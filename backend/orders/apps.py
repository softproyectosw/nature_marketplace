"""
Orders app configuration.

This app handles shopping cart and order management.
"""

from django.apps import AppConfig


class OrdersConfig(AppConfig):
    """Configuration for the orders application."""
    
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'orders'
    verbose_name = 'Orders & Cart'
