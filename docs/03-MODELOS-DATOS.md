# 📊 Modelos de Datos

## Diagrama Entidad-Relación

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           DIAGRAMA DE BASE DE DATOS                                 │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    User      │       │  UserProfile │       │    Badge     │
│──────────────│       │──────────────│       │──────────────│
│ id           │◄──────│ user_id (FK) │       │ id           │
│ email        │       │ display_name │       │ name         │
│ password     │       │ theme        │       │ icon         │
│ first_name   │       │ level        │       │ points_value │
│ last_name    │       │ current_pts  │       └──────┬───────┘
└──────┬───────┘       └──────────────┘              │
       │                      │                       │
       │                      │         ┌─────────────┘
       │                      ▼         ▼
       │               ┌──────────────────┐
       │               │    UserBadge     │
       │               │──────────────────│
       │               │ user_profile (FK)│
       │               │ badge (FK)       │
       │               │ awarded_at       │
       │               └──────────────────┘
       │
       │         ┌──────────────┐       ┌──────────────┐
       │         │   Category   │       │   Product    │
       │         │──────────────│       │──────────────│
       │         │ id           │◄──────│ category (FK)│
       │         │ name         │       │ id           │
       │         │ slug         │       │ title        │
       │         │ icon         │       │ slug         │
       │         └──────────────┘       │ price        │
       │                                │ product_type │
       │                                └──────┬───────┘
       │                                       │
       │    ┌──────────────────────────────────┼──────────────────────────┐
       │    │                                  │                          │
       │    ▼                                  ▼                          ▼
       │ ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
       │ │  ProductImage    │    │  ProductUpdate   │    │ SponsorshipUnit  │
       │ │──────────────────│    │──────────────────│    │──────────────────│
       │ │ product (FK)     │    │ product (FK)     │    │ product (FK)     │
       │ │ image            │    │ title            │    │ code (unique)    │
       │ │ is_primary       │    │ content          │    │ name             │
       │ │ display_order    │    │ update_type      │    │ sponsor (FK)─────┼──► User
       │ └──────────────────┘    └──────────────────┘    │ location_lat     │
       │                                                  │ location_lng     │
       │                                                  └──────┬───────────┘
       │                                                         │
       │                              ┌──────────────────────────┼──────────────┐
       │                              │                          │              │
       │                              ▼                          ▼              │
       │                   ┌──────────────────┐    ┌──────────────────┐        │
       │                   │    UnitImage     │    │    UnitUpdate    │        │
       │                   │──────────────────│    │──────────────────│        │
       │                   │ unit (FK)        │    │ unit (FK)        │        │
       │                   │ image            │    │ title            │        │
       │                   │ caption          │    │ content          │        │
       │                   └──────────────────┘    │ created_by (FK)──┼────► User
       │                                           └──────────────────┘
       │
       │    ┌──────────────┐       ┌──────────────┐       ┌──────────────┐
       │    │     Cart     │       │   CartItem   │       │    Order     │
       │    │──────────────│       │──────────────│       │──────────────│
       └───►│ user (FK)    │◄──────│ cart (FK)    │       │ user (FK)◄───┼──┐
            │ session_key  │       │ product (FK)─┼──►    │ order_number │  │
            └──────────────┘       │ quantity     │       │ status       │  │
                                   └──────────────┘       │ total_amount │  │
                                                          └──────┬───────┘  │
                                                                 │          │
                                          ┌──────────────────────┴──────┐   │
                                          │                             │   │
                                          ▼                             ▼   │
                               ┌──────────────────┐          ┌──────────────┴───┐
                               │    OrderItem     │          │     Payment      │
                               │──────────────────│          │──────────────────│
                               │ order (FK)       │          │ order (FK)       │
                               │ product (FK)     │          │ user (FK)        │
                               │ quantity         │          │ stripe_intent_id │
                               │ unit_price       │          │ status           │
                               └──────────────────┘          │ amount           │
                                                             └──────────────────┘
```

## Modelos Detallados

### 1. User (Django Auth)

El modelo de usuario base de Django, extendido con `UserProfile`.

```python
# Django proporciona estos campos automáticamente:
User:
  - id: int (PK)
  - username: str
  - email: str
  - password: str (hasheado)
  - first_name: str
  - last_name: str
  - is_active: bool
  - is_staff: bool
  - date_joined: datetime
```

**¿Por qué usar el User de Django?**

Django incluye:
- Hashing seguro de contraseñas (PBKDF2)
- Sistema de permisos integrado
- Compatibilidad con django-allauth para social login

---

### 2. UserProfile

Extiende el usuario con información adicional.

```python
class UserProfile(models.Model):
    # Relación uno-a-uno con User
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    
    # Información de perfil
    display_name = models.CharField(max_length=100)  # Nombre público
    photo_url = models.URLField()                     # Avatar
    
    # Preferencias
    theme = models.CharField(choices=['dark', 'light', 'system'])
    currency = models.CharField(choices=['USD', 'EUR'])
    
    # Notificaciones
    notify_email = models.BooleanField(default=True)
    notify_push = models.BooleanField(default=True)
    notify_tree_updates = models.BooleanField(default=True)
    
    # Gamificación
    level = models.CharField(choices=['Seed', 'Sprout', 'Sapling', ...])
    current_points = models.PositiveIntegerField(default=0)
    total_points_earned = models.PositiveIntegerField(default=0)
```

**Relación con User:**

```
┌─────────────┐         ┌─────────────────┐
│    User     │ 1 ─── 1 │   UserProfile   │
│─────────────│         │─────────────────│
│ id: 1       │◄────────│ user_id: 1      │
│ email: ...  │         │ level: "Sprout" │
└─────────────┘         └─────────────────┘
```

**Sistema de Niveles:**

| Nivel | Puntos Requeridos | Descripción |
|-------|-------------------|-------------|
| Seed | 0 | Usuario nuevo |
| Sprout | 100 | Primer apadrinamiento |
| Sapling | 500 | Padrino activo |
| Earth Guardian | 1,500 | Padrino veterano |
| Forest Master | 5,000 | Embajador |

---

### 3. Category

Categorías para organizar productos.

```python
class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)  # URL amigable: "arboles"
    description = models.TextField()
    icon = models.CharField(max_length=50)  # Nombre de ícono Material
    image_url = models.URLField()
    is_active = models.BooleanField(default=True)
    display_order = models.PositiveIntegerField(default=0)
```

**Ejemplo de datos:**

| id | name | slug | icon |
|----|------|------|------|
| 1 | Árboles | arboles | park |
| 2 | Bosques | bosques | forest |
| 3 | Lagunas | lagunas | water |
| 4 | Experiencias | experiencias | hiking |

---

### 4. Product

Representa un tipo de producto o apadrinamiento.

```python
class Product(models.Model):
    # Tipos de producto
    class ProductType(models.TextChoices):
        TREE = 'tree', 'Árbol'
        FOREST = 'forest', 'Bosque'
        LAGOON = 'lagoon', 'Laguna/Humedal'
        EXPERIENCE = 'experience', 'Experiencia'
    
    # Tipos de precio
    class PricingType(models.TextChoices):
        ANNUAL = 'annual', 'Suscripción Anual'
        ONE_TIME = 'one_time', 'Pago Único'
    
    # Información básica
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    short_description = models.CharField(max_length=300)
    
    # Categorización
    category = models.ForeignKey(Category, on_delete=models.PROTECT)
    product_type = models.CharField(choices=ProductType.choices)
    
    # Propósito e impacto
    purpose = models.TextField()  # Por qué es importante
    impact_description = models.TextField()  # Qué impacto genera
    
    # Precios
    price = models.DecimalField(max_digits=10, decimal_places=2)
    pricing_type = models.CharField(choices=PricingType.choices)
    currency = models.CharField(default='USD')
    compare_at_price = models.DecimalField(null=True)  # Precio tachado
    
    # Inventario
    stock = models.PositiveIntegerField(default=0)
    is_unlimited_stock = models.BooleanField(default=True)
    
    # Campos específicos de experiencias
    duration = models.CharField(max_length=50)  # "4 horas"
    max_participants = models.PositiveIntegerField(null=True)
    includes = models.JSONField(default=list)  # ["Transporte", "Almuerzo"]
    
    # Campos específicos de áreas
    area_size = models.CharField(max_length=50)  # "1 hectárea"
    is_collective = models.BooleanField(default=False)
    
    # Ubicación general
    location_name = models.CharField(max_length=200)
    location_lat = models.DecimalField(max_digits=9, decimal_places=6)
    location_lng = models.DecimalField(max_digits=9, decimal_places=6)
    
    # Métricas de árboles
    co2_offset_kg = models.DecimalField(null=True)
    species = models.CharField(max_length=100)
    
    # Estado
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    is_new = models.BooleanField(default=True)
```

**Diferencia entre Product y SponsorshipUnit:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PRODUCT vs SPONSORSHIP UNIT                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  PRODUCT (Plantilla)                                                    │
│  ─────────────────────────────────────────────────────────────────────  │
│  "Roble Andino"                                                         │
│  - Descripción general de la especie                                    │
│  - Precio base: $75/año                                                 │
│  - Ubicación general: Sierra Nevada                                     │
│  - CO2 promedio: 22 kg/año                                             │
│                                                                         │
│         │                                                               │
│         │ tiene muchas                                                  │
│         ▼                                                               │
│                                                                         │
│  SPONSORSHIP UNIT (Instancia única)                                     │
│  ─────────────────────────────────────────────────────────────────────  │
│  "TREE-2024-001: Roble del Amanecer"                                   │
│  - Código único: TREE-2024-001                                         │
│  - Nombre propio: "Roble del Amanecer"                                 │
│  - Ubicación exacta: 10.823456, -73.456789                             │
│  - Padrino: Juan Pérez                                                  │
│  - Altura actual: 2.3m                                                  │
│  - CO2 absorbido: 45 kg (acumulado)                                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 5. SponsorshipUnit

Unidad única de apadrinamiento (un árbol específico, una hectárea específica).

```python
class SponsorshipUnit(models.Model):
    # Estados posibles
    class Status(models.TextChoices):
        AVAILABLE = 'available', 'Disponible'
        RESERVED = 'reserved', 'Reservado'
        SPONSORED = 'sponsored', 'Apadrinado'
        INACTIVE = 'inactive', 'Inactivo'
    
    # Identificación única
    code = models.CharField(max_length=50, unique=True)  # TREE-2024-001
    name = models.CharField(max_length=200)  # "Roble del Amanecer"
    slug = models.SlugField(unique=True)
    
    # Relación con producto base
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    
    # Estado
    status = models.CharField(choices=Status.choices, default='available')
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    
    # Descripción específica
    description = models.TextField()  # Historia de este árbol específico
    story = models.TextField()  # Narrativa emocional
    
    # UBICACIÓN EXACTA (solo visible para padrinos)
    location_name = models.CharField(max_length=200)  # Dirección exacta
    location_lat = models.DecimalField(max_digits=9, decimal_places=6)
    location_lng = models.DecimalField(max_digits=9, decimal_places=6)
    
    # UBICACIÓN APROXIMADA (visible para todos)
    location_area = models.CharField(max_length=200)  # "Sierra Nevada"
    location_lat_approx = models.DecimalField(max_digits=9, decimal_places=3)
    location_lng_approx = models.DecimalField(max_digits=9, decimal_places=3)
    location_radius_km = models.DecimalField(default=5.0)
    
    # Características físicas
    species = models.CharField(max_length=100)
    age_years = models.PositiveIntegerField(null=True)
    height_cm = models.PositiveIntegerField(null=True)
    area_m2 = models.DecimalField(null=True)  # Para bosques/lagunas
    
    # Métricas de impacto
    co2_absorbed_total = models.DecimalField(default=0)  # Acumulado
    co2_per_year = models.DecimalField(null=True)  # Estimado anual
    
    # Padrino
    sponsor = models.ForeignKey(User, null=True, on_delete=models.SET_NULL)
    sponsored_at = models.DateTimeField(null=True)
    sponsorship_expires_at = models.DateTimeField(null=True)
```

**Lógica de ubicación (estilo Airbnb):**

```python
def get_location_for_user(self, user) -> dict:
    """
    Retorna ubicación según el tipo de usuario.
    """
    is_sponsor = user and user.is_authenticated and self.sponsor_id == user.id
    
    if is_sponsor:
        # Padrino ve ubicación exacta
        return {
            'type': 'exact',
            'name': self.location_name,
            'lat': float(self.location_lat),
            'lng': float(self.location_lng),
            'can_visit': True,
        }
    else:
        # Visitante ve área aproximada
        return {
            'type': 'approximate',
            'name': self.location_area,
            'lat': float(self.location_lat_approx),
            'lng': float(self.location_lng_approx),
            'radius_km': float(self.location_radius_km),
            'message': 'La ubicación exacta se revela al apadrinar',
            'can_visit': False,
        }
```

---

### 6. UnitUpdate

Actualizaciones de una unidad específica (timeline del árbol).

```python
class UnitUpdate(models.Model):
    class UpdateType(models.TextChoices):
        PHOTO = 'photo', 'Nueva Foto'
        GROWTH = 'growth', 'Crecimiento'
        MILESTONE = 'milestone', 'Hito Alcanzado'
        MAINTENANCE = 'maintenance', 'Mantenimiento'
        IMPACT = 'impact', 'Reporte de Impacto'
    
    unit = models.ForeignKey(SponsorshipUnit, on_delete=models.CASCADE)
    update_type = models.CharField(choices=UpdateType.choices)
    title = models.CharField(max_length=200)
    content = models.TextField()
    
    # Imagen opcional
    image = models.ImageField(upload_to='unit_updates/')
    
    # Métricas opcionales
    height_cm = models.PositiveIntegerField(null=True)
    co2_absorbed = models.DecimalField(null=True)
    health_status = models.CharField(max_length=50)  # "Saludable", "Requiere atención"
    
    # Visibilidad
    is_public = models.BooleanField(default=True)
    notify_sponsor = models.BooleanField(default=True)
    
    # Quién creó la actualización
    created_by = models.ForeignKey(User, null=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)
```

**Ejemplo de timeline:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│  TIMELINE: Roble del Amanecer (TREE-2024-001)                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  📅 15 Dic 2024 - MILESTONE                                            │
│  "¡Primer año completado!"                                              │
│  Tu árbol ha absorbido 22kg de CO2 en su primer año.                   │
│  [📷 Foto del árbol con 2.3m de altura]                                │
│                                                                         │
│  📅 01 Oct 2024 - GROWTH                                               │
│  "Crecimiento trimestral"                                               │
│  Altura: 2.1m → 2.3m (+20cm)                                           │
│  Estado: Saludable                                                      │
│                                                                         │
│  📅 15 Jul 2024 - PHOTO                                                │
│  "Temporada de lluvias"                                                 │
│  El roble está aprovechando las lluvias para crecer fuerte.            │
│  [📷 Foto con gotas de lluvia en las hojas]                            │
│                                                                         │
│  📅 01 Ene 2024 - MILESTONE                                            │
│  "¡Bienvenido a la familia!"                                            │
│  Tu árbol ha sido plantado y registrado.                                │
│  Coordenadas: 10.823456, -73.456789                                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 7. Cart y CartItem

Carrito de compras.

```python
class Cart(models.Model):
    user = models.OneToOneField(User, null=True, on_delete=models.CASCADE)
    session_key = models.CharField(max_length=40, null=True)  # Para anónimos
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    @property
    def total_items(self) -> int:
        return sum(item.quantity for item in self.items.all())
    
    @property
    def subtotal(self) -> Decimal:
        return sum(item.line_total for item in self.items.all())


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    selected_options = models.JSONField(default=dict)  # {"nickname": "Mi Roble"}
    
    @property
    def line_total(self) -> Decimal:
        return self.product.price * self.quantity
```

**Flujo del carrito:**

```
Usuario anónimo                    Usuario autenticado
       │                                  │
       ▼                                  ▼
┌──────────────────┐              ┌──────────────────┐
│ Cart             │              │ Cart             │
│ session_key: abc │              │ user_id: 123     │
│ user: null       │  ──login──►  │ session_key: null│
└──────────────────┘              └──────────────────┘
       │                                  │
       │ Al hacer login, los items       │
       │ del carrito anónimo se          │
       │ transfieren al carrito          │
       │ del usuario                     │
       └──────────────────────────────────┘
```

---

### 8. Order y OrderItem

Órdenes completadas.

```python
class Order(models.Model):
    class OrderStatus(models.TextChoices):
        PENDING = 'Pending', 'Pendiente'
        PAID = 'Paid', 'Pagado'
        PROCESSING = 'Processing', 'Procesando'
        FULFILLED = 'Fulfilled', 'Completado'
        CANCELLED = 'Cancelled', 'Cancelado'
        REFUNDED = 'Refunded', 'Reembolsado'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    order_number = models.CharField(max_length=20, unique=True)  # NM-20241218-1234
    user = models.ForeignKey(User, on_delete=models.PROTECT)
    
    status = models.CharField(choices=OrderStatus.choices, default='Pending')
    
    # Montos
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    discount_amount = models.DecimalField(default=0)
    tax_amount = models.DecimalField(default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(default='USD')
    
    # Snapshot del cliente
    customer_email = models.EmailField()
    customer_name = models.CharField(max_length=200)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True)
    fulfilled_at = models.DateTimeField(null=True)


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    
    # Snapshot del producto (en caso de que cambie después)
    product_title = models.CharField(max_length=200)
    product_slug = models.SlugField()
    
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    line_total = models.DecimalField(max_digits=10, decimal_places=2)
    
    selected_options = models.JSONField(default=dict)
```

**¿Por qué guardar snapshot del producto?**

Si el precio del producto cambia después de la compra, el historial de órdenes debe mostrar el precio original:

```
Orden #NM-20241218-1234
─────────────────────────────────────────
Producto: Roble Andino
Precio actual: $85/año  ← Precio nuevo
Precio pagado: $75/año  ← Snapshot guardado
```

---

### 9. Payment

Registro de pagos con Stripe.

```python
class Payment(models.Model):
    class PaymentStatus(models.TextChoices):
        PENDING = 'pending', 'Pendiente'
        PROCESSING = 'processing', 'Procesando'
        SUCCEEDED = 'succeeded', 'Exitoso'
        FAILED = 'failed', 'Fallido'
        CANCELLED = 'cancelled', 'Cancelado'
        REFUNDED = 'refunded', 'Reembolsado'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    order = models.ForeignKey(Order, on_delete=models.PROTECT)
    user = models.ForeignKey(User, on_delete=models.PROTECT)
    
    # IDs de Stripe
    stripe_payment_intent_id = models.CharField(unique=True)  # pi_xxx
    stripe_checkout_session_id = models.CharField(unique=True)  # cs_xxx
    stripe_customer_id = models.CharField()  # cus_xxx
    
    status = models.CharField(choices=PaymentStatus.choices)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(default='USD')
    
    # Info de tarjeta (solo últimos 4 dígitos - PCI compliant)
    card_last_four = models.CharField(max_length=4)
    card_brand = models.CharField(max_length=20)  # visa, mastercard
    
    # Errores
    error_code = models.CharField(blank=True)
    error_message = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True)
```

**Flujo de pago:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FLUJO DE PAGO                                   │
└─────────────────────────────────────────────────────────────────────────┘

1. Usuario confirma checkout
   │
   ▼
2. Backend crea Payment (status: pending)
   │
   ▼
3. Backend crea PaymentIntent en Stripe
   │
   ▼
4. Frontend recibe client_secret
   │
   ▼
5. Usuario ingresa datos de tarjeta
   │
   ▼
6. Stripe procesa pago
   │
   ├─► ÉXITO: Webhook actualiza Payment (status: succeeded)
   │          Order pasa a "Paid"
   │          Se crea SponsorshipUnit asignado al usuario
   │
   └─► FALLO: Webhook actualiza Payment (status: failed)
              Se guarda error_code y error_message
              Usuario puede reintentar
```

## Índices de Base de Datos

Los índices mejoran la velocidad de las consultas frecuentes:

```python
# En Product
class Meta:
    indexes = [
        models.Index(fields=['slug']),  # Búsqueda por URL
        models.Index(fields=['category', 'is_active']),  # Filtro por categoría
        models.Index(fields=['product_type', 'is_active']),  # Filtro por tipo
        models.Index(fields=['is_featured', 'is_active']),  # Productos destacados
    ]

# En Order
class Meta:
    indexes = [
        models.Index(fields=['order_number']),  # Búsqueda por número
        models.Index(fields=['user', 'status']),  # Órdenes de usuario
        models.Index(fields=['status', 'created_at']),  # Dashboard admin
    ]
```

**¿Cuándo agregar un índice?**

- Campos usados frecuentemente en `WHERE`
- Campos usados en `ORDER BY`
- Foreign keys (Django los crea automáticamente)
- Campos únicos (Django los crea automáticamente)
