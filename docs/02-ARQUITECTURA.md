# 🏗️ Arquitectura del Sistema

## Visión General

Nature Marketplace sigue una arquitectura de **microservicios ligeros** con separación clara entre frontend y backend, comunicándose a través de una API REST.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              INTERNET                                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            CLOUDFLARE                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │    CDN      │  │    WAF      │  │   DDoS      │  │    SSL      │   │
│  │   Cache     │  │  Firewall   │  │ Protection  │  │ Termination │   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              NGINX                                      │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Reverse Proxy · Rate Limiting · Load Balancing · Compression   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                    │                               │
                    ▼                               ▼
┌───────────────────────────────┐   ┌───────────────────────────────────┐
│          FRONTEND             │   │            BACKEND                │
│  ┌─────────────────────────┐  │   │  ┌─────────────────────────────┐  │
│  │       Next.js 14        │  │   │  │        Django 5.0           │  │
│  │  ───────────────────    │  │   │  │  ─────────────────────────  │  │
│  │  • Server Components    │  │   │  │  • Django REST Framework    │  │
│  │  • App Router           │  │   │  │  • JWT Authentication       │  │
│  │  • React 18             │  │   │  │  • ORM (PostgreSQL)         │  │
│  │  • TypeScript           │  │   │  │  • Admin CMS                │  │
│  │  • Tailwind CSS         │  │   │  │  • Celery (async tasks)     │  │
│  └─────────────────────────┘  │   │  └─────────────────────────────┘  │
│           Puerto 3000         │   │           Puerto 8000             │
└───────────────────────────────┘   └───────────────────────────────────┘
                                                    │
                    ┌───────────────────────────────┼───────────────────┐
                    │                               │                   │
                    ▼                               ▼                   ▼
        ┌───────────────────┐           ┌───────────────┐    ┌─────────────────┐
        │    PostgreSQL     │           │     MinIO     │    │     Redis       │
        │  ───────────────  │           │  ───────────  │    │  ─────────────  │
        │  Base de datos    │           │  Object       │    │  Cache          │
        │  relacional       │           │  Storage      │    │  Sessions       │
        │  Puerto 5432      │           │  Puerto 9000  │    │  Puerto 6379    │
        └───────────────────┘           └───────────────┘    └─────────────────┘
```

## Stack Tecnológico Detallado

### Frontend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Next.js** | 14.x | Framework React con SSR/SSG |
| **React** | 18.x | Biblioteca de UI |
| **TypeScript** | 5.x | Tipado estático |
| **Tailwind CSS** | 3.x | Estilos utilitarios |
| **Lucide React** | - | Iconografía |

**¿Por qué Next.js?**

Next.js fue elegido por:

1. **Server-Side Rendering (SSR)**: Las páginas de productos se renderizan en el servidor, mejorando SEO y tiempo de carga inicial.

2. **App Router**: El nuevo sistema de rutas basado en carpetas es intuitivo y permite layouts anidados.

3. **Server Components**: Reduce el JavaScript enviado al cliente, mejorando performance.

4. **Optimización de imágenes**: El componente `<Image>` optimiza automáticamente las fotos de los árboles.

### Backend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Django** | 5.x | Framework web Python |
| **Django REST Framework** | 3.x | API REST |
| **PostgreSQL** | 15.x | Base de datos |
| **Gunicorn** | - | Servidor WSGI |
| **Celery** | - | Tareas asíncronas |

**¿Por qué Django?**

Django fue elegido por:

1. **Admin integrado**: Panel de administración listo para usar, ideal para gestionar productos y usuarios.

2. **ORM robusto**: Mapeo objeto-relacional que simplifica consultas complejas.

3. **Seguridad**: Protección contra CSRF, XSS, SQL injection incluida.

4. **Ecosistema maduro**: Miles de paquetes disponibles (django-allauth, dj-rest-auth, etc.).

### Infraestructura

| Tecnología | Propósito |
|------------|-----------|
| **Docker** | Contenedorización |
| **Docker Compose** | Orquestación local |
| **Nginx** | Reverse proxy |
| **Cloudflare** | CDN y seguridad |
| **MinIO** | Almacenamiento de archivos |

## Patrones de Arquitectura

### 1. Separación Frontend/Backend

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        SEPARACIÓN DE RESPONSABILIDADES                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  FRONTEND (Next.js)              │  BACKEND (Django)                   │
│  ─────────────────────────────── │  ───────────────────────────────    │
│  • Renderizado de UI             │  • Lógica de negocio                │
│  • Manejo de estado local        │  • Persistencia de datos            │
│  • Validación de formularios     │  • Autenticación/Autorización       │
│  • Navegación                    │  • Procesamiento de pagos           │
│  • Animaciones                   │  • Envío de emails                  │
│  • Caché del cliente             │  • Generación de reportes           │
│                                                                         │
│  Comunicación: API REST + JSON                                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Ventajas de esta separación:**

- **Escalabilidad independiente**: Frontend y backend pueden escalar por separado
- **Equipos especializados**: Desarrolladores frontend y backend trabajan en paralelo
- **Flexibilidad**: El backend puede servir a múltiples clientes (web, móvil, terceros)
- **Testing aislado**: Cada parte se prueba independientemente

### 2. Patrón Repository (Backend)

Django usa el patrón Repository a través de su ORM:

```python
# En lugar de SQL directo:
# SELECT * FROM products WHERE is_active = true AND category_id = 1

# Usamos el ORM:
products = Product.objects.filter(is_active=True, category_id=1)
```

**Beneficios:**
- Abstracción de la base de datos
- Queries type-safe
- Fácil migración entre bases de datos

### 3. Patrón Serializer (API)

Los serializers transforman datos entre Python y JSON:

```python
# Modelo Python → JSON (para enviar al frontend)
class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'title', 'price', 'description']

# Uso:
product = Product.objects.get(id=1)
data = ProductSerializer(product).data
# Resultado: {"id": 1, "title": "Roble Andino", "price": "75.00", ...}
```

### 4. Patrón Middleware (Seguridad)

Capas de procesamiento que interceptan cada request:

```
Request del usuario
        │
        ▼
┌───────────────────┐
│  CORS Middleware  │  ← Valida origen de la petición
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  Auth Middleware  │  ← Verifica token JWT
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  Rate Limiting    │  ← Limita peticiones por IP
└───────────────────┘
        │
        ▼
┌───────────────────┐
│     Tu Vista      │  ← Lógica de negocio
└───────────────────┘
```

## Flujo de Datos

### Ejemplo: Usuario apadrina un árbol

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    FLUJO DE APADRINAMIENTO                              │
└─────────────────────────────────────────────────────────────────────────┘

1. FRONTEND: Usuario hace clic en "Apadrinar"
   │
   ▼
2. FRONTEND: Envía POST /api/orders/checkout/
   {
     "items": [{"product_id": 123, "quantity": 1}],
     "payment_method": "card"
   }
   │
   ▼
3. BACKEND: OrderView recibe la petición
   │
   ├─► Valida token JWT
   ├─► Verifica stock del producto
   ├─► Calcula total
   │
   ▼
4. BACKEND: Crea PaymentIntent en Stripe
   │
   ▼
5. BACKEND: Retorna client_secret al frontend
   {
     "order_id": "NM-20241218-1234",
     "client_secret": "pi_xxx_secret_yyy"
   }
   │
   ▼
6. FRONTEND: Muestra formulario de pago Stripe
   │
   ▼
7. STRIPE: Procesa el pago
   │
   ▼
8. STRIPE: Envía webhook a /api/payments/webhook/
   │
   ▼
9. BACKEND: Actualiza estado de orden a "Paid"
   │
   ├─► Crea SponsorshipUnit asignado al usuario
   ├─► Envía email de confirmación
   ├─► Otorga puntos de gamificación
   │
   ▼
10. FRONTEND: Redirige a página de confirmación
    │
    ▼
11. USUARIO: Ve su nuevo árbol en "Mi Bosque"
```

## Estructura de Carpetas

### Backend

```
backend/
├── config/                 # Configuración del proyecto Django
│   ├── settings.py        # Settings principales
│   ├── urls.py            # URLs raíz
│   └── wsgi.py            # Punto de entrada WSGI
│
├── users/                  # App de usuarios
│   ├── models.py          # UserProfile, Badge, UserBadge
│   ├── serializers.py     # Serializers de usuario
│   ├── views.py           # Vistas de autenticación
│   └── admin.py           # Admin de usuarios
│
├── products/               # App de productos
│   ├── models.py          # Product, Category, SponsorshipUnit
│   ├── serializers.py     # Serializers de productos
│   ├── views.py           # Vistas de catálogo
│   └── admin.py           # CMS de productos
│
├── orders/                 # App de órdenes
│   ├── models.py          # Cart, Order, OrderItem
│   ├── serializers.py     # Serializers de órdenes
│   └── views.py           # Checkout, historial
│
├── payments/               # App de pagos
│   ├── models.py          # Payment
│   ├── views.py           # Integración Stripe
│   └── webhooks.py        # Webhooks de Stripe
│
└── requirements.txt        # Dependencias Python
```

### Frontend

```
frontend/
├── app/                    # App Router de Next.js
│   ├── (auth)/            # Grupo de rutas de autenticación
│   │   ├── login/         # /login
│   │   └── register/      # /register
│   │
│   ├── (dashboard)/       # Grupo de rutas protegidas
│   │   ├── profile/       # /profile
│   │   ├── favorites/     # /favorites
│   │   └── tracker/       # /tracker
│   │
│   ├── (public)/          # Grupo de rutas públicas
│   │   ├── products/      # /products
│   │   └── about/         # /about
│   │
│   ├── layout.tsx         # Layout raíz
│   ├── page.tsx           # Página principal (/)
│   └── globals.css        # Estilos globales
│
├── components/             # Componentes reutilizables
│   ├── ui/                # Componentes base (Button, Input, Card)
│   ├── maps/              # Componentes de mapas
│   └── seo/               # Componentes de SEO
│
├── lib/                    # Utilidades y configuración
│   ├── api/               # Cliente API
│   └── utils/             # Funciones helper
│
└── middleware.ts           # Middleware de autenticación
```

## Decisiones Técnicas

### ¿Por qué PostgreSQL y no MongoDB?

| Criterio | PostgreSQL ✅ | MongoDB |
|----------|--------------|---------|
| Relaciones complejas | Excelente (FK, JOINs) | Limitado |
| Transacciones ACID | Completo | Parcial |
| Integridad de datos | Fuerte | Débil |
| Django ORM | Soporte nativo | Requiere ODM extra |

Los datos de Nature Marketplace son altamente relacionales:
- Usuario → tiene → Órdenes → contienen → Productos
- SponsorshipUnit → pertenece a → Usuario
- SponsorshipUnit → tiene → Actualizaciones

### ¿Por qué MinIO y no S3 directamente?

MinIO es compatible con la API de S3 pero:
- **Desarrollo local**: Funciona sin conexión a internet
- **Costos**: Gratis para desarrollo y staging
- **Migración fácil**: Cambiar a S3 solo requiere cambiar credenciales

### ¿Por qué JWT y no sesiones tradicionales?

| Criterio | JWT ✅ | Sesiones |
|----------|-------|----------|
| Stateless | Sí | No (requiere storage) |
| Escalabilidad | Alta | Requiere sticky sessions |
| Móvil/API | Ideal | Complicado |
| Microservicios | Fácil compartir | Difícil |

## Escalabilidad

### Horizontal (más servidores)

```
                    ┌─────────────┐
                    │   Nginx     │
                    │   (LB)      │
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │  Backend 1  │ │  Backend 2  │ │  Backend 3  │
    └─────────────┘ └─────────────┘ └─────────────┘
           │               │               │
           └───────────────┼───────────────┘
                           │
                    ┌──────┴──────┐
                    │  PostgreSQL │
                    │  (Primary)  │
                    └─────────────┘
```

### Vertical (más recursos)

Para cargas moderadas, aumentar CPU/RAM del servidor es más simple:

| Carga | Configuración |
|-------|---------------|
| < 1,000 usuarios/día | 2 CPU, 4GB RAM |
| 1,000-10,000 usuarios/día | 4 CPU, 8GB RAM |
| > 10,000 usuarios/día | Escalar horizontalmente |

## Monitoreo

### Métricas a observar

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         MÉTRICAS CLAVE                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  PERFORMANCE                                                            │
│  ─────────────────────────────────────────────────────────────────────  │
│  • Response time p95 < 500ms                                           │
│  • Error rate < 1%                                                      │
│  • Uptime > 99.9%                                                       │
│                                                                         │
│  RECURSOS                                                               │
│  ─────────────────────────────────────────────────────────────────────  │
│  • CPU usage < 70%                                                      │
│  • Memory usage < 80%                                                   │
│  • Disk usage < 85%                                                     │
│                                                                         │
│  NEGOCIO                                                                │
│  ─────────────────────────────────────────────────────────────────────  │
│  • Requests por minuto                                                  │
│  • Usuarios activos                                                     │
│  • Conversiones                                                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```
