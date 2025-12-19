"""
Product serializers for API responses and request validation.

These serializers handle data transformation between Python objects and JSON.
"""

from rest_framework import serializers
import bleach

from .models import (
    Category, Product, ProductImage, ProductUpdate,
    SponsorshipUnit, UnitImage, UnitUpdate
)


# i18n Mixin for translated fields
class TranslatedFieldsMixin:
    """
    Mixin to handle translated fields based on Accept-Language header.
    
    For each translatable field (e.g., 'title'), checks if '{field}_en' exists
    and returns the appropriate value based on the request language.
    """
    
    # Define which fields have translations
    translated_fields = []
    
    def get_language(self):
        """Get language from request header."""
        request = self.context.get('request')
        if request:
            accept_lang = request.headers.get('Accept-Language', 'es')
            if accept_lang.startswith('en'):
                return 'en'
        return 'es'
    
    def get_translated_value(self, obj, field_name):
        """Get translated value for a field."""
        lang = self.get_language()
        
        if lang == 'en':
            en_field = f'{field_name}_en'
            en_value = getattr(obj, en_field, None)
            if en_value:
                return en_value
        
        return getattr(obj, field_name, '')
    
    def get_translated_json_value(self, obj, field_name):
        """Get translated value for a JSON field (list)."""
        lang = self.get_language()
        
        if lang == 'en':
            en_field = f'{field_name}_en'
            en_value = getattr(obj, en_field, None)
            if en_value and len(en_value) > 0:
                return en_value
        
        return getattr(obj, field_name, [])
    
    def to_representation(self, instance):
        """Override to replace translated fields with correct language."""
        data = super().to_representation(instance)
        
        # Handle regular text fields
        for field in self.translated_fields:
            if field in data:
                data[field] = self.get_translated_value(instance, field)
        
        # Handle JSON fields (lists)
        translated_json_fields = getattr(self, 'translated_json_fields', [])
        for field in translated_json_fields:
            if field in data:
                data[field] = self.get_translated_json_value(instance, field)
        
        return data


class CategorySerializer(TranslatedFieldsMixin, serializers.ModelSerializer):
    """Serializer for Category model with i18n support."""
    
    translated_fields = ['name', 'description']
    product_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = [
            'id',
            'name',
            'slug',
            'description',
            'icon',
            'image_url',
            'is_active',
            'display_order',
            'product_count',
        ]
        read_only_fields = ['id', 'slug', 'product_count']
    
    def get_product_count(self, obj) -> int:
        """Get the number of active products in this category."""
        return obj.products.filter(is_active=True).count()


class CategoryListSerializer(TranslatedFieldsMixin, serializers.ModelSerializer):
    """Lightweight serializer for category lists with i18n support."""
    
    translated_fields = ['name']
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'icon']


class ProductImageSerializer(serializers.ModelSerializer):
    """Serializer for product gallery images."""
    
    url = serializers.CharField(read_only=True)
    
    class Meta:
        model = ProductImage
        fields = [
            'id',
            'url',
            'alt_text',
            'caption',
            'is_primary',
            'display_order',
        ]


class ProductUpdateSerializer(serializers.ModelSerializer):
    """Serializer for product updates/timeline."""
    
    image_display_url = serializers.CharField(read_only=True)
    update_type_display = serializers.CharField(source='get_update_type_display', read_only=True)
    
    class Meta:
        model = ProductUpdate
        fields = [
            'id',
            'update_type',
            'update_type_display',
            'title',
            'content',
            'image_display_url',
            'co2_absorbed',
            'height_cm',
            'is_public',
            'created_at',
        ]


class ProductListSerializer(TranslatedFieldsMixin, serializers.ModelSerializer):
    """Lightweight serializer for product lists and cards with i18n support."""
    
    translated_fields = ['title', 'short_description']
    
    category_name = serializers.SerializerMethodField()
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    is_on_sale = serializers.BooleanField(read_only=True)
    discount_percentage = serializers.IntegerField(read_only=True)
    primary_image = serializers.CharField(read_only=True)
    price_label = serializers.CharField(read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id',
            'title',
            'slug',
            'short_description',
            'price',
            'price_label',
            'pricing_type',
            'currency',
            'compare_at_price',
            'is_on_sale',
            'discount_percentage',
            'category_name',
            'category_slug',
            'product_type',
            'primary_image',
            'rating',
            'reviews_count',
            'is_featured',
            'is_new',
            'location_name',
            'co2_offset_kg',
            'area_size',
            'duration',
        ]
    
    def get_category_name(self, obj):
        """Get translated category name."""
        lang = self.get_language()
        if lang == 'en' and obj.category.name_en:
            return obj.category.name_en
        return obj.category.name


class ProductDetailSerializer(TranslatedFieldsMixin, serializers.ModelSerializer):
    """Full serializer for product detail pages with i18n support."""
    
    translated_fields = ['title', 'description', 'short_description', 'purpose', 'impact_description', 'duration']
    # JSON fields that need special handling
    translated_json_fields = ['includes', 'features']
    
    category = CategoryListSerializer(read_only=True)
    gallery = ProductImageSerializer(many=True, read_only=True)
    updates = ProductUpdateSerializer(many=True, read_only=True)
    is_on_sale = serializers.BooleanField(read_only=True)
    discount_percentage = serializers.IntegerField(read_only=True)
    is_in_stock = serializers.BooleanField(read_only=True)
    seo_title = serializers.CharField(read_only=True)
    seo_description = serializers.CharField(read_only=True)
    price_label = serializers.CharField(read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id',
            'title',
            'slug',
            'description',
            'short_description',
            'purpose',
            'impact_description',
            'price',
            'price_label',
            'pricing_type',
            'currency',
            'compare_at_price',
            'is_on_sale',
            'discount_percentage',
            'category',
            'product_type',
            'gallery',
            'updates',
            'stock',
            'is_in_stock',
            'rating',
            'reviews_count',
            'features',
            'location_name',
            'location_lat',
            'location_lng',
            'co2_offset_kg',
            'species',
            'area_size',
            'is_collective',
            'duration',
            'max_participants',
            'includes',
            'is_featured',
            'is_new',
            'seo_title',
            'seo_description',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']


class ProductCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating products (admin only)."""
    
    class Meta:
        model = Product
        fields = [
            'title',
            'description',
            'short_description',
            'price',
            'currency',
            'compare_at_price',
            'category',
            'product_type',
            'images',
            'stock',
            'is_unlimited_stock',
            'features',
            'location_name',
            'location_lat',
            'location_lng',
            'co2_offset_kg',
            'species',
            'is_active',
            'is_featured',
            'is_new',
            'meta_title',
            'meta_description',
        ]
    
    def validate_title(self, value: str) -> str:
        """Sanitize title to prevent XSS."""
        return bleach.clean(value, tags=[], strip=True)
    
    def validate_description(self, value: str) -> str:
        """Sanitize description, allowing some HTML tags."""
        allowed_tags = ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h2', 'h3']
        return bleach.clean(value, tags=allowed_tags, strip=True)
    
    def validate_price(self, value):
        """Ensure price is positive."""
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than zero.")
        return value


class ProductSearchSerializer(serializers.Serializer):
    """Serializer for product search parameters."""
    
    q = serializers.CharField(required=False, min_length=2, max_length=100)
    category = serializers.CharField(required=False)
    product_type = serializers.ChoiceField(
        choices=Product.ProductType.choices,
        required=False
    )
    min_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False
    )
    max_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False
    )
    is_featured = serializers.BooleanField(required=False)
    ordering = serializers.ChoiceField(
        choices=[
            ('price', 'Price (Low to High)'),
            ('-price', 'Price (High to Low)'),
            ('-rating', 'Rating'),
            ('-created_at', 'Newest'),
        ],
        required=False,
        default='-created_at'
    )


# Serializers para SponsorshipUnit

class UnitImageSerializer(serializers.ModelSerializer):
    """Serializer para imágenes de unidades."""
    
    url = serializers.CharField(read_only=True)
    
    class Meta:
        model = UnitImage
        fields = [
            'id', 'url', 'alt_text', 'caption',
            'taken_at', 'is_primary', 'display_order'
        ]


class UnitUpdateSerializer(serializers.ModelSerializer):
    """Serializer para actualizaciones de unidades."""
    
    image_display_url = serializers.CharField(read_only=True)
    update_type_display = serializers.CharField(source='get_update_type_display', read_only=True)
    
    class Meta:
        model = UnitUpdate
        fields = [
            'id', 'update_type', 'update_type_display',
            'title', 'content', 'image_display_url',
            'height_cm', 'co2_absorbed', 'health_status',
            'is_public', 'created_at'
        ]


class SponsorshipUnitListSerializer(serializers.ModelSerializer):
    """Serializer ligero para listados de unidades."""
    
    product_title = serializers.CharField(source='product.title', read_only=True)
    product_type = serializers.CharField(source='product.product_type', read_only=True)
    price = serializers.DecimalField(source='product.price', max_digits=10, decimal_places=2, read_only=True)
    price_label = serializers.CharField(source='product.price_label', read_only=True)
    primary_image = serializers.CharField(read_only=True)
    is_available = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = SponsorshipUnit
        fields = [
            'id', 'code', 'name', 'slug',
            'product_title', 'product_type',
            'price', 'price_label',
            'status', 'is_available',
            'location_name', 'species',
            'co2_per_year', 'primary_image',
            'is_featured'
        ]


class SponsorshipUnitDetailSerializer(serializers.ModelSerializer):
    """Serializer completo para detalle de unidad."""
    
    product = ProductListSerializer(read_only=True)
    gallery = UnitImageSerializer(many=True, read_only=True)
    updates = UnitUpdateSerializer(many=True, read_only=True)
    primary_image = serializers.CharField(read_only=True)
    is_available = serializers.BooleanField(read_only=True)
    sponsor_name = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    is_user_sponsor = serializers.SerializerMethodField()
    
    class Meta:
        model = SponsorshipUnit
        fields = [
            'id', 'code', 'name', 'slug',
            'product', 'status', 'is_available',
            'description', 'story',
            'location',
            'is_user_sponsor',
            'species', 'age_years', 'height_cm',
            'area_m2',
            'co2_per_year', 'co2_absorbed_total',
            'sponsor_name', 'sponsored_at', 'sponsorship_expires_at',
            'is_active', 'is_featured',
            'gallery', 'updates', 'primary_image',
            'created_at', 'updated_at'
        ]
    
    def get_sponsor_name(self, obj) -> str | None:
        """Obtener nombre del padrino (solo primeras letras por privacidad)."""
        if obj.sponsor:
            first_name = obj.sponsor.first_name or ''
            last_initial = (obj.sponsor.last_name or '')[:1]
            if first_name:
                return f"{first_name} {last_initial}."
            return "Padrino anónimo"
        return None
    
    def get_location(self, obj) -> dict:
        """
        Obtener ubicación según el usuario actual.
        Padrinos ven ubicación exacta, otros ven área aproximada.
        """
        request = self.context.get('request')
        user = request.user if request else None
        return obj.get_location_for_user(user)
    
    def get_is_user_sponsor(self, obj) -> bool:
        """Verificar si el usuario actual es el padrino."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.sponsor_id == request.user.id
        return False


class SponsorshipUnitSearchSerializer(serializers.Serializer):
    """Serializer para búsqueda de unidades."""
    
    q = serializers.CharField(required=False, min_length=2, max_length=100)
    product_type = serializers.ChoiceField(
        choices=Product.ProductType.choices,
        required=False
    )
    status = serializers.ChoiceField(
        choices=SponsorshipUnit.Status.choices,
        required=False
    )
    min_price = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=False
    )
    max_price = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=False
    )
    location = serializers.CharField(required=False)
    is_featured = serializers.BooleanField(required=False)
    ordering = serializers.ChoiceField(
        choices=[
            ('price', 'Precio (menor a mayor)'),
            ('-price', 'Precio (mayor a menor)'),
            ('-co2_per_year', 'Mayor impacto CO2'),
            ('-created_at', 'Más recientes'),
            ('name', 'Nombre A-Z'),
        ],
        required=False,
        default='-created_at'
    )
