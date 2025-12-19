"""
User serializers for API responses and request validation.

These serializers handle data transformation between Python objects and JSON.
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import UserProfile, Badge, UserBadge

User = get_user_model()


class BadgeSerializer(serializers.ModelSerializer):
    """Serializer for Badge model."""
    
    class Meta:
        model = Badge
        fields = ['id', 'name', 'description', 'icon', 'points_value']
        read_only_fields = ['id']


class UserBadgeSerializer(serializers.ModelSerializer):
    """Serializer for UserBadge model with nested badge data."""
    
    badge = BadgeSerializer(read_only=True)
    
    class Meta:
        model = UserBadge
        fields = ['id', 'badge', 'awarded_at']
        read_only_fields = ['id', 'awarded_at']


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for UserProfile model."""
    
    email = serializers.EmailField(source='user.email', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    next_level_threshold = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = [
            'id',
            'email',
            'username',
            'display_name',
            'photo_url',
            'theme',
            'currency',
            'notify_email',
            'notify_push',
            'notify_tree_updates',
            'level',
            'current_points',
            'total_points_earned',
            'next_level_threshold',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'email',
            'username',
            'level',
            'current_points',
            'total_points_earned',
            'next_level_threshold',
            'created_at',
            'updated_at',
        ]


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile."""
    
    class Meta:
        model = UserProfile
        fields = ['display_name', 'photo_url']


class UserPreferencesSerializer(serializers.ModelSerializer):
    """Serializer for updating user preferences."""
    
    class Meta:
        model = UserProfile
        fields = [
            'theme',
            'currency',
            'notify_email',
            'notify_push',
            'notify_tree_updates',
        ]


class UserStatsSerializer(serializers.Serializer):
    """Serializer for user statistics."""
    
    level = serializers.CharField()
    current_points = serializers.IntegerField()
    total_points_earned = serializers.IntegerField()
    next_level_threshold = serializers.IntegerField()
    progress_percentage = serializers.IntegerField()
    badge_count = serializers.IntegerField()
    tree_count = serializers.IntegerField()
    total_co2_offset_kg = serializers.FloatField()


class FullUserProfileSerializer(serializers.Serializer):
    """Serializer for full user profile with badges and stats."""
    
    profile = UserProfileSerializer()
    badges = UserBadgeSerializer(many=True)
    stats = UserStatsSerializer()
