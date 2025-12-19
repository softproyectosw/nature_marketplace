"""
Order service for business logic operations.

This module contains business logic for cart and order operations.
"""

from typing import Optional
from decimal import Decimal
from django.db import transaction
from django.contrib.auth import get_user_model

from .models import Cart, CartItem, Order, OrderItem
from .repositories import (
    CartRepository, CartItemRepository,
    OrderRepository, OrderItemRepository
)
from products.services import product_service

User = get_user_model()


class CartService:
    """Service for shopping cart business logic."""
    
    def __init__(self):
        self.cart_repo = CartRepository
        self.item_repo = CartItemRepository
    
    def get_cart(self, user: Optional[User] = None, session_key: Optional[str] = None) -> Cart:
        """
        Get or create a cart for a user or session.
        
        Args:
            user: Authenticated user (optional)
            session_key: Session key for anonymous users (optional)
        
        Returns:
            Cart instance
        """
        if user and user.is_authenticated:
            return self.cart_repo.get_or_create_for_user(user)
        elif session_key:
            return self.cart_repo.get_or_create_for_session(session_key)
        else:
            raise ValueError("Either user or session_key must be provided")
    
    def add_to_cart(
        self,
        cart: Cart,
        product_id: int,
        quantity: int = 1,
        options: dict = None
    ) -> dict:
        """
        Add a product to the cart.
        
        Args:
            cart: Cart instance
            product_id: Product ID to add
            quantity: Quantity to add
            options: Product-specific options
        
        Returns:
            Dict with success status and cart item or error
        """
        # Validate quantity
        if quantity < 1:
            return {'success': False, 'error': 'Quantity must be at least 1'}
        
        # Check product availability
        if not product_service.check_availability(product_id, quantity):
            return {'success': False, 'error': 'Product not available'}
        
        try:
            item = self.item_repo.add_item(cart, product_id, quantity, options)
            return {'success': True, 'item': item, 'cart': cart}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def update_quantity(self, cart: Cart, product_id: int, quantity: int) -> dict:
        """
        Update the quantity of a cart item.
        
        Args:
            cart: Cart instance
            product_id: Product ID to update
            quantity: New quantity (0 to remove)
        
        Returns:
            Dict with success status
        """
        if quantity < 0:
            return {'success': False, 'error': 'Quantity cannot be negative'}
        
        if quantity > 0:
            # Check availability for new quantity
            if not product_service.check_availability(product_id, quantity):
                return {'success': False, 'error': 'Requested quantity not available'}
        
        item = self.item_repo.update_quantity(cart, product_id, quantity)
        return {'success': True, 'item': item, 'cart': cart}
    
    def remove_from_cart(self, cart: Cart, product_id: int) -> dict:
        """Remove a product from the cart."""
        removed = self.item_repo.remove_item(cart, product_id)
        return {'success': removed, 'cart': cart}
    
    def clear_cart(self, cart: Cart) -> dict:
        """Remove all items from the cart."""
        self.cart_repo.clear(cart)
        return {'success': True, 'cart': cart}
    
    def get_cart_summary(self, cart: Cart) -> dict:
        """
        Get a summary of the cart.
        
        Returns:
            Dict with items, counts, and totals
        """
        items = list(cart.items.select_related('product').all())
        return {
            'items': items,
            'item_count': len(items),
            'total_quantity': sum(item.quantity for item in items),
            'subtotal': cart.subtotal,
            'total': cart.total,
        }
    
    def merge_anonymous_cart(self, user: User, session_key: str) -> Cart:
        """
        Merge an anonymous cart into a user's cart after login.
        
        Args:
            user: The authenticated user
            session_key: The anonymous session key
        
        Returns:
            The user's cart with merged items
        """
        user_cart = self.cart_repo.get_or_create_for_user(user)
        
        try:
            anonymous_cart = Cart.objects.get(session_key=session_key)
            return self.cart_repo.merge_carts(anonymous_cart, user_cart)
        except Cart.DoesNotExist:
            return user_cart


class OrderService:
    """Service for order business logic."""
    
    def __init__(self):
        self.order_repo = OrderRepository
        self.order_item_repo = OrderItemRepository
        self.cart_service = CartService()
    
    @transaction.atomic
    def create_order_from_cart(self, user: User, cart: Cart, **kwargs) -> dict:
        """
        Create an order from a cart.
        
        This is an atomic operation that:
        1. Validates cart is not empty
        2. Checks all products are available
        3. Creates the order and order items
        4. Reserves stock for each product
        5. Clears the cart
        
        Args:
            user: The user placing the order
            cart: The cart to convert to order
            **kwargs: Additional order fields
        
        Returns:
            Dict with success status and order or error
        """
        # Validate cart is not empty
        if cart.total_items == 0:
            return {'success': False, 'error': 'Cart is empty'}
        
        # Check availability for all items
        for item in cart.items.all():
            if not product_service.check_availability(item.product.id, item.quantity):
                return {
                    'success': False,
                    'error': f'{item.product.title} is not available in requested quantity'
                }
        
        # Create the order
        order = self.order_repo.create(user, cart, **kwargs)
        
        # Create order items and reserve stock
        for cart_item in cart.items.all():
            self.order_item_repo.create_from_cart_item(order, cart_item)
            product_service.reserve_stock(cart_item.product.id, cart_item.quantity)
        
        # Clear the cart
        cart.clear()
        
        return {'success': True, 'order': order}
    
    def get_order(self, order_id: str) -> Optional[Order]:
        """Get an order by ID."""
        return self.order_repo.get_by_id(order_id)
    
    def get_order_by_number(self, order_number: str) -> Optional[Order]:
        """Get an order by order number."""
        return self.order_repo.get_by_order_number(order_number)
    
    def get_user_orders(self, user: User):
        """Get all orders for a user."""
        return self.order_repo.get_user_orders(user)
    
    def mark_as_paid(self, order: Order) -> Order:
        """Mark an order as paid."""
        return self.order_repo.update_status(order, Order.OrderStatus.PAID)
    
    def mark_as_fulfilled(self, order: Order) -> Order:
        """Mark an order as fulfilled."""
        return self.order_repo.update_status(order, Order.OrderStatus.FULFILLED)
    
    def cancel_order(self, order: Order) -> dict:
        """
        Cancel an order.
        
        Only pending or paid orders can be cancelled.
        """
        if not order.can_cancel:
            return {'success': False, 'error': 'Order cannot be cancelled'}
        
        self.order_repo.update_status(order, Order.OrderStatus.CANCELLED)
        
        # TODO: Restore stock for cancelled items
        # TODO: Process refund if order was paid
        
        return {'success': True, 'order': order}


# Singleton instances
cart_service = CartService()
order_service = OrderService()
