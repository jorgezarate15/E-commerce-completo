from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.entities import Cart, CartItem, Order, OrderItem, OrderStatus, ProductVariant, User
from app.schemas.order import OrderCreateRequest, OrderCreateResponse, OrderListResponse, OrderSummary

router = APIRouter()


@router.get("", response_model=OrderListResponse)
def list_my_orders(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> OrderListResponse:
    orders = db.scalars(select(Order).where(Order.user_id == current_user.id).order_by(Order.id.desc())).all()
    items = [
        OrderSummary(
            id=order.id,
            status=order.status.value,
            subtotal=float(order.subtotal),
            taxes=float(order.taxes),
            shipping_cost=float(order.shipping_cost),
            discount_total=float(order.discount_total),
            total=float(order.total),
            tracking_number=order.tracking_number,
        )
        for order in orders
    ]
    return OrderListResponse(items=items, total=len(items))


@router.post("", response_model=OrderCreateResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    payload: OrderCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> OrderCreateResponse:
    cart = db.scalar(
        select(Cart)
        .where(Cart.user_id == current_user.id, Cart.is_active.is_(True))
        .options(joinedload(Cart.items).joinedload(CartItem.variant).joinedload(ProductVariant.product))
    )
    if not cart or not cart.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    subtotal = Decimal("0")
    for item in cart.items:
        variant = item.variant
        if variant.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for SKU {variant.sku}")
        unit_price = variant.sale_price or variant.base_price
        subtotal += unit_price * item.quantity

    taxes = subtotal * Decimal("0.16")
    shipping_cost = Decimal("15.00") if payload.shipping_method == "express" else Decimal("5.00")
    discount_total = Decimal("0")
    total = subtotal + taxes + shipping_cost - discount_total

    order = Order(
        user_id=current_user.id,
        status=OrderStatus.pending,
        subtotal=subtotal,
        taxes=taxes,
        shipping_cost=shipping_cost,
        discount_total=discount_total,
        total=total,
        shipping_address_snapshot=payload.shipping_address,
    )
    db.add(order)
    db.flush()

    for item in cart.items:
        variant = item.variant
        unit_price = variant.sale_price or variant.base_price
        db.add(
            OrderItem(
                order_id=order.id,
                product_variant_id=variant.id,
                product_name_snapshot=variant.product.name,
                size_snapshot=variant.size,
                color_snapshot=variant.color,
                unit_price=unit_price,
                quantity=item.quantity,
            )
        )
        variant.stock -= item.quantity

    cart.is_active = False
    db.commit()
    db.refresh(order)

    summary = OrderSummary(
        id=order.id,
        status=order.status.value,
        subtotal=float(order.subtotal),
        taxes=float(order.taxes),
        shipping_cost=float(order.shipping_cost),
        discount_total=float(order.discount_total),
        total=float(order.total),
        tracking_number=order.tracking_number,
    )
    return OrderCreateResponse(order=summary, message="Order created successfully")
