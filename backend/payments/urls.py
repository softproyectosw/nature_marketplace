"""
Payment URL configuration.

This module defines URL patterns for payment endpoints.
"""

from django.urls import path

from .views import (
    CreateCheckoutSessionView,
    CreatePaymentIntentView,
    StripeWebhookView,
    PaymentStatusView,
)

app_name = 'payments'

urlpatterns = [
    # Checkout session (Stripe Checkout)
    path('checkout/', CreateCheckoutSessionView.as_view(), name='checkout'),
    
    # Payment intent (Stripe Elements)
    path('intent/', CreatePaymentIntentView.as_view(), name='payment-intent'),
    
    # Stripe webhook
    path('webhook/', StripeWebhookView.as_view(), name='webhook'),
    
    # Payment status
    path('status/<uuid:order_id>/', PaymentStatusView.as_view(), name='status'),
]
