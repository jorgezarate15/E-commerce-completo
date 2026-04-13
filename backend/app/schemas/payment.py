from pydantic import BaseModel, Field


class PaymentIntentCreateRequest(BaseModel):
    order_id: int
    provider: str = Field(pattern="^(stripe|paypal)$")


class PaymentIntentResponse(BaseModel):
    payment_id: int
    order_id: int
    provider: str
    status: str
    amount: float
    provider_reference: str
    client_secret: str


class PaymentConfirmRequest(BaseModel):
    payment_id: int


class PaymentResponse(BaseModel):
    payment_id: int
    order_id: int
    provider: str
    status: str
    amount: float
    provider_reference: str | None = None


class PaymentWebhookMockRequest(BaseModel):
    provider_reference: str
    event: str = Field(pattern="^(payment_succeeded|payment_failed)$")
