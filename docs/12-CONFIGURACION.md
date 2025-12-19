# ⚙️ Configuración

## Variables de Entorno

### Estructura de Archivos

```
nature_marketplace/
├── .env                        # Variables locales (no commitear)
├── .env.example                # Plantilla para desarrollo
└── .env.production.example     # Plantilla para producción
```

### Variables de Desarrollo

```bash
# .env (desarrollo local)

# ============================================
# DJANGO BACKEND
# ============================================

# Modo debug (NUNCA true en producción)
DEBUG=True

# Clave secreta (generar una única para producción)
SECRET_KEY=django-insecure-dev-key-change-in-production

# Hosts permitidos
ALLOWED_HOSTS=localhost,127.0.0.1

# Orígenes CORS permitidos
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# ============================================
# BASE DE DATOS
# ============================================

# PostgreSQL
POSTGRES_DB=nature_marketplace
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
DATABASE_URL=postgres://postgres:postgres@db:5432/nature_marketplace

# ============================================
# ALMACENAMIENTO (MinIO)
# ============================================

MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
MINIO_ENDPOINT=minio:9000
MINIO_BUCKET=nature-media
MINIO_USE_SSL=False

# ============================================
# STRIPE (usar claves de test)
# ============================================

STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# ============================================
# EMAIL (desarrollo)
# ============================================

# Usar consola en desarrollo
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend

# ============================================
# FRONTEND
# ============================================

NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_MINIO_URL=http://localhost:9000
```

### Variables de Producción

```bash
# .env (producción)

# ============================================
# DJANGO BACKEND
# ============================================

DEBUG=False

# Generar con: python -c "import secrets; print(secrets.token_urlsafe(50))"
SECRET_KEY=tu-clave-secreta-muy-larga-y-unica-generada-aleatoriamente

ALLOWED_HOSTS=tu-dominio.com,www.tu-dominio.com

CORS_ALLOWED_ORIGINS=https://tu-dominio.com,https://www.tu-dominio.com

# ============================================
# BASE DE DATOS
# ============================================

POSTGRES_DB=nature_marketplace
POSTGRES_USER=nature_user
POSTGRES_PASSWORD=contraseña-muy-segura-para-postgres
DATABASE_URL=postgres://nature_user:contraseña-muy-segura@db:5432/nature_marketplace

# ============================================
# ALMACENAMIENTO (MinIO)
# ============================================

MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=contraseña-muy-segura-para-minio
MINIO_ENDPOINT=minio:9000
MINIO_BUCKET=nature-media
MINIO_USE_SSL=False

# ============================================
# STRIPE (claves de producción)
# ============================================

STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# ============================================
# EMAIL (producción)
# ============================================

EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=tu-api-key-de-sendgrid
DEFAULT_FROM_EMAIL=Nature Marketplace <noreply@tu-dominio.com>

# ============================================
# FRONTEND
# ============================================

NEXT_PUBLIC_API_URL=https://tu-dominio.com
NEXT_PUBLIC_MINIO_URL=https://tu-dominio.com/storage

# ============================================
# SEGURIDAD ADICIONAL
# ============================================

# Forzar HTTPS
SECURE_SSL_REDIRECT=True
SECURE_PROXY_SSL_HEADER=HTTP_X_FORWARDED_PROTO,https

# Cookies seguras
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True

# HSTS
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=True
SECURE_HSTS_PRELOAD=True
```

## Configuración de Django

### settings.py

```python
# backend/config/settings.py

import os
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

# Seguridad
SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-key-change-me')
DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost').split(',')

# Aplicaciones
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',
    
    # Third party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    'allauth',
    'allauth.account',
    'dj_rest_auth',
    'dj_rest_auth.registration',
    'storages',
    
    # Local apps
    'users',
    'products',
    'orders',
    'payments',
]

# Middleware
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'allauth.account.middleware.AccountMiddleware',
]

# Base de datos
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('POSTGRES_DB', 'nature_marketplace'),
        'USER': os.environ.get('POSTGRES_USER', 'postgres'),
        'PASSWORD': os.environ.get('POSTGRES_PASSWORD', 'postgres'),
        'HOST': os.environ.get('POSTGRES_HOST', 'db'),
        'PORT': os.environ.get('POSTGRES_PORT', '5432'),
    }
}

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

# JWT
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# CORS
CORS_ALLOWED_ORIGINS = os.environ.get(
    'CORS_ALLOWED_ORIGINS', 
    'http://localhost:3000'
).split(',')
CORS_ALLOW_CREDENTIALS = True

# Archivos estáticos
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'static'

# Archivos de medios (MinIO)
DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
AWS_ACCESS_KEY_ID = os.environ.get('MINIO_ROOT_USER')
AWS_SECRET_ACCESS_KEY = os.environ.get('MINIO_ROOT_PASSWORD')
AWS_STORAGE_BUCKET_NAME = os.environ.get('MINIO_BUCKET', 'nature-media')
AWS_S3_ENDPOINT_URL = f"http://{os.environ.get('MINIO_ENDPOINT', 'minio:9000')}"
AWS_S3_USE_SSL = os.environ.get('MINIO_USE_SSL', 'False').lower() == 'true'
AWS_DEFAULT_ACL = 'public-read'
AWS_QUERYSTRING_AUTH = False

# Email
EMAIL_BACKEND = os.environ.get(
    'EMAIL_BACKEND',
    'django.core.mail.backends.console.EmailBackend'
)
EMAIL_HOST = os.environ.get('EMAIL_HOST', '')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', 587))
EMAIL_USE_TLS = os.environ.get('EMAIL_USE_TLS', 'True').lower() == 'true'
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', 'noreply@example.com')

# Stripe
STRIPE_SECRET_KEY = os.environ.get('STRIPE_SECRET_KEY', '')
STRIPE_PUBLISHABLE_KEY = os.environ.get('STRIPE_PUBLISHABLE_KEY', '')
STRIPE_WEBHOOK_SECRET = os.environ.get('STRIPE_WEBHOOK_SECRET', '')

# Seguridad en producción
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
```

## Configuración de Next.js

### next.config.js

```javascript
// frontend/next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Habilitar modo standalone para Docker
  output: 'standalone',
  
  // Dominios permitidos para imágenes
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: 'minio',
      },
      {
        protocol: 'https',
        hostname: 'tu-dominio.com',
      },
    ],
  },
  
  // Variables de entorno públicas
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_MINIO_URL: process.env.NEXT_PUBLIC_MINIO_URL,
    NEXT_PUBLIC_STRIPE_KEY: process.env.NEXT_PUBLIC_STRIPE_KEY,
  },
  
  // Redirecciones
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
  
  // Headers de seguridad
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

## Configuración de Tailwind

### tailwind.config.ts

```typescript
// frontend/tailwind.config.ts

import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Colores principales
        primary: {
          DEFAULT: '#6B7B3C',
          light: '#8A9B5C',
          dark: '#4A5A2C',
        },
        secondary: {
          DEFAULT: '#1E3A5F',
          light: '#2E4A7F',
          dark: '#0E2A4F',
        },
        
        // Fondos
        background: {
          dark: '#0D1117',
          card: '#161B22',
          elevated: '#21262D',
        },
        
        // Acentos
        accent: {
          gold: '#8B6914',
          success: '#238636',
          warning: '#9E6A03',
          error: '#DA3633',
        },
      },
      
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

## Configuración de Nginx

### nginx.conf

```nginx
# nginx/nginx.conf

user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 2048;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    access_log /var/log/nginx/access.log main;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json 
               application/javascript application/xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/m;

    # Upstreams
    upstream frontend {
        server frontend:3000;
        keepalive 32;
    }

    upstream backend {
        server backend:8000;
        keepalive 32;
    }

    include /etc/nginx/conf.d/*.conf;
}
```

## Stripe

### Configuración de Webhooks

1. Ir a [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Crear nuevo endpoint: `https://tu-dominio.com/api/payments/webhook/`
3. Seleccionar eventos:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
4. Copiar el Webhook Secret a `.env`

### Claves de Test vs Producción

| Entorno | Prefijo | Uso |
|---------|---------|-----|
| Test | `sk_test_`, `pk_test_` | Desarrollo, staging |
| Live | `sk_live_`, `pk_live_` | Producción |

**Tarjetas de prueba:**
- Éxito: `4242 4242 4242 4242`
- Rechazada: `4000 0000 0000 0002`
- Requiere autenticación: `4000 0025 0000 3155`

## MinIO

### Crear Bucket

```bash
# Entrar al contenedor de MinIO
docker compose exec minio sh

# Crear bucket
mc alias set local http://localhost:9000 minioadmin minioadmin
mc mb local/nature-media
mc policy set public local/nature-media
```

### Acceder a la Consola

- URL: `http://localhost:9001`
- Usuario: valor de `MINIO_ROOT_USER`
- Contraseña: valor de `MINIO_ROOT_PASSWORD`

## Verificación de Configuración

### Checklist de Desarrollo

- [ ] `.env` creado con valores de desarrollo
- [ ] Docker Compose levanta sin errores
- [ ] Frontend accesible en `http://localhost:3000`
- [ ] Backend accesible en `http://localhost:8000`
- [ ] Admin accesible en `http://localhost:8000/admin/`
- [ ] MinIO accesible en `http://localhost:9001`
- [ ] Migraciones ejecutadas
- [ ] Superusuario creado

### Checklist de Producción

- [ ] `DEBUG=False`
- [ ] `SECRET_KEY` único y seguro
- [ ] `ALLOWED_HOSTS` configurado
- [ ] `CORS_ALLOWED_ORIGINS` configurado
- [ ] Contraseñas de BD seguras
- [ ] Claves de Stripe de producción
- [ ] Email configurado
- [ ] SSL/HTTPS habilitado
- [ ] Firewall configurado
- [ ] Backups configurados
