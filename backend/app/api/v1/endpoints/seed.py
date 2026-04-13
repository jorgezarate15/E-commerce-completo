from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_password_hash
from app.models.entities import Brand, Category, Material, Product, ProductImage, ProductVariant, User, UserRole

router = APIRouter()


@router.post("/dev-seed")
def seed_initial_data(db: Session = Depends(get_db)) -> dict[str, str]:
    has_users = (db.scalar(select(func.count(User.id))) or 0) > 0
    if not has_users:
        admin = User(
            email="admin@shoestore.local",
            full_name="Admin Shoe Store",
            hashed_password=get_password_hash("Admin12345"),
            role=UserRole.admin,
            is_active=True,
        )
        db.add(admin)

    has_catalog = (db.scalar(select(func.count(Product.id))) or 0) > 0
    if not has_catalog:
        running = Category(name="Running", slug="running")
        casual = Category(name="Casual", slug="casual")
        stride = Brand(name="Stride")
        north = Brand(name="NorthWalk")
        leather = Material(name="Leather")
        mesh = Material(name="Mesh")
        db.add_all([running, casual, stride, north, leather, mesh])
        db.flush()

        product_one = Product(
            name="Runner Pro X",
            description="Zapatilla running ligera con amortiguacion para uso diario.",
            brand_id=stride.id,
            category_id=running.id,
            material_id=mesh.id,
            is_active=True,
        )
        product_two = Product(
            name="Urban Leather",
            description="Zapato urbano de cuero para uso casual premium.",
            brand_id=north.id,
            category_id=casual.id,
            material_id=leather.id,
            is_active=True,
        )
        db.add_all([product_one, product_two])
        db.flush()

        db.add_all(
            [
                ProductVariant(product_id=product_one.id, sku="RUN-PROX-42-BLK", size="42", color="Black", base_price=129.99, sale_price=99.99, stock=20),
                ProductVariant(product_id=product_one.id, sku="RUN-PROX-41-WHT", size="41", color="White", base_price=129.99, sale_price=109.99, stock=14),
                ProductVariant(product_id=product_two.id, sku="URB-LEA-42-BRN", size="42", color="Brown", base_price=149.99, sale_price=None, stock=9),
            ]
        )

        db.add_all(
            [
                ProductImage(product_id=product_one.id, image_url="https://images.unsplash.com/photo-1542291026-7eec264c27ff", sort_order=1),
                ProductImage(product_id=product_two.id, image_url="https://images.unsplash.com/photo-1511556532299-8f662fc26c06", sort_order=1),
            ]
        )

    db.commit()
    return {"status": "ok", "message": "Seed data ready"}
