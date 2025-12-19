"""
User repository for data access operations.

This module abstracts database operations for UserProfile, Badge, and UserBadge models.
"""

from typing import Optional
from django.db.models import QuerySet
from django.contrib.auth import get_user_model

from .models import UserProfile, Badge, UserBadge

User = get_user_model()


class UserProfileRepository:
    """Repository for UserProfile data access operations."""
    
    @staticmethod
    def get_or_create_for_user(user: User) -> UserProfile:
        """Get or create a profile for a user."""
        profile, created = UserProfile.objects.get_or_create(
            user=user,
            defaults={
                'display_name': user.username,
            }
        )
        return profile
    
    @staticmethod
    def get_by_user(user: User) -> Optional[UserProfile]:
        """Get a profile by user."""
        try:
            return UserProfile.objects.select_related('user').get(user=user)
        except UserProfile.DoesNotExist:
            return None
    
    @staticmethod
    def get_by_user_id(user_id: int) -> Optional[UserProfile]:
        """Get a profile by user ID."""
        try:
            return UserProfile.objects.select_related('user').get(user_id=user_id)
        except UserProfile.DoesNotExist:
            return None
    
    @staticmethod
    def update_preferences(profile: UserProfile, **kwargs) -> UserProfile:
        """Update user preferences."""
        allowed_fields = [
            'theme', 'currency', 'notify_email', 
            'notify_push', 'notify_tree_updates'
        ]
        for key, value in kwargs.items():
            if key in allowed_fields:
                setattr(profile, key, value)
        profile.save()
        return profile
    
    @staticmethod
    def update_profile(profile: UserProfile, **kwargs) -> UserProfile:
        """Update profile information."""
        allowed_fields = ['display_name', 'photo_url']
        for key, value in kwargs.items():
            if key in allowed_fields:
                setattr(profile, key, value)
        profile.save()
        return profile


class BadgeRepository:
    """Repository for Badge data access operations."""
    
    @staticmethod
    def get_all() -> QuerySet[Badge]:
        """Get all badges."""
        return Badge.objects.all().order_by('name')
    
    @staticmethod
    def get_by_id(badge_id: int) -> Optional[Badge]:
        """Get a badge by ID."""
        try:
            return Badge.objects.get(id=badge_id)
        except Badge.DoesNotExist:
            return None
    
    @staticmethod
    def get_by_name(name: str) -> Optional[Badge]:
        """Get a badge by name."""
        try:
            return Badge.objects.get(name=name)
        except Badge.DoesNotExist:
            return None


class UserBadgeRepository:
    """Repository for UserBadge data access operations."""
    
    @staticmethod
    def get_user_badges(profile: UserProfile) -> QuerySet[UserBadge]:
        """Get all badges for a user profile."""
        return (
            UserBadge.objects
            .filter(user_profile=profile)
            .select_related('badge')
            .order_by('-awarded_at')
        )
    
    @staticmethod
    def award_badge(profile: UserProfile, badge: Badge) -> Optional[UserBadge]:
        """Award a badge to a user. Returns None if already awarded."""
        user_badge, created = UserBadge.objects.get_or_create(
            user_profile=profile,
            badge=badge
        )
        
        if created:
            # Add points for earning the badge
            profile.add_points(badge.points_value)
            return user_badge
        
        return None  # Badge was already awarded
    
    @staticmethod
    def has_badge(profile: UserProfile, badge: Badge) -> bool:
        """Check if a user has a specific badge."""
        return UserBadge.objects.filter(
            user_profile=profile,
            badge=badge
        ).exists()
