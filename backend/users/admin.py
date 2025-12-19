"""
Admin configuration for users app.

Registers UserProfile, Badge, and UserBadge models with the Django admin.
"""

from django.contrib import admin
from .models import UserProfile, Badge, UserBadge


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """Admin configuration for UserProfile model."""
    
    list_display = [
        'user',
        'display_name',
        'level',
        'current_points',
        'theme',
        'currency',
        'created_at',
    ]
    list_filter = ['level', 'theme', 'currency', 'created_at']
    search_fields = ['user__username', 'user__email', 'display_name']
    readonly_fields = ['created_at', 'updated_at', 'total_points_earned']
    
    fieldsets = (
        ('User', {
            'fields': ('user', 'display_name', 'photo_url')
        }),
        ('Preferences', {
            'fields': ('theme', 'currency')
        }),
        ('Notifications', {
            'fields': ('notify_email', 'notify_push', 'notify_tree_updates')
        }),
        ('Gamification', {
            'fields': ('level', 'current_points', 'total_points_earned')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    """Admin configuration for Badge model."""
    
    list_display = ['name', 'icon', 'points_value', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at']


@admin.register(UserBadge)
class UserBadgeAdmin(admin.ModelAdmin):
    """Admin configuration for UserBadge model."""
    
    list_display = ['user_profile', 'badge', 'awarded_at']
    list_filter = ['badge', 'awarded_at']
    search_fields = ['user_profile__display_name', 'badge__name']
    readonly_fields = ['awarded_at']
