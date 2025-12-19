"""
Order models for Nature Marketplace.

This module defines Cart, CartItem, Order, and OrderItem models
for managing the shopping experience and order processing.
"""

import uuid
from decimal import Decimal
from django.conf import settings
from django.db import models
from django.core.validators import MinValueValidator

from products.models import Product
class Cart(models.Model):
    """
    Shopping cart for a user.
    
    Each authenticated user has one active cart.
    Anonymous users can have session-based carts (handled in views).
    """
    
    # Relationships
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='cart',
        null=True,
        blank=True,
        help_text='The user who owns this cart (null for anonymous)'
    )
    
    # Session ID for anonymous carts
    session_key = models.CharField(
        max_length=40,
        null=True,
        blank=True,
        db_index=True,
        help_text='Session key for anonymous cart'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Cart'
        verbose_name_plural = 'Carts'
        ordering = ['-updated_at']
    
    def __str__(self) -> str:
        if self.user:
            return f"Cart for {self.user.username}"
        return f"Anonymous Cart ({self.session_key[:8]}...)"
    
    @property
    def total_items(self) -> int:
        """Get total number of items in cart."""
        return sum(item.quantity for item in self.items.all())
    
    @property
    def subtotal(self) -> Decimal:
        """Calculate cart subtotal before any discounts."""
        return sum(item.line_total for item in self.items.all())
    
    @property
    def total(self) -> Decimal:
        """Calculate cart total (subtotal for now, can add discounts later)."""
        return self.subtotal
    
    def clear(self) -> None:
        """Remove all items from cart."""
        self.items.all().delete()
class CartItem(models.Model):
    """
    Individual item in a shopping cart.
    
    Tracks product, quantity, and any selected options.
    """
    
    # Relationships
    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name='items',
        help_text='The cart this item belongs to'
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='cart_items',
        help_text='The product being purchased'
    )
    
    # Item Details
    quantity = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        help_text='Quantity of this product'
    )
    
    # Selected options (e.g., retreat date, tree nickname)
    selected_options = models.JSONField(
        default=dict,
        blank=True,
        help_text='Product-specific options (e.g., {"date": "2024-10-15"})'
    )
    
    # Timestamps
    added_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Cart Item'
        verbose_name_plural = 'Cart Items'
        unique_together = ['cart', 'product']
        ordering = ['-added_at']
    
    def __str__(self) -> str:
        return f"{self.quantity}x {self.product.title}"
    
    @property
    def unit_price(self) -> Decimal:
        """Get the unit price of the product."""
        return self.product.price
    
    @property
    def line_total(self) -> Decimal:
        """Calculate total for this line item."""
        return self.unit_price * self.quantity
class Order(models.Model):
    """
    Completed order from a user.
    
    Orders are created when a cart is checked out and payment is processed.
    """
    
    # Order Status Choices
    class OrderStatus(models.TextChoices):
        PENDING = 'Pending', 'Pending'
        PAID = 'Paid', 'Paid'
        PROCESSING = 'Processing', 'Processing'
        FULFILLED = 'Fulfilled', 'Fulfilled'
        CANCELLED = 'Cancelled', 'Cancelled'
        REFUNDED = 'Refunded', 'Refunded'
    
    # Identification
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text='Unique order identifier'
    )
    order_number = models.CharField(
        max_length=20,
        unique=True,
        editable=False,
        help_text='Human-readable order number'
    )
    
    # Relationships
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='orders',
        help_text='The user who placed this order'
    )
    
    # Order Details
    status = models.CharField(
        max_length=20,
        choices=OrderStatus.choices,
        default=OrderStatus.PENDING,
        help_text='Current order status'
    )
    
    # Amounts
    subtotal = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text='Order subtotal before discounts'
    )
    discount_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        help_text='Total discount applied'
    )
    tax_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        help_text='Tax amount'
    )
    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text='Final order total'
    )
    currency = models.CharField(
        max_length=3,
        default='USD',
        help_text='Currency code (ISO 4217)'
    )
    
    # Customer Information (snapshot at time of order)
    customer_email = models.EmailField(
        help_text='Customer email at time of order'
    )
    customer_name = models.CharField(
        max_length=200,
        blank=True,
        help_text='Customer name at time of order'
    )
    
    # Notes
    customer_notes = models.TextField(
        blank=True,
        help_text='Notes from the customer'
    )
    internal_notes = models.TextField(
        blank=True,
        help_text='Internal notes (not visible to customer)'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    paid_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text='When payment was confirmed'
    )
    fulfilled_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text='When order was fulfilled'
    )
    
    class Meta:
        verbose_name = 'Order'
        verbose_name_plural = 'Orders'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['order_number']),
            models.Index(fields=['user', 'status']),
            models.Index(fields=['status', 'created_at']),
        ]
    
    def __str__(self) -> str:
        return f"Order {self.order_number}"
    
    def save(self, *args, **kwargs) -> None:
        """Generate order number if not set."""
        if not self.order_number:
            # Generate order number: NM-YYYYMMDD-XXXX
            from django.utils import timezone
            import random
            date_str = timezone.now().strftime('%Y%m%d')
            random_suffix = ''.join([str(random.randint(0, 9)) for _ in range(4)])
            self.order_number = f"NM-{date_str}-{random_suffix}"
        super().save(*args, **kwargs)
    
    @property
    def is_paid(self) -> bool:
        """Check if order has been paid."""
        return self.status in [
            self.OrderStatus.PAID,
            self.OrderStatus.PROCESSING,
            self.OrderStatus.FULFILLED,
        ]
    
    @property
    def can_cancel(self) -> bool:
        """Check if order can be cancelled."""
        return self.status in [
            self.OrderStatus.PENDING,
            self.OrderStatus.PAID,
        ]
class OrderItem(models.Model):
    """
    Individual item in an order.
    
    Stores a snapshot of product data at time of purchase.
    """
    
    # Relationships
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items',
        help_text='The order this item belongs to'
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name='order_items',
        help_text='The product that was purchased'
    )
    
    # Item Details (snapshot at time of order)
    product_title = models.CharField(
        max_length=200,
        help_text='Product title at time of purchase'
    )
    product_slug = models.SlugField(
        max_length=200,
        help_text='Product slug at time of purchase'
    )
    
    quantity = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        help_text='Quantity purchased'
    )
    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text='Price per unit at time of purchase'
    )
    line_total = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text='Total for this line item'
    )
    
    # Selected options
    selected_options = models.JSONField(
        default=dict,
        blank=True,
        help_text='Product-specific options selected'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Order Item'
        verbose_name_plural = 'Order Items'
        ordering = ['created_at']
    
    def __str__(self) -> str:
        return f"{self.quantity}x {self.product_title}"
    
    def save(self, *args, **kwargs) -> None:
        """Calculate line total and snapshot product data."""
        # Snapshot product data if not set
        if not self.product_title:
            self.product_title = self.product.title
        if not self.product_slug:
            self.product_slug = self.product.slug
        
        # Calculate line total
        self.line_total = self.unit_price * self.quantity
        
        super().save(*args, **kwargs)
