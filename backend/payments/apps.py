"""
Payments app configuration.

This app handles Stripe payment processing and payment records.
"""

from django.apps import AppConfig


class PaymentsConfig(AppConfig):
    """Configuration for the payments application."""
    
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'payments'
    verbose_name = 'Payment Processing'
