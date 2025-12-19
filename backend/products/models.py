"""
Product models for Nature Marketplace.

This module defines Category and Product models for the marketplace catalog.
Products can be trees for adoption, wellness retreats, or physical/digital goods.
"""

from django.conf import settings
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.text import slugify
class Category(models.Model):
    """
    Product category for organizing the catalog.
    
    Categories include: Retreat, Tree, PhysicalProduct, DigitalGoods
    """
    
    name = models.CharField(
        max_length=100,
        unique=True,
        help_text='Category name (e.g., "Trees", "Retreats")'
    )
    slug = models.SlugField(
        max_length=100,
        unique=True,
        help_text='URL-friendly version of the name'
    )
    description = models.TextField(
        blank=True,
        help_text='Category description for SEO and display'
    )
    icon = models.CharField(
        max_length=50,
        blank=True,
        help_text='Material Symbol icon name'
    )
    image_url = models.URLField(
        blank=True,
        help_text='Category banner/thumbnail image URL'
    )
    is_active = models.BooleanField(
        default=True,
        help_text='Whether this category is visible in the catalog'
    )
    display_order = models.PositiveIntegerField(
        default=0,
        help_text='Order in which to display categories'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'
        ordering = ['display_order', 'name']
    
    def __str__(self) -> str:
        return self.name
    
    def save(self, *args, **kwargs) -> None:
        """Auto-generate slug from name if not provided."""
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
class Product(models.Model):
    """
    Product model representing items in the marketplace.
    
    Products can be:
    - Trees for adoption (with location data)
    - Wellness retreats (with dates and capacity)
    - Physical products (with stock)
    - Digital goods
    """
    
    # Product Type Choices
    class ProductType(models.TextChoices):
        TREE = 'tree', 'Árbol'
        FOREST = 'forest', 'Bosque'
        LAGOON = 'lagoon', 'Laguna/Humedal'
        EXPERIENCE = 'experience', 'Experiencia'
    
    # Pricing Type Choices
    class PricingType(models.TextChoices):
        ANNUAL = 'annual', 'Suscripción Anual'
        ONE_TIME = 'one_time', 'Pago Único'
    
    # Basic Information
    title = models.CharField(
        max_length=200,
        help_text='Product title'
    )
    slug = models.SlugField(
        max_length=200,
        unique=True,
        help_text='URL-friendly version of the title'
    )
    description = models.TextField(
        help_text='Full product description (supports markdown)'
    )
    short_description = models.CharField(
        max_length=300,
        help_text='Brief description for cards and SEO meta'
    )
    
    # Categorization
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name='products',
        help_text='Product category'
    )
    product_type = models.CharField(
        max_length=20,
        choices=ProductType.choices,
        help_text='Type of product'
    )
    
    # Purpose & Impact
    purpose = models.TextField(
        blank=True,
        help_text='Propósito del apadrinamiento - por qué es importante'
    )
    impact_description = models.TextField(
        blank=True,
        help_text='Descripción del impacto que genera el apadrinamiento'
    )
    
    # Pricing
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text='Precio del producto'
    )
    pricing_type = models.CharField(
        max_length=20,
        choices=PricingType.choices,
        default=PricingType.ANNUAL,
        help_text='Tipo de precio (anual o único)'
    )
    currency = models.CharField(
        max_length=3,
        default='USD',
        help_text='Código de moneda (ISO 4217)'
    )
    compare_at_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        help_text='Precio original para mostrar descuentos'
    )
    
    # Inventory
    stock = models.PositiveIntegerField(
        default=0,
        help_text='Stock disponible (0 = ilimitado para apadrinamientos)'
    )
    is_unlimited_stock = models.BooleanField(
        default=True,
        help_text='Si es true, el stock no se rastrea'
    )
    
    # Experience-specific fields
    duration = models.CharField(
        max_length=50,
        blank=True,
        help_text='Duración de la experiencia (ej: "4 horas", "3 días")'
    )
    max_participants = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text='Máximo de participantes por experiencia'
    )
    includes = models.JSONField(
        default=list,
        help_text='Lista de lo que incluye (ej: ["Transporte", "Almuerzo"])'
    )
    
    # Area-specific fields (for forests/lagoons)
    area_size = models.CharField(
        max_length=50,
        blank=True,
        help_text='Tamaño del área (ej: "1 hectárea", "2,500 m²")'
    )
    is_collective = models.BooleanField(
        default=False,
        help_text='Si es apadrinamiento colectivo (varios padrinos)'
    )
    
    # Ratings & Reviews
    rating = models.DecimalField(
        max_digits=2,
        decimal_places=1,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        help_text='Average rating (0-5)'
    )
    reviews_count = models.PositiveIntegerField(
        default=0,
        help_text='Number of reviews'
    )
    
    # Features & Highlights
    features = models.JSONField(
        default=list,
        help_text='List of feature strings (e.g., ["Organic", "Vegan"])'
    )
    
    # Location (for Trees and Retreats)
    location_name = models.CharField(
        max_length=200,
        blank=True,
        help_text='Location name (e.g., "Sequoia National Forest")'
    )
    location_lat = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        help_text='Latitude coordinate'
    )
    location_lng = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        help_text='Longitude coordinate'
    )
    
    # Tree-specific fields
    co2_offset_kg = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text='Estimated CO2 offset in kg per year (for trees)'
    )
    species = models.CharField(
        max_length=100,
        blank=True,
        help_text='Tree species (for trees)'
    )
    
    # Status & Visibility
    is_active = models.BooleanField(
        default=True,
        help_text='Whether product is visible in catalog'
    )
    is_featured = models.BooleanField(
        default=False,
        help_text='Whether to show in featured section'
    )
    is_new = models.BooleanField(
        default=True,
        help_text='Whether to show "New" badge'
    )
    
    # SEO
    meta_title = models.CharField(
        max_length=70,
        blank=True,
        help_text='SEO meta title (defaults to title if empty)'
    )
    meta_description = models.CharField(
        max_length=160,
        blank=True,
        help_text='SEO meta description (defaults to short_description if empty)'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Product'
        verbose_name_plural = 'Products'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['category', 'is_active']),
            models.Index(fields=['product_type', 'is_active']),
            models.Index(fields=['is_featured', 'is_active']),
        ]
    
    def __str__(self) -> str:
        return self.title
    
    def save(self, *args, **kwargs) -> None:
        """Auto-generate slug from title if not provided."""
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)
    
    @property
    def is_on_sale(self) -> bool:
        """Check if product has a discount."""
        return self.compare_at_price is not None and self.compare_at_price > self.price
    
    @property
    def discount_percentage(self) -> int:
        """Calculate discount percentage if on sale."""
        if not self.is_on_sale or not self.compare_at_price:
            return 0
        return int(((self.compare_at_price - self.price) / self.compare_at_price) * 100)
    
    @property
    def is_in_stock(self) -> bool:
        """Check if product is available."""
        return self.is_unlimited_stock or self.stock > 0
    
    @property
    def primary_image(self) -> str:
        """Get the first image URL or empty string."""
        if self.images and len(self.images) > 0:
            return self.images[0]
        return ''
    
    @property
    def seo_title(self) -> str:
        """Get SEO title, falling back to product title."""
        return self.meta_title or self.title
    
    @property
    def seo_description(self) -> str:
        """Get SEO description, falling back to short description."""
        return self.meta_description or self.short_description
    
    @property
    def price_label(self) -> str:
        """Get price label based on pricing type."""
        if self.pricing_type == self.PricingType.ANNUAL:
            return '/año'
        return ''


class ProductImage(models.Model):
    """
    Galería de imágenes para productos.
    Permite múltiples fotos por producto con orden y descripción.
    """
    
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='gallery',
        help_text='Producto al que pertenece la imagen'
    )
    image = models.ImageField(
        upload_to='products/%Y/%m/',
        blank=True,
        null=True,
        help_text='Archivo de imagen'
    )
    image_url = models.URLField(
        blank=True,
        help_text='URL externa de imagen (alternativa a subir archivo)'
    )
    alt_text = models.CharField(
        max_length=200,
        blank=True,
        help_text='Texto alternativo para accesibilidad'
    )
    caption = models.CharField(
        max_length=300,
        blank=True,
        help_text='Descripción o pie de foto'
    )
    is_primary = models.BooleanField(
        default=False,
        help_text='Si es la imagen principal del producto'
    )
    display_order = models.PositiveIntegerField(
        default=0,
        help_text='Orden de visualización'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Imagen de Producto'
        verbose_name_plural = 'Imágenes de Productos'
        ordering = ['display_order', '-is_primary']
    
    def __str__(self) -> str:
        return f"{self.product.title} - Imagen {self.display_order}"
    
    @property
    def url(self) -> str:
        """Get image URL from file or external URL."""
        if self.image:
            return self.image.url
        return self.image_url


class ProductUpdate(models.Model):
    """
    Historial de actualizaciones de productos.
    Permite a los padrinos ver el progreso de sus apadrinamientos.
    """
    
    class UpdateType(models.TextChoices):
        PHOTO = 'photo', 'Nueva Foto'
        GROWTH = 'growth', 'Crecimiento'
        MILESTONE = 'milestone', 'Hito Alcanzado'
        MAINTENANCE = 'maintenance', 'Mantenimiento'
        IMPACT = 'impact', 'Reporte de Impacto'
        NEWS = 'news', 'Noticia'
        EVENT = 'event', 'Evento'
    
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='updates',
        help_text='Producto relacionado'
    )
    update_type = models.CharField(
        max_length=20,
        choices=UpdateType.choices,
        default=UpdateType.NEWS,
        help_text='Tipo de actualización'
    )
    title = models.CharField(
        max_length=200,
        help_text='Título de la actualización'
    )
    content = models.TextField(
        help_text='Contenido de la actualización (soporta markdown)'
    )
    image = models.ImageField(
        upload_to='updates/%Y/%m/',
        blank=True,
        null=True,
        help_text='Imagen de la actualización'
    )
    image_url = models.URLField(
        blank=True,
        help_text='URL externa de imagen'
    )
    
    # Metrics (optional, for growth/impact updates)
    co2_absorbed = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text='CO2 absorbido hasta la fecha (kg)'
    )
    height_cm = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text='Altura actual en centímetros (para árboles)'
    )
    
    # Visibility
    is_public = models.BooleanField(
        default=True,
        help_text='Si es visible para todos o solo padrinos'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Actualización de Producto'
        verbose_name_plural = 'Actualizaciones de Productos'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['product', '-created_at']),
            models.Index(fields=['update_type']),
        ]
    
    def __str__(self) -> str:
        return f"{self.product.title} - {self.title}"
    
    @property
    def image_display_url(self) -> str:
        """Get image URL from file or external URL."""
        if self.image:
            return self.image.url
        return self.image_url


class SponsorshipUnit(models.Model):
    """
    Unidad única de apadrinamiento.
    
    Cada árbol, laguna, hectárea o fracción es una unidad única con:
    - Identificador único (código)
    - Nombre propio
    - Ubicación específica
    - Historial de actualizaciones
    - Padrino asignado (cuando se apadrina)
    """
    
    class Status(models.TextChoices):
        AVAILABLE = 'available', 'Disponible'
        SPONSORED = 'sponsored', 'Apadrinado'
        RESERVED = 'reserved', 'Reservado'
        INACTIVE = 'inactive', 'Inactivo'
    
    # Identificación única
    code = models.CharField(
        max_length=50,
        unique=True,
        help_text='Código único (ej: TREE-001, LAG-GUATAVITA-001, FOREST-SN-001)'
    )
    name = models.CharField(
        max_length=200,
        help_text='Nombre propio de la unidad (ej: "Roble del Amanecer", "Sector Norte Laguna")'
    )
    slug = models.SlugField(
        max_length=200,
        unique=True,
        help_text='URL amigable'
    )
    
    # Relación con el tipo de producto
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name='units',
        help_text='Tipo de producto al que pertenece'
    )
    
    # Estado
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.AVAILABLE,
        help_text='Estado actual de la unidad'
    )
    
    # Descripción específica
    description = models.TextField(
        blank=True,
        help_text='Descripción específica de esta unidad'
    )
    story = models.TextField(
        blank=True,
        help_text='Historia o contexto especial de esta unidad'
    )
    
    # Ubicación específica (exacta - solo visible para padrinos)
    location_name = models.CharField(
        max_length=200,
        blank=True,
        help_text='Ubicación específica (visible para padrinos)'
    )
    location_lat = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        help_text='Latitud exacta (solo padrinos)'
    )
    location_lng = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        help_text='Longitud exacta (solo padrinos)'
    )
    
    # Ubicación aproximada (pública - para todos)
    location_area = models.CharField(
        max_length=200,
        blank=True,
        help_text='Área general (ej: "Sierra Nevada, Colombia")'
    )
    location_lat_approx = models.DecimalField(
        max_digits=9,
        decimal_places=3,
        null=True,
        blank=True,
        help_text='Latitud aproximada (3 decimales = ~100m de precisión)'
    )
    location_lng_approx = models.DecimalField(
        max_digits=9,
        decimal_places=3,
        null=True,
        blank=True,
        help_text='Longitud aproximada (3 decimales = ~100m de precisión)'
    )
    location_radius_km = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=5.0,
        help_text='Radio del área aproximada en km (para mostrar círculo en mapa)'
    )
    
    # Características específicas (árboles)
    species = models.CharField(
        max_length=100,
        blank=True,
        help_text='Especie (para árboles)'
    )
    age_years = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text='Edad en años'
    )
    height_cm = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text='Altura actual en centímetros'
    )
    
    # Características específicas (áreas)
    area_m2 = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        help_text='Área en metros cuadrados'
    )
    
    # Impacto
    co2_absorbed_total = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text='CO2 total absorbido hasta la fecha (kg)'
    )
    co2_per_year = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text='CO2 estimado por año (kg)'
    )
    
    # Padrino actual
    sponsor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sponsored_units',
        help_text='Padrino actual'
    )
    sponsored_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text='Fecha de apadrinamiento'
    )
    sponsorship_expires_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text='Fecha de expiración del apadrinamiento'
    )
    
    # Visibilidad
    is_active = models.BooleanField(
        default=True,
        help_text='Si está visible en el catálogo'
    )
    is_featured = models.BooleanField(
        default=False,
        help_text='Si aparece en destacados'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Unidad de Apadrinamiento'
        verbose_name_plural = 'Unidades de Apadrinamiento'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['status']),
            models.Index(fields=['product', 'status']),
            models.Index(fields=['sponsor']),
        ]
    
    def __str__(self) -> str:
        return f"{self.code} - {self.name}"
    
    def save(self, *args, **kwargs) -> None:
        if not self.slug:
            self.slug = slugify(f"{self.code}-{self.name}")
        super().save(*args, **kwargs)
    
    @property
    def is_available(self) -> bool:
        return self.status == self.Status.AVAILABLE
    
    @property
    def primary_image(self) -> str:
        """Get primary image from gallery."""
        primary = self.gallery.filter(is_primary=True).first()
        if primary:
            return primary.url
        first = self.gallery.first()
        if first:
            return first.url
        return self.product.primary_image
    
    def get_location_for_user(self, user) -> dict:
        """
        Obtener ubicación según el usuario.
        - Padrino actual: ubicación exacta
        - Otros usuarios: ubicación aproximada (estilo Airbnb)
        """
        is_sponsor = user and user.is_authenticated and self.sponsor_id == user.id
        
        if is_sponsor:
            return {
                'type': 'exact',
                'name': self.location_name,
                'lat': float(self.location_lat) if self.location_lat else None,
                'lng': float(self.location_lng) if self.location_lng else None,
                'area': self.location_area,
                'can_visit': True,
            }
        else:
            return {
                'type': 'approximate',
                'name': self.location_area or self.location_name,
                'lat': float(self.location_lat_approx) if self.location_lat_approx else None,
                'lng': float(self.location_lng_approx) if self.location_lng_approx else None,
                'radius_km': float(self.location_radius_km) if self.location_radius_km else 1.0,
                'message': 'La ubicación exacta se revela al apadrinar',
                'can_visit': False,
            }
    
    def save(self, *args, **kwargs) -> None:
        # Auto-generar ubicación aproximada si no existe
        if self.location_lat and not self.location_lat_approx:
            # Redondear a 3 decimales (~100m de precisión)
            from decimal import Decimal, ROUND_DOWN
            self.location_lat_approx = Decimal(str(self.location_lat)).quantize(
                Decimal('0.001'), rounding=ROUND_DOWN
            )
        if self.location_lng and not self.location_lng_approx:
            from decimal import Decimal, ROUND_DOWN
            self.location_lng_approx = Decimal(str(self.location_lng)).quantize(
                Decimal('0.001'), rounding=ROUND_DOWN
            )
        if self.location_name and not self.location_area:
            # Usar el nombre de ubicación como área si no hay área definida
            self.location_area = self.location_name
        
        if not self.slug:
            self.slug = slugify(f"{self.code}-{self.name}")
        super().save(*args, **kwargs)


class UnitImage(models.Model):
    """Galería de imágenes para unidades individuales."""
    
    unit = models.ForeignKey(
        SponsorshipUnit,
        on_delete=models.CASCADE,
        related_name='gallery',
        help_text='Unidad a la que pertenece'
    )
    image = models.ImageField(
        upload_to='units/%Y/%m/',
        blank=True,
        null=True,
        help_text='Archivo de imagen'
    )
    image_url = models.URLField(
        blank=True,
        help_text='URL externa de imagen'
    )
    alt_text = models.CharField(
        max_length=200,
        blank=True,
        help_text='Texto alternativo'
    )
    caption = models.CharField(
        max_length=300,
        blank=True,
        help_text='Descripción de la foto'
    )
    taken_at = models.DateField(
        null=True,
        blank=True,
        help_text='Fecha en que se tomó la foto'
    )
    is_primary = models.BooleanField(
        default=False,
        help_text='Si es la imagen principal'
    )
    display_order = models.PositiveIntegerField(
        default=0,
        help_text='Orden de visualización'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Imagen de Unidad'
        verbose_name_plural = 'Imágenes de Unidades'
        ordering = ['display_order', '-is_primary']
    
    def __str__(self) -> str:
        return f"{self.unit.name} - Imagen {self.display_order}"
    
    @property
    def url(self) -> str:
        if self.image:
            return self.image.url
        return self.image_url


class UnitUpdate(models.Model):
    """
    Actualizaciones específicas de una unidad.
    Timeline de progreso para los padrinos.
    """
    
    class UpdateType(models.TextChoices):
        PHOTO = 'photo', 'Nueva Foto'
        GROWTH = 'growth', 'Crecimiento'
        MILESTONE = 'milestone', 'Hito Alcanzado'
        MAINTENANCE = 'maintenance', 'Mantenimiento'
        IMPACT = 'impact', 'Reporte de Impacto'
        HEALTH = 'health', 'Estado de Salud'
        WEATHER = 'weather', 'Evento Climático'
        WILDLIFE = 'wildlife', 'Avistamiento de Fauna'
    
    unit = models.ForeignKey(
        SponsorshipUnit,
        on_delete=models.CASCADE,
        related_name='updates',
        help_text='Unidad relacionada'
    )
    update_type = models.CharField(
        max_length=20,
        choices=UpdateType.choices,
        default=UpdateType.PHOTO,
        help_text='Tipo de actualización'
    )
    title = models.CharField(
        max_length=200,
        help_text='Título de la actualización'
    )
    content = models.TextField(
        help_text='Contenido (soporta markdown)'
    )
    
    # Media
    image = models.ImageField(
        upload_to='unit_updates/%Y/%m/',
        blank=True,
        null=True,
        help_text='Imagen de la actualización'
    )
    image_url = models.URLField(
        blank=True,
        help_text='URL externa de imagen'
    )
    
    # Métricas
    height_cm = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text='Altura actual (cm)'
    )
    co2_absorbed = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text='CO2 absorbido acumulado (kg)'
    )
    health_status = models.CharField(
        max_length=50,
        blank=True,
        help_text='Estado de salud (ej: Excelente, Bueno, Requiere atención)'
    )
    
    # Visibilidad
    is_public = models.BooleanField(
        default=True,
        help_text='Visible para todos o solo el padrino'
    )
    notify_sponsor = models.BooleanField(
        default=True,
        help_text='Enviar notificación al padrino'
    )
    
    # Autor
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='unit_updates_created',
        help_text='Usuario que creó la actualización'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Actualización de Unidad'
        verbose_name_plural = 'Actualizaciones de Unidades'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['unit', '-created_at']),
            models.Index(fields=['update_type']),
        ]
    
    def __str__(self) -> str:
        return f"{self.unit.code} - {self.title}"
    
    @property
    def image_display_url(self) -> str:
        if self.image:
            return self.image.url
        return self.image_url
