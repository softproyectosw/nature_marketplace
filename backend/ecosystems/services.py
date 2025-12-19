"""
Ecosystem service for tree tracking business logic.

This module handles adopted tree management and tracking.
"""

from typing import Optional
from django.db.models import QuerySet
from django.contrib.auth import get_user_model

from .models import AdoptedTree, TimelineEvent, TreeGalleryImage
from .repositories import (
    AdoptedTreeRepository,
    TimelineEventRepository,
    TreeGalleryImageRepository
)

User = get_user_model()


class EcosystemService:
    """Service for ecosystem and tree tracking business logic."""
    
    def __init__(self):
        self.tree_repo = AdoptedTreeRepository
        self.timeline_repo = TimelineEventRepository
        self.gallery_repo = TreeGalleryImageRepository
    
    def get_user_trees(self, user: User) -> QuerySet[AdoptedTree]:
        """Get all adopted trees for a user."""
        return self.tree_repo.get_user_trees(user)
    
    def get_tree_by_id(self, tree_id: str) -> Optional[AdoptedTree]:
        """Get an adopted tree by its ID."""
        return self.tree_repo.get_by_id(tree_id)
    
    def get_tree_by_number(self, tree_number: str) -> Optional[AdoptedTree]:
        """Get an adopted tree by its tree number."""
        return self.tree_repo.get_by_tree_number(tree_number)
    
    def create_adopted_tree(
        self,
        user: User,
        order_item,
        nickname: str = ''
    ) -> AdoptedTree:
        """
        Create an adopted tree from an order item.
        
        This is called after successful payment for tree products.
        """
        tree = self.tree_repo.create_from_order_item(
            user=user,
            order_item=order_item,
            nickname=nickname
        )
        
        # Create initial timeline event
        self.timeline_repo.create_adoption_event(tree)
        
        # Award points to user
        self._award_adoption_points(user)
        
        return tree
    
    def update_tree_nickname(self, tree: AdoptedTree, nickname: str) -> AdoptedTree:
        """Update the nickname of an adopted tree."""
        tree.nickname = nickname
        tree.save(update_fields=['nickname', 'updated_at'])
        return tree
    
    def get_tree_timeline(self, tree: AdoptedTree) -> QuerySet[TimelineEvent]:
        """Get the timeline events for a tree."""
        return self.timeline_repo.get_for_tree(tree)
    
    def add_timeline_event(
        self,
        tree: AdoptedTree,
        event_type: str,
        title: str,
        description: str = '',
        icon: str = 'eco',
        event_date=None
    ) -> TimelineEvent:
        """Add a timeline event to a tree."""
        from django.utils import timezone
        
        return self.timeline_repo.create(
            tree=tree,
            event_type=event_type,
            title=title,
            description=description,
            icon=icon,
            event_date=event_date or timezone.now().date()
        )
    
    def get_tree_gallery(self, tree: AdoptedTree) -> QuerySet[TreeGalleryImage]:
        """Get the gallery images for a tree."""
        return self.gallery_repo.get_for_tree(tree)
    
    def add_gallery_image(
        self,
        tree: AdoptedTree,
        image_url: str,
        caption: str = '',
        is_primary: bool = False,
        taken_date=None
    ) -> TreeGalleryImage:
        """Add a gallery image to a tree."""
        return self.gallery_repo.create(
            tree=tree,
            image_url=image_url,
            caption=caption,
            is_primary=is_primary,
            taken_date=taken_date
        )
    
    def get_user_forest_stats(self, user: User) -> dict:
        """
        Get statistics about a user's forest.
        
        Returns:
            Dict with tree count, total CO2 offset, etc.
        """
        tree_count = self.tree_repo.get_user_tree_count(user)
        total_co2 = self.tree_repo.get_total_co2_offset(user)
        
        return {
            'tree_count': tree_count,
            'total_co2_offset_kg': total_co2,
            'total_co2_offset_tons': round(total_co2 / 1000, 2),
            'equivalent_car_miles': round(total_co2 * 2.5, 0),  # Rough estimate
        }
    
    def update_tree_metrics(
        self,
        tree: AdoptedTree,
        height_cm: float = None,
        co2_offset_kg: float = None,
        age_days: int = None
    ) -> AdoptedTree:
        """Update the metrics for a tree."""
        updates = {}
        if height_cm is not None:
            updates['height_cm'] = height_cm
        if co2_offset_kg is not None:
            updates['co2_offset_kg'] = co2_offset_kg
        if age_days is not None:
            updates['age_days'] = age_days
        
        if updates:
            return self.tree_repo.update_metrics(tree, **updates)
        return tree
    
    def _award_adoption_points(self, user: User) -> None:
        """Award green points for adopting a tree."""
        from users.services import gamification_service
        
        # Award 50 points for each tree adoption
        gamification_service.add_points(user, 50, 'Tree Adoption')
        
        # Check for badges
        tree_count = self.tree_repo.get_user_tree_count(user)
        
        if tree_count == 1:
            gamification_service.award_badge_by_name(user, 'First Tree')
        elif tree_count == 5:
            gamification_service.award_badge_by_name(user, 'Forest Starter')
        elif tree_count == 10:
            gamification_service.award_badge_by_name(user, 'Forest Guardian')
    
    def verify_tree_ownership(self, user: User, tree_id: str) -> bool:
        """Verify that a user owns a specific tree."""
        tree = self.tree_repo.get_by_id(tree_id)
        if not tree:
            return False
        return tree.user_id == user.id


# Singleton instance
ecosystem_service = EcosystemService()
