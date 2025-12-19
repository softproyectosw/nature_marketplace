"""
Products app configuration.

This app handles the product catalog including trees, retreats, and physical products.
"""

from django.apps import AppConfig


class ProductsConfig(AppConfig):
    """Configuration for the products application."""
    
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'products'
    verbose_name = 'Product Catalog'
