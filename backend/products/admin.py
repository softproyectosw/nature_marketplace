"""
Admin configuration for products app.

Registers Category and Product models with the Django admin.
"""

from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Category, Product, ProductImage, ProductUpdate,
    SponsorshipUnit, UnitImage, UnitUpdate
)


class ProductImageInline(admin.TabularInline):
    """Inline admin for product images."""
    model = ProductImage
    extra = 1
    fields = ['image', 'image_url', 'alt_text', 'caption', 'is_primary', 'display_order']


class ProductUpdateInline(admin.TabularInline):
    """Inline admin for product updates."""
    model = ProductUpdate
    extra = 0
    fields = ['update_type', 'title', 'content', 'image', 'is_public', 'created_at']
    readonly_fields = ['created_at']
    ordering = ['-created_at']


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """Admin configuration for Category model."""
    
    list_display = ['name', 'slug', 'is_active', 'display_order', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'name_en', 'description']
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['display_order', 'name']
    
    fieldsets = (
        ('Español (Default)', {
            'fields': ('name', 'slug', 'description')
        }),
        ('English', {
            'fields': ('name_en', 'description_en'),
            'classes': ('collapse',)
        }),
        ('Configuración', {
            'fields': ('icon', 'image_url', 'is_active', 'display_order')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


class StockFilter(admin.SimpleListFilter):
    """Custom filter for stock status."""
    title = 'Stock Status'
    parameter_name = 'stock_status'
    
    def lookups(self, request, model_admin):
        return (
            ('out_of_stock', 'Out of Stock'),
            ('low_stock', 'Low Stock (< 10)'),
            ('in_stock', 'In Stock'),
            ('unlimited', 'Unlimited Stock'),
        )
    
    def queryset(self, request, queryset):
        if self.value() == 'out_of_stock':
            return queryset.filter(is_unlimited_stock=False, stock=0)
        if self.value() == 'low_stock':
            return queryset.filter(is_unlimited_stock=False, stock__gt=0, stock__lt=10)
        if self.value() == 'in_stock':
            return queryset.filter(is_unlimited_stock=False, stock__gte=10)
        if self.value() == 'unlimited':
            return queryset.filter(is_unlimited_stock=True)
        return queryset


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """Admin configuration for Product model with stock management."""
    
    list_display = [
        'title',
        'category',
        'product_type',
        'price_display',
        'stock',
        'stock_status',
        'is_active',
        'is_featured',
        'rating',
        'created_at',
    ]
    list_filter = [
        'category',
        'product_type',
        StockFilter,
        'is_active',
        'is_featured',
        'is_new',
        'pricing_type',
        'created_at',
    ]
    list_editable = ['stock', 'is_active', 'is_featured']
    list_per_page = 25
    search_fields = ['title', 'title_en', 'description', 'description_en', 'short_description', 'species']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ['created_at', 'updated_at']
    
    inlines = [ProductImageInline, ProductUpdateInline]
    
    fieldsets = (
        ('Información Básica (Español)', {
            'fields': ('title', 'slug', 'short_description', 'description')
        }),
        ('Basic Info (English)', {
            'fields': ('title_en', 'short_description_en', 'description_en'),
            'classes': ('collapse',)
        }),
        ('Propósito e Impacto (Español)', {
            'fields': ('purpose', 'impact_description')
        }),
        ('Purpose & Impact (English)', {
            'fields': ('purpose_en', 'impact_description_en'),
            'classes': ('collapse',)
        }),
        ('Categorización', {
            'fields': ('category', 'product_type', 'features')
        }),
        ('Precio', {
            'fields': ('price', 'pricing_type', 'currency', 'compare_at_price')
        }),
        ('Inventario', {
            'fields': ('stock', 'is_unlimited_stock'),
            'description': 'Stock = 0 con is_unlimited_stock = False significa agotado. Para apadrinamientos, usar stock ilimitado.'
        }),
        ('Imágenes (legacy)', {
            'fields': ('images',),
            'classes': ('collapse',),
            'description': 'Usar la galería de imágenes en su lugar'
        }),
        ('Calificaciones', {
            'fields': ('rating', 'reviews_count')
        }),
        ('Ubicación', {
            'fields': ('location_name', 'location_lat', 'location_lng'),
            'classes': ('collapse',)
        }),
        ('Detalles de Árbol', {
            'fields': ('species', 'co2_offset_kg'),
            'classes': ('collapse',)
        }),
        ('Detalles de Bosque/Laguna', {
            'fields': ('area_size', 'is_collective'),
            'classes': ('collapse',)
        }),
        ('Detalles de Experiencia', {
            'fields': ('duration', 'max_participants', 'includes'),
            'classes': ('collapse',)
        }),
        ('Estado', {
            'fields': ('is_active', 'is_featured', 'is_new')
        }),
        ('SEO', {
            'fields': ('meta_title', 'meta_description'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['add_stock_10', 'add_stock_50', 'add_stock_100', 'set_out_of_stock', 'set_unlimited_stock', 'remove_unlimited_stock']
    
    def price_display(self, obj):
        """Display price with currency and type."""
        label = '/año' if obj.pricing_type == 'annual' else ''
        return format_html(
            '<strong>${}{}</strong>',
            obj.price, label
        )
    price_display.short_description = 'Price'
    price_display.admin_order_field = 'price'
    
    def stock_status(self, obj):
        """Display stock status with color coding."""
        if obj.is_unlimited_stock:
            return format_html('<span style="color: #22c55e;">∞ Unlimited</span>')
        if obj.stock == 0:
            return format_html('<span style="color: #ef4444; font-weight: bold;">⚠ Out of Stock</span>')
        if obj.stock < 10:
            return format_html('<span style="color: #f59e0b;">Low Stock</span>')
        return format_html('<span style="color: #22c55e;">In Stock</span>')
    stock_status.short_description = 'Status'
    
    @admin.action(description='Add 10 units to stock')
    def add_stock_10(self, request, queryset):
        for product in queryset:
            if not product.is_unlimited_stock:
                product.stock += 10
                product.save(update_fields=['stock'])
        self.message_user(request, f'Added 10 units to {queryset.count()} products.')
    
    @admin.action(description='Add 50 units to stock')
    def add_stock_50(self, request, queryset):
        for product in queryset:
            if not product.is_unlimited_stock:
                product.stock += 50
                product.save(update_fields=['stock'])
        self.message_user(request, f'Added 50 units to {queryset.count()} products.')
    
    @admin.action(description='Add 100 units to stock')
    def add_stock_100(self, request, queryset):
        for product in queryset:
            if not product.is_unlimited_stock:
                product.stock += 100
                product.save(update_fields=['stock'])
        self.message_user(request, f'Added 100 units to {queryset.count()} products.')
    
    @admin.action(description='Set stock to 0 (Out of Stock)')
    def set_out_of_stock(self, request, queryset):
        queryset.update(stock=0, is_unlimited_stock=False)
        self.message_user(request, f'{queryset.count()} products set to out of stock.')
    
    @admin.action(description='Set as Unlimited Stock')
    def set_unlimited_stock(self, request, queryset):
        queryset.update(is_unlimited_stock=True)
        self.message_user(request, f'{queryset.count()} products set to unlimited stock.')
    
    @admin.action(description='Remove Unlimited Stock (use stock count)')
    def remove_unlimited_stock(self, request, queryset):
        queryset.update(is_unlimited_stock=False)
        self.message_user(request, f'{queryset.count()} products now use stock count.')


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    """Admin configuration for ProductImage model."""
    
    list_display = ['product', 'alt_text', 'is_primary', 'display_order', 'created_at']
    list_filter = ['is_primary', 'created_at']
    search_fields = ['product__title', 'alt_text', 'caption']
    raw_id_fields = ['product']
    ordering = ['product', 'display_order']


@admin.register(ProductUpdate)
class ProductUpdateAdmin(admin.ModelAdmin):
    """Admin configuration for ProductUpdate model."""
    
    list_display = ['product', 'update_type', 'title', 'is_public', 'created_at']
    list_filter = ['update_type', 'is_public', 'created_at']
    search_fields = ['product__title', 'title', 'content']
    raw_id_fields = ['product']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Información', {
            'fields': ('product', 'update_type', 'title', 'content')
        }),
        ('Media', {
            'fields': ('image', 'image_url')
        }),
        ('Métricas', {
            'fields': ('co2_absorbed', 'height_cm'),
            'classes': ('collapse',)
        }),
        ('Visibilidad', {
            'fields': ('is_public',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


# Inlines para SponsorshipUnit
class UnitImageInline(admin.TabularInline):
    """Inline para galería de imágenes de unidad."""
    model = UnitImage
    extra = 1
    fields = ['image', 'image_url', 'alt_text', 'caption', 'taken_at', 'is_primary', 'display_order']


class UnitUpdateInline(admin.StackedInline):
    """Inline para actualizaciones de unidad."""
    model = UnitUpdate
    extra = 0
    fk_name = 'unit'
    fields = [
        'update_type', 'title', 'content',
        ('image', 'image_url'),
        ('height_cm', 'co2_absorbed', 'health_status'),
        ('is_public', 'notify_sponsor'),
    ]
    readonly_fields = ['created_at']
    ordering = ['-created_at']
    exclude = ['created_by']


@admin.register(SponsorshipUnit)
class SponsorshipUnitAdmin(admin.ModelAdmin):
    """
    Admin CMS para gestionar unidades de apadrinamiento.
    Formulario completo para registrar árboles, lagunas, hectáreas, etc.
    """
    
    list_display = [
        'code', 'name', 'product', 'status', 'sponsor_display',
        'location_name', 'co2_per_year', 'is_featured', 'created_at'
    ]
    list_filter = [
        'status', 'product', 'product__product_type',
        'is_active', 'is_featured', 'created_at'
    ]
    search_fields = ['code', 'name', 'description', 'location_name', 'species']
    prepopulated_fields = {'slug': ('code', 'name')}
    raw_id_fields = ['sponsor']
    readonly_fields = ['created_at', 'updated_at', 'sponsored_at']
    date_hierarchy = 'created_at'
    
    inlines = [UnitImageInline, UnitUpdateInline]
    
    fieldsets = (
        ('Identificación', {
            'fields': ('code', 'name', 'slug', 'product'),
            'description': 'Información básica de identificación. El código debe ser único.'
        }),
        ('Estado', {
            'fields': ('status', 'is_active', 'is_featured'),
        }),
        ('Descripción', {
            'fields': ('description', 'story'),
            'description': 'Cuenta la historia de esta unidad. ¿Qué la hace especial?'
        }),
        ('Ubicación Exacta (Solo Padrinos)', {
            'fields': ('location_name', ('location_lat', 'location_lng')),
            'description': 'Ubicación exacta - solo visible para el padrino después de apadrinar.'
        }),
        ('Ubicación Aproximada (Pública)', {
            'fields': ('location_area', ('location_lat_approx', 'location_lng_approx'), 'location_radius_km'),
            'description': 'Ubicación aproximada visible para todos. Se auto-genera si no se especifica.',
            'classes': ('collapse',)
        }),
        ('Características de Árbol', {
            'fields': ('species', 'age_years', 'height_cm'),
            'classes': ('collapse',),
            'description': 'Solo para árboles individuales.'
        }),
        ('Características de Área', {
            'fields': ('area_m2',),
            'classes': ('collapse',),
            'description': 'Solo para bosques, lagunas o fracciones.'
        }),
        ('Impacto Ambiental', {
            'fields': ('co2_per_year', 'co2_absorbed_total'),
            'description': 'Métricas de impacto ambiental.'
        }),
        ('Apadrinamiento', {
            'fields': ('sponsor', 'sponsored_at', 'sponsorship_expires_at'),
            'classes': ('collapse',),
            'description': 'Información del padrino actual.'
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def sponsor_display(self, obj):
        """Mostrar padrino con link."""
        if obj.sponsor:
            return format_html(
                '<a href="/admin/users/user/{}/change/">{}</a>',
                obj.sponsor.id,
                obj.sponsor.email
            )
        return format_html('<span style="color: green;">✓ Disponible</span>')
    sponsor_display.short_description = 'Padrino'
    
    actions = ['mark_as_available', 'mark_as_inactive']
    
    def mark_as_available(self, request, queryset):
        queryset.update(status='available', sponsor=None)
        self.message_user(request, f'{queryset.count()} unidades marcadas como disponibles.')
    mark_as_available.short_description = 'Marcar como disponible'
    
    def mark_as_inactive(self, request, queryset):
        queryset.update(status='inactive')
        self.message_user(request, f'{queryset.count()} unidades marcadas como inactivas.')
    mark_as_inactive.short_description = 'Marcar como inactivo'


@admin.register(UnitImage)
class UnitImageAdmin(admin.ModelAdmin):
    """Admin para imágenes de unidades."""
    
    list_display = ['unit', 'alt_text', 'taken_at', 'is_primary', 'display_order']
    list_filter = ['is_primary', 'taken_at', 'created_at']
    search_fields = ['unit__code', 'unit__name', 'alt_text', 'caption']
    raw_id_fields = ['unit']
    ordering = ['unit', 'display_order']


@admin.register(UnitUpdate)
class UnitUpdateAdmin(admin.ModelAdmin):
    """Admin para actualizaciones de unidades."""
    
    list_display = [
        'unit', 'update_type', 'title', 'health_status',
        'is_public', 'notify_sponsor', 'created_at'
    ]
    list_filter = ['update_type', 'is_public', 'health_status', 'created_at']
    search_fields = ['unit__code', 'unit__name', 'title', 'content']
    raw_id_fields = ['unit', 'created_by']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Unidad', {
            'fields': ('unit',)
        }),
        ('Actualización', {
            'fields': ('update_type', 'title', 'content')
        }),
        ('Media', {
            'fields': (('image', 'image_url'),)
        }),
        ('Métricas', {
            'fields': (('height_cm', 'co2_absorbed'), 'health_status'),
            'description': 'Métricas opcionales para tracking de progreso.'
        }),
        ('Visibilidad y Notificación', {
            'fields': (('is_public', 'notify_sponsor'),)
        }),
        ('Autor', {
            'fields': ('created_by',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
