from pydantic import BaseModel, Field


class AdminProductCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    description: str = Field(min_length=10)
    brand_id: int
    category_id: int
    material_id: int | None = None
    sku: str = Field(min_length=2, max_length=80)
    size: str = Field(min_length=1, max_length=20)
    color: str = Field(min_length=1, max_length=50)
    base_price: float = Field(ge=0)
    sale_price: float | None = Field(default=None, ge=0)
    stock: int = Field(ge=0)


class AdminProductSummary(BaseModel):
    id: int
    name: str
    brand: str
    category: str
    variants: int
    total_stock: int


class AdminProductListResponse(BaseModel):
    items: list[AdminProductSummary]
    total: int


class AdminOrderSummary(BaseModel):
    id: int
    user_id: int
    customer_email: str
    status: str
    total: float
    created_at: str


class AdminOrderListResponse(BaseModel):
    items: list[AdminOrderSummary]
    total: int


class AdminOrderStatusUpdateRequest(BaseModel):
    status: str
    tracking_number: str | None = None


class AdminUserSummary(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool


class AdminUserListResponse(BaseModel):
    items: list[AdminUserSummary]
    total: int


class AdminUserRoleUpdateRequest(BaseModel):
    role: str
    is_active: bool | None = None


class AdminStatusBucket(BaseModel):
    status: str
    count: int


class AdminTopProduct(BaseModel):
    product_name: str
    units_sold: int
    revenue: float


class AdminDailyMetric(BaseModel):
    day: str
    orders: int
    revenue: float


class AdminAnalyticsResponse(BaseModel):
    total_orders: int
    paid_orders: int
    total_revenue: float
    average_order_value: float
    orders_today: int
    status_breakdown: list[AdminStatusBucket]
    top_products: list[AdminTopProduct]
    daily_series: list[AdminDailyMetric]
