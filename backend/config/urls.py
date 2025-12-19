"""
URL configuration for Nature Marketplace project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
"""

from django.contrib import admin
from django.urls import include, path
from django.http import JsonResponse
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)


def health_check(request):
    """Health check endpoint for Docker and load balancers."""
    return JsonResponse({"status": "healthy", "service": "nature-marketplace-api"})


urlpatterns = [
    # Admin site
    path('admin/', admin.site.urls),
    
    # Health check endpoint
    path('api/health/', health_check, name='health_check'),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # Authentication (dj-rest-auth)
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
    path('api/auth/social/', include('allauth.socialaccount.urls')),
    
    # API endpoints
    path('api/users/', include('users.urls', namespace='users')),
    path('api/', include('products.urls', namespace='products')),
    path('api/', include('orders.urls', namespace='orders')),
    path('api/payments/', include('payments.urls', namespace='payments')),
    path('api/ecosystems/', include('ecosystems.urls', namespace='ecosystems')),
]
