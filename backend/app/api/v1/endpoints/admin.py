from datetime import date, datetime, time, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import and_, func, or_, select
from sqlalchemy.orm import Session, joinedload

from app.api.deps import require_admin
from app.core.database import get_db
from app.models.entities import (
    Category,
    Order,
    OrderStatus,
    Product,
    ProductVariant,
    User,
    UserRole,
)
from app.models.entities import OrderItem
from app.schemas.admin import (
    AdminOrderListResponse,
    AdminOrderStatusUpdateRequest,
    AdminOrderSummary,
    AdminProductCreateRequest,
    AdminProductListResponse,
    AdminProductSummary,
    AdminUserListResponse,
    AdminUserRoleUpdateRequest,
    AdminUserSummary,
)
from app.schemas.admin import AdminAnalyticsResponse, AdminDailyMetric, AdminStatusBucket, AdminTopProduct

router = APIRouter()

PAID_STATUSES = [OrderStatus.processing, OrderStatus.shipped, OrderStatus.delivered]


@router.get("/products", response_model=AdminProductListResponse)
def list_products(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> AdminProductListResponse:
    total = db.scalar(select(func.count(Product.id)).where(Product.is_active.is_(True))) or 0
    products = db.scalars(
        select(Product)
        .where(Product.is_active.is_(True))
        .options(joinedload(Product.brand), joinedload(Product.category), joinedload(Product.variants))
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).unique().all()

    items = [
        AdminProductSummary(
            id=product.id,
            name=product.name,
            brand=product.brand.name,
            category=product.category.name,
            variants=len(product.variants),
            total_stock=sum(variant.stock for variant in product.variants if variant.is_active),
        )
        for product in products
    ]
    return AdminProductListResponse(items=items, total=total)


@router.post("/products", response_model=AdminProductSummary, status_code=status.HTTP_201_CREATED)
def create_product(
    payload: AdminProductCreateRequest,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> AdminProductSummary:
    category = db.get(Category, payload.category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    product = Product(
        name=payload.name,
        description=payload.description,
        brand_id=payload.brand_id,
        category_id=payload.category_id,
        material_id=payload.material_id,
        is_active=True,
    )
    db.add(product)
    db.flush()

    db.add(
        ProductVariant(
            product_id=product.id,
            sku=payload.sku,
            size=payload.size,
            color=payload.color,
            base_price=payload.base_price,
            sale_price=payload.sale_price,
            stock=payload.stock,
            is_active=True,
        )
    )
    db.commit()
    db.refresh(product)

    product = db.scalar(
        select(Product)
        .where(Product.id == product.id)
        .options(joinedload(Product.brand), joinedload(Product.category), joinedload(Product.variants))
    )
    if not product:
        raise HTTPException(status_code=500, detail="Product creation failed")

    return AdminProductSummary(
        id=product.id,
        name=product.name,
        brand=product.brand.name,
        category=product.category.name,
        variants=len(product.variants),
        total_stock=sum(variant.stock for variant in product.variants if variant.is_active),
    )


@router.get("/orders", response_model=AdminOrderListResponse)
def list_orders(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
    status_filter: str | None = Query(default=None, alias="status"),
) -> AdminOrderListResponse:
    statement = select(Order).options(joinedload(Order.user)).order_by(Order.id.desc())
    if status_filter:
        statement = statement.where(Order.status == status_filter)

    orders = db.scalars(statement).all()
    items = [
        AdminOrderSummary(
            id=order.id,
            user_id=order.user_id,
            customer_email=order.user.email,
            status=order.status.value,
            total=float(order.total),
            created_at=order.created_at.isoformat() if isinstance(order.created_at, datetime) else str(order.created_at),
        )
        for order in orders
    ]
    return AdminOrderListResponse(items=items, total=len(items))


@router.patch("/orders/{order_id}/status", response_model=AdminOrderSummary)
def update_order_status(
    order_id: int,
    payload: AdminOrderStatusUpdateRequest,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> AdminOrderSummary:
    order = db.scalar(select(Order).where(Order.id == order_id).options(joinedload(Order.user)))
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    try:
        order.status = OrderStatus(payload.status)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid order status") from exc

    if payload.tracking_number is not None:
        order.tracking_number = payload.tracking_number

    db.commit()
    db.refresh(order)

    return AdminOrderSummary(
        id=order.id,
        user_id=order.user_id,
        customer_email=order.user.email,
        status=order.status.value,
        total=float(order.total),
        created_at=order.created_at.isoformat() if isinstance(order.created_at, datetime) else str(order.created_at),
    )


@router.get("/users", response_model=AdminUserListResponse)
def list_users(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
    search: str | None = None,
) -> AdminUserListResponse:
    statement = select(User).order_by(User.id.desc())
    if search:
        search_term = f"%{search.strip()}%"
        statement = statement.where(or_(User.email.ilike(search_term), User.full_name.ilike(search_term)))

    users = db.scalars(statement).all()
    items = [
        AdminUserSummary(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            role=user.role.value,
            is_active=user.is_active,
        )
        for user in users
    ]
    return AdminUserListResponse(items=items, total=len(items))


@router.patch("/users/{user_id}/role", response_model=AdminUserSummary)
def update_user_role(
    user_id: int,
    payload: AdminUserRoleUpdateRequest,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> AdminUserSummary:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        user.role = UserRole(payload.role)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid role") from exc

    if payload.is_active is not None:
        user.is_active = payload.is_active

    db.commit()
    db.refresh(user)

    return AdminUserSummary(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role.value,
        is_active=user.is_active,
    )


@router.get("/analytics", response_model=AdminAnalyticsResponse)
def get_analytics(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
    from_date: date | None = Query(default=None, alias="from"),
    to_date: date | None = Query(default=None, alias="to"),
    status_filter: str | None = Query(default=None, alias="status"),
) -> AdminAnalyticsResponse:
    base_conditions = []

    if from_date:
        base_conditions.append(Order.created_at >= datetime.combine(from_date, time.min))
    if to_date:
        base_conditions.append(Order.created_at < datetime.combine(to_date + timedelta(days=1), time.min))

    status_enum: OrderStatus | None = None
    if status_filter:
        try:
            status_enum = OrderStatus(status_filter)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail="Invalid status filter") from exc

    filtered_conditions = list(base_conditions)
    if status_enum is not None:
        filtered_conditions.append(Order.status == status_enum)

    total_orders = db.scalar(select(func.count(Order.id)).where(*filtered_conditions)) or 0

    paid_conditions = list(base_conditions)
    paid_conditions.append(Order.status.in_(PAID_STATUSES))
    if status_enum is not None:
        paid_conditions.append(Order.status == status_enum)

    paid_orders = db.scalar(select(func.count(Order.id)).where(*paid_conditions)) or 0
    total_revenue_raw = db.scalar(select(func.coalesce(func.sum(Order.total), 0)).where(*paid_conditions))
    total_revenue = float(total_revenue_raw or 0)
    average_order_value = float(total_revenue / paid_orders) if paid_orders else 0.0

    today_date = datetime.utcnow().date()
    today_conditions = list(filtered_conditions)
    today_conditions.append(func.date(Order.created_at) == str(today_date))
    orders_today = (
        db.scalar(
            select(func.count(Order.id)).where(*today_conditions)
        )
        or 0
    )

    status_rows = db.execute(select(Order.status, func.count(Order.id)).where(*base_conditions).group_by(Order.status)).all()
    status_breakdown = [
        AdminStatusBucket(status=status.value if hasattr(status, "value") else str(status), count=count)
        for status, count in status_rows
    ]

    top_rows = db.execute(
        select(
            OrderItem.product_name_snapshot,
            func.coalesce(func.sum(OrderItem.quantity), 0).label("units_sold"),
            func.coalesce(func.sum(OrderItem.unit_price * OrderItem.quantity), 0).label("revenue"),
        )
        .join(Order, Order.id == OrderItem.order_id)
        .where(and_(*paid_conditions))
        .group_by(OrderItem.product_name_snapshot)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(5)
    ).all()
    top_products = [
        AdminTopProduct(product_name=name, units_sold=int(units_sold or 0), revenue=float(revenue or 0))
        for name, units_sold, revenue in top_rows
    ]

    daily_rows = db.execute(
        select(
            func.date(Order.created_at).label("day"),
            func.count(Order.id).label("orders"),
            func.coalesce(func.sum(Order.total), 0).label("revenue"),
        )
        .where(*paid_conditions)
        .group_by(func.date(Order.created_at))
        .order_by(func.date(Order.created_at))
    ).all()
    daily_series = [
        AdminDailyMetric(day=str(day), orders=int(orders or 0), revenue=float(revenue or 0))
        for day, orders, revenue in daily_rows
    ]

    return AdminAnalyticsResponse(
        total_orders=total_orders,
        paid_orders=paid_orders,
        total_revenue=total_revenue,
        average_order_value=average_order_value,
        orders_today=orders_today,
        status_breakdown=status_breakdown,
        top_products=top_products,
        daily_series=daily_series,
    )
