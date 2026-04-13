from decimal import Decimal
from uuid import uuid4

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.models.entities import Order, OrderStatus, Payment, PaymentStatus, User
from app.schemas.payment import (
    PaymentConfirmRequest,
    PaymentIntentCreateRequest,
    PaymentIntentResponse,
    PaymentResponse,
    PaymentWebhookMockRequest,
)

router = APIRouter()


def _payment_to_response(payment: Payment) -> PaymentResponse:
    return PaymentResponse(
        payment_id=payment.id,
        order_id=payment.order_id,
        provider=payment.provider,
        status=payment.status.value,
        amount=float(payment.amount),
        provider_reference=payment.provider_reference,
    )


@router.post("/intent", response_model=PaymentIntentResponse, status_code=status.HTTP_201_CREATED)
def create_payment_intent(
    payload: PaymentIntentCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PaymentIntentResponse:
    order = db.scalar(select(Order).where(Order.id == payload.order_id, Order.user_id == current_user.id))
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status == OrderStatus.cancelled:
        raise HTTPException(status_code=400, detail="Order is cancelled")

    provider_reference = f"{payload.provider}_{uuid4().hex[:18]}"
    payment = Payment(
        order_id=order.id,
        provider=payload.provider,
        provider_reference=provider_reference,
        status=PaymentStatus.pending,
        amount=Decimal(str(order.total)),
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    client_secret = f"{provider_reference}_secret"
    return PaymentIntentResponse(
        payment_id=payment.id,
        order_id=payment.order_id,
        provider=payment.provider,
        status=payment.status.value,
        amount=float(payment.amount),
        provider_reference=provider_reference,
        client_secret=client_secret,
    )


@router.post("/confirm", response_model=PaymentResponse)
def confirm_payment(
    payload: PaymentConfirmRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PaymentResponse:
    payment = db.scalar(select(Payment).join(Order).where(Payment.id == payload.payment_id, Order.user_id == current_user.id))
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    payment.status = PaymentStatus.paid
    order = db.get(Order, payment.order_id)
    if order and order.status == OrderStatus.pending:
        order.status = OrderStatus.processing

    db.commit()
    db.refresh(payment)
    return _payment_to_response(payment)


@router.post("/mock-webhook", response_model=PaymentResponse)
def mock_payment_webhook(
    payload: PaymentWebhookMockRequest,
    db: Session = Depends(get_db),
    x_webhook_secret: str | None = Header(default=None),
) -> PaymentResponse:
    if x_webhook_secret != settings.payment_webhook_secret:
        raise HTTPException(status_code=401, detail="Invalid webhook secret")

    payment = db.scalar(select(Payment).where(Payment.provider_reference == payload.provider_reference))
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    if payload.event == "payment_succeeded":
        payment.status = PaymentStatus.paid
        order = db.get(Order, payment.order_id)
        if order and order.status == OrderStatus.pending:
            order.status = OrderStatus.processing
    else:
        payment.status = PaymentStatus.failed

    db.commit()
    db.refresh(payment)
    return _payment_to_response(payment)
