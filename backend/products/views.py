"""
Product API views.

This module defines API endpoints for products and categories.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter

from .models import Product, Category
from .serializers import (
    CategorySerializer,
    CategoryListSerializer,
    ProductListSerializer,
    ProductDetailSerializer,
    ProductCreateSerializer,
)
from .services import product_service, category_service


@extend_schema_view(
    list=extend_schema(
        summary="List all categories",
        description="Get all active product categories.",
        tags=["Products"]
    ),
    retrieve=extend_schema(
        summary="Get category details",
        description="Get a category by its slug with product count.",
        tags=["Products"]
    ),
)
class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for product categories.
    
    Provides list and retrieve operations for categories.
    """
    
    queryset = Category.objects.filter(is_active=True)
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'
    
    def get_serializer_class(self):
        if self.action == 'list':
            return CategoryListSerializer
        return CategorySerializer
    
    @extend_schema(
        summary="Get category products",
        description="Get all products in a specific category.",
        tags=["Products"]
    )
    @action(detail=True, methods=['get'])
    def products(self, request, slug=None):
        """Get all products in this category."""
        products = product_service.get_products_by_category(slug)
        serializer = ProductListSerializer(products, many=True)
        return Response(serializer.data)


@extend_schema_view(
    list=extend_schema(
        summary="List all products",
        description="Get all active products with optional filtering.",
        tags=["Products"],
        parameters=[
            OpenApiParameter(name='category', description='Filter by category slug'),
            OpenApiParameter(name='product_type', description='Filter by product type'),
            OpenApiParameter(name='is_featured', description='Filter featured products'),
            OpenApiParameter(name='search', description='Search in title and description'),
        ]
    ),
    retrieve=extend_schema(
        summary="Get product details",
        description="Get full product details by slug.",
        tags=["Products"]
    ),
)
class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for products.
    
    Provides list and retrieve operations with filtering and search.
    """
    
    queryset = Product.objects.filter(is_active=True).select_related('category')
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category__slug', 'product_type', 'is_featured', 'is_new']
    search_fields = ['title', 'description', 'short_description', 'species']
    ordering_fields = ['price', 'rating', 'created_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        return ProductDetailSerializer
    
    @extend_schema(
        summary="Get featured products",
        description="Get products marked as featured for homepage display.",
        tags=["Products"]
    )
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured products."""
        limit = int(request.query_params.get('limit', 10))
        products = product_service.get_featured_products(limit)
        serializer = ProductListSerializer(products, many=True)
        return Response(serializer.data)
    
    @extend_schema(
        summary="Get new arrivals",
        description="Get products marked as new arrivals.",
        tags=["Products"]
    )
    @action(detail=False, methods=['get'])
    def new_arrivals(self, request):
        """Get new arrival products."""
        limit = int(request.query_params.get('limit', 10))
        products = product_service.get_new_arrivals(limit)
        serializer = ProductListSerializer(products, many=True)
        return Response(serializer.data)
    
    @extend_schema(
        summary="Get tree products",
        description="Get all tree products available for adoption.",
        tags=["Products"]
    )
    @action(detail=False, methods=['get'])
    def trees(self, request):
        """Get all tree products."""
        products = product_service.get_trees()
        serializer = ProductListSerializer(products, many=True)
        return Response(serializer.data)
    
    @extend_schema(
        summary="Get retreat products",
        description="Get all wellness retreat products.",
        tags=["Products"]
    )
    @action(detail=False, methods=['get'])
    def retreats(self, request):
        """Get all retreat products."""
        products = product_service.get_retreats()
        serializer = ProductListSerializer(products, many=True)
        return Response(serializer.data)
    
    @extend_schema(
        summary="Check product availability",
        description="Check if a product is available in the requested quantity.",
        tags=["Products"]
    )
    @action(detail=True, methods=['get'])
    def availability(self, request, slug=None):
        """Check product availability."""
        product = self.get_object()
        quantity = int(request.query_params.get('quantity', 1))
        is_available = product_service.check_availability(product.id, quantity)
        return Response({
            'product_id': product.id,
            'quantity': quantity,
            'is_available': is_available,
            'stock': product.stock if not product.is_unlimited_stock else None,
        })
