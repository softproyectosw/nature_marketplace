# 🌱 Nature Marketplace – MVP Implementation Plan

> **Nota importante**: El diseño frontend ya existe en `frontend-base/`. La migración a Next.js debe preservar exactamente el mismo diseño visual (Eco-Luxury, dark theme, glassmorphism).

---

## 🤖 Instrucciones para Implementación por IA

> ### Cómo usar este documento
> Este plan está diseñado para ser ejecutado secuencialmente por una IA (como Cascade, Cursor, o similar). Sigue estas reglas:
>
> **Reglas de ejecución:**
> 1. **Ejecuta las fases EN ORDEN** (0 → 1 → 2 → 3 → 4). No saltes fases.
> 2. **Dentro de cada fase, ejecuta las acciones EN ORDEN** (1.1.1 → 1.1.2 → 1.1.3...).
> 3. **Una acción a la vez**. Completa una antes de pasar a la siguiente.
> 4. **Marca como ✅ cada acción completada** antes de continuar.
> 5. **Si una acción falla**, detente y reporta el error. No continúes.
>
> **Antes de cada acción, verifica:**
> - ¿Existen las dependencias necesarias?
> - ¿Están creados los archivos/carpetas previos?
> - ¿El código anterior compila sin errores?
>
> **Convenciones de código:**
> - Todo el código en **inglés**
> - Comentarios explicativos en cada archivo nuevo
> - Seguir los patrones existentes en `frontend-base/`
> - TypeScript estricto (no `any` sin justificación)
> - Python con type hints

### Orden de Ejecución Global

```
FASE 0: Infraestructura Base
    └── 0.1 → 0.2 → 0.3 → 0.4
    
FASE 1: Data Access Layer (Modelos)
    └── 1.1.1 → 1.1.2 → ... → 1.6.5
    
FASE 2: Business Logic Layer (Services)
    └── 2.1.1 → 2.1.2 → ... → 2.5.2
    
FASE 3: Presentation Layer (Frontend)
    └── 3.1.1 → 3.1.2 → ... → 3.9.3
    
FASE 4: Integración
    └── 4.1 → 4.2 → ... → 4.6

SEGURIDAD (paralelo a todas las fases):
    └── S.1 → S.2 → ... → S.10
```

---

## 🏗️ Arquitectura de 3 Capas

> ### 📚 ¿Por qué 3 capas?
> La arquitectura de 3 capas es un patrón estándar en la industria que **separa responsabilidades**. Esto significa que cada capa tiene UN solo trabajo. Los beneficios son:
> 
> - **Mantenibilidad**: Si cambias la base de datos, solo tocas la capa de datos
> - **Testabilidad**: Puedes probar cada capa de forma independiente
> - **Escalabilidad**: Puedes escalar cada capa según la demanda
> - **Trabajo en equipo**: Frontend y backend pueden trabajar en paralelo
>
> **Regla de oro**: Una capa solo puede comunicarse con la capa inmediatamente inferior. El frontend NUNCA habla directamente con la base de datos.

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│                      (Next.js Frontend)                      │
│  UI Components │ Pages │ Routing │ State Management │ i18n  │
│                                                              │
│  📌 Migrar diseño existente de frontend-base/ sin cambios   │
│                                                              │
│  💡 Esta capa SOLO se encarga de mostrar datos y capturar   │
│     interacciones del usuario. NO tiene lógica de negocio.  │
└─────────────────────────────────────────────────────────────┘
                              ↓ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                      │
│                      (Django Backend)                        │
│   Services │ Use Cases │ Validation │ Domain Rules │ DTOs   │
│                                                              │
│  💡 Aquí viven las REGLAS DEL NEGOCIO. Ejemplo: "Un usuario │
│     no puede adoptar más de 10 árboles" se valida aquí.     │
└─────────────────────────────────────────────────────────────┘
                              ↓ ORM/SDK
┌─────────────────────────────────────────────────────────────┐
│                    DATA ACCESS LAYER                         │
│              (Supabase + Stripe + Storage)                   │
│    Models │ Repositories │ Migrations │ External APIs        │
│                                                              │
│  💡 Esta capa SOLO sabe cómo guardar y leer datos. No sabe  │
│     qué significan los datos ni qué reglas tienen.          │
└─────────────────────────────────────────────────────────────┘
```

---

## 📂 Estructura Final del Proyecto

> ### 📚 ¿Por qué esta estructura?
> La estructura de carpetas refleja la arquitectura. Cada carpeta tiene un propósito claro:
>
> - **Separación frontend/backend**: Pueden desplegarse de forma independiente
> - **Route Groups en Next.js** `(public)`, `(auth)`, `(dashboard)`: Permiten aplicar diferentes layouts y reglas de acceso sin afectar la URL
> - **Apps de Django por dominio**: Cada app representa un concepto de negocio (usuarios, productos, órdenes), NO una función técnica
> - **Docker**: Garantiza que el proyecto funcione igual en cualquier máquina
>
> **Ten en cuenta**: Los paréntesis en `(public)` son una convención de Next.js App Router. NO aparecen en la URL final.

```
root/
├── frontend/                 # Presentation Layer (Next.js)
│   ├── app/
│   │   ├── (public)/         # SEO pages (SSR) - URLs: /, /products, etc.
│   │   ├── (auth)/           # Login/Register - URLs: /login, /register
│   │   └── (dashboard)/      # Protected area - URLs: /dashboard, /cart, etc.
│   ├── components/
│   │   └── ui/               # Componentes "tontos" (solo presentación)
│   ├── lib/
│   │   ├── api/              # Cliente HTTP para hablar con Django
│   │   └── store/            # Estado global (Context API)
│   └── i18n/                 # Traducciones EN/ES
│
├── backend/                  # Business + Data Layer (Django)
│   ├── config/               # Configuración central de Django
│   ├── users/                # Todo sobre usuarios y perfiles
│   ├── products/             # Todo sobre productos (trees, retreats)
│   ├── orders/               # Todo sobre carrito y compras
│   ├── payments/             # Todo sobre pagos (Stripe)
│   └── ecosystems/           # Todo sobre tracking de árboles adoptados
│
├── docker/                   # Dockerfiles para cada servicio
├── docker-compose.yml        # Orquestación de todos los servicios
├── .env.example              # Plantilla de variables de entorno
└── README.md                 # Documentación principal
```

---

## 🎨 Diseño Frontend (YA EXISTENTE)

El diseño en `frontend-base/` debe migrarse **sin cambios visuales**:

| Pantalla Actual | Destino Next.js | Tipo |
|-----------------|-----------------|------|
| `LandingPage.tsx` | `app/(public)/page.tsx` | SSR/SEO |
| `HomeScreen.tsx` | `app/(dashboard)/page.tsx` | Protected |
| `LoginScreen.tsx` | `app/(auth)/login/page.tsx` | No-index |
| `ProductDetailsScreen.tsx` | `app/(public)/products/[category]/[slug]/page.tsx` | SSR/SEO |
| `CartScreen.tsx` | `app/(dashboard)/cart/page.tsx` | Protected |
| `ProfileScreen.tsx` | `app/(dashboard)/profile/page.tsx` | Protected |
| `FavoritesScreen.tsx` | `app/(dashboard)/favorites/page.tsx` | Protected |
| `TreeTrackerScreen.tsx` | `app/(dashboard)/tracker/[id]/page.tsx` | Protected |
| `WelcomeScreen.tsx` | `app/(public)/welcome/page.tsx` | SSR/SEO |
| `BottomNav.tsx` | `components/ui/BottomNav.tsx` | Client Component |
| `StoreContext.tsx` | `lib/store/` | Split en múltiples contexts |

**Preservar**:
- Paleta de colores (primary: #30e87a, background-dark: #112117, etc.)
- Tipografía (Plus Jakarta Sans)
- Glassmorphism y efectos blur
- Animaciones existentes
- Iconos Material Symbols

---

## ✅ Fases de Implementación

> ### 📚 ¿Por qué fases?
> Construimos el proyecto **de abajo hacia arriba** (bottom-up):
> 1. Primero la infraestructura (Docker, carpetas)
> 2. Luego los modelos de datos (cómo se guardan las cosas)
> 3. Después la lógica de negocio (qué reglas aplican)
> 4. Finalmente la interfaz (cómo se ve)
>
> **Beneficio**: Cada fase se puede probar antes de pasar a la siguiente. Si los modelos están mal, es mejor descubrirlo antes de construir toda la UI.

### FASE 0: Infraestructura Base

> 💡 **¿Por qué empezar con Docker?** Docker garantiza que todos los desarrolladores tengan el mismo entorno. Evita el clásico "en mi máquina funciona". También facilita el despliegue a producción.

> 🤖 **Instrucciones para IA - FASE 0:**
> ```
> PASO 0.1: Crear carpetas
>   - Crear: frontend/, backend/, docker/
>   - Verificar: Las 3 carpetas existen
>   
> PASO 0.2: Crear docker-compose.yml
>   - Servicios: frontend (port 3000), backend (port 8000)
>   - Dependencias: backend depende de que exista .env
>   - Verificar: docker compose config no da errores
>   
> PASO 0.3: Crear .env.example
>   - Incluir TODAS las variables listadas en sección "Variables de Entorno"
>   - NO incluir valores reales, solo placeholders
>   - Verificar: El archivo existe y tiene todas las variables
>   
> PASO 0.4: Crear README.md
>   - Incluir: Quick start, estructura, comandos básicos
>   - Verificar: El archivo es legible y tiene instrucciones claras
> ```

| # | Acción | Archivo(s) | Estado |
|---|--------|------------|--------|
| 0.1 | Crear estructura de carpetas raíz | `frontend/`, `backend/`, `docker/` | ⬜ |
| 0.2 | Crear `docker-compose.yml` | `docker-compose.yml` | ⬜ |
| 0.3 | Crear `.env.example` | `.env.example` | ⬜ |
| 0.4 | Crear `README.md` principal | `README.md` | ⬜ |

---

### FASE 1: Data Access Layer (Django - Modelos)

> ### 📚 ¿Qué son los Modelos?
> Los modelos definen **cómo se estructuran los datos** en la base de datos. Cada modelo es una tabla. Cada atributo es una columna.
>
> **Ten en cuenta**:
> - Un modelo NO debe tener lógica de negocio (eso va en Services)
> - Los modelos deben ser simples: campos, relaciones, y poco más
> - Las migraciones son archivos que Django genera para crear/modificar tablas

> 🤖 **Instrucciones para IA - FASE 1:**
> ```
> PREREQUISITOS:
>   - FASE 0 completada
>   - Carpeta backend/ existe
>   
> ORDEN DE EJECUCIÓN:
>   1.1.1 → 1.1.2 → 1.1.3 → 1.1.4 → 1.1.5 (Scaffold)
>   1.2.1 → 1.2.2 → 1.2.3 (Users)
>   1.3.1 → 1.3.2 → 1.3.3 → 1.3.4 (Products)
>   1.4.1 → ... → 1.4.6 (Orders)
>   1.5.1 → 1.5.2 → 1.5.3 (Payments)
>   1.6.1 → ... → 1.6.5 (Ecosystems)
>   
> DESPUÉS DE CADA APP:
>   - Ejecutar: python manage.py makemigrations
>   - Ejecutar: python manage.py migrate
>   - Verificar: No hay errores de migración
>   
> MODELOS - USAR TIPOS DEL ARCHIVO:
>   - Referencia: PROJECT_DOCS_General Especification.md (sección 3)
>   - Cada modelo debe tener __str__ method
>   - Usar type hints en Python
> ```

#### 1.1 Scaffold Django
| # | Acción | Archivo(s) | Estado |
|---|--------|------------|--------|
| 1.1.1 | Crear proyecto Django con `config/` | `backend/config/` | ⬜ |
| 1.1.2 | Crear `requirements.txt` | `backend/requirements.txt` | ⬜ |
| 1.1.3 | Crear `Dockerfile` backend | `backend/Dockerfile` | ⬜ |
| 1.1.4 | Configurar settings base | `backend/config/settings/base.py` | ⬜ |
| 1.1.5 | Crear config linting | `backend/.flake8`, `pyproject.toml` | ⬜ |

#### 1.2 App: Users
| # | Acción | Archivo(s) | Estado |
|---|--------|------------|--------|
| 1.2.1 | Crear app `users` | `backend/users/` | ⬜ |
| 1.2.2 | Definir modelo `UserProfile` | `backend/users/models.py` | ⬜ |
| 1.2.3 | Crear migración | `backend/users/migrations/` | ⬜ |

#### 1.3 App: Products
| # | Acción | Archivo(s) | Estado |
|---|--------|------------|--------|
| 1.3.1 | Crear app `products` | `backend/products/` | ⬜ |
| 1.3.2 | Definir modelo `Category` | `backend/products/models.py` | ⬜ |
| 1.3.3 | Definir modelo `Product` | `backend/products/models.py` | ⬜ |
| 1.3.4 | Crear migración | `backend/products/migrations/` | ⬜ |

#### 1.4 App: Orders
| # | Acción | Archivo(s) | Estado |
|---|--------|------------|--------|
| 1.4.1 | Crear app `orders` | `backend/orders/` | ⬜ |
| 1.4.2 | Definir modelo `Cart` | `backend/orders/models.py` | ⬜ |
| 1.4.3 | Definir modelo `CartItem` | `backend/orders/models.py` | ⬜ |
| 1.4.4 | Definir modelo `Order` | `backend/orders/models.py` | ⬜ |
| 1.4.5 | Definir modelo `OrderItem` | `backend/orders/models.py` | ⬜ |
| 1.4.6 | Crear migración | `backend/orders/migrations/` | ⬜ |

#### 1.5 App: Payments
| # | Acción | Archivo(s) | Estado |
|---|--------|------------|--------|
| 1.5.1 | Crear app `payments` | `backend/payments/` | ⬜ |
| 1.5.2 | Definir modelo `Payment` | `backend/payments/models.py` | ⬜ |
| 1.5.3 | Crear migración | `backend/payments/migrations/` | ⬜ |

#### 1.6 App: Ecosystems
| # | Acción | Archivo(s) | Estado |
|---|--------|------------|--------|
| 1.6.1 | Crear app `ecosystems` | `backend/ecosystems/` | ⬜ |
| 1.6.2 | Definir modelo `AdoptedTree` | `backend/ecosystems/models.py` | ⬜ |
| 1.6.3 | Definir modelo `TimelineEvent` | `backend/ecosystems/models.py` | ⬜ |
| 1.6.4 | Definir modelo `TreeGalleryImage` | `backend/ecosystems/models.py` | ⬜ |
| 1.6.5 | Crear migración | `backend/ecosystems/migrations/` | ⬜ |

---

### FASE 2: Business Logic Layer (Django - Services)

> ### 📚 ¿Qué es la capa de lógica de negocio?
> Esta capa contiene las **reglas que hacen único a tu negocio**. Ejemplos:
> - "Un usuario no puede comprar un árbol que ya fue adoptado"
> - "El precio final incluye 10% de donación a ONGs"
> - "Los puntos verdes se calculan como: precio × 0.1"
>
> **Componentes clave**:
> - **Repositories**: Abstraen el acceso a datos. El Service no sabe si los datos vienen de PostgreSQL, una API, o un archivo.
> - **Services**: Contienen la lógica de negocio. Orquestan repositories y aplican reglas.
> - **Serializers**: Transforman datos entre formatos (JSON ↔ Python objects). También validan inputs.
>
> **Regla importante**: Las Views (API endpoints) NO deben tener lógica. Solo llaman a Services.

> 🤖 **Instrucciones para IA - FASE 2:**
> ```
> PREREQUISITOS:
>   - FASE 1 completada
>   - Todos los modelos migrados sin errores
>   - Apps users, products, orders, payments, ecosystems existen
>   
> ORDEN DE EJECUCIÓN:
>   2.1.x (Repositories) → 2.2.x (Services) → 2.3.x (Serializers) → 2.4.x (Views) → 2.5.x (URLs)
>   
> PATRÓN PARA CADA APP:
>   1. Crear repository.py (acceso a datos)
>   2. Crear services.py (lógica de negocio)
>   3. Crear serializers.py (validación y transformación)
>   4. Crear views.py (endpoints API)
>   5. Crear urls.py (rutas)
>   
> VERIFICACIÓN DESPUÉS DE CADA PASO:
>   - flake8 backend/ (sin errores de linting)
>   - mypy backend/ (sin errores de tipos)
>   - python manage.py check (sin errores de Django)
>   
> ESTRUCTURA DE UN SERVICE:
>   class ProductService:
>       def __init__(self, repository: ProductRepository):
>           self.repository = repository
>       
>       def get_featured(self) -> list[Product]:
>           return self.repository.get_featured()
> ```

#### 2.1 Repositories

> 💡 **¿Por qué Repositories?** Permiten cambiar la fuente de datos sin tocar la lógica de negocio. Si mañana migras de PostgreSQL a MongoDB, solo cambias el repository.
| # | Acción | Archivo(s) | Estado |
|---|--------|------------|--------|
| 2.1.1 | Crear `ProductRepository` | `backend/products/repositories.py` | ⬜ |
| 2.1.2 | Crear `OrderRepository` | `backend/orders/repositories.py` | ⬜ |
| 2.1.3 | Crear `EcosystemRepository` | `backend/ecosystems/repositories.py` | ⬜ |
| 2.1.4 | Crear `UserRepository` | `backend/users/repositories.py` | ⬜ |

#### 2.2 Services

> 💡 **¿Qué hace un Service?** Coordina operaciones complejas. Ejemplo: `OrderService.create_order()` podría: validar stock → crear orden → procesar pago → enviar email → actualizar puntos.

| # | Acción | Archivo(s) | Estado |
|---|--------|------------|--------|
| 2.2.1 | Crear `ProductService` | `backend/products/services.py` | ⬜ |
| 2.2.2 | Crear `CartService` | `backend/orders/services.py` | ⬜ |
| 2.2.3 | Crear `OrderService` | `backend/orders/services.py` | ⬜ |
| 2.2.4 | Crear `PaymentService` | `backend/payments/services.py` | ⬜ |
| 2.2.5 | Crear `EcosystemService` | `backend/ecosystems/services.py` | ⬜ |
| 2.2.6 | Crear `GamificationService` | `backend/users/services.py` | ⬜ |

#### 2.3 Serializers

> 💡 **¿Qué es un Serializer?** Convierte objetos Python a JSON (para enviar al frontend) y viceversa. También valida que los datos del usuario sean correctos antes de guardarlos.
| # | Acción | Archivo(s) | Estado |
|---|--------|------------|--------|
| 2.3.1 | Crear `UserProfileSerializer` | `backend/users/serializers.py` | ⬜ |
| 2.3.2 | Crear `ProductSerializer` | `backend/products/serializers.py` | ⬜ |
| 2.3.3 | Crear `CartSerializer` | `backend/orders/serializers.py` | ⬜ |
| 2.3.4 | Crear `OrderSerializer` | `backend/orders/serializers.py` | ⬜ |
| 2.3.5 | Crear `AdoptedTreeSerializer` | `backend/ecosystems/serializers.py` | ⬜ |

#### 2.4 Views (API)

> 💡 **¿Qué es una View en Django REST?** Es el "controlador" que recibe peticiones HTTP, llama al Service correspondiente, y devuelve una respuesta JSON. Debe ser muy delgada (thin controller).

| # | Acción | Archivo(s) | Estado |
|---|--------|------------|--------|
| 2.4.1 | Crear `ProductViewSet` | `backend/products/views.py` | ⬜ |
| 2.4.2 | Crear `CartViewSet` | `backend/orders/views.py` | ⬜ |
| 2.4.3 | Crear `OrderViewSet` | `backend/orders/views.py` | ⬜ |
| 2.4.4 | Crear `PaymentView` | `backend/payments/views.py` | ⬜ |
| 2.4.5 | Crear `EcosystemViewSet` | `backend/ecosystems/views.py` | ⬜ |
| 2.4.6 | Crear `UserProfileView` | `backend/users/views.py` | ⬜ |

#### 2.5 URLs

> 💡 **URLs RESTful**: Usamos convenciones REST. `GET /api/products/` lista productos. `GET /api/products/123/` obtiene uno. `POST /api/products/` crea uno. Esto hace la API predecible.
| # | Acción | Archivo(s) | Estado |
|---|--------|------------|--------|
| 2.5.1 | Configurar URLs por app | `backend/*/urls.py` | ⬜ |
| 2.5.2 | Registrar en config | `backend/config/urls.py` | ⬜ |

---

### FASE 3: Presentation Layer (Next.js - Migración)

> ### 📚 ¿Por qué Next.js en lugar de React puro?
> Next.js agrega capacidades críticas para un marketplace:
>
> - **SSR (Server-Side Rendering)**: Las páginas se generan en el servidor. Google puede indexarlas (SEO).
> - **App Router**: Sistema de rutas basado en carpetas. Más intuitivo y potente.
> - **Server Components**: Componentes que se ejecutan en el servidor. Menos JavaScript en el cliente = más rápido.
> - **Image Optimization**: Optimiza imágenes automáticamente (WebP, lazy loading, etc.)
>
> **Recuerda**: El diseño ya existe en `frontend-base/`. Solo lo migramos, NO lo rediseñamos.

> 🤖 **Instrucciones para IA - FASE 3:**
> ```
> PREREQUISITOS:
>   - FASE 2 completada
>   - API backend funcionando en localhost:8000
>   - Carpeta frontend/ existe (vacía)
>   
> FUENTE DE DISEÑO:
>   - COPIAR estilos de: frontend-base/index.html (tailwind config)
>   - COPIAR componentes de: frontend-base/screens/*.tsx
>   - COPIAR contexto de: frontend-base/context/StoreContext.tsx
>   - PRESERVAR: colores, tipografía, animaciones, iconos
>   
> ORDEN DE EJECUCIÓN:
>   3.1.x (Scaffold) → 3.2.x (i18n) → 3.3.x (API Client) → 
>   3.4.x (State) → 3.5.x (UI Components) → 
>   3.6.x (Public Pages) → 3.7.x (Auth Pages) → 
>   3.8.x (Dashboard Pages) → 3.9.x (Middleware/SEO)
>   
> MIGRACIÓN DE CADA PANTALLA:
>   1. Leer el archivo original en frontend-base/screens/
>   2. Identificar si es Server o Client Component
>   3. Crear en la ubicación correcta (public/auth/dashboard)
>   4. Adaptar imports (react-router → next/navigation)
>   5. Agregar metadata si es página pública
>   6. Verificar que se ve IGUAL que el original
>   
> VERIFICACIÓN:
>   - npm run build (sin errores)
>   - npm run lint (sin errores)
>   - Comparar visualmente con frontend-base
> ```

#### 3.1 Scaffold Next.js

> 💡 **Tailwind CSS**: Usamos las mismas clases y colores que ya existen en `frontend-base/`. La configuración debe coincidir exactamente.
| # | Acción | Archivo(s) | Estado |
|---|--------|------------|--------|
| 3.1.1 | Crear proyecto Next.js | `frontend/` | ⬜ |
| 3.1.2 | Configurar Tailwind (mismos colores) | `frontend/tailwind.config.ts` | ⬜ |
| 3.1.3 | Crear `Dockerfile` | `frontend/Dockerfile` | ⬜ |
| 3.1.4 | Configurar `next.config.js` | `frontend/next.config.js` | ⬜ |
| 3.1.5 | Crear layout raíz | `frontend/app/layout.tsx` | ⬜ |
| 3.1.6 | Migrar estilos globales | `frontend/app/globals.css` | ⬜ |

#### 3.2 i18n

> 💡 **¿Qué es i18n?** Internacionalización. Permite que la app se muestre en múltiples idiomas. Los textos NO van hardcodeados en el código, van en archivos JSON separados por idioma.

| # | Acción | Archivo(s) | Estado |
|---|--------|------------|--------|
| 3.2.1 | Configurar `next-intl` | `frontend/i18n/` | ⬜ |
| 3.2.2 | Crear diccionario EN | `frontend/i18n/en.json` | ⬜ |
| 3.2.3 | Crear diccionario ES | `frontend/i18n/es.json` | ⬜ |

#### 3.3 API Client

> 💡 **¿Por qué un cliente API centralizado?** Evita repetir código. Maneja errores, tokens de autenticación, y URLs base en un solo lugar. Si la API cambia, solo modificas un archivo.
| # | Acción | Archivo(s) | Estado |
|---|--------|------------|--------|
| 3.3.1 | Crear cliente HTTP base | `frontend/lib/api/client.ts` | ⬜ |
| 3.3.2 | Crear `productsApi` | `frontend/lib/api/products.ts` | ⬜ |
| 3.3.3 | Crear `ordersApi` | `frontend/lib/api/orders.ts` | ⬜ |
| 3.3.4 | Crear `ecosystemsApi` | `frontend/lib/api/ecosystems.ts` | ⬜ |
| 3.3.5 | Crear `paymentsApi` | `frontend/lib/api/payments.ts` | ⬜ |

#### 3.4 State Management

> 💡 **¿Qué es Context API?** Es la forma de React de compartir datos entre componentes sin pasar props manualmente en cada nivel. Ideal para: usuario logueado, carrito, favoritos, tema.
>
> **Ten en cuenta**: Separamos en múltiples contexts (Cart, Favorites, User) en lugar de uno gigante. Esto evita re-renders innecesarios.

| # | Acción | Archivo(s) | Estado |
|---|--------|------------|--------|
| 3.4.1 | Crear `CartContext` | `frontend/lib/store/CartContext.tsx` | ⬜ |
| 3.4.2 | Crear `FavoritesContext` | `frontend/lib/store/FavoritesContext.tsx` | ⬜ |
| 3.4.3 | Crear `UserContext` | `frontend/lib/store/UserContext.tsx` | ⬜ |
| 3.4.4 | Crear `Providers` wrapper | `frontend/lib/store/Providers.tsx` | ⬜ |

#### 3.5 UI Components (Migrar de frontend-base)

> 💡 **Componentes "tontos" vs "inteligentes"**: Los componentes UI (`Button`, `Input`, `ProductCard`) son "tontos" - solo reciben props y renderizan. NO hacen fetch de datos ni tienen lógica de negocio. Esto los hace reutilizables.
| # | Acción | Origen | Destino | Estado |
|---|--------|--------|---------|--------|
| 3.5.1 | Migrar `BottomNav` | `frontend-base/components/` | `frontend/components/ui/` | ⬜ |
| 3.5.2 | Extraer `ProductCard` | De `HomeScreen.tsx` | `frontend/components/ui/` | ⬜ |
| 3.5.3 | Extraer `Button` variants | De screens | `frontend/components/ui/` | ⬜ |
| 3.5.4 | Extraer `Input` | De `LoginScreen.tsx` | `frontend/components/ui/` | ⬜ |
| 3.5.5 | Extraer `TreeAnimation` | De `LoginScreen.tsx` | `frontend/components/ui/` | ⬜ |

#### 3.6 Páginas Públicas (SEO)

> 💡 **¿Por qué SSR para páginas públicas?** Google necesita ver el contenido HTML completo para indexarlo. Con SSR, el servidor genera el HTML antes de enviarlo. Sin SSR, Google vería una página vacía con JavaScript.
>
> **Importante**: Estas páginas usan Server Components por defecto. Solo agrega `"use client"` si necesitas interactividad (clicks, formularios).

| # | Acción | Origen | Destino | Estado |
|---|--------|--------|---------|--------|
| 3.6.1 | Migrar Landing | `LandingPage.tsx` | `app/(public)/page.tsx` | ⬜ |
| 3.6.2 | Migrar Welcome | `WelcomeScreen.tsx` | `app/(public)/welcome/page.tsx` | ⬜ |
| 3.6.3 | Crear Products list | Nuevo | `app/(public)/products/page.tsx` | ⬜ |
| 3.6.4 | Migrar Product detail | `ProductDetailsScreen.tsx` | `app/(public)/products/[category]/[slug]/page.tsx` | ⬜ |
| 3.6.5 | Agregar metadata SEO | - | Cada `page.tsx` público | ⬜ |
| 3.6.6 | Agregar JSON-LD | - | `components/seo/JsonLd.tsx` | ⬜ |

#### 3.7 Páginas Auth (No-index)

> 💡 **¿Por qué no indexar auth?** Las páginas de login/register no aportan valor SEO. Si Google las indexa, podrían aparecer en resultados de búsqueda, lo cual es confuso para usuarios y desperdicia "crawl budget".
| # | Acción | Origen | Destino | Estado |
|---|--------|--------|---------|--------|
| 3.7.1 | Migrar Login | `LoginScreen.tsx` | `app/(auth)/login/page.tsx` | ⬜ |
| 3.7.2 | Crear Register | Basado en Login | `app/(auth)/register/page.tsx` | ⬜ |
| 3.7.3 | Crear layout auth | - | `app/(auth)/layout.tsx` | ⬜ |

#### 3.8 Páginas Dashboard (Protected)

> 💡 **¿Qué significa "Protected"?** Estas páginas requieren que el usuario esté logueado. Si alguien intenta acceder sin autenticación, el middleware lo redirige a `/login`.
>
> **El layout protegido**: Verifica la sesión del usuario. Si no hay sesión válida, redirige. Esto se hace en el servidor, antes de renderizar la página.

| # | Acción | Origen | Destino | Estado |
|---|--------|--------|---------|--------|
| 3.8.1 | Crear layout protegido | - | `app/(dashboard)/layout.tsx` | ⬜ |
| 3.8.2 | Migrar Home | `HomeScreen.tsx` | `app/(dashboard)/page.tsx` | ⬜ |
| 3.8.3 | Migrar Cart | `CartScreen.tsx` | `app/(dashboard)/cart/page.tsx` | ⬜ |
| 3.8.4 | Migrar Profile | `ProfileScreen.tsx` | `app/(dashboard)/profile/page.tsx` | ⬜ |
| 3.8.5 | Migrar Favorites | `FavoritesScreen.tsx` | `app/(dashboard)/favorites/page.tsx` | ⬜ |
| 3.8.6 | Migrar Tracker | `TreeTrackerScreen.tsx` | `app/(dashboard)/tracker/[id]/page.tsx` | ⬜ |

#### 3.9 Middleware & SEO

> 💡 **¿Qué es Middleware en Next.js?** Código que se ejecuta ANTES de que la página se renderice. Ideal para: verificar autenticación, redirigir según idioma, bloquear rutas, etc.
| # | Acción | Archivo(s) | Estado |
|---|--------|------------|--------|
| 3.9.1 | Crear `middleware.ts` | `frontend/middleware.ts` | ⬜ |
| 3.9.2 | Crear `robots.txt` | `frontend/public/robots.txt` | ⬜ |
| 3.9.3 | Configurar sitemap | `frontend/app/sitemap.ts` | ⬜ |

---

### FASE 4: Integración

> ### 📚 ¿Por qué una fase de integración separada?
> Hasta ahora, frontend y backend funcionan de forma aislada con datos mock. En esta fase los conectamos con servicios reales:
>
> - **Supabase**: Maneja autenticación (login, register, sesiones) y almacenamiento
> - **Stripe**: Procesa pagos reales de forma segura
> - **E2E Testing**: Verificamos que todo el flujo funcione junto
>
> **Ten en cuenta**: Esta es la fase donde más bugs aparecen. Prueba cada integración de forma aislada antes de combinarlas.

> 🤖 **Instrucciones para IA - FASE 4:**
> ```
> PREREQUISITOS:
>   - FASE 3 completada
>   - Frontend y backend corriendo sin errores
>   - Cuentas creadas en: Supabase, Stripe
>   - Variables de entorno configuradas en .env
>   
> ORDEN DE EJECUCIÓN:
>   4.1 (Supabase Auth) → 4.2 (Login/Register) → 4.3 (Stripe) → 
>   4.4 (E2E Test) → 4.5 (SEO Audit) → 4.6 (Docs)
>   
> FLUJO DE PRUEBA E2E (4.4):
>   1. Abrir / (landing)
>   2. Click en "Start Journey"
>   3. Registrar nuevo usuario
>   4. Navegar a productos
>   5. Seleccionar un árbol
>   6. Agregar al carrito
>   7. Ir a checkout
>   8. Completar pago (usar tarjeta de prueba Stripe)
>   9. Verificar que el árbol aparece en dashboard
>   10. Abrir tracker del árbol
>   
> SI ALGO FALLA:
>   - Revisar console del navegador
>   - Revisar logs del backend
>   - Verificar variables de entorno
>   - NO continuar hasta resolver
> ```

| # | Acción | Descripción | Estado |
|---|--------|-------------|--------|
| 4.1 | Supabase Auth | Configurar cliente en frontend | ⬜ |
| 4.2 | Login/Register | Conectar con Supabase | ⬜ |
| 4.3 | Stripe Checkout | Integrar flujo de pago | ⬜ |
| 4.4 | Flujo adopción | Probar E2E | ⬜ |
| 4.5 | SEO audit | Verificar con Lighthouse | ⬜ |
| 4.6 | Documentación API | Crear docs | ⬜ |

---

## 🛠️ Tech Stack

> 💡 **¿Por qué este stack?** Cada tecnología fue elegida por una razón específica:
> - **Next.js**: SEO + React + Server Components
> - **Django**: Robusto, seguro, excelente ORM, gran comunidad
> - **Supabase**: PostgreSQL + Auth + Storage sin manejar infraestructura
> - **Stripe**: El estándar de la industria para pagos
> - **Docker**: Consistencia entre desarrollo y producción

| Capa | Tecnología |
|------|------------|
| Presentation | Next.js 14, TypeScript, Tailwind CSS, next-intl |
| Business Logic | Django 5, Django REST Framework, Python 3.11+ |
| Data Access | Supabase (Postgres, Auth, Storage), Stripe |
| Infrastructure | Docker, Docker Compose, Cloudflare |

---

## 🔍 SEO Requirements (NON-NEGOTIABLE)

> ### 📚 ¿Por qué SEO es crítico para un marketplace?
> SEO (Search Engine Optimization) determina si Google muestra tu sitio cuando alguien busca "adoptar un árbol" o "retiros de bienestar". Sin SEO:
> - Dependes 100% de publicidad pagada
> - No tienes tráfico orgánico (gratuito)
> - Pierdes credibilidad (la gente confía más en resultados orgánicos)
>
> **Para un marketplace, SEO es supervivencia**. Si nadie te encuentra, nadie compra.

### Objetivos SEO
- Indexar todas las páginas públicas de productos (árboles, retiros, productos)
- Rankear para keywords de impacto ecológico y naturaleza
- Nunca exponer páginas privadas o sensibles

### Páginas Indexables (SSR/SSG)

> 💡 **SSR vs SSG**: 
> - **SSR (Server-Side Rendering)**: La página se genera en cada petición. Ideal para contenido que cambia frecuentemente.
> - **SSG (Static Site Generation)**: La página se genera una vez en build time. Más rápido, ideal para contenido estático.

```
app/(public)/
├── page.tsx                           # Home / Landing
├── products/page.tsx                  # Catálogo
├── products/[category]/[slug]/page.tsx # Detalle producto
├── impact/page.tsx                    # Página de impacto
└── about/page.tsx                     # Sobre nosotros
```

### Metadata por Página

> 💡 **¿Qué es Metadata?** Son datos sobre la página que Google usa para mostrar en resultados de búsqueda:
> - **Title**: El título azul clickeable
> - **Description**: El texto gris debajo del título
> - **Open Graph**: Lo que se muestra cuando compartes en redes sociales
>
> **Regla**: Cada página debe tener metadata ÚNICA. Si todas dicen lo mismo, Google penaliza.

Cada página pública DEBE definir metadata única:

```typescript
// app/(public)/products/[category]/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const product = await getProduct(params.slug);
  return {
    title: `${product.title} | Nature Marketplace`,
    description: product.shortDescription,
    openGraph: {
      title: product.title,
      description: product.shortDescription,
      images: [product.images[0]],
    },
  };
}
```

### Structured Data (JSON-LD)

> 💡 **¿Qué es JSON-LD?** Es un formato que le dice a Google exactamente qué tipo de contenido tienes. Sin él, Google "adivina". Con él, Google SABE que es un producto con precio, disponibilidad, etc.
>
> **Beneficio**: Habilita "rich snippets" - esas estrellas, precios y fotos que ves en algunos resultados de Google. Aumentan el CTR (click-through rate) significativamente.

Implementar Schema.org para:

| Tipo | Páginas | Propiedades |
|------|---------|-------------|
| Product | Detalle producto | name, description, price, image, category |
| Organization | About, Footer | name, logo, url, sameAs |
| BreadcrumbList | Todas las públicas | itemListElement |
| WebSite | Home | name, url, potentialAction (search) |

Ejemplo:
```typescript
// components/seo/ProductJsonLd.tsx
export function ProductJsonLd({ product }: { product: Product }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.title,
          description: product.description,
          image: product.images,
          offers: {
            "@type": "Offer",
            price: product.price,
            priceCurrency: product.currency,
            availability: "https://schema.org/InStock",
          },
        }),
      }}
    />
  );
}
```

### robots.txt

> 💡 **¿Qué es robots.txt?** Es un archivo que le dice a los bots de Google (y otros) qué pueden y qué NO pueden rastrear. Es como un cartel de "No pasar" para ciertas áreas de tu sitio.
>
> **Importante**: robots.txt NO es seguridad. Un hacker puede ignorarlo. Solo es una "sugerencia" para bots bien comportados.

```
User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /dashboard/*
Disallow: /login
Disallow: /register
Disallow: /cart
Disallow: /checkout
Disallow: /api/*

Sitemap: https://naturemarketplace.com/sitemap.xml
```

### Sitemap Dinámico

> 💡 **¿Qué es un Sitemap?** Es un archivo XML que lista TODAS las páginas públicas de tu sitio. Google lo usa para descubrir páginas nuevas más rápido.
>
> **Dinámico**: En lugar de mantenerlo manualmente, Next.js lo genera automáticamente basándose en tus productos y páginas.

```typescript
// app/sitemap.ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getAllProducts();
  
  const productUrls = products.map((product) => ({
    url: `https://naturemarketplace.com/products/${product.category}/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    { url: 'https://naturemarketplace.com', priority: 1.0 },
    { url: 'https://naturemarketplace.com/products', priority: 0.9 },
    ...productUrls,
  ];
}
```

### Páginas NO Indexables

Estas páginas NUNCA deben ser indexadas:

| Ruta | Método de Bloqueo |
|------|-------------------|
| `/login`, `/register` | `robots: { index: false }` + robots.txt |
| `/dashboard/*` | `robots: { index: false }` + robots.txt |
| `/cart`, `/checkout` | `robots: { index: false }` + robots.txt |
| `/api/*` | robots.txt |

```typescript
// app/(auth)/login/page.tsx
export const metadata: Metadata = {
  title: 'Login | Nature Marketplace',
  robots: { index: false, follow: false },
};
```

### Performance SEO (Core Web Vitals)

> 💡 **¿Qué son Core Web Vitals?** Son métricas de Google que miden la experiencia del usuario. Desde 2021, afectan directamente tu ranking en búsquedas.
>
> - **LCP (Largest Contentful Paint)**: ¿Cuánto tarda en aparecer el contenido principal?
> - **FID (First Input Delay)**: ¿Cuánto tarda en responder cuando el usuario hace click?
> - **CLS (Cumulative Layout Shift)**: ¿Se mueve el contenido mientras carga? (muy molesto)
>
> **Herramienta**: Usa Lighthouse en Chrome DevTools para medir estas métricas.

| Métrica | Target | Cómo lograrlo |
|---------|--------|---------------|
| LCP | < 2.5s | Imágenes optimizadas, Server Components |
| FID | < 100ms | Minimal JS en páginas públicas |
| CLS | < 0.1 | Dimensiones de imagen definidas |
| FCP | < 1.5s | SSR, font preload |

### Imágenes

- Formato WebP preferido
- Alt text obligatorio en TODAS las imágenes
- Lazy loading por defecto
- Usar `next/image` con sizes definidos

```typescript
<Image
  src={product.image}
  alt={product.title}
  width={400}
  height={300}
  priority={isAboveFold}
/>
```

### i18n SEO

- Locale por defecto: `en`
- Locale secundario: `es`
- Implementar `hreflang` tags
- URLs localizadas: `/en/products`, `/es/productos`

```html
<link rel="alternate" hreflang="en" href="https://naturemarketplace.com/en/products" />
<link rel="alternate" hreflang="es" href="https://naturemarketplace.com/es/productos" />
<link rel="alternate" hreflang="x-default" href="https://naturemarketplace.com/products" />
```

### Checklist SEO

- [ ] Metadata única por página pública
- [ ] JSON-LD en páginas de producto
- [ ] robots.txt configurado
- [ ] Sitemap dinámico generado
- [ ] Imágenes con alt text
- [ ] Core Web Vitals < targets
- [ ] hreflang tags para i18n
- [ ] Canonical URLs definidas
- [ ] Open Graph tags para social sharing

---

## 🔒 Security Requirements (NON-NEGOTIABLE)

> ### 📚 ¿Por qué la seguridad es crítica?
> Un marketplace maneja **dinero real** y **datos personales**. Una brecha de seguridad puede significar:
> - Pérdida de dinero (tuyo y de tus usuarios)
> - Demandas legales (GDPR, leyes de protección de datos)
> - Destrucción de la reputación (nadie confía en un sitio hackeado)
>
> **La seguridad NO es opcional**. No es algo que "agregas después". Se diseña desde el día 1.

### Protección contra Ataques Comunes

> 💡 **OWASP Top 10**: Es una lista de los 10 ataques más comunes en aplicaciones web. Cubrimos los más relevantes para un marketplace.

#### 1. SQL Injection

> 💡 **¿Qué es?** El atacante inserta código SQL malicioso en inputs. Ejemplo: en lugar de un email, escribe `'; DROP TABLE users; --` y borra toda tu base de datos.
>
> **Prevención**: NUNCA concatenar strings para formar queries. Siempre usar el ORM o queries parametrizadas.
| Capa | Protección |
|------|------------|
| Django ORM | Usar SIEMPRE el ORM, nunca raw SQL |
| Queries | Parametrizar cualquier query manual |
| Validación | Sanitizar inputs en serializers |

```python
# ❌ NUNCA hacer esto
User.objects.raw(f"SELECT * FROM users WHERE id = {user_id}")

# ✅ Siempre usar ORM
User.objects.filter(id=user_id)
```

#### 2. XSS (Cross-Site Scripting)

> 💡 **¿Qué es?** El atacante inyecta JavaScript malicioso que se ejecuta en el navegador de otros usuarios. Puede robar cookies, sesiones, o redirigir a sitios falsos.
>
> **Ejemplo**: Un usuario pone `<script>steal(document.cookie)</script>` como nombre de producto. Si no sanitizas, ese script se ejecuta cuando otros ven el producto.

| Capa | Protección |
|------|------------|
| React/Next.js | Escape automático de JSX |
| Django | Templates escapan por defecto |
| Headers | `Content-Security-Policy` header |
| Inputs | Sanitizar HTML si se permite rich text |

```typescript
// next.config.js - CSP Header
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com;",
  },
];
```

#### 3. CSRF (Cross-Site Request Forgery)

> 💡 **¿Qué es?** El atacante engaña a un usuario logueado para que haga acciones sin saberlo. Ejemplo: un email con un link invisible que transfiere dinero de tu cuenta.
>
> **Cómo funciona**: Si estás logueado en tu banco y visitas un sitio malicioso, ese sitio puede hacer peticiones a tu banco usando TU sesión.
>
> **Prevención**: Tokens CSRF - cada formulario tiene un token secreto que el atacante no puede adivinar.

| Capa | Protección |
|------|------------|
| Django | `CsrfViewMiddleware` habilitado |
| Frontend | Enviar CSRF token en headers |
| Cookies | `SameSite=Lax` o `Strict` |

```python
# settings/base.py
MIDDLEWARE = [
    'django.middleware.csrf.CsrfViewMiddleware',
    ...
]
CSRF_COOKIE_SECURE = True
CSRF_COOKIE_HTTPONLY = True
SESSION_COOKIE_SECURE = True
```

#### 4. Authentication & Authorization

> 💡 **Diferencia clave**:
> - **Authentication (AuthN)**: ¿Quién eres? (login, verificar identidad)
> - **Authorization (AuthZ)**: ¿Qué puedes hacer? (permisos, roles)
>
> **Errores comunes**: 
> - Guardar passwords en texto plano (NUNCA)
> - No limitar intentos de login (permite ataques de fuerza bruta)
> - Tokens que nunca expiran (si se roban, acceso eterno)

| Protección | Implementación |
|------------|----------------|
| Passwords | Supabase Auth (bcrypt hashing) |
| Sessions | JWT con refresh tokens |
| Rate Limiting | Django Ratelimit en login |
| 2FA | Opcional via Supabase |

```python
# Rate limiting en login
from django_ratelimit.decorators import ratelimit

@ratelimit(key='ip', rate='5/m', method='POST', block=True)
def login_view(request):
    ...
```

#### 5. CORS (Cross-Origin Resource Sharing)

> 💡 **¿Qué es CORS?** Es una política de seguridad del navegador que bloquea peticiones entre diferentes dominios. Sin configurar CORS, tu frontend en `localhost:3000` no puede hablar con tu backend en `localhost:8000`.
>
> **Peligro de configurar mal**: Si pones `CORS_ALLOW_ALL_ORIGINS = True`, cualquier sitio puede hacer peticiones a tu API. Un atacante podría crear un sitio falso que robe datos de usuarios logueados.

```python
# settings/base.py
CORS_ALLOWED_ORIGINS = [
    "https://naturemarketplace.com",
    "http://localhost:3000",  # Solo en desarrollo
]
CORS_ALLOW_CREDENTIALS = True
```

#### 6. Security Headers

> 💡 **¿Qué son los Security Headers?** Son instrucciones HTTP que le dicen al navegador cómo comportarse de forma segura. Cada header previene un tipo específico de ataque:
>
> - **HSTS**: Fuerza HTTPS, previene downgrade attacks
> - **X-Frame-Options**: Previene clickjacking (tu sitio embebido en un iframe malicioso)
> - **X-Content-Type-Options**: Previene MIME sniffing attacks
> - **CSP**: Controla qué scripts/estilos pueden ejecutarse

```typescript
// next.config.js
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];
```

#### 7. Stripe Security

> 💡 **¿Por qué Stripe es especial?** Manejar pagos tiene regulaciones estrictas (PCI-DSS). Si manejas números de tarjeta directamente, debes cumplir con auditorías costosas.
>
> **La solución**: Stripe Elements. El usuario ingresa su tarjeta en un iframe de Stripe. Tu código NUNCA ve el número de tarjeta. Stripe te da un token seguro.
>
> **Webhooks**: Stripe te notifica eventos (pago exitoso, fallo, reembolso). SIEMPRE verifica la firma para asegurar que el mensaje viene de Stripe y no de un atacante.

| Protección | Implementación |
|------------|----------------|
| Webhook Signature | Verificar SIEMPRE `stripe-signature` |
| API Keys | Solo en backend, nunca en frontend |
| PCI Compliance | Usar Stripe Elements (nunca manejar tarjetas) |

```python
# payments/views.py
import stripe

@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError:
        return HttpResponse(status=400)
    
    # Procesar evento...
```

#### 8. Supabase Row Level Security (RLS)

> 💡 **¿Qué es RLS?** Son reglas a nivel de base de datos que controlan quién puede ver/modificar qué filas. Incluso si tu código tiene un bug, la base de datos bloquea accesos no autorizados.
>
> **Ejemplo**: Sin RLS, un bug podría permitir que el Usuario A vea las órdenes del Usuario B. Con RLS, la base de datos SIEMPRE filtra: "solo muestra filas donde user_id = usuario actual".
>
> **Es tu última línea de defensa**. Si todo lo demás falla, RLS protege los datos.

```sql
-- Usuarios solo pueden ver sus propios datos
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = user_id);

-- Usuarios solo pueden ver sus propias órdenes
CREATE POLICY "Users can view own orders"
ON orders FOR SELECT
USING (auth.uid() = user_id);

-- Productos son públicos para lectura
CREATE POLICY "Products are viewable by everyone"
ON products FOR SELECT
USING (true);
```

#### 9. Input Validation

> 💡 **Regla de oro**: NUNCA confíes en datos del usuario. Todo input es potencialmente malicioso hasta que lo valides.
>
> **Qué validar**:
> - Tipo de dato (¿es realmente un número?)
> - Rango (¿el precio es positivo?)
> - Formato (¿el email tiene @?)
> - Contenido (¿hay HTML/scripts maliciosos?)
>
> **Dónde validar**: En el backend (serializers). La validación del frontend es solo UX, no seguridad.

```python
# serializers.py
from rest_framework import serializers
import bleach

class ProductSerializer(serializers.ModelSerializer):
    def validate_title(self, value):
        # Sanitizar HTML
        return bleach.clean(value, tags=[], strip=True)
    
    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be positive")
        return value
```

#### 10. Environment Variables

> 💡 **¿Por qué variables de entorno?** Los secrets (API keys, passwords) NUNCA deben estar en el código. Si subes tu código a GitHub con un secret, bots lo detectan en segundos y lo explotan.
>
> **Reglas**:
> - Secrets en `.env` (que está en `.gitignore`)
> - Compartir `.env.example` sin valores reales
> - En producción, usar el sistema de secrets del hosting (no archivos)

```python
# NUNCA hardcodear secrets
# ❌ Mal
STRIPE_SECRET_KEY = "sk_live_xxx"

# ✅ Bien
STRIPE_SECRET_KEY = os.environ.get("STRIPE_SECRET_KEY")
```

### Django Security Settings (Production)

> 💡 **Desarrollo vs Producción**: En desarrollo, Django es permisivo para facilitar debugging. En producción, DEBE ser estricto. Estas settings son el mínimo para producción.
>
> **Checklist antes de deploy**:
> - `DEBUG = False` (CRÍTICO - con True, los errores muestran tu código)
> - `ALLOWED_HOSTS` configurado (previene host header attacks)
> - Todas las cookies marcadas como `Secure` y `HttpOnly`

```python
# settings/production.py
DEBUG = False
ALLOWED_HOSTS = ['naturemarketplace.com', 'www.naturemarketplace.com']

# HTTPS
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# Cookies
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = True

# HSTS
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Content Type
SECURE_CONTENT_TYPE_NOSNIFF = True

# XSS
SECURE_BROWSER_XSS_FILTER = True

# Clickjacking
X_FRAME_OPTIONS = 'DENY'
```

### Checklist de Seguridad

> 💡 **Usa este checklist antes de cada deploy a producción**. Un solo item sin marcar puede ser la puerta de entrada para un atacante.

- [ ] Django `DEBUG=False` en producción
- [ ] HTTPS forzado via Cloudflare
- [ ] CORS configurado correctamente
- [ ] CSRF protection habilitado
- [ ] Rate limiting en endpoints sensibles
- [ ] Stripe webhook signature verificada
- [ ] Supabase RLS policies activas
- [ ] Security headers configurados
- [ ] Secrets en variables de entorno
- [ ] Input validation en todos los serializers
- [ ] SQL injection prevenido (solo ORM)
- [ ] XSS prevenido (CSP headers)
- [ ] Passwords hasheados (Supabase Auth)
- [ ] JWT tokens con expiración corta

### Acciones Atómicas de Seguridad

> 💡 **Implementa estas acciones como parte del desarrollo, no al final**. La seguridad retrofiteada siempre tiene huecos.

> 🤖 **Instrucciones para IA - SEGURIDAD:**
> ```
> CUÁNDO EJECUTAR:
>   - S.1, S.2, S.9: Durante FASE 1 (al crear Django)
>   - S.3, S.8: Durante FASE 2 (al crear views y serializers)
>   - S.4, S.7: Durante FASE 3 (al crear Next.js)
>   - S.5: Durante FASE 4 (al integrar Stripe)
>   - S.6: Durante FASE 4 (al integrar Supabase)
>   - S.10: Al final, antes de deploy
>   
> VERIFICACIÓN DE SEGURIDAD:
>   - Ejecutar: python manage.py check --deploy
>   - Revisar: Todos los warnings deben estar resueltos
>   - Headers: Verificar con securityheaders.com
>   
> NUNCA:
>   - Commitear .env con secrets reales
>   - Usar DEBUG=True en producción
>   - Desactivar CSRF "porque no funciona"
>   - Poner CORS_ALLOW_ALL_ORIGINS=True
> ```

| # | Acción | Archivo(s) | Estado |
|---|--------|------------|--------|
| S.1 | Configurar Django security settings | `backend/config/settings/production.py` | ⬜ |
| S.2 | Configurar CORS | `backend/config/settings/base.py` | ⬜ |
| S.3 | Implementar rate limiting | `backend/users/views.py` | ⬜ |
| S.4 | Configurar security headers Next.js | `frontend/next.config.js` | ⬜ |
| S.5 | Implementar Stripe webhook verification | `backend/payments/views.py` | ⬜ |
| S.6 | Crear Supabase RLS policies | `supabase/migrations/` | ⬜ |
| S.7 | Configurar CSP header | `frontend/next.config.js` | ⬜ |
| S.8 | Validar inputs en serializers | `backend/*/serializers.py` | ⬜ |
| S.9 | Configurar `.env` y `.env.example` | Raíz del proyecto | ⬜ |
| S.10 | Auditar dependencias (safety, npm audit) | CI/CD | ⬜ |

---

## 🔧 Variables de Entorno

> 💡 **Cómo usar**:
> 1. Copia `.env.example` a `.env`
> 2. Llena los valores reales
> 3. NUNCA subas `.env` a Git (ya está en `.gitignore`)
>
> **Prefijo `NEXT_PUBLIC_`**: En Next.js, solo las variables con este prefijo son accesibles en el frontend. Las demás solo existen en el servidor.

```env
# Backend
DJANGO_SECRET_KEY=
DJANGO_DEBUG=True
DATABASE_URL=
SUPABASE_URL=
SUPABASE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=
```

---

## 📋 MVP Definition of Done

> 💡 **¿Qué es "Definition of Done"?** Es la lista de criterios que deben cumplirse para considerar el MVP completo. Si un item no está marcado, el MVP no está listo para usuarios reales.
>
> **Filosofía MVP**: No es "la versión fea". Es la versión más pequeña que entrega valor real y permite validar el negocio.

- [ ] Usuario puede registrarse y hacer login
- [ ] Usuario puede navegar productos (SEO-friendly)
- [ ] Usuario puede adoptar un árbol (flujo de compra)
- [ ] Pago procesado via Stripe
- [ ] Árbol aparece en dashboard del usuario
- [ ] Progreso del árbol es visible (tracker)
- [ ] Google puede indexar páginas públicas
- [ ] i18n funciona (EN/ES)
- [ ] Docker levanta todo el stack

---

## 🚀 Comandos

> 💡 **Comandos esenciales para el día a día**. Memoriza estos - los usarás constantemente.

```bash
# Desarrollo completo - levanta frontend + backend + todo
docker compose up --build

# Solo backend
cd backend && python manage.py runserver

# Solo frontend
cd frontend && npm run dev

# Linting backend
cd backend && flake8 . && mypy . && black . && isort .

# Migraciones
cd backend && python manage.py makemigrations && python manage.py migrate
```

---

🌿 Build with intention. Ship with simplicity. Grow with nature.

---

## 🤖 Resumen de Ejecución para IA

> ### Flujo Completo de Implementación
> Ejecuta este flujo de principio a fin. Cada paso depende del anterior.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FLUJO DE IMPLEMENTACIÓN                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  FASE 0: INFRAESTRUCTURA                                                     │
│  ────────────────────────                                                    │
│  0.1 Crear carpetas (frontend/, backend/, docker/)                          │
│  0.2 Crear docker-compose.yml                                                │
│  0.3 Crear .env.example                                                      │
│  0.4 Crear README.md                                                         │
│  ✓ Verificar: docker compose config funciona                                │
│                                                                              │
│                              ↓                                               │
│                                                                              │
│  FASE 1: DATA ACCESS LAYER (Django Modelos)                                 │
│  ──────────────────────────────────────────                                 │
│  1.1.x Scaffold Django + settings + requirements                            │
│  1.2.x App users + modelo UserProfile                                       │
│  1.3.x App products + modelos Category, Product                             │
│  1.4.x App orders + modelos Cart, CartItem, Order, OrderItem                │
│  1.5.x App payments + modelo Payment                                        │
│  1.6.x App ecosystems + modelos AdoptedTree, Timeline, Gallery              │
│  + S.1 Security settings + S.2 CORS + S.9 .env                              │
│  ✓ Verificar: python manage.py migrate sin errores                          │
│                                                                              │
│                              ↓                                               │
│                                                                              │
│  FASE 2: BUSINESS LOGIC LAYER (Django Services)                             │
│  ──────────────────────────────────────────────                             │
│  2.1.x Repositories (ProductRepo, OrderRepo, etc.)                          │
│  2.2.x Services (ProductService, CartService, etc.)                         │
│  2.3.x Serializers (validación de datos)                                    │
│  2.4.x Views (API endpoints)                                                │
│  2.5.x URLs (rutas API)                                                     │
│  + S.3 Rate limiting + S.8 Input validation                                 │
│  ✓ Verificar: curl localhost:8000/api/products/ retorna JSON                │
│                                                                              │
│                              ↓                                               │
│                                                                              │
│  FASE 3: PRESENTATION LAYER (Next.js Frontend)                              │
│  ─────────────────────────────────────────────                              │
│  3.1.x Scaffold Next.js + Tailwind (copiar config de frontend-base)         │
│  3.2.x i18n (next-intl, diccionarios EN/ES)                                 │
│  3.3.x API Client (cliente HTTP para Django)                                │
│  3.4.x State Management (CartContext, FavoritesContext, UserContext)        │
│  3.5.x UI Components (migrar de frontend-base)                              │
│  3.6.x Páginas públicas (SSR, SEO, metadata)                                │
│  3.7.x Páginas auth (login, register, no-index)                             │
│  3.8.x Páginas dashboard (protegidas)                                       │
│  3.9.x Middleware + robots.txt + sitemap                                    │
│  + S.4 Security headers + S.7 CSP                                           │
│  ✓ Verificar: npm run build sin errores, diseño igual a frontend-base      │
│                                                                              │
│                              ↓                                               │
│                                                                              │
│  FASE 4: INTEGRACIÓN                                                         │
│  ───────────────────                                                         │
│  4.1 Configurar Supabase Auth                                               │
│  4.2 Conectar login/register                                                │
│  4.3 Integrar Stripe Checkout                                               │
│  4.4 Probar flujo E2E completo                                              │
│  4.5 Auditar SEO con Lighthouse                                             │
│  4.6 Documentar API                                                         │
│  + S.5 Stripe webhook + S.6 Supabase RLS + S.10 Audit deps                  │
│  ✓ Verificar: Usuario puede adoptar árbol y verlo en dashboard              │
│                                                                              │
│                              ↓                                               │
│                                                                              │
│  ✅ MVP COMPLETO                                                             │
│  ───────────────                                                             │
│  - Usuario puede registrarse y hacer login                                  │
│  - Usuario puede navegar productos (SEO-friendly)                           │
│  - Usuario puede adoptar un árbol                                           │
│  - Pago procesado via Stripe                                                │
│  - Árbol visible en dashboard con tracker                                   │
│  - Google puede indexar páginas públicas                                    │
│  - i18n funciona (EN/ES)                                                    │
│  - Docker levanta todo el stack                                             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Comandos de Verificación por Fase

```bash
# FASE 0
docker compose config  # Debe mostrar configuración sin errores

# FASE 1
cd backend && python manage.py check  # Sin errores
cd backend && python manage.py migrate  # Migraciones aplicadas

# FASE 2
cd backend && python manage.py runserver  # Servidor arranca
curl http://localhost:8000/api/products/  # Retorna JSON

# FASE 3
cd frontend && npm run build  # Build exitoso
cd frontend && npm run lint  # Sin errores de lint

# FASE 4
docker compose up  # Todo el stack arranca
# Abrir http://localhost:3000 y probar flujo completo

# SEGURIDAD
cd backend && python manage.py check --deploy  # Sin warnings
npm audit  # Sin vulnerabilidades críticas
```

### Si la IA se Detiene

Si la implementación se interrumpe, para continuar:

1. **Identificar última acción completada** (buscar último ✅)
2. **Verificar estado actual**:
   - ¿Backend corre? `cd backend && python manage.py runserver`
   - ¿Frontend corre? `cd frontend && npm run dev`
   - ¿Docker funciona? `docker compose up`
3. **Continuar desde la siguiente acción pendiente** (primer ⬜ después del último ✅)

---

**Fin del documento de implementación.**
