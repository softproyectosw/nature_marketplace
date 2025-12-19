"""
Tests for products app.

Tests cover models, services, and API endpoints.
"""

from decimal import Decimal
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status

from .models import Category, Product
from .services import ProductService, CategoryService


class CategoryModelTest(TestCase):
    """Tests for Category model."""

    def setUp(self):
        self.category = Category.objects.create(
            name='Trees',
            slug='trees',
            description='Adopt a tree',
            is_active=True
        )

    def test_category_str(self):
        """Test category string representation."""
        self.assertEqual(str(self.category), 'Trees')

    def test_category_slug_unique(self):
        """Test that category slug is unique."""
        with self.assertRaises(Exception):
            Category.objects.create(name='Trees 2', slug='trees')


class ProductModelTest(TestCase):
    """Tests for Product model."""

    def setUp(self):
        self.category = Category.objects.create(
            name='Trees',
            slug='trees',
            is_active=True
        )
        self.product = Product.objects.create(
            title='Andean Oak Tree',
            slug='andean-oak-tree',
            category=self.category,
            product_type=Product.ProductType.TREE,
            price=Decimal('49.00'),
            stock=100,
            is_active=True
        )

    def test_product_str(self):
        """Test product string representation."""
        self.assertEqual(str(self.product), 'Andean Oak Tree')

    def test_product_in_stock(self):
        """Test product is_in_stock property."""
        self.assertTrue(self.product.is_in_stock)
        self.product.stock = 0
        self.assertFalse(self.product.is_in_stock)

    def test_product_unlimited_stock(self):
        """Test unlimited stock products."""
        self.product.is_unlimited_stock = True
        self.product.stock = 0
        self.assertTrue(self.product.is_in_stock)


class ProductServiceTest(TestCase):
    """Tests for ProductService."""

    def setUp(self):
        self.service = ProductService()
        self.category = Category.objects.create(
            name='Trees',
            slug='trees',
            is_active=True
        )
        self.product = Product.objects.create(
            title='Ceiba Tree',
            slug='ceiba-tree',
            category=self.category,
            product_type=Product.ProductType.TREE,
            price=Decimal('59.00'),
            stock=50,
            is_active=True,
            is_featured=True
        )

    def test_get_product_by_slug(self):
        """Test getting product by slug."""
        product = self.service.get_product_by_slug('ceiba-tree')
        self.assertIsNotNone(product)
        self.assertEqual(product.title, 'Ceiba Tree')

    def test_get_featured_products(self):
        """Test getting featured products."""
        featured = self.service.get_featured_products()
        self.assertEqual(featured.count(), 1)

    def test_check_availability(self):
        """Test product availability check."""
        self.assertTrue(self.service.check_availability(self.product.id, 10))
        self.assertFalse(self.service.check_availability(self.product.id, 100))


class ProductAPITest(APITestCase):
    """Tests for Product API endpoints."""

    def setUp(self):
        self.category = Category.objects.create(
            name='Trees',
            slug='trees',
            is_active=True
        )
        self.product = Product.objects.create(
            title='Oak Tree',
            slug='oak-tree',
            category=self.category,
            product_type=Product.ProductType.TREE,
            price=Decimal('45.00'),
            stock=25,
            is_active=True
        )

    def test_list_products(self):
        """Test listing all products."""
        url = reverse('products:product-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_retrieve_product(self):
        """Test retrieving a single product."""
        url = reverse('products:product-detail', kwargs={'slug': self.product.slug})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Oak Tree')

    def test_list_categories(self):
        """Test listing all categories."""
        url = reverse('products:category-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
