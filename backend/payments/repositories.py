"""
Payment repositories for Nature Marketplace.

This module provides data access abstraction for Payment models.
"""

from typing import Optional
from django.contrib.auth import get_user_model
from django.db.models import QuerySet, Sum

from .models import Payment
from orders.models import Order

User = get_user_model()


class PaymentRepository:
    """Repository for Payment data access operations."""

    def get_by_id(self, payment_id: str) -> Optional[Payment]:
        """Get payment by ID."""
        try:
            return Payment.objects.select_related('order', 'user').get(id=payment_id)
        except Payment.DoesNotExist:
            return None

    def get_by_stripe_payment_intent(self, payment_intent_id: str) -> Optional[Payment]:
        """Get payment by Stripe PaymentIntent ID."""
        try:
            return Payment.objects.select_related('order', 'user').get(
                stripe_payment_intent_id=payment_intent_id
            )
        except Payment.DoesNotExist:
            return None

    def get_by_stripe_checkout_session(self, session_id: str) -> Optional[Payment]:
        """Get payment by Stripe Checkout Session ID."""
        try:
            return Payment.objects.select_related('order', 'user').get(
                stripe_checkout_session_id=session_id
            )
        except Payment.DoesNotExist:
            return None

    def get_by_order(self, order: Order) -> QuerySet[Payment]:
        """Get all payments for an order."""
        return Payment.objects.filter(order=order).order_by('-created_at')

    def get_successful_payment_for_order(self, order: Order) -> Optional[Payment]:
        """Get successful payment for an order."""
        return Payment.objects.filter(
            order=order,
            status=Payment.PaymentStatus.SUCCEEDED
        ).first()

    def get_user_payments(self, user: User) -> QuerySet[Payment]:
        """Get all payments for a user."""
        return Payment.objects.filter(user=user).select_related('order').order_by('-created_at')

    def get_user_successful_payments(self, user: User) -> QuerySet[Payment]:
        """Get successful payments for a user."""
        return Payment.objects.filter(
            user=user,
            status=Payment.PaymentStatus.SUCCEEDED
        ).select_related('order').order_by('-created_at')

    def get_pending_payments(self) -> QuerySet[Payment]:
        """Get all pending payments."""
        return Payment.objects.filter(
            status=Payment.PaymentStatus.PENDING
        ).select_related('order', 'user')

    def create(
        self,
        order: Order,
        user: User,
        amount: float,
        currency: str = 'USD',
        payment_method: str = Payment.PaymentMethod.CARD,
        stripe_payment_intent_id: Optional[str] = None,
        stripe_checkout_session_id: Optional[str] = None,
        stripe_customer_id: str = '',
        metadata: Optional[dict] = None
    ) -> Payment:
        """Create a new payment record."""
        return Payment.objects.create(
            order=order,
            user=user,
            amount=amount,
            currency=currency,
            payment_method=payment_method,
            stripe_payment_intent_id=stripe_payment_intent_id,
            stripe_checkout_session_id=stripe_checkout_session_id,
            stripe_customer_id=stripe_customer_id,
            metadata=metadata or {}
        )

    def update_status(
        self,
        payment: Payment,
        status: str,
        error_code: str = '',
        error_message: str = ''
    ) -> Payment:
        """Update payment status."""
        payment.status = status
        if error_code:
            payment.error_code = error_code
        if error_message:
            payment.error_message = error_message
        if status == Payment.PaymentStatus.SUCCEEDED:
            from django.utils import timezone
            payment.completed_at = timezone.now()
        payment.save()
        return payment

    def update_stripe_details(
        self,
        payment: Payment,
        charge_id: str = '',
        card_last_four: str = '',
        card_brand: str = ''
    ) -> Payment:
        """Update Stripe-specific details."""
        if charge_id:
            payment.stripe_charge_id = charge_id
        if card_last_four:
            payment.card_last_four = card_last_four
        if card_brand:
            payment.card_brand = card_brand
        payment.save()
        return payment

    def process_refund(self, payment: Payment, refund_amount: float) -> Payment:
        """Process a refund for a payment."""
        payment.refunded_amount += refund_amount
        if payment.refunded_amount >= payment.amount:
            payment.status = Payment.PaymentStatus.REFUNDED
        else:
            payment.status = Payment.PaymentStatus.PARTIALLY_REFUNDED
        payment.save()
        return payment

    def get_total_revenue(self) -> float:
        """Get total revenue from successful payments."""
        result = Payment.objects.filter(
            status=Payment.PaymentStatus.SUCCEEDED
        ).aggregate(total=Sum('amount'))
        return float(result['total'] or 0)

    def get_user_total_spent(self, user: User) -> float:
        """Get total amount spent by a user."""
        result = Payment.objects.filter(
            user=user,
            status=Payment.PaymentStatus.SUCCEEDED
        ).aggregate(total=Sum('amount'))
        return float(result['total'] or 0)
