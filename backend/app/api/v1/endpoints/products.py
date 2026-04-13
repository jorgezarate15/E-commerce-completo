from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import and_, func, or_, select
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.models.entities import Product, ProductVariant
from app.schemas.product import ProductCard, ProductDetailResponse, ProductImageResponse, ProductListResponse, ProductVariantResponse

router = APIRouter()


@router.get("", response_model=ProductListResponse)
def list_products(
    db: Session = Depends(get_db),
    search: str | None = None,
    category: str | None = None,
    brand: str | None = None,
    size: str | None = None,
    color: str | None = None,
    min_price: float | None = Query(default=None, ge=0),
    max_price: float | None = Query(default=None, ge=0),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=12, ge=1, le=100),
) -> ProductListResponse:
    conditions = [Product.is_active.is_(True)]

    if search:
        search_term = f"%{search.strip()}%"
        conditions.append(
            or_(
                Product.name.ilike(search_term),
                Product.description.ilike(search_term),
            )
        )
    if category:
        conditions.append(Product.category.has(name=category))
    if brand:
        conditions.append(Product.brand.has(name=brand))
    if size:
        conditions.append(Product.variants.any(ProductVariant.size == size))
    if color:
        conditions.append(Product.variants.any(ProductVariant.color == color))

    min_price_decimal = Decimal(str(min_price)) if min_price is not None else None
    max_price_decimal = Decimal(str(max_price)) if max_price is not None else None
    if min_price_decimal is not None:
        conditions.append(Product.variants.any(ProductVariant.base_price >= min_price_decimal))
    if max_price_decimal is not None:
        conditions.append(Product.variants.any(ProductVariant.base_price <= max_price_decimal))

    total = db.scalar(select(func.count(Product.id)).where(and_(*conditions))) or 0
    statement = (
        select(Product)
        .where(and_(*conditions))
        .options(
            joinedload(Product.brand),
            joinedload(Product.category),
            joinedload(Product.material),
            joinedload(Product.images),
            joinedload(Product.variants),
        )
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    products = db.scalars(statement).unique().all()

    items: list[ProductCard] = []
    for product in products:
        active_variants = [variant for variant in product.variants if variant.is_active]
        if not active_variants:
            continue
        cheapest_variant = min(active_variants, key=lambda variant: float(variant.sale_price or variant.base_price))
        items.append(
            ProductCard(
                id=product.id,
                name=product.name,
                brand=product.brand.name,
                category=product.category.name,
                material=product.material.name if product.material else None,
                base_price=float(cheapest_variant.base_price),
                sale_price=float(cheapest_variant.sale_price) if cheapest_variant.sale_price is not None else None,
                default_variant_id=cheapest_variant.id,
                in_stock=any(variant.stock > 0 for variant in active_variants),
                image_url=product.images[0].image_url if product.images else None,
            )
        )
    return ProductListResponse(items=items, total=total, page=page, page_size=page_size)


@router.get("/{product_id}", response_model=ProductDetailResponse)
def get_product(product_id: int, db: Session = Depends(get_db)) -> ProductDetailResponse:
    statement = (
        select(Product)
        .where(Product.id == product_id, Product.is_active.is_(True))
        .options(
            joinedload(Product.brand),
            joinedload(Product.category),
            joinedload(Product.material),
            joinedload(Product.images),
            joinedload(Product.variants),
        )
    )
    product = db.scalar(statement)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    variants = [
        ProductVariantResponse(
            id=variant.id,
            sku=variant.sku,
            size=variant.size,
            color=variant.color,
            base_price=float(variant.base_price),
            sale_price=float(variant.sale_price) if variant.sale_price is not None else None,
            stock=variant.stock,
        )
        for variant in product.variants
        if variant.is_active
    ]
    images = [
        ProductImageResponse(id=image.id, image_url=image.image_url, sort_order=image.sort_order)
        for image in sorted(product.images, key=lambda image: image.sort_order)
    ]

    return ProductDetailResponse(
        id=product.id,
        name=product.name,
        description=product.description,
        brand=product.brand.name,
        category=product.category.name,
        material=product.material.name if product.material else None,
        variants=variants,
        images=images,
    )
