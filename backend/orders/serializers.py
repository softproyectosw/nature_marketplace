"""
Order serializers for API responses and request validation.

These serializers handle cart and order data transformation.
"""

from rest_framework import serializers

from .models import Cart, CartItem, Order, OrderItem
from products.serializers import ProductListSerializer


class CartItemSerializer(serializers.ModelSerializer):
    """Serializer for CartItem model."""
    
    product = ProductListSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    unit_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True
    )
    line_total = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True
    )
    
    class Meta:
        model = CartItem
        fields = [
            'id',
            'product',
            'product_id',
            'quantity',
            'selected_options',
            'unit_price',
            'line_total',
            'added_at',
        ]
        read_only_fields = ['id', 'added_at']


class CartItemCreateSerializer(serializers.Serializer):
    """Serializer for adding items to cart."""
    
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, default=1)
    selected_options = serializers.DictField(required=False, default=dict)
    
    def validate_product_id(self, value: int) -> int:
        """Validate that product exists and is active."""
        from products.models import Product
        
        try:
            product = Product.objects.get(id=value, is_active=True)
        except Product.DoesNotExist:
            raise serializers.ValidationError("Product not found or unavailable.")
        
        return value


class CartItemUpdateSerializer(serializers.Serializer):
    """Serializer for updating cart item quantity."""
    
    quantity = serializers.IntegerField(min_value=0)


class CartSerializer(serializers.ModelSerializer):
    """Serializer for Cart model with items."""
    
    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.IntegerField(read_only=True)
    subtotal = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True
    )
    total = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True
    )
    
    class Meta:
        model = Cart
        fields = [
            'id',
            'items',
            'total_items',
            'subtotal',
            'total',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for OrderItem model."""
    
    product_id = serializers.IntegerField(source='product.id', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = [
            'id',
            'product_id',
            'product_title',
            'product_slug',
            'quantity',
            'unit_price',
            'line_total',
            'selected_options',
        ]
        read_only_fields = ['id']


class OrderSerializer(serializers.ModelSerializer):
    """Serializer for Order model."""
    
    items = OrderItemSerializer(many=True, read_only=True)
    is_paid = serializers.BooleanField(read_only=True)
    can_cancel = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id',
            'order_number',
            'status',
            'subtotal',
            'discount_amount',
            'tax_amount',
            'total_amount',
            'currency',
            'customer_email',
            'customer_name',
            'customer_notes',
            'items',
            'is_paid',
            'can_cancel',
            'created_at',
            'paid_at',
            'fulfilled_at',
        ]
        read_only_fields = [
            'id',
            'order_number',
            'status',
            'subtotal',
            'total_amount',
            'created_at',
            'paid_at',
            'fulfilled_at',
        ]


class OrderListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for order lists."""
    
    item_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = [
            'id',
            'order_number',
            'status',
            'total_amount',
            'currency',
            'item_count',
            'created_at',
        ]
    
    def get_item_count(self, obj) -> int:
        return obj.items.count()


class OrderCreateSerializer(serializers.Serializer):
    """Serializer for creating an order from cart."""
    
    customer_name = serializers.CharField(max_length=200, required=False)
    customer_notes = serializers.CharField(max_length=1000, required=False)


class CheckoutSerializer(serializers.Serializer):
    """Serializer for checkout process."""
    
    order_id = serializers.UUIDField(required=False)
    success_url = serializers.URLField()
    cancel_url = serializers.URLField()
