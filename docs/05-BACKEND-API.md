# 🔌 Backend API

## Visión General

La API REST está construida con Django REST Framework (DRF) y sigue los principios RESTful.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ESTRUCTURA DE LA API                            │
└─────────────────────────────────────────────────────────────────────────┘

Base URL: https://api.nature-marketplace.com/api/

Endpoints principales:
├── /auth/           → Autenticación (login, registro, tokens)
├── /users/          → Gestión de usuarios y perfiles
├── /products/       → Catálogo de productos
├── /units/          → Unidades de apadrinamiento
├── /categories/     → Categorías de productos
├── /cart/           → Carrito de compras
├── /orders/         → Órdenes y checkout
├── /payments/       → Procesamiento de pagos
└── /health/         → Estado del servidor
```

## Convenciones

### Formato de Respuesta

Todas las respuestas usan JSON:

```json
// Respuesta exitosa (200, 201)
{
  "id": 1,
  "title": "Roble Andino",
  "price": "75.00",
  "created_at": "2024-12-18T10:30:00Z"
}

// Lista con paginación
{
  "count": 150,
  "next": "https://api.example.com/products/?page=2",
  "previous": null,
  "results": [
    { "id": 1, "title": "Roble Andino" },
    { "id": 2, "title": "Cedro del Líbano" }
  ]
}

// Error (400, 401, 403, 404, 500)
{
  "error": "validation_error",
  "message": "Los datos proporcionados no son válidos",
  "details": {
    "email": ["Este campo es requerido"],
    "password": ["La contraseña debe tener al menos 8 caracteres"]
  }
}
```

### Códigos de Estado HTTP

| Código | Significado | Uso |
|--------|-------------|-----|
| 200 | OK | GET exitoso, PUT/PATCH exitoso |
| 201 | Created | POST exitoso (recurso creado) |
| 204 | No Content | DELETE exitoso |
| 400 | Bad Request | Datos inválidos |
| 401 | Unauthorized | Token faltante o inválido |
| 403 | Forbidden | Sin permisos para esta acción |
| 404 | Not Found | Recurso no existe |
| 429 | Too Many Requests | Rate limit excedido |
| 500 | Server Error | Error interno |

### Autenticación

```http
# Incluir token en header Authorization
GET /api/users/me/ HTTP/1.1
Host: api.nature-marketplace.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## Endpoints Detallados

### Autenticación (`/api/auth/`)

#### Registro de Usuario

```http
POST /api/auth/registration/
Content-Type: application/json

{
  "email": "usuario@email.com",
  "password1": "contraseña_segura_123",
  "password2": "contraseña_segura_123",
  "first_name": "Juan",
  "last_name": "Pérez"
}
```

**Respuesta (201 Created):**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIs...",
  "refresh": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "usuario@email.com",
    "first_name": "Juan",
    "last_name": "Pérez"
  }
}
```

#### Login

```http
POST /api/auth/login/
Content-Type: application/json

{
  "email": "usuario@email.com",
  "password": "contraseña_segura_123"
}
```

**Respuesta (200 OK):**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIs...",
  "refresh": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "usuario@email.com"
  }
}
```

#### Refresh Token

```http
POST /api/auth/token/refresh/
Content-Type: application/json

{
  "refresh": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Respuesta (200 OK):**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIs_nuevo..."
}
```

#### Logout

```http
POST /api/auth/logout/
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "refresh": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### Usuarios (`/api/users/`)

#### Obtener Usuario Actual

```http
GET /api/users/me/
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Respuesta (200 OK):**
```json
{
  "id": 1,
  "email": "usuario@email.com",
  "first_name": "Juan",
  "last_name": "Pérez",
  "profile": {
    "display_name": "Juan P.",
    "photo_url": "https://...",
    "theme": "dark",
    "level": "Sprout",
    "current_points": 150,
    "total_points_earned": 250
  },
  "badges": [
    {
      "id": 1,
      "name": "Primera Semilla",
      "icon": "eco",
      "awarded_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

#### Actualizar Perfil

```http
PATCH /api/users/me/
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "first_name": "Juan Carlos",
  "profile": {
    "display_name": "JuanC",
    "theme": "light",
    "notify_tree_updates": true
  }
}
```

---

### Productos (`/api/products/`)

#### Listar Productos

```http
GET /api/products/
```

**Query Parameters:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `page` | int | Número de página (default: 1) |
| `page_size` | int | Items por página (default: 20, max: 100) |
| `category` | string | Filtrar por slug de categoría |
| `product_type` | string | Filtrar por tipo (tree, forest, lagoon, experience) |
| `is_featured` | bool | Solo productos destacados |
| `min_price` | decimal | Precio mínimo |
| `max_price` | decimal | Precio máximo |
| `search` | string | Búsqueda en título y descripción |
| `ordering` | string | Ordenar por campo (-price, created_at, etc.) |

**Ejemplo:**
```http
GET /api/products/?category=arboles&product_type=tree&is_featured=true&ordering=-created_at
```

**Respuesta (200 OK):**
```json
{
  "count": 45,
  "next": "https://api.example.com/products/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Roble Andino",
      "slug": "roble-andino",
      "short_description": "Árbol nativo de los Andes colombianos",
      "price": "75.00",
      "price_label": "/año",
      "currency": "USD",
      "product_type": "tree",
      "category": {
        "id": 1,
        "name": "Árboles",
        "slug": "arboles"
      },
      "primary_image": "https://storage.example.com/products/roble.jpg",
      "rating": "4.8",
      "reviews_count": 127,
      "is_featured": true,
      "is_new": false,
      "co2_offset_kg": "22.00",
      "location_name": "Sierra Nevada, Colombia"
    }
  ]
}
```

#### Detalle de Producto

```http
GET /api/products/roble-andino/
```

**Respuesta (200 OK):**
```json
{
  "id": 1,
  "title": "Roble Andino",
  "slug": "roble-andino",
  "description": "El Roble Andino (Quercus humboldtii) es una especie...",
  "short_description": "Árbol nativo de los Andes colombianos",
  "purpose": "Proteger el ecosistema de bosque de niebla...",
  "impact_description": "Cada roble absorbe 22kg de CO2 al año...",
  "price": "75.00",
  "pricing_type": "annual",
  "currency": "USD",
  "compare_at_price": "95.00",
  "product_type": "tree",
  "category": {
    "id": 1,
    "name": "Árboles",
    "slug": "arboles",
    "icon": "park"
  },
  "features": ["Nativo", "Bosque de niebla", "Hábitat de fauna"],
  "location_name": "Sierra Nevada, Colombia",
  "location_lat": "10.823000",
  "location_lng": "-73.456000",
  "co2_offset_kg": "22.00",
  "species": "Quercus humboldtii",
  "gallery": [
    {
      "id": 1,
      "url": "https://storage.example.com/products/roble-1.jpg",
      "alt_text": "Roble Andino en su hábitat natural",
      "is_primary": true
    },
    {
      "id": 2,
      "url": "https://storage.example.com/products/roble-2.jpg",
      "alt_text": "Detalle de hojas del Roble Andino",
      "is_primary": false
    }
  ],
  "updates": [
    {
      "id": 1,
      "title": "Temporada de floración",
      "content": "Los robles de la reserva están en plena floración...",
      "update_type": "news",
      "image_url": "https://storage.example.com/updates/floracion.jpg",
      "created_at": "2024-12-01T10:00:00Z"
    }
  ],
  "available_units_count": 23,
  "rating": "4.8",
  "reviews_count": 127,
  "is_featured": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### Unidades de Apadrinamiento (`/api/units/`)

#### Listar Unidades Disponibles

```http
GET /api/units/?product=1&status=available
```

**Respuesta (200 OK):**
```json
{
  "count": 23,
  "results": [
    {
      "id": 1,
      "code": "TREE-2024-001",
      "name": "Roble del Amanecer",
      "slug": "tree-2024-001-roble-del-amanecer",
      "product_title": "Roble Andino",
      "product_type": "tree",
      "price": "75.00",
      "price_label": "/año",
      "status": "available",
      "is_available": true,
      "location_name": "Sierra Nevada, Colombia",
      "species": "Quercus humboldtii",
      "co2_per_year": "22.00",
      "primary_image": "https://storage.example.com/units/tree-001.jpg",
      "is_featured": true
    }
  ]
}
```

#### Detalle de Unidad

```http
GET /api/units/tree-2024-001-roble-del-amanecer/
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...  # Opcional
```

**Respuesta para visitante (no padrino):**
```json
{
  "id": 1,
  "code": "TREE-2024-001",
  "name": "Roble del Amanecer",
  "slug": "tree-2024-001-roble-del-amanecer",
  "product": {
    "id": 1,
    "title": "Roble Andino",
    "price": "75.00"
  },
  "status": "available",
  "is_available": true,
  "description": "Este roble fue plantado en enero de 2024...",
  "story": "Ubicado en una ladera con vista al valle...",
  
  "location": {
    "type": "approximate",
    "name": "Sierra Nevada, Colombia",
    "lat": 10.823,
    "lng": -73.456,
    "radius_km": 5.0,
    "message": "La ubicación exacta se revela al apadrinar",
    "can_visit": false
  },
  
  "is_user_sponsor": false,
  "species": "Quercus humboldtii",
  "age_years": 1,
  "height_cm": 230,
  "co2_per_year": "22.00",
  "co2_absorbed_total": "18.50",
  
  "gallery": [...],
  "updates": [...],
  
  "sponsor_name": null,
  "sponsored_at": null
}
```

**Respuesta para padrino:**
```json
{
  "...mismo contenido...",
  
  "location": {
    "type": "exact",
    "name": "Finca El Roble, Vereda San Pedro, Km 5",
    "lat": 10.823456,
    "lng": -73.456789,
    "area": "Sierra Nevada, Colombia",
    "can_visit": true
  },
  
  "is_user_sponsor": true,
  "sponsor_name": "Juan P.",
  "sponsored_at": "2024-01-15T10:00:00Z",
  "sponsorship_expires_at": "2025-01-15T10:00:00Z"
}
```

---

### Carrito (`/api/cart/`)

#### Obtener Carrito

```http
GET /api/cart/
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Respuesta (200 OK):**
```json
{
  "id": 1,
  "items": [
    {
      "id": 1,
      "product": {
        "id": 1,
        "title": "Roble Andino",
        "slug": "roble-andino",
        "price": "75.00",
        "primary_image": "https://..."
      },
      "quantity": 1,
      "selected_options": {
        "unit_id": 1,
        "nickname": "Mi primer árbol"
      },
      "unit_price": "75.00",
      "line_total": "75.00"
    }
  ],
  "total_items": 1,
  "subtotal": "75.00",
  "total": "75.00"
}
```

#### Agregar al Carrito

```http
POST /api/cart/items/
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "product_id": 1,
  "quantity": 1,
  "selected_options": {
    "unit_id": 1,
    "nickname": "Mi primer árbol"
  }
}
```

#### Actualizar Item

```http
PATCH /api/cart/items/1/
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "quantity": 2
}
```

#### Eliminar Item

```http
DELETE /api/cart/items/1/
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

### Órdenes (`/api/orders/`)

#### Crear Orden (Checkout)

```http
POST /api/orders/checkout/
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "customer_notes": "Es un regalo de cumpleaños"
}
```

**Respuesta (201 Created):**
```json
{
  "order_id": "550e8400-e29b-41d4-a716-446655440000",
  "order_number": "NM-20241218-1234",
  "total_amount": "75.00",
  "currency": "USD",
  "stripe_client_secret": "pi_xxx_secret_yyy",
  "status": "Pending"
}
```

#### Listar Mis Órdenes

```http
GET /api/orders/
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Respuesta (200 OK):**
```json
{
  "count": 5,
  "results": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "order_number": "NM-20241218-1234",
      "status": "Fulfilled",
      "total_amount": "75.00",
      "items_count": 1,
      "created_at": "2024-12-18T10:00:00Z",
      "paid_at": "2024-12-18T10:05:00Z"
    }
  ]
}
```

#### Detalle de Orden

```http
GET /api/orders/NM-20241218-1234/
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

### Pagos (`/api/payments/`)

#### Webhook de Stripe

```http
POST /api/payments/webhook/
Stripe-Signature: t=1234567890,v1=abc123...
Content-Type: application/json

{
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_xxx",
      "amount": 7500,
      "currency": "usd",
      "metadata": {
        "order_id": "550e8400-e29b-41d4-a716-446655440000"
      }
    }
  }
}
```

**Este endpoint es llamado por Stripe, no por el frontend.**

---

## Serializers

Los serializers transforman datos entre Python y JSON.

### Ejemplo: ProductSerializer

```python
class ProductListSerializer(serializers.ModelSerializer):
    """
    Serializer ligero para listados de productos.
    Incluye solo los campos necesarios para mostrar cards.
    """
    
    category = CategorySerializer(read_only=True)
    primary_image = serializers.CharField(read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'title', 'slug', 'short_description',
            'price', 'price_label', 'currency',
            'product_type', 'category',
            'primary_image', 'rating', 'reviews_count',
            'is_featured', 'is_new',
            'co2_offset_kg', 'location_name'
        ]


class ProductDetailSerializer(serializers.ModelSerializer):
    """
    Serializer completo para página de detalle.
    Incluye galería, actualizaciones y toda la información.
    """
    
    category = CategorySerializer(read_only=True)
    gallery = ProductImageSerializer(many=True, read_only=True)
    updates = ProductUpdateSerializer(many=True, read_only=True)
    available_units_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'title', 'slug', 'description', 'short_description',
            'purpose', 'impact_description',
            'price', 'pricing_type', 'currency', 'compare_at_price',
            'product_type', 'category', 'features',
            'location_name', 'location_lat', 'location_lng',
            'co2_offset_kg', 'species',
            'duration', 'max_participants', 'includes',
            'area_size', 'is_collective',
            'gallery', 'updates',
            'available_units_count',
            'rating', 'reviews_count',
            'is_featured', 'is_new',
            'created_at', 'updated_at'
        ]
    
    def get_available_units_count(self, obj) -> int:
        """Contar unidades disponibles para este producto."""
        return obj.units.filter(status='available', is_active=True).count()
```

### Serializer con Lógica de Usuario

```python
class SponsorshipUnitDetailSerializer(serializers.ModelSerializer):
    """
    Serializer que adapta la respuesta según el usuario.
    """
    
    location = serializers.SerializerMethodField()
    is_user_sponsor = serializers.SerializerMethodField()
    
    def get_location(self, obj) -> dict:
        """
        Retorna ubicación exacta o aproximada según el usuario.
        """
        request = self.context.get('request')
        user = request.user if request else None
        return obj.get_location_for_user(user)
    
    def get_is_user_sponsor(self, obj) -> bool:
        """
        Verifica si el usuario actual es el padrino.
        """
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.sponsor_id == request.user.id
        return False
```

## Views

### ViewSet Básico

```python
class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para productos.
    
    Endpoints:
    - GET /api/products/          → list()
    - GET /api/products/{slug}/   → retrieve()
    """
    
    queryset = Product.objects.filter(is_active=True)
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category__slug', 'product_type', 'is_featured']
    search_fields = ['title', 'description', 'short_description']
    ordering_fields = ['price', 'created_at', 'rating']
    
    def get_serializer_class(self):
        """
        Usar serializer ligero para lista, completo para detalle.
        """
        if self.action == 'list':
            return ProductListSerializer
        return ProductDetailSerializer
    
    def get_queryset(self):
        """
        Optimizar queries con select_related y prefetch_related.
        """
        queryset = super().get_queryset()
        
        if self.action == 'retrieve':
            # Para detalle, cargar relaciones
            queryset = queryset.select_related('category')
            queryset = queryset.prefetch_related('gallery', 'updates')
        
        return queryset
```

### View con Autenticación

```python
class CartViewSet(viewsets.ModelViewSet):
    """
    ViewSet para carrito de compras.
    Requiere autenticación.
    """
    
    permission_classes = [IsAuthenticated]
    serializer_class = CartSerializer
    
    def get_queryset(self):
        """
        Retornar solo el carrito del usuario actual.
        """
        return Cart.objects.filter(user=self.request.user)
    
    def get_object(self):
        """
        Obtener o crear carrito del usuario.
        """
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        return cart
```

## Filtros y Búsqueda

### Configuración de Filtros

```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}
```

### Filtro Personalizado

```python
class ProductFilter(django_filters.FilterSet):
    """
    Filtros avanzados para productos.
    """
    
    min_price = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    category = django_filters.CharFilter(field_name='category__slug')
    
    class Meta:
        model = Product
        fields = ['product_type', 'is_featured', 'is_new']
```

## Paginación

### Respuesta Paginada

```json
{
  "count": 150,           // Total de items
  "next": "https://api.example.com/products/?page=2",
  "previous": null,
  "results": [...]        // Items de esta página
}
```

### Paginación Personalizada

```python
class LargeResultsSetPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 100
```

## Manejo de Errores

### Excepciones Personalizadas

```python
from rest_framework.exceptions import APIException

class InsufficientStockError(APIException):
    status_code = 400
    default_detail = 'No hay suficiente stock disponible'
    default_code = 'insufficient_stock'


class UnitAlreadySponsoredError(APIException):
    status_code = 400
    default_detail = 'Esta unidad ya tiene un padrino'
    default_code = 'already_sponsored'
```

### Handler Global de Errores

```python
# config/exception_handler.py
from rest_framework.views import exception_handler

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    
    if response is not None:
        response.data = {
            'error': exc.default_code if hasattr(exc, 'default_code') else 'error',
            'message': str(exc.detail) if hasattr(exc, 'detail') else str(exc),
            'status_code': response.status_code
        }
    
    return response
```
