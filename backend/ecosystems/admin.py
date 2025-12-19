"""
Admin configuration for ecosystems app.

Registers AdoptedTree, TimelineEvent, and TreeGalleryImage models.
"""

from django.contrib import admin
from .models import AdoptedTree, TimelineEvent, TreeGalleryImage


class TimelineEventInline(admin.TabularInline):
    """Inline admin for timeline events."""
    model = TimelineEvent
    extra = 0
    readonly_fields = ['created_at']
    ordering = ['-event_date']


class TreeGalleryImageInline(admin.TabularInline):
    """Inline admin for gallery images."""
    model = TreeGalleryImage
    extra = 0
    readonly_fields = ['uploaded_at']
    ordering = ['-uploaded_at']


@admin.register(AdoptedTree)
class AdoptedTreeAdmin(admin.ModelAdmin):
    """Admin configuration for AdoptedTree model."""
    
    list_display = [
        'tree_number',
        'nickname',
        'species',
        'user',
        'status',
        'age_years',
        'co2_offset_kg',
        'adoption_date',
    ]
    list_filter = ['status', 'species', 'adoption_date', 'created_at']
    search_fields = [
        'tree_number',
        'nickname',
        'species',
        'user__username',
        'user__email',
        'location_name',
    ]
    readonly_fields = [
        'id',
        'tree_number',
        'created_at',
        'updated_at',
        'age_years',
    ]
    inlines = [TimelineEventInline, TreeGalleryImageInline]
    
    fieldsets = (
        ('Identification', {
            'fields': ('id', 'tree_number', 'nickname')
        }),
        ('Relationships', {
            'fields': ('user', 'product', 'order_item')
        }),
        ('Tree Information', {
            'fields': ('species', 'status')
        }),
        ('Location', {
            'fields': ('location_name', 'latitude', 'longitude')
        }),
        ('Metrics', {
            'fields': ('age_days', 'age_years', 'height_cm', 'co2_offset_kg')
        }),
        ('Certificate', {
            'fields': ('certificate_url',),
            'classes': ('collapse',)
        }),
        ('Dates', {
            'fields': ('adoption_date', 'planted_date', 'created_at', 'updated_at')
        }),
    )
    
    def age_years(self, obj):
        return obj.age_years
    age_years.short_description = 'Age (Years)'


@admin.register(TimelineEvent)
class TimelineEventAdmin(admin.ModelAdmin):
    """Admin configuration for TimelineEvent model."""
    
    list_display = ['title', 'tree', 'event_type', 'event_date', 'created_at']
    list_filter = ['event_type', 'event_date', 'created_at']
    search_fields = ['title', 'description', 'tree__tree_number', 'tree__nickname']
    readonly_fields = ['id', 'created_at']


@admin.register(TreeGalleryImage)
class TreeGalleryImageAdmin(admin.ModelAdmin):
    """Admin configuration for TreeGalleryImage model."""
    
    list_display = ['tree', 'caption', 'is_primary', 'taken_date', 'uploaded_at']
    list_filter = ['is_primary', 'taken_date', 'uploaded_at']
    search_fields = ['caption', 'tree__tree_number', 'tree__nickname']
    readonly_fields = ['id', 'uploaded_at']
