"""
Tests for orders app.

Tests cover models, services, and API endpoints.
"""

from decimal import Decimal
from django.test import TestCase
from django.contrib.auth import get_user_model

from .models import Cart, CartItem, Order, OrderItem
from .services import CartService, OrderService
from products.models import Category, Product

User = get_user_model()


class CartModelTest(TestCase):
    """Tests for Cart model."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.cart = Cart.objects.create(user=self.user)
        self.category = Category.objects.create(
            name='Trees',
            slug='trees',
            is_active=True
        )
        self.product = Product.objects.create(
            title='Test Tree',
            slug='test-tree',
            category=self.category,
            price=Decimal('50.00'),
            stock=10,
            is_active=True
        )

    def test_cart_str(self):
        """Test cart string representation."""
        self.assertIn('testuser', str(self.cart))

    def test_cart_empty_by_default(self):
        """Test that new cart is empty."""
        self.assertEqual(self.cart.total_items, 0)
        self.assertEqual(self.cart.subtotal, 0)

    def test_add_item_to_cart(self):
        """Test adding item to cart."""
        CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=2
        )
        self.assertEqual(self.cart.total_items, 2)
        self.assertEqual(self.cart.subtotal, Decimal('100.00'))


class OrderModelTest(TestCase):
    """Tests for Order model."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='orderuser',
            email='order@example.com',
            password='testpass123'
        )
        self.order = Order.objects.create(
            user=self.user,
            subtotal=Decimal('100.00'),
            total_amount=Decimal('105.00'),
            customer_email='order@example.com'
        )

    def test_order_str(self):
        """Test order string representation."""
        self.assertIn(self.order.order_number, str(self.order))

    def test_order_number_generated(self):
        """Test that order number is auto-generated."""
        self.assertIsNotNone(self.order.order_number)
        self.assertTrue(self.order.order_number.startswith('NM-'))

    def test_order_default_status(self):
        """Test order default status is pending."""
        self.assertEqual(self.order.status, Order.OrderStatus.PENDING)

    def test_order_can_cancel(self):
        """Test order can be cancelled when pending."""
        self.assertTrue(self.order.can_cancel)
        self.order.status = Order.OrderStatus.FULFILLED
        self.assertFalse(self.order.can_cancel)


class CartServiceTest(TestCase):
    """Tests for CartService."""

    def setUp(self):
        self.service = CartService()
        self.user = User.objects.create_user(
            username='cartuser',
            email='cart@example.com',
            password='testpass123'
        )
        self.category = Category.objects.create(
            name='Trees',
            slug='trees',
            is_active=True
        )
        self.product = Product.objects.create(
            title='Service Tree',
            slug='service-tree',
            category=self.category,
            price=Decimal('75.00'),
            stock=20,
            is_active=True
        )

    def test_get_cart_for_user(self):
        """Test getting cart for authenticated user."""
        cart = self.service.get_cart(user=self.user)
        self.assertIsNotNone(cart)
        self.assertEqual(cart.user, self.user)

    def test_add_to_cart(self):
        """Test adding product to cart."""
        cart = self.service.get_cart(user=self.user)
        result = self.service.add_to_cart(cart, self.product.id, quantity=2)
        self.assertTrue(result['success'])
        self.assertEqual(cart.total_items, 2)

    def test_add_to_cart_invalid_quantity(self):
        """Test adding product with invalid quantity."""
        cart = self.service.get_cart(user=self.user)
        result = self.service.add_to_cart(cart, self.product.id, quantity=0)
        self.assertFalse(result['success'])

    def test_clear_cart(self):
        """Test clearing cart."""
        cart = self.service.get_cart(user=self.user)
        self.service.add_to_cart(cart, self.product.id, quantity=1)
        result = self.service.clear_cart(cart)
        self.assertTrue(result['success'])
        self.assertEqual(cart.total_items, 0)


class OrderServiceTest(TestCase):
    """Tests for OrderService."""

    def setUp(self):
        self.cart_service = CartService()
        self.order_service = OrderService()
        self.user = User.objects.create_user(
            username='orderserviceuser',
            email='orderservice@example.com',
            password='testpass123'
        )
        self.category = Category.objects.create(
            name='Retreats',
            slug='retreats',
            is_active=True
        )
        self.product = Product.objects.create(
            title='Wellness Retreat',
            slug='wellness-retreat',
            category=self.category,
            product_type=Product.ProductType.RETREAT,
            price=Decimal('500.00'),
            stock=10,
            is_active=True
        )

    def test_create_order_from_empty_cart(self):
        """Test creating order from empty cart fails."""
        cart = self.cart_service.get_cart(user=self.user)
        result = self.order_service.create_order_from_cart(self.user, cart)
        self.assertFalse(result['success'])
        self.assertIn('empty', result['error'].lower())

    def test_create_order_from_cart(self):
        """Test creating order from cart with items."""
        cart = self.cart_service.get_cart(user=self.user)
        self.cart_service.add_to_cart(cart, self.product.id, quantity=1)
        result = self.order_service.create_order_from_cart(
            self.user,
            cart,
            customer_email='orderservice@example.com'
        )
        self.assertTrue(result['success'])
        self.assertIsNotNone(result['order'])
        self.assertEqual(result['order'].total_amount, Decimal('500.00'))
