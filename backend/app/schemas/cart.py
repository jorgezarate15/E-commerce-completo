from pydantic import BaseModel, Field


class CartItem(BaseModel):
    id: int
    product_variant_id: int
    product_name: str
    size: str
    color: str
    unit_price: float
    quantity: int
    line_total: float


class CartItemUpsertRequest(BaseModel):
    product_variant_id: int
    quantity: int = Field(ge=1, le=20)


class CartResponse(BaseModel):
    cart_id: int
    items: list[CartItem]
    subtotal: float
    taxes: float
    shipping_estimate: float
    discount_total: float
    total: float
