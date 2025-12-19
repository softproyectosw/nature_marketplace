"""
Payment models for Nature Marketplace.

This module defines the Payment model for tracking Stripe payments
and their relationship to orders.
"""

import uuid
from django.conf import settings
from django.db import models
from django.core.validators import MinValueValidator

from orders.models import Order
class Payment(models.Model):
    """
    Payment record for tracking Stripe transactions.
    
    Each payment is associated with an order and tracks the Stripe
    payment intent and its status.
    """
    
    # Payment Status Choices
    class PaymentStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        PROCESSING = 'processing', 'Processing'
        SUCCEEDED = 'succeeded', 'Succeeded'
        FAILED = 'failed', 'Failed'
        CANCELLED = 'cancelled', 'Cancelled'
        REFUNDED = 'refunded', 'Refunded'
        PARTIALLY_REFUNDED = 'partially_refunded', 'Partially Refunded'
    
    # Payment Method Choices
    class PaymentMethod(models.TextChoices):
        CARD = 'card', 'Credit/Debit Card'
        APPLE_PAY = 'apple_pay', 'Apple Pay'
        GOOGLE_PAY = 'google_pay', 'Google Pay'
        BANK_TRANSFER = 'bank_transfer', 'Bank Transfer'
    
    # Identification
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text='Unique payment identifier'
    )
    
    # Relationships
    order = models.ForeignKey(
        Order,
        on_delete=models.PROTECT,
        related_name='payments',
        help_text='The order this payment is for'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='payments',
        help_text='The user who made this payment'
    )
    
    # Stripe Integration
    stripe_payment_intent_id = models.CharField(
        max_length=100,
        unique=True,
        null=True,
        blank=True,
        help_text='Stripe PaymentIntent ID (pi_...)'
    )
    stripe_checkout_session_id = models.CharField(
        max_length=100,
        unique=True,
        null=True,
        blank=True,
        help_text='Stripe Checkout Session ID (cs_...)'
    )
    stripe_customer_id = models.CharField(
        max_length=100,
        blank=True,
        help_text='Stripe Customer ID (cus_...)'
    )
    stripe_charge_id = models.CharField(
        max_length=100,
        blank=True,
        help_text='Stripe Charge ID (ch_...)'
    )
    
    # Payment Details
    status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING,
        help_text='Current payment status'
    )
    payment_method = models.CharField(
        max_length=20,
        choices=PaymentMethod.choices,
        default=PaymentMethod.CARD,
        help_text='Payment method used'
    )
    
    # Amounts
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text='Payment amount'
    )
    currency = models.CharField(
        max_length=3,
        default='USD',
        help_text='Currency code (ISO 4217)'
    )
    
    # Refund tracking
    refunded_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        help_text='Amount refunded'
    )
    
    # Card Details (last 4 digits only - PCI compliant)
    card_last_four = models.CharField(
        max_length=4,
        blank=True,
        help_text='Last 4 digits of card'
    )
    card_brand = models.CharField(
        max_length=20,
        blank=True,
        help_text='Card brand (visa, mastercard, etc.)'
    )
    
    # Error Handling
    error_code = models.CharField(
        max_length=100,
        blank=True,
        help_text='Stripe error code if payment failed'
    )
    error_message = models.TextField(
        blank=True,
        help_text='Error message if payment failed'
    )
    
    # Metadata
    metadata = models.JSONField(
        default=dict,
        blank=True,
        help_text='Additional metadata from Stripe'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text='When payment was completed'
    )
    
    class Meta:
        verbose_name = 'Payment'
        verbose_name_plural = 'Payments'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['stripe_payment_intent_id']),
            models.Index(fields=['stripe_checkout_session_id']),
            models.Index(fields=['order', 'status']),
            models.Index(fields=['user', 'status']),
        ]
    
    def __str__(self) -> str:
        return f"Payment {self.id} - {self.status} - ${self.amount}"
    
    @property
    def is_successful(self) -> bool:
        """Check if payment was successful."""
        return self.status == self.PaymentStatus.SUCCEEDED
    
    @property
    def is_refundable(self) -> bool:
        """Check if payment can be refunded."""
        return (
            self.status == self.PaymentStatus.SUCCEEDED
            and self.refunded_amount < self.amount
        )
    
    @property
    def net_amount(self) -> float:
        """Calculate net amount after refunds."""
        return float(self.amount - self.refunded_amount)
    
    def mark_as_succeeded(self) -> None:
        """Mark payment as successful."""
        from django.utils import timezone
        self.status = self.PaymentStatus.SUCCEEDED
        self.completed_at = timezone.now()
        self.save()
    
    def mark_as_failed(self, error_code: str = '', error_message: str = '') -> None:
        """Mark payment as failed with error details."""
        self.status = self.PaymentStatus.FAILED
        self.error_code = error_code
        self.error_message = error_message
        self.save()
