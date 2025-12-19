"""
Order repository for data access operations.

This module abstracts database operations for Cart, CartItem, Order, and OrderItem models.
"""

from typing import Optional
from django.db.models import QuerySet
from django.contrib.auth import get_user_model

from .models import Cart, CartItem, Order, OrderItem

User = get_user_model()


class CartRepository:
    """Repository for Cart data access operations."""
    
    @staticmethod
    def get_or_create_for_user(user: User) -> Cart:
        """Get or create a cart for an authenticated user."""
        cart, _ = Cart.objects.get_or_create(user=user)
        return cart
    
    @staticmethod
    def get_or_create_for_session(session_key: str) -> Cart:
        """Get or create a cart for an anonymous session."""
        cart, _ = Cart.objects.get_or_create(session_key=session_key)
        return cart
    
    @staticmethod
    def get_by_id(cart_id: int) -> Optional[Cart]:
        """Get a cart by its ID."""
        try:
            return Cart.objects.prefetch_related('items__product').get(id=cart_id)
        except Cart.DoesNotExist:
            return None
    
    @staticmethod
    def get_for_user(user: User) -> Optional[Cart]:
        """Get the cart for a user."""
        try:
            return Cart.objects.prefetch_related('items__product').get(user=user)
        except Cart.DoesNotExist:
            return None
    
    @staticmethod
    def merge_carts(anonymous_cart: Cart, user_cart: Cart) -> Cart:
        """
        Merge an anonymous cart into a user's cart.
        
        Used when an anonymous user logs in.
        """
        for item in anonymous_cart.items.all():
            existing_item = user_cart.items.filter(product=item.product).first()
            if existing_item:
                existing_item.quantity += item.quantity
                existing_item.save()
            else:
                item.cart = user_cart
                item.save()
        
        anonymous_cart.delete()
        return user_cart
    
    @staticmethod
    def clear(cart: Cart) -> None:
        """Remove all items from a cart."""
        cart.items.all().delete()


class CartItemRepository:
    """Repository for CartItem data access operations."""
    
    @staticmethod
    def add_item(cart: Cart, product_id: int, quantity: int = 1, options: dict = None) -> CartItem:
        """Add an item to the cart or update quantity if exists."""
        from products.models import Product
        
        product = Product.objects.get(id=product_id)
        item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={
                'quantity': quantity,
                'selected_options': options or {}
            }
        )
        
        if not created:
            item.quantity += quantity
            if options:
                item.selected_options.update(options)
            item.save()
        
        return item
    
    @staticmethod
    def update_quantity(cart: Cart, product_id: int, quantity: int) -> Optional[CartItem]:
        """Update the quantity of a cart item."""
        try:
            item = CartItem.objects.get(cart=cart, product_id=product_id)
            if quantity <= 0:
                item.delete()
                return None
            item.quantity = quantity
            item.save()
            return item
        except CartItem.DoesNotExist:
            return None
    
    @staticmethod
    def remove_item(cart: Cart, product_id: int) -> bool:
        """Remove an item from the cart."""
        deleted, _ = CartItem.objects.filter(cart=cart, product_id=product_id).delete()
        return deleted > 0


class OrderRepository:
    """Repository for Order data access operations."""
    
    @staticmethod
    def create(user: User, cart: Cart, **kwargs) -> Order:
        """Create an order from a cart."""
        # Extract known fields from kwargs to avoid duplicates
        customer_email = kwargs.pop('customer_email', user.email)
        customer_name = kwargs.pop('customer_name', '')
        
        order = Order.objects.create(
            user=user,
            subtotal=cart.subtotal,
            total_amount=cart.total,
            customer_email=customer_email,
            customer_name=customer_name,
            **kwargs
        )
        return order
    
    @staticmethod
    def get_by_id(order_id: str) -> Optional[Order]:
        """Get an order by its UUID."""
        try:
            return Order.objects.prefetch_related('items__product').get(id=order_id)
        except Order.DoesNotExist:
            return None
    
    @staticmethod
    def get_by_order_number(order_number: str) -> Optional[Order]:
        """Get an order by its order number."""
        try:
            return Order.objects.prefetch_related('items__product').get(
                order_number=order_number
            )
        except Order.DoesNotExist:
            return None
    
    @staticmethod
    def get_user_orders(user: User) -> QuerySet[Order]:
        """Get all orders for a user."""
        return (
            Order.objects
            .filter(user=user)
            .prefetch_related('items__product')
            .order_by('-created_at')
        )
    
    @staticmethod
    def update_status(order: Order, status: str) -> Order:
        """Update the status of an order."""
        from django.utils import timezone
        
        order.status = status
        
        if status == Order.OrderStatus.PAID:
            order.paid_at = timezone.now()
        elif status == Order.OrderStatus.FULFILLED:
            order.fulfilled_at = timezone.now()
        
        order.save()
        return order


class OrderItemRepository:
    """Repository for OrderItem data access operations."""
    
    @staticmethod
    def create_from_cart_item(order: Order, cart_item: CartItem) -> OrderItem:
        """Create an order item from a cart item."""
        return OrderItem.objects.create(
            order=order,
            product=cart_item.product,
            product_title=cart_item.product.title,
            product_slug=cart_item.product.slug,
            quantity=cart_item.quantity,
            unit_price=cart_item.unit_price,
            line_total=cart_item.line_total,
            selected_options=cart_item.selected_options
        )
    
    @staticmethod
    def create_items_from_cart(order: Order, cart: Cart) -> list[OrderItem]:
        """Create all order items from a cart."""
        items = []
        for cart_item in cart.items.all():
            item = OrderItemRepository.create_from_cart_item(order, cart_item)
            items.append(item)
        return items
