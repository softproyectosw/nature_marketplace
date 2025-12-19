"""
Ecosystem serializers for API responses and request validation.

These serializers handle adopted tree and tracking data transformation.
"""

from rest_framework import serializers

from .models import AdoptedTree, TimelineEvent, TreeGalleryImage


class TimelineEventSerializer(serializers.ModelSerializer):
    """Serializer for TimelineEvent model."""
    
    class Meta:
        model = TimelineEvent
        fields = [
            'id',
            'event_type',
            'title',
            'description',
            'icon',
            'event_date',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class TreeGalleryImageSerializer(serializers.ModelSerializer):
    """Serializer for TreeGalleryImage model."""
    
    class Meta:
        model = TreeGalleryImage
        fields = [
            'id',
            'image_url',
            'thumbnail_url',
            'caption',
            'alt_text',
            'is_primary',
            'taken_date',
            'uploaded_at',
        ]
        read_only_fields = ['id', 'uploaded_at']


class AdoptedTreeListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for tree lists."""
    
    display_name = serializers.CharField(read_only=True)
    age_years = serializers.FloatField(read_only=True)
    primary_image = serializers.SerializerMethodField()
    
    class Meta:
        model = AdoptedTree
        fields = [
            'id',
            'tree_number',
            'display_name',
            'nickname',
            'species',
            'status',
            'location_name',
            'age_years',
            'co2_offset_kg',
            'adoption_date',
            'primary_image',
        ]
    
    def get_primary_image(self, obj) -> str:
        """Get the primary gallery image URL."""
        primary = obj.gallery_images.filter(is_primary=True).first()
        if primary:
            return primary.image_url
        first = obj.gallery_images.first()
        return first.image_url if first else ''


class AdoptedTreeDetailSerializer(serializers.ModelSerializer):
    """Full serializer for tree detail/tracker page."""
    
    display_name = serializers.CharField(read_only=True)
    age_years = serializers.FloatField(read_only=True)
    timeline_events = TimelineEventSerializer(many=True, read_only=True)
    gallery_images = TreeGalleryImageSerializer(many=True, read_only=True)
    product_title = serializers.CharField(source='product.title', read_only=True)
    product_slug = serializers.CharField(source='product.slug', read_only=True)
    
    class Meta:
        model = AdoptedTree
        fields = [
            'id',
            'tree_number',
            'display_name',
            'nickname',
            'species',
            'status',
            'location_name',
            'latitude',
            'longitude',
            'age_days',
            'age_years',
            'height_cm',
            'co2_offset_kg',
            'certificate_url',
            'adoption_date',
            'planted_date',
            'product_title',
            'product_slug',
            'timeline_events',
            'gallery_images',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'tree_number', 'created_at', 'updated_at']


class AdoptedTreeUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating adopted tree (nickname only for users)."""
    
    class Meta:
        model = AdoptedTree
        fields = ['nickname']


class ForestStatsSerializer(serializers.Serializer):
    """Serializer for user's forest statistics."""
    
    tree_count = serializers.IntegerField()
    total_co2_offset_kg = serializers.FloatField()
    total_co2_offset_tons = serializers.FloatField()
    equivalent_car_miles = serializers.FloatField()


class TreeMetricsUpdateSerializer(serializers.Serializer):
    """Serializer for updating tree metrics (admin only)."""
    
    height_cm = serializers.DecimalField(
        max_digits=7,
        decimal_places=2,
        required=False
    )
    co2_offset_kg = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False
    )
    age_days = serializers.IntegerField(min_value=0, required=False)
    status = serializers.ChoiceField(
        choices=AdoptedTree.TreeStatus.choices,
        required=False
    )


class TimelineEventCreateSerializer(serializers.Serializer):
    """Serializer for creating timeline events (admin only)."""
    
    event_type = serializers.ChoiceField(choices=TimelineEvent.EventType.choices)
    title = serializers.CharField(max_length=200)
    description = serializers.CharField(required=False, allow_blank=True)
    icon = serializers.CharField(max_length=50, default='eco')
    event_date = serializers.DateField()


class GalleryImageCreateSerializer(serializers.Serializer):
    """Serializer for adding gallery images (admin only)."""
    
    image_url = serializers.URLField()
    thumbnail_url = serializers.URLField(required=False)
    caption = serializers.CharField(max_length=300, required=False, allow_blank=True)
    alt_text = serializers.CharField(max_length=200, required=False, allow_blank=True)
    is_primary = serializers.BooleanField(default=False)
    taken_date = serializers.DateField(required=False)
