from pydantic import BaseModel


class OrderCreateRequest(BaseModel):
    shipping_address: str
    shipping_method: str = "standard"


class OrderSummary(BaseModel):
    id: int
    status: str
    subtotal: float
    taxes: float
    shipping_cost: float
    discount_total: float
    total: float
    tracking_number: str | None = None


class OrderCreateResponse(BaseModel):
    order: OrderSummary
    message: str


class OrderListResponse(BaseModel):
    items: list[OrderSummary]
    total: int
