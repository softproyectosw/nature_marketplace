"""
User serializers for API responses and request validation.

These serializers handle data transformation between Python objects and JSON.
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import UserProfile, Badge, UserBadge, UserFavorite

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
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    next_level_threshold = serializers.IntegerField(read_only=True)
    avatar_url = serializers.SerializerMethodField()
    
    def get_avatar_url(self, obj) -> str:
        """Get the full avatar URL."""
        # If there's an uploaded photo, get its URL
        if obj.photo:
            url = obj.photo.url
            # If URL is relative (doesn't start with http), make it absolute
            if url and not url.startswith(('http://', 'https://')):
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(url)
                # Fallback: prepend with API URL from settings
                from django.conf import settings
                media_url = getattr(settings, 'MEDIA_URL', '/media/')
                # For S3/MinIO, the URL should already be absolute
                # For local storage, we need to build the full URL
                return url
            return url
        # If there's an external photo URL, return it
        if obj.photo_url:
            return obj.photo_url
        return ''
    
    class Meta:
        model = UserProfile
        fields = [
            'id',
            'email',
            'first_name',
            'last_name',
            'username',
            'display_name',
            'avatar_url',
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
            'first_name',
            'last_name',
            'username',
            'avatar_url',
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


class UserPhotoUploadSerializer(serializers.ModelSerializer):
    """Serializer for uploading user profile photo."""
    
    class Meta:
        model = UserProfile
        fields = ['photo']
    
    def validate_photo(self, value):
        # Validate file size (max 5MB)
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("Image file too large (max 5MB)")
        
        # Validate file type
        allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        if value.content_type not in allowed_types:
            raise serializers.ValidationError("Invalid image type. Use JPEG, PNG, GIF or WebP")
        
        return value
    
    def update(self, instance, validated_data):
        # Delete old photo from storage before saving new one
        if instance.photo and 'photo' in validated_data:
            try:
                instance.photo.delete(save=False)
            except Exception:
                pass  # Ignore errors if file doesn't exist
        
        # Clear external photo_url when uploading a new photo
        instance.photo_url = ''
        
        return super().update(instance, validated_data)


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


class UserFavoriteSerializer(serializers.ModelSerializer):
    """Serializer for UserFavorite model."""
    
    product_id = serializers.IntegerField(source='product.id', read_only=True)
    product_title = serializers.CharField(source='product.title', read_only=True)
    product_slug = serializers.CharField(source='product.slug', read_only=True)
    
    class Meta:
        model = UserFavorite
        fields = ['id', 'product_id', 'product_title', 'product_slug', 'created_at']
        read_only_fields = ['id', 'created_at']


class FavoriteIdsSerializer(serializers.Serializer):
    """Serializer for list of favorite product IDs."""
    
    product_ids = serializers.ListField(
        child=serializers.IntegerField(),
        help_text='List of product IDs'
    )
