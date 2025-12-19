"""
Ecosystem models for Nature Marketplace.

This module defines AdoptedTree, TimelineEvent, and TreeGalleryImage models
for tracking adopted trees and their growth journey.
"""

import uuid
from django.conf import settings
from django.db import models
from django.core.validators import MinValueValidator

from products.models import Product
from orders.models import OrderItem
class AdoptedTree(models.Model):
    """
    Represents a tree that has been adopted by a user.
    
    Each adopted tree tracks its growth, location, and environmental impact.
    This is the core model for the Tree Tracker feature.
    """
    
    # Tree Status Choices
    class TreeStatus(models.TextChoices):
        HEALTHY = 'Healthy', 'Healthy'
        MAINTENANCE = 'Maintenance', 'Under Maintenance'
        CRITICAL = 'Critical', 'Critical'
        DORMANT = 'Dormant', 'Dormant (Winter)'
    
    # Identification
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text='Unique tree identifier'
    )
    tree_number = models.CharField(
        max_length=20,
        unique=True,
        editable=False,
        help_text='Human-readable tree number (e.g., "SEQ-2024-0001")'
    )
    
    # Relationships
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='adopted_trees',
        help_text='The user who adopted this tree'
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name='adoptions',
        help_text='The tree product that was purchased'
    )
    order_item = models.OneToOneField(
        OrderItem,
        on_delete=models.PROTECT,
        related_name='adopted_tree',
        null=True,
        blank=True,
        help_text='The order item that created this adoption'
    )
    
    # Tree Information
    nickname = models.CharField(
        max_length=100,
        blank=True,
        help_text='User-given nickname for the tree'
    )
    species = models.CharField(
        max_length=100,
        help_text='Tree species (copied from product)'
    )
    
    # Status & Health
    status = models.CharField(
        max_length=20,
        choices=TreeStatus.choices,
        default=TreeStatus.HEALTHY,
        help_text='Current health status of the tree'
    )
    
    # Location
    location_name = models.CharField(
        max_length=200,
        help_text='Location name (e.g., "Sequoia National Forest")'
    )
    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        help_text='GPS latitude coordinate'
    )
    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        help_text='GPS longitude coordinate'
    )
    
    # Metrics
    age_days = models.PositiveIntegerField(
        default=0,
        help_text='Age of the tree in days since planting'
    )
    height_cm = models.DecimalField(
        max_digits=7,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        help_text='Current height in centimeters'
    )
    co2_offset_kg = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        help_text='Total CO2 offset in kilograms'
    )
    
    # Certificate
    certificate_url = models.URLField(
        blank=True,
        help_text='URL to downloadable adoption certificate'
    )
    
    # Timestamps
    adoption_date = models.DateField(
        help_text='Date when the tree was adopted'
    )
    planted_date = models.DateField(
        null=True,
        blank=True,
        help_text='Date when the tree was physically planted'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Adopted Tree'
        verbose_name_plural = 'Adopted Trees'
        ordering = ['-adoption_date']
        indexes = [
            models.Index(fields=['tree_number']),
            models.Index(fields=['user', 'status']),
        ]
    
    def __str__(self) -> str:
        name = self.nickname or self.species
        return f"{name} ({self.tree_number})"
    
    def save(self, *args, **kwargs) -> None:
        """Generate tree number if not set."""
        if not self.tree_number:
            from django.utils import timezone
            import random
            
            # Get species prefix (first 3 letters uppercase)
            prefix = self.species[:3].upper() if self.species else 'TRE'
            year = timezone.now().year
            random_suffix = ''.join([str(random.randint(0, 9)) for _ in range(4)])
            self.tree_number = f"{prefix}-{year}-{random_suffix}"
        
        super().save(*args, **kwargs)
    
    @property
    def age_years(self) -> float:
        """Get age in years."""
        return round(self.age_days / 365.25, 1)
    
    @property
    def display_name(self) -> str:
        """Get display name (nickname or species)."""
        return self.nickname or self.species
class TimelineEvent(models.Model):
    """
    Timeline event for an adopted tree.
    
    Records milestones, updates, and audits in the tree's life.
    """
    
    # Event Type Choices
    class EventType(models.TextChoices):
        MILESTONE = 'Milestone', 'Milestone'
        AUDIT = 'Audit', 'Audit'
        UPDATE = 'Update', 'Update'
        MAINTENANCE = 'Maintenance', 'Maintenance'
        PHOTO = 'Photo', 'Photo Update'
    
    # Identification
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    
    # Relationships
    tree = models.ForeignKey(
        AdoptedTree,
        on_delete=models.CASCADE,
        related_name='timeline_events',
        help_text='The tree this event belongs to'
    )
    
    # Event Details
    event_type = models.CharField(
        max_length=20,
        choices=EventType.choices,
        help_text='Type of timeline event'
    )
    title = models.CharField(
        max_length=200,
        help_text='Event title'
    )
    description = models.TextField(
        blank=True,
        help_text='Detailed description of the event'
    )
    icon = models.CharField(
        max_length=50,
        default='eco',
        help_text='Material Symbol icon name'
    )
    
    # Timestamps
    event_date = models.DateField(
        help_text='Date when the event occurred'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Timeline Event'
        verbose_name_plural = 'Timeline Events'
        ordering = ['-event_date', '-created_at']
    
    def __str__(self) -> str:
        return f"{self.title} - {self.event_date}"
class TreeGalleryImage(models.Model):
    """
    Photo gallery image for an adopted tree.
    
    Stores photos of the tree's growth over time.
    """
    
    # Identification
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    
    # Relationships
    tree = models.ForeignKey(
        AdoptedTree,
        on_delete=models.CASCADE,
        related_name='gallery_images',
        help_text='The tree this image belongs to'
    )
    
    # Image Details
    image_url = models.URLField(
        help_text='URL to the image'
    )
    thumbnail_url = models.URLField(
        blank=True,
        help_text='URL to thumbnail version'
    )
    caption = models.CharField(
        max_length=300,
        blank=True,
        help_text='Image caption'
    )
    alt_text = models.CharField(
        max_length=200,
        blank=True,
        help_text='Alt text for accessibility'
    )
    
    # Metadata
    is_primary = models.BooleanField(
        default=False,
        help_text='Whether this is the primary/featured image'
    )
    taken_date = models.DateField(
        null=True,
        blank=True,
        help_text='Date when the photo was taken'
    )
    
    # Timestamps
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Tree Gallery Image'
        verbose_name_plural = 'Tree Gallery Images'
        ordering = ['-uploaded_at']
    
    def __str__(self) -> str:
        return f"Image for {self.tree.display_name} - {self.uploaded_at.date()}"
    
    def save(self, *args, **kwargs) -> None:
        """Ensure only one primary image per tree."""
        if self.is_primary:
            # Unset other primary images for this tree
            TreeGalleryImage.objects.filter(
                tree=self.tree,
                is_primary=True
            ).exclude(pk=self.pk).update(is_primary=False)
        
        super().save(*args, **kwargs)
