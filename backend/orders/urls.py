"""
Order URL configuration.

This module defines URL patterns for cart and order endpoints.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import CartViewSet, OrderViewSet

# Create router and register viewsets
router = DefaultRouter()
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'orders', OrderViewSet, basename='order')

app_name = 'orders'

urlpatterns = [
    path('', include(router.urls)),
]
