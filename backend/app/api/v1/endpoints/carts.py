from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.entities import Cart, CartItem, ProductVariant, User
from app.schemas.cart import CartItem as CartItemResponse
from app.schemas.cart import CartItemUpsertRequest, CartResponse

router = APIRouter()


def _get_or_create_cart(db: Session, user_id: int) -> Cart:
    statement = (
        select(Cart)
        .where(Cart.user_id == user_id, Cart.is_active.is_(True))
        .options(joinedload(Cart.items).joinedload(CartItem.variant).joinedload(ProductVariant.product))
    )
    cart = db.scalar(statement)
    if cart:
        return cart

    cart = Cart(user_id=user_id, is_active=True)
    db.add(cart)
    db.commit()
    db.refresh(cart)
    return cart


def _build_cart_response(cart: Cart) -> CartResponse:
    subtotal = Decimal("0")
    items: list[CartItemResponse] = []

    for item in cart.items:
        unit_price = item.variant.sale_price or item.variant.base_price
        line_total = unit_price * item.quantity
        subtotal += line_total
        items.append(
            CartItemResponse(
                id=item.id,
                product_variant_id=item.product_variant_id,
                product_name=item.variant.product.name,
                size=item.variant.size,
                color=item.variant.color,
                unit_price=float(unit_price),
                quantity=item.quantity,
                line_total=float(line_total),
            )
        )

    taxes = subtotal * Decimal("0.16")
    shipping_estimate = Decimal("5.00") if subtotal > 0 else Decimal("0")
    discount_total = Decimal("0")
    total = subtotal + taxes + shipping_estimate - discount_total

    return CartResponse(
        cart_id=cart.id,
        items=items,
        subtotal=float(subtotal),
        taxes=float(taxes),
        shipping_estimate=float(shipping_estimate),
        discount_total=float(discount_total),
        total=float(total),
    )


@router.get("", response_model=CartResponse)
def get_cart(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> CartResponse:
    cart = _get_or_create_cart(db, current_user.id)
    return _build_cart_response(cart)


@router.post("/items", response_model=CartResponse, status_code=status.HTTP_201_CREATED)
def add_cart_item(
    payload: CartItemUpsertRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CartResponse:
    cart = _get_or_create_cart(db, current_user.id)
    variant = db.get(ProductVariant, payload.product_variant_id)
    if not variant or not variant.is_active:
        raise HTTPException(status_code=404, detail="Variant not found")
    if variant.stock < payload.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")

    existing = db.scalar(
        select(CartItem).where(
            CartItem.cart_id == cart.id,
            CartItem.product_variant_id == payload.product_variant_id,
        )
    )
    if existing:
        new_quantity = existing.quantity + payload.quantity
        if variant.stock < new_quantity:
            raise HTTPException(status_code=400, detail="Insufficient stock")
        existing.quantity = new_quantity
    else:
        db.add(CartItem(cart_id=cart.id, product_variant_id=payload.product_variant_id, quantity=payload.quantity))

    db.commit()
    cart = _get_or_create_cart(db, current_user.id)
    return _build_cart_response(cart)


@router.delete("/items/{item_id}", response_model=CartResponse)
def delete_cart_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CartResponse:
    cart = _get_or_create_cart(db, current_user.id)
    item = db.scalar(select(CartItem).where(CartItem.id == item_id, CartItem.cart_id == cart.id))
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    db.delete(item)
    db.commit()
    cart = _get_or_create_cart(db, current_user.id)
    return _build_cart_response(cart)
