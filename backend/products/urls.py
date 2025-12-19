"""
Product URL configuration.

This module defines URL patterns for product and category endpoints.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import ProductViewSet, CategoryViewSet

# Create router and register viewsets
router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'categories', CategoryViewSet, basename='category')

app_name = 'products'

urlpatterns = [
    path('', include(router.urls)),
]
