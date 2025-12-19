"""
Ecosystem URL configuration.

This module defines URL patterns for tree tracking endpoints.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import AdoptedTreeViewSet

# Create router and register viewsets
router = DefaultRouter()
router.register(r'trees', AdoptedTreeViewSet, basename='adopted-tree')

app_name = 'ecosystems'

urlpatterns = [
    path('', include(router.urls)),
]
