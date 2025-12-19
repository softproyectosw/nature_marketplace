"""
Tests for ecosystems app.

Tests cover models, services, and API endpoints.
"""

from decimal import Decimal
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse

from .models import AdoptedTree, TimelineEvent, TreeGalleryImage
from .services import EcosystemService
from products.models import Category, Product

User = get_user_model()


class AdoptedTreeModelTest(TestCase):
    """Tests for AdoptedTree model."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='treeowner',
            email='tree@example.com',
            password='testpass123'
        )
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
            stock=10,
            is_active=True,
            species='Ceiba pentandra',
            co2_offset_kg=35
        )
        self.tree = AdoptedTree.objects.create(
            user=self.user,
            product=self.product,
            custom_name='My Ceiba',
            species='Ceiba pentandra',
            location_name='Amazon Rainforest',
            location_lat=-3.4653,
            location_lng=-62.2159,
            co2_offset_kg=35
        )

    def test_tree_str(self):
        """Test adopted tree string representation."""
        self.assertIn('My Ceiba', str(self.tree))

    def test_tree_default_status(self):
        """Test adopted tree default status."""
        self.assertEqual(self.tree.status, AdoptedTree.TreeStatus.HEALTHY)

    def test_tree_age_days(self):
        """Test tree age calculation."""
        self.assertGreaterEqual(self.tree.age_days, 0)


class TimelineEventModelTest(TestCase):
    """Tests for TimelineEvent model."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='eventuser',
            email='event@example.com',
            password='testpass123'
        )
        self.category = Category.objects.create(
            name='Trees',
            slug='trees',
            is_active=True
        )
        self.product = Product.objects.create(
            title='Oak Tree',
            slug='oak-tree',
            category=self.category,
            price=Decimal('49.00'),
            stock=10,
            is_active=True
        )
        self.tree = AdoptedTree.objects.create(
            user=self.user,
            product=self.product,
            custom_name='My Oak',
            species='Quercus robur'
        )
        self.event = TimelineEvent.objects.create(
            tree=self.tree,
            event_type=TimelineEvent.EventType.PLANTED,
            title='Tree Planted',
            description='Your tree was planted today!'
        )

    def test_event_str(self):
        """Test timeline event string representation."""
        self.assertIn('Tree Planted', str(self.event))

    def test_event_ordering(self):
        """Test events are ordered by date descending."""
        event2 = TimelineEvent.objects.create(
            tree=self.tree,
            event_type=TimelineEvent.EventType.GROWTH_UPDATE,
            title='Growth Update'
        )
        events = list(self.tree.timeline_events.all())
        self.assertEqual(events[0], event2)


class EcosystemServiceTest(TestCase):
    """Tests for EcosystemService."""

    def setUp(self):
        self.service = EcosystemService()
        self.user = User.objects.create_user(
            username='ecoserviceuser',
            email='ecoservice@example.com',
            password='testpass123'
        )
        self.category = Category.objects.create(
            name='Trees',
            slug='trees',
            is_active=True
        )
        self.product = Product.objects.create(
            title='Sequoia Tree',
            slug='sequoia-tree',
            category=self.category,
            product_type=Product.ProductType.TREE,
            price=Decimal('99.00'),
            stock=5,
            is_active=True,
            species='Sequoiadendron giganteum',
            co2_offset_kg=50,
            location_name='California',
            location_lat=36.5785,
            location_lng=-118.2923
        )

    def test_create_adopted_tree(self):
        """Test creating adopted tree from product."""
        tree = self.service.create_adopted_tree(
            user=self.user,
            product=self.product,
            custom_name='Giant Sequoia'
        )
        self.assertIsNotNone(tree)
        self.assertEqual(tree.custom_name, 'Giant Sequoia')
        self.assertEqual(tree.species, 'Sequoiadendron giganteum')

    def test_get_user_trees(self):
        """Test getting user's adopted trees."""
        self.service.create_adopted_tree(
            user=self.user,
            product=self.product,
            custom_name='Tree 1'
        )
        self.service.create_adopted_tree(
            user=self.user,
            product=self.product,
            custom_name='Tree 2'
        )
        trees = self.service.get_user_trees(self.user)
        self.assertEqual(trees.count(), 2)

    def test_add_timeline_event(self):
        """Test adding timeline event to tree."""
        tree = self.service.create_adopted_tree(
            user=self.user,
            product=self.product
        )
        event = self.service.add_timeline_event(
            tree=tree,
            event_type=TimelineEvent.EventType.GROWTH_UPDATE,
            title='Monthly Update',
            description='Your tree grew 5cm this month!'
        )
        self.assertIsNotNone(event)
        self.assertEqual(tree.timeline_events.count(), 2)  # Planted + Growth


class EcosystemAPITest(APITestCase):
    """Tests for Ecosystem API endpoints."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='ecoapiuser',
            email='ecoapi@example.com',
            password='testpass123'
        )
        self.category = Category.objects.create(
            name='Trees',
            slug='trees',
            is_active=True
        )
        self.product = Product.objects.create(
            title='API Tree',
            slug='api-tree',
            category=self.category,
            price=Decimal('45.00'),
            stock=10,
            is_active=True
        )
        self.tree = AdoptedTree.objects.create(
            user=self.user,
            product=self.product,
            custom_name='API Test Tree',
            species='Test Species'
        )

    def test_list_trees_unauthenticated(self):
        """Test listing trees without authentication."""
        url = reverse('ecosystems:adoptedtree-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_trees_authenticated(self):
        """Test listing trees with authentication."""
        self.client.force_authenticate(user=self.user)
        url = reverse('ecosystems:adoptedtree-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_retrieve_tree(self):
        """Test retrieving a single tree."""
        self.client.force_authenticate(user=self.user)
        url = reverse('ecosystems:adoptedtree-detail', kwargs={'pk': self.tree.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['custom_name'], 'API Test Tree')
