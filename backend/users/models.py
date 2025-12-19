"""
User models for Nature Marketplace.

This module defines the UserProfile model which extends Django's built-in User
with additional fields for preferences, gamification, and wallet information.
"""

from django.conf import settings
from django.db import models
from django.core.validators import MinValueValidator


class UserProfile(models.Model):
    """
    Extended user profile with preferences, gamification, and wallet.
    
    This model has a one-to-one relationship with Django's User model.
    It stores additional user data that doesn't belong in the base User model.
    """
    
    # Theme Choices
    class ThemeChoice(models.TextChoices):
        DARK = 'dark', 'Dark'
        LIGHT = 'light', 'Light'
        SYSTEM = 'system', 'System'
    
    # Currency Choices
    class CurrencyChoice(models.TextChoices):
        USD = 'USD', 'US Dollar'
        EUR = 'EUR', 'Euro'
    
    # Gamification Level Choices
    class LevelChoice(models.TextChoices):
        SEED = 'Seed', 'Seed'
        SPROUT = 'Sprout', 'Sprout'
        SAPLING = 'Sapling', 'Sapling'
        EARTH_GUARDIAN = 'Earth Guardian', 'Earth Guardian'
        FOREST_MASTER = 'Forest Master', 'Forest Master'
    
    # Relationships
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='profile',
        help_text='The Django user this profile belongs to'
    )
    
    # Profile Information
    display_name = models.CharField(
        max_length=100,
        blank=True,
        help_text='Display name shown in the UI'
    )
    photo_url = models.URLField(
        blank=True,
        help_text='URL to user profile photo'
    )
    
    # Preferences
    theme = models.CharField(
        max_length=10,
        choices=ThemeChoice.choices,
        default=ThemeChoice.DARK,
        help_text='UI theme preference'
    )
    currency = models.CharField(
        max_length=3,
        choices=CurrencyChoice.choices,
        default=CurrencyChoice.USD,
        help_text='Preferred currency for prices'
    )
    
    # Notification preferences (stored as JSON-like fields)
    notify_email = models.BooleanField(
        default=True,
        help_text='Receive email notifications'
    )
    notify_push = models.BooleanField(
        default=True,
        help_text='Receive push notifications'
    )
    notify_tree_updates = models.BooleanField(
        default=True,
        help_text='Receive updates about adopted trees'
    )
    
    # Gamification
    level = models.CharField(
        max_length=20,
        choices=LevelChoice.choices,
        default=LevelChoice.SEED,
        help_text='Current gamification level'
    )
    current_points = models.PositiveIntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text='Current green points balance'
    )
    total_points_earned = models.PositiveIntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text='Total points earned all time'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'
        ordering = ['-created_at']
    
    def __str__(self) -> str:
        """Return string representation of the profile."""
        return f"{self.display_name or self.user.username}'s Profile"
    
    @property
    def next_level_threshold(self) -> int:
        """Calculate points needed for next level."""
        thresholds = {
            self.LevelChoice.SEED: 100,
            self.LevelChoice.SPROUT: 500,
            self.LevelChoice.SAPLING: 1500,
            self.LevelChoice.EARTH_GUARDIAN: 5000,
            self.LevelChoice.FOREST_MASTER: 999999,  # Max level
        }
        return thresholds.get(self.level, 100)
    
    def add_points(self, points: int) -> None:
        """
        Add green points to the user's balance.
        
        Args:
            points: Number of points to add (must be positive)
        """
        if points <= 0:
            return
        
        self.current_points += points
        self.total_points_earned += points
        self._check_level_up()
        self.save()
    
    def _check_level_up(self) -> None:
        """Check if user should level up based on total points."""
        level_thresholds = [
            (0, self.LevelChoice.SEED),
            (100, self.LevelChoice.SPROUT),
            (500, self.LevelChoice.SAPLING),
            (1500, self.LevelChoice.EARTH_GUARDIAN),
            (5000, self.LevelChoice.FOREST_MASTER),
        ]
        
        for threshold, level in reversed(level_thresholds):
            if self.total_points_earned >= threshold:
                self.level = level
                break


class Badge(models.Model):
    """
    Achievement badges that users can earn.
    
    Badges are awarded for completing specific actions or milestones.
    """
    
    name = models.CharField(
        max_length=100,
        unique=True,
        help_text='Badge name'
    )
    description = models.TextField(
        blank=True,
        help_text='Description of how to earn this badge'
    )
    icon = models.CharField(
        max_length=50,
        help_text='Material Symbol icon name'
    )
    points_value = models.PositiveIntegerField(
        default=0,
        help_text='Points awarded when badge is earned'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Badge'
        verbose_name_plural = 'Badges'
        ordering = ['name']
    
    def __str__(self) -> str:
        return self.name


class UserBadge(models.Model):
    """
    Junction table for users and their earned badges.
    
    Tracks when each badge was awarded to each user.
    """
    
    user_profile = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        related_name='badges',
        help_text='The user who earned this badge'
    )
    badge = models.ForeignKey(
        Badge,
        on_delete=models.CASCADE,
        related_name='awarded_to',
        help_text='The badge that was earned'
    )
    awarded_at = models.DateTimeField(
        auto_now_add=True,
        help_text='When the badge was awarded'
    )
    
    class Meta:
        verbose_name = 'User Badge'
        verbose_name_plural = 'User Badges'
        unique_together = ['user_profile', 'badge']
        ordering = ['-awarded_at']
    
    def __str__(self) -> str:
        return f"{self.user_profile.display_name} - {self.badge.name}"
