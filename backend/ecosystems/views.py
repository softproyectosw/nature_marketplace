"""
Ecosystem API views.

This module defines API endpoints for tree tracking and management.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from drf_spectacular.utils import extend_schema, extend_schema_view

from .models import AdoptedTree
from .serializers import (
    AdoptedTreeListSerializer,
    AdoptedTreeDetailSerializer,
    AdoptedTreeUpdateSerializer,
    ForestStatsSerializer,
    TimelineEventSerializer,
    TreeGalleryImageSerializer,
    TimelineEventCreateSerializer,
    GalleryImageCreateSerializer,
    TreeMetricsUpdateSerializer,
)
from .services import ecosystem_service


@extend_schema_view(
    list=extend_schema(
        summary="List user's adopted trees",
        description="Get all trees adopted by the authenticated user.",
        tags=["Ecosystems"]
    ),
    retrieve=extend_schema(
        summary="Get tree details",
        description="Get full details of an adopted tree including timeline and gallery.",
        tags=["Ecosystems"]
    ),
)
class AdoptedTreeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for adopted tree operations.
    
    Provides CRUD operations for user's adopted trees.
    """
    
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'
    
    def get_queryset(self):
        """Filter trees to only show user's own trees."""
        return ecosystem_service.get_user_trees(self.request.user)
    
    def get_serializer_class(self):
        if self.action == 'list':
            return AdoptedTreeListSerializer
        if self.action in ['update', 'partial_update']:
            return AdoptedTreeUpdateSerializer
        return AdoptedTreeDetailSerializer
    
    @extend_schema(
        summary="Get forest statistics",
        description="Get statistics about the user's forest (tree count, CO2 offset, etc.).",
        responses={200: ForestStatsSerializer},
        tags=["Ecosystems"]
    )
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get user's forest statistics."""
        stats = ecosystem_service.get_user_forest_stats(request.user)
        serializer = ForestStatsSerializer(stats)
        return Response(serializer.data)
    
    @extend_schema(
        summary="Update tree nickname",
        description="Update the nickname of an adopted tree.",
        request=AdoptedTreeUpdateSerializer,
        tags=["Ecosystems"]
    )
    def partial_update(self, request, id=None):
        """Update tree nickname."""
        tree = self.get_object()
        serializer = AdoptedTreeUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        updated_tree = ecosystem_service.update_tree_nickname(
            tree=tree,
            nickname=serializer.validated_data.get('nickname', tree.nickname)
        )
        
        return Response(AdoptedTreeDetailSerializer(updated_tree).data)
    
    @extend_schema(
        summary="Get tree timeline",
        description="Get the timeline events for a specific tree.",
        responses={200: TimelineEventSerializer(many=True)},
        tags=["Ecosystems"]
    )
    @action(detail=True, methods=['get'])
    def timeline(self, request, id=None):
        """Get tree timeline events."""
        tree = self.get_object()
        events = ecosystem_service.get_tree_timeline(tree)
        serializer = TimelineEventSerializer(events, many=True)
        return Response(serializer.data)
    
    @extend_schema(
        summary="Get tree gallery",
        description="Get the photo gallery for a specific tree.",
        responses={200: TreeGalleryImageSerializer(many=True)},
        tags=["Ecosystems"]
    )
    @action(detail=True, methods=['get'])
    def gallery(self, request, id=None):
        """Get tree gallery images."""
        tree = self.get_object()
        images = ecosystem_service.get_tree_gallery(tree)
        serializer = TreeGalleryImageSerializer(images, many=True)
        return Response(serializer.data)
    
    @extend_schema(
        summary="Add timeline event (Admin)",
        description="Add a timeline event to a tree. Admin only.",
        request=TimelineEventCreateSerializer,
        tags=["Ecosystems"]
    )
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def add_event(self, request, id=None):
        """Add a timeline event to a tree (admin only)."""
        tree = self.get_object()
        serializer = TimelineEventCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        event = ecosystem_service.add_timeline_event(
            tree=tree,
            **serializer.validated_data
        )
        
        return Response(
            TimelineEventSerializer(event).data,
            status=status.HTTP_201_CREATED
        )
    
    @extend_schema(
        summary="Add gallery image (Admin)",
        description="Add a photo to a tree's gallery. Admin only.",
        request=GalleryImageCreateSerializer,
        tags=["Ecosystems"]
    )
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def add_image(self, request, id=None):
        """Add a gallery image to a tree (admin only)."""
        tree = self.get_object()
        serializer = GalleryImageCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        image = ecosystem_service.add_gallery_image(
            tree=tree,
            **serializer.validated_data
        )
        
        return Response(
            TreeGalleryImageSerializer(image).data,
            status=status.HTTP_201_CREATED
        )
    
    @extend_schema(
        summary="Update tree metrics (Admin)",
        description="Update tree metrics like height and CO2 offset. Admin only.",
        request=TreeMetricsUpdateSerializer,
        tags=["Ecosystems"]
    )
    @action(detail=True, methods=['patch'], permission_classes=[IsAdminUser])
    def update_metrics(self, request, id=None):
        """Update tree metrics (admin only)."""
        tree = self.get_object()
        serializer = TreeMetricsUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        updated_tree = ecosystem_service.update_tree_metrics(
            tree=tree,
            **serializer.validated_data
        )
        
        return Response(AdoptedTreeDetailSerializer(updated_tree).data)
