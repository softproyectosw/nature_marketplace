"""
Tests for users app.

Tests cover models, services, and API endpoints.
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse

from .models import UserProfile, Badge, UserBadge

User = get_user_model()


class UserProfileModelTest(TestCase):
    """Tests for UserProfile model."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='profileuser',
            email='profile@example.com',
            password='testpass123'
        )
        self.profile = UserProfile.objects.create(
            user=self.user,
            display_name='Nature Lover'
        )

    def test_profile_str(self):
        """Test profile string representation."""
        self.assertIn('Nature Lover', str(self.profile))

    def test_profile_default_values(self):
        """Test profile default values."""
        self.assertEqual(self.profile.current_points, 0)
        self.assertEqual(self.profile.total_points_earned, 0)
        self.assertEqual(self.profile.level, UserProfile.LevelChoice.SEED)

    def test_profile_add_points(self):
        """Test adding points to profile."""
        self.profile.add_points(150)
        self.assertEqual(self.profile.current_points, 150)
        self.assertEqual(self.profile.level, UserProfile.LevelChoice.SPROUT)


class BadgeModelTest(TestCase):
    """Tests for Badge model."""

    def setUp(self):
        self.badge = Badge.objects.create(
            name='First Tree',
            description='Adopted your first tree',
            icon='park',
            points_value=10
        )

    def test_badge_str(self):
        """Test badge string representation."""
        self.assertEqual(str(self.badge), 'First Tree')


class UserBadgeTest(TestCase):
    """Tests for UserBadge model."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='badgeuser',
            email='badge@example.com',
            password='testpass123'
        )
        self.profile = UserProfile.objects.create(
            user=self.user,
            display_name='Badge User'
        )
        self.badge = Badge.objects.create(
            name='Eco Warrior',
            description='Reached 100 green points',
            icon='eco',
            points_value=50
        )

    def test_award_badge(self):
        """Test awarding badge to user."""
        user_badge = UserBadge.objects.create(
            user_profile=self.profile,
            badge=self.badge
        )
        self.assertIsNotNone(user_badge.awarded_at)
        self.assertEqual(self.profile.badges.count(), 1)

    def test_unique_badge_per_user(self):
        """Test that same badge cannot be awarded twice."""
        UserBadge.objects.create(
            user_profile=self.profile,
            badge=self.badge
        )
        with self.assertRaises(Exception):
            UserBadge.objects.create(
                user_profile=self.profile,
                badge=self.badge
            )


class UserAPITest(APITestCase):
    """Tests for User API endpoints."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='apiuser',
            email='api@example.com',
            password='testpass123'
        )
        self.profile = UserProfile.objects.create(
            user=self.user,
            display_name='API User'
        )

    def test_get_profile_unauthenticated(self):
        """Test getting profile without authentication."""
        url = reverse('users:profile')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_profile_authenticated(self):
        """Test getting profile with authentication."""
        self.client.force_authenticate(user=self.user)
        url = reverse('users:profile')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['display_name'], 'API User')

    def test_get_stats(self):
        """Test getting user stats."""
        self.client.force_authenticate(user=self.user)
        url = reverse('users:stats')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('current_points', response.data)
