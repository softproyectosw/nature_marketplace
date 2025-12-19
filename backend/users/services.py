"""
User service for profile and gamification business logic.

This module handles user profiles, preferences, and the gamification system.
"""

from typing import Optional
from django.contrib.auth import get_user_model

from .models import UserProfile, Badge, UserBadge
from .repositories import UserProfileRepository, BadgeRepository, UserBadgeRepository

User = get_user_model()


class UserProfileService:
    """Service for user profile business logic."""
    
    def __init__(self):
        self.profile_repo = UserProfileRepository
    
    def get_or_create_profile(self, user: User) -> UserProfile:
        """Get or create a profile for a user."""
        return self.profile_repo.get_or_create_for_user(user)
    
    def get_profile(self, user: User) -> Optional[UserProfile]:
        """Get a user's profile."""
        return self.profile_repo.get_by_user(user)
    
    def update_profile(self, user: User, **kwargs) -> UserProfile:
        """
        Update a user's profile.
        
        Allowed fields: display_name, photo_url
        """
        profile = self.get_or_create_profile(user)
        return self.profile_repo.update_profile(profile, **kwargs)
    
    def update_preferences(self, user: User, **kwargs) -> UserProfile:
        """
        Update a user's preferences.
        
        Allowed fields: theme, currency, notify_email, notify_push, notify_tree_updates
        """
        profile = self.get_or_create_profile(user)
        return self.profile_repo.update_preferences(profile, **kwargs)
    
    def get_full_profile(self, user: User) -> dict:
        """
        Get a user's full profile with stats.
        
        Returns:
            Dict with profile data, badges, and stats
        """
        profile = self.get_or_create_profile(user)
        badges = UserBadgeRepository.get_user_badges(profile)
        
        return {
            'profile': profile,
            'badges': list(badges),
            'stats': {
                'level': profile.level,
                'current_points': profile.current_points,
                'total_points_earned': profile.total_points_earned,
                'next_level_threshold': profile.next_level_threshold,
                'badge_count': badges.count(),
            }
        }


class GamificationService:
    """Service for gamification system (points, levels, badges)."""
    
    def __init__(self):
        self.profile_repo = UserProfileRepository
        self.badge_repo = BadgeRepository
        self.user_badge_repo = UserBadgeRepository
    
    def add_points(self, user: User, points: int, reason: str = '') -> UserProfile:
        """
        Add green points to a user.
        
        Args:
            user: The user to award points to
            points: Number of points to add
            reason: Reason for awarding points (for logging)
        
        Returns:
            Updated UserProfile
        """
        profile = self.profile_repo.get_or_create_for_user(user)
        profile.add_points(points)
        
        # TODO: Log point award with reason
        
        return profile
    
    def get_user_level(self, user: User) -> dict:
        """
        Get a user's current level and progress.
        
        Returns:
            Dict with level info and progress percentage
        """
        profile = self.profile_repo.get_or_create_for_user(user)
        
        # Calculate progress to next level
        level_thresholds = {
            UserProfile.LevelChoice.SEED: (0, 100),
            UserProfile.LevelChoice.SPROUT: (100, 500),
            UserProfile.LevelChoice.SAPLING: (500, 1500),
            UserProfile.LevelChoice.EARTH_GUARDIAN: (1500, 5000),
            UserProfile.LevelChoice.FOREST_MASTER: (5000, 999999),
        }
        
        current_min, current_max = level_thresholds.get(
            profile.level,
            (0, 100)
        )
        
        points_in_level = profile.total_points_earned - current_min
        points_needed = current_max - current_min
        progress = min(100, int((points_in_level / points_needed) * 100))
        
        return {
            'level': profile.level,
            'current_points': profile.current_points,
            'total_points': profile.total_points_earned,
            'next_level_at': current_max,
            'progress_percentage': progress,
        }
    
    def get_all_badges(self):
        """Get all available badges."""
        return self.badge_repo.get_all()
    
    def get_user_badges(self, user: User):
        """Get all badges earned by a user."""
        profile = self.profile_repo.get_or_create_for_user(user)
        return self.user_badge_repo.get_user_badges(profile)
    
    def award_badge(self, user: User, badge: Badge) -> Optional[UserBadge]:
        """
        Award a badge to a user.
        
        Returns:
            UserBadge if newly awarded, None if already had badge
        """
        profile = self.profile_repo.get_or_create_for_user(user)
        return self.user_badge_repo.award_badge(profile, badge)
    
    def award_badge_by_name(self, user: User, badge_name: str) -> Optional[UserBadge]:
        """
        Award a badge to a user by badge name.
        
        Returns:
            UserBadge if newly awarded, None if badge doesn't exist or already had
        """
        badge = self.badge_repo.get_by_name(badge_name)
        if not badge:
            return None
        return self.award_badge(user, badge)
    
    def check_and_award_badges(self, user: User) -> list[UserBadge]:
        """
        Check all badge conditions and award any earned badges.
        
        Returns:
            List of newly awarded badges
        """
        awarded = []
        profile = self.profile_repo.get_or_create_for_user(user)
        
        # Check point-based badges
        point_badges = [
            (100, 'Point Collector'),
            (500, 'Point Master'),
            (1000, 'Point Champion'),
        ]
        
        for threshold, badge_name in point_badges:
            if profile.total_points_earned >= threshold:
                badge = self.badge_repo.get_by_name(badge_name)
                if badge and not self.user_badge_repo.has_badge(profile, badge):
                    user_badge = self.user_badge_repo.award_badge(profile, badge)
                    if user_badge:
                        awarded.append(user_badge)
        
        return awarded


# Singleton instances
user_profile_service = UserProfileService()
gamification_service = GamificationService()
