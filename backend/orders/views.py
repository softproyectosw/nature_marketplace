"""
Order API views.

This module defines API endpoints for cart and order management.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema, extend_schema_view

from .models import Cart, Order
from .serializers import (
    CartSerializer,
    CartItemSerializer,
    CartItemCreateSerializer,
    CartItemUpdateSerializer,
    OrderSerializer,
    OrderListSerializer,
    OrderCreateSerializer,
)
from .services import cart_service, order_service


@extend_schema_view(
    list=extend_schema(
        summary="Get cart",
        description="Get the current user's shopping cart.",
        tags=["Cart"]
    ),
)
class CartViewSet(viewsets.ViewSet):
    """
    ViewSet for shopping cart operations.
    
    Handles cart retrieval, adding/removing items, and clearing.
    """
    
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_cart(self, request):
        """Get or create cart for the current user/session."""
        if request.user.is_authenticated:
            return cart_service.get_cart(user=request.user)
        else:
            session_key = request.session.session_key
            if not session_key:
                request.session.create()
                session_key = request.session.session_key
            return cart_service.get_cart(session_key=session_key)
    
    @extend_schema(
        summary="Get cart",
        description="Get the current shopping cart with all items.",
        tags=["Cart"]
    )
    def list(self, request):
        """Get the current cart."""
        cart = self.get_cart(request)
        serializer = CartSerializer(cart)
        return Response(serializer.data)
    
    @extend_schema(
        summary="Add item to cart",
        description="Add a product to the shopping cart.",
        request=CartItemCreateSerializer,
        tags=["Cart"]
    )
    @action(detail=False, methods=['post'])
    def add(self, request):
        """Add an item to the cart."""
        serializer = CartItemCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        cart = self.get_cart(request)
        result = cart_service.add_to_cart(
            cart=cart,
            product_id=serializer.validated_data['product_id'],
            quantity=serializer.validated_data.get('quantity', 1),
            options=serializer.validated_data.get('selected_options', {})
        )
        
        if result['success']:
            return Response(
                CartSerializer(result['cart']).data,
                status=status.HTTP_201_CREATED
            )
        return Response(
            {'error': result['error']},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @extend_schema(
        summary="Update cart item quantity",
        description="Update the quantity of an item in the cart.",
        request=CartItemUpdateSerializer,
        tags=["Cart"]
    )
    @action(detail=False, methods=['patch'], url_path='update/(?P<product_id>[^/.]+)')
    def update_item(self, request, product_id=None):
        """Update cart item quantity."""
        serializer = CartItemUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        cart = self.get_cart(request)
        result = cart_service.update_quantity(
            cart=cart,
            product_id=int(product_id),
            quantity=serializer.validated_data['quantity']
        )
        
        if result['success']:
            return Response(CartSerializer(result['cart']).data)
        return Response(
            {'error': result['error']},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @extend_schema(
        summary="Remove item from cart",
        description="Remove a product from the shopping cart.",
        tags=["Cart"]
    )
    @action(detail=False, methods=['delete'], url_path='remove/(?P<product_id>[^/.]+)')
    def remove_item(self, request, product_id=None):
        """Remove an item from the cart."""
        cart = self.get_cart(request)
        result = cart_service.remove_from_cart(cart, int(product_id))
        
        if result['success']:
            return Response(CartSerializer(result['cart']).data)
        return Response(
            {'error': 'Item not found in cart'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    @extend_schema(
        summary="Clear cart",
        description="Remove all items from the shopping cart.",
        tags=["Cart"]
    )
    @action(detail=False, methods=['delete'])
    def clear(self, request):
        """Clear all items from the cart."""
        cart = self.get_cart(request)
        cart_service.clear_cart(cart)
        return Response(CartSerializer(cart).data)
    
    @extend_schema(
        summary="Get cart summary",
        description="Get a summary of the cart with totals.",
        tags=["Cart"]
    )
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get cart summary."""
        cart = self.get_cart(request)
        summary = cart_service.get_cart_summary(cart)
        return Response({
            'item_count': summary['item_count'],
            'total_quantity': summary['total_quantity'],
            'subtotal': str(summary['subtotal']),
            'total': str(summary['total']),
        })


@extend_schema_view(
    list=extend_schema(
        summary="List user orders",
        description="Get all orders for the authenticated user.",
        tags=["Orders"]
    ),
    retrieve=extend_schema(
        summary="Get order details",
        description="Get full details of a specific order.",
        tags=["Orders"]
    ),
)
class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for order operations.
    
    Provides list and retrieve for user's orders.
    """
    
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'
    
    def get_queryset(self):
        """Filter orders to only show user's own orders."""
        return order_service.get_user_orders(self.request.user)
    
    def get_serializer_class(self):
        if self.action == 'list':
            return OrderListSerializer
        return OrderSerializer
    
    @extend_schema(
        summary="Create order from cart",
        description="Convert the current cart into an order.",
        request=OrderCreateSerializer,
        tags=["Orders"]
    )
    @action(detail=False, methods=['post'])
    def create_from_cart(self, request):
        """Create an order from the current cart."""
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Get user's cart
        cart = cart_service.get_cart(user=request.user)
        
        # Create order
        result = order_service.create_order_from_cart(
            user=request.user,
            cart=cart,
            **serializer.validated_data
        )
        
        if result['success']:
            return Response(
                OrderSerializer(result['order']).data,
                status=status.HTTP_201_CREATED
            )
        return Response(
            {'error': result['error']},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @extend_schema(
        summary="Cancel order",
        description="Cancel a pending or paid order.",
        tags=["Orders"]
    )
    @action(detail=True, methods=['post'])
    def cancel(self, request, id=None):
        """Cancel an order."""
        order = self.get_object()
        result = order_service.cancel_order(order)
        
        if result['success']:
            return Response(OrderSerializer(result['order']).data)
        return Response(
            {'error': result['error']},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @extend_schema(
        summary="Get order by number",
        description="Get an order by its order number.",
        tags=["Orders"]
    )
    @action(detail=False, methods=['get'], url_path='by-number/(?P<order_number>[^/.]+)')
    def by_number(self, request, order_number=None):
        """Get order by order number."""
        order = order_service.get_order_by_number(order_number)
        
        if not order or order.user != request.user:
            return Response(
                {'error': 'Order not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        return Response(OrderSerializer(order).data)
