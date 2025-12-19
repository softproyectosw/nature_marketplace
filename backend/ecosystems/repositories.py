"""
Ecosystem repository for data access operations.

This module abstracts database operations for AdoptedTree, TimelineEvent, 
and TreeGalleryImage models.
"""

from typing import Optional
from django.db.models import QuerySet
from django.contrib.auth import get_user_model

from .models import AdoptedTree, TimelineEvent, TreeGalleryImage

User = get_user_model()


class AdoptedTreeRepository:
    """Repository for AdoptedTree data access operations."""
    
    @staticmethod
    def get_by_id(tree_id: str) -> Optional[AdoptedTree]:
        """Get an adopted tree by its UUID."""
        try:
            return (
                AdoptedTree.objects
                .select_related('user', 'product')
                .prefetch_related('timeline_events', 'gallery_images')
                .get(id=tree_id)
            )
        except AdoptedTree.DoesNotExist:
            return None
    
    @staticmethod
    def get_by_tree_number(tree_number: str) -> Optional[AdoptedTree]:
        """Get an adopted tree by its tree number."""
        try:
            return (
                AdoptedTree.objects
                .select_related('user', 'product')
                .prefetch_related('timeline_events', 'gallery_images')
                .get(tree_number=tree_number)
            )
        except AdoptedTree.DoesNotExist:
            return None
    
    @staticmethod
    def get_user_trees(user: User) -> QuerySet[AdoptedTree]:
        """Get all adopted trees for a user."""
        return (
            AdoptedTree.objects
            .filter(user=user)
            .select_related('product')
            .prefetch_related('timeline_events', 'gallery_images')
            .order_by('-adoption_date')
        )
    
    @staticmethod
    def get_user_tree_count(user: User) -> int:
        """Get the count of trees adopted by a user."""
        return AdoptedTree.objects.filter(user=user).count()
    
    @staticmethod
    def get_total_co2_offset(user: User) -> float:
        """Get total CO2 offset for all of a user's trees."""
        from django.db.models import Sum
        result = (
            AdoptedTree.objects
            .filter(user=user)
            .aggregate(total=Sum('co2_offset_kg'))
        )
        return float(result['total'] or 0)
    
    @staticmethod
    def create_from_order_item(user: User, order_item, **kwargs) -> AdoptedTree:
        """Create an adopted tree from an order item."""
        from django.utils import timezone
        
        product = order_item.product
        
        return AdoptedTree.objects.create(
            user=user,
            product=product,
            order_item=order_item,
            species=product.species or product.title,
            location_name=product.location_name,
            latitude=product.location_lat or 0,
            longitude=product.location_lng or 0,
            adoption_date=timezone.now().date(),
            co2_offset_kg=product.co2_offset_kg or 0,
            **kwargs
        )
    
    @staticmethod
    def update_metrics(tree: AdoptedTree, **kwargs) -> AdoptedTree:
        """Update tree metrics."""
        for key, value in kwargs.items():
            if hasattr(tree, key):
                setattr(tree, key, value)
        tree.save()
        return tree


class TimelineEventRepository:
    """Repository for TimelineEvent data access operations."""
    
    @staticmethod
    def get_for_tree(tree: AdoptedTree) -> QuerySet[TimelineEvent]:
        """Get all timeline events for a tree."""
        return tree.timeline_events.order_by('-event_date')
    
    @staticmethod
    def create(tree: AdoptedTree, **kwargs) -> TimelineEvent:
        """Create a timeline event for a tree."""
        return TimelineEvent.objects.create(tree=tree, **kwargs)
    
    @staticmethod
    def create_adoption_event(tree: AdoptedTree) -> TimelineEvent:
        """Create the initial adoption event."""
        return TimelineEvent.objects.create(
            tree=tree,
            event_type=TimelineEvent.EventType.MILESTONE,
            title='Tree Adopted',
            description=f'{tree.species} was adopted and added to your forest.',
            icon='park',
            event_date=tree.adoption_date
        )
    
    @staticmethod
    def create_planting_event(tree: AdoptedTree) -> TimelineEvent:
        """Create a planting event."""
        return TimelineEvent.objects.create(
            tree=tree,
            event_type=TimelineEvent.EventType.MILESTONE,
            title='Tree Planted',
            description=f'{tree.species} was planted at {tree.location_name}.',
            icon='nature',
            event_date=tree.planted_date or tree.adoption_date
        )


class TreeGalleryImageRepository:
    """Repository for TreeGalleryImage data access operations."""
    
    @staticmethod
    def get_for_tree(tree: AdoptedTree) -> QuerySet[TreeGalleryImage]:
        """Get all gallery images for a tree."""
        return tree.gallery_images.order_by('-uploaded_at')
    
    @staticmethod
    def get_primary_image(tree: AdoptedTree) -> Optional[TreeGalleryImage]:
        """Get the primary image for a tree."""
        return tree.gallery_images.filter(is_primary=True).first()
    
    @staticmethod
    def create(tree: AdoptedTree, **kwargs) -> TreeGalleryImage:
        """Create a gallery image for a tree."""
        return TreeGalleryImage.objects.create(tree=tree, **kwargs)
