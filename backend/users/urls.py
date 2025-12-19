"""
User URL configuration.

This module defines URL patterns for user profile and gamification endpoints.
"""

from django.urls import path

from .views import (
    UserProfileView,
    UserPreferencesView,
    UserStatsView,
    UserBadgesView,
    AllBadgesView,
    FullProfileView,
)

app_name = 'users'

urlpatterns = [
    # Profile
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('profile/full/', FullProfileView.as_view(), name='full-profile'),
    
    # Preferences
    path('preferences/', UserPreferencesView.as_view(), name='preferences'),
    
    # Stats
    path('stats/', UserStatsView.as_view(), name='stats'),
    
    # Badges
    path('badges/', UserBadgesView.as_view(), name='user-badges'),
    path('badges/all/', AllBadgesView.as_view(), name='all-badges'),
]
