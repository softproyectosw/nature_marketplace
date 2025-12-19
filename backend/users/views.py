"""
User API views.

This module defines API endpoints for user profiles and gamification.
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema

from .serializers import (
    UserProfileSerializer,
    UserProfileUpdateSerializer,
    UserPreferencesSerializer,
    BadgeSerializer,
    UserBadgeSerializer,
    UserStatsSerializer,
)
from .services import user_profile_service, gamification_service
from ecosystems.services import ecosystem_service


class UserProfileView(APIView):
    """
    User profile endpoint.
    
    Get and update the authenticated user's profile.
    """
    
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        summary="Get user profile",
        description="Get the authenticated user's profile.",
        responses={200: UserProfileSerializer},
        tags=["Users"]
    )
    def get(self, request):
        """Get user profile."""
        profile = user_profile_service.get_or_create_profile(request.user)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)
    
    @extend_schema(
        summary="Update user profile",
        description="Update the authenticated user's profile (display name, photo).",
        request=UserProfileUpdateSerializer,
        responses={200: UserProfileSerializer},
        tags=["Users"]
    )
    def patch(self, request):
        """Update user profile."""
        serializer = UserProfileUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        profile = user_profile_service.update_profile(
            user=request.user,
            **serializer.validated_data
        )
        
        return Response(UserProfileSerializer(profile).data)


class UserPreferencesView(APIView):
    """
    User preferences endpoint.
    
    Get and update user preferences (theme, notifications, etc.).
    """
    
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        summary="Get user preferences",
        description="Get the authenticated user's preferences.",
        responses={200: UserPreferencesSerializer},
        tags=["Users"]
    )
    def get(self, request):
        """Get user preferences."""
        profile = user_profile_service.get_or_create_profile(request.user)
        serializer = UserPreferencesSerializer(profile)
        return Response(serializer.data)
    
    @extend_schema(
        summary="Update user preferences",
        description="Update the authenticated user's preferences.",
        request=UserPreferencesSerializer,
        responses={200: UserPreferencesSerializer},
        tags=["Users"]
    )
    def patch(self, request):
        """Update user preferences."""
        serializer = UserPreferencesSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        
        profile = user_profile_service.update_preferences(
            user=request.user,
            **serializer.validated_data
        )
        
        return Response(UserPreferencesSerializer(profile).data)


class UserStatsView(APIView):
    """
    User statistics endpoint.
    
    Get user's gamification stats and forest stats.
    """
    
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        summary="Get user statistics",
        description="Get the authenticated user's gamification and forest statistics.",
        responses={200: UserStatsSerializer},
        tags=["Users"]
    )
    def get(self, request):
        """Get user statistics."""
        # Get gamification stats
        level_info = gamification_service.get_user_level(request.user)
        
        # Get forest stats
        forest_stats = ecosystem_service.get_user_forest_stats(request.user)
        
        # Get badge count
        badges = gamification_service.get_user_badges(request.user)
        
        stats = {
            'level': level_info['level'],
            'current_points': level_info['current_points'],
            'total_points_earned': level_info['total_points'],
            'next_level_threshold': level_info['next_level_at'],
            'progress_percentage': level_info['progress_percentage'],
            'badge_count': badges.count(),
            'tree_count': forest_stats['tree_count'],
            'total_co2_offset_kg': forest_stats['total_co2_offset_kg'],
        }
        
        serializer = UserStatsSerializer(stats)
        return Response(serializer.data)


class UserBadgesView(APIView):
    """
    User badges endpoint.
    
    Get user's earned badges.
    """
    
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        summary="Get user badges",
        description="Get all badges earned by the authenticated user.",
        responses={200: UserBadgeSerializer(many=True)},
        tags=["Users"]
    )
    def get(self, request):
        """Get user's badges."""
        badges = gamification_service.get_user_badges(request.user)
        serializer = UserBadgeSerializer(badges, many=True)
        return Response(serializer.data)


class AllBadgesView(APIView):
    """
    All badges endpoint.
    
    Get all available badges in the system.
    """
    
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        summary="Get all badges",
        description="Get all available badges in the system.",
        responses={200: BadgeSerializer(many=True)},
        tags=["Users"]
    )
    def get(self, request):
        """Get all available badges."""
        badges = gamification_service.get_all_badges()
        serializer = BadgeSerializer(badges, many=True)
        return Response(serializer.data)


class FullProfileView(APIView):
    """
    Full user profile endpoint.
    
    Get complete user profile with badges and stats.
    """
    
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        summary="Get full user profile",
        description="Get complete user profile including badges and statistics.",
        tags=["Users"]
    )
    def get(self, request):
        """Get full user profile."""
        profile_data = user_profile_service.get_full_profile(request.user)
        forest_stats = ecosystem_service.get_user_forest_stats(request.user)
        
        return Response({
            'profile': UserProfileSerializer(profile_data['profile']).data,
            'badges': UserBadgeSerializer(profile_data['badges'], many=True).data,
            'stats': {
                **profile_data['stats'],
                'tree_count': forest_stats['tree_count'],
                'total_co2_offset_kg': forest_stats['total_co2_offset_kg'],
            }
        })
