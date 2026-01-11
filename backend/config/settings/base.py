"""
Django base settings for Nature Marketplace project.

This file contains settings common to all environments.
Environment-specific settings are in development.py and production.py.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/topics/settings/
"""

import os
from pathlib import Path
from datetime import timedelta

# Load environment variables from .env file (for local development)
from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parent.parent.parent.parent / '.env')

# =============================================================================
# PATH CONFIGURATION
# =============================================================================

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# =============================================================================
# CORE SETTINGS
# =============================================================================

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get(
    'DJANGO_SECRET_KEY',
    'django-insecure-change-this-in-production-use-a-real-secret-key'
)

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# =============================================================================
# APPLICATION DEFINITION
# =============================================================================

DJANGO_APPS = [
    'jazzmin',  # Admin theme - MUST be before django.contrib.admin
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',  # Required by allauth
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'rest_framework.authtoken',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    'drf_spectacular',
    'storages',
    # django-allauth
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',
    # dj-rest-auth
    'dj_rest_auth',
    'dj_rest_auth.registration',
]

LOCAL_APPS = [
    'users.apps.UsersConfig',
    'products.apps.ProductsConfig',
    'orders.apps.OrdersConfig',
    'payments.apps.PaymentsConfig',
    'ecosystems.apps.EcosystemsConfig',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

# =============================================================================
# MIDDLEWARE
# =============================================================================

MIDDLEWARE = [
    # Security middleware should be first
    'django.middleware.security.SecurityMiddleware',
    # Whitenoise for static files (before other middleware)
    'whitenoise.middleware.WhiteNoiseMiddleware',
    # CORS middleware must be before CommonMiddleware
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    # Allauth middleware
    'allauth.account.middleware.AccountMiddleware',
]

# =============================================================================
# URL CONFIGURATION
# =============================================================================

ROOT_URLCONF = 'config.urls'

# =============================================================================
# TEMPLATE CONFIGURATION
# =============================================================================

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# =============================================================================
# WSGI CONFIGURATION
# =============================================================================

WSGI_APPLICATION = 'config.wsgi.application'

# =============================================================================
# DATABASE CONFIGURATION
# =============================================================================

# Default to SQLite for development, override in environment-specific settings
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# =============================================================================
# PASSWORD VALIDATION
# =============================================================================

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 8,
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# =============================================================================
# INTERNATIONALIZATION
# =============================================================================

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Supported languages
LANGUAGES = [
    ('en', 'English'),
    ('es', 'Spanish'),
]

# =============================================================================
# STATIC FILES (CSS, JavaScript, Images)
# =============================================================================

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [
    BASE_DIR / 'static',
]

# Whitenoise configuration for static file compression
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# =============================================================================
# MEDIA FILES (User uploads)
# =============================================================================

# Public URL path for user-uploaded media.
# We standardize on /storage/ so Nginx can serve either local files or proxy to MinIO.
MEDIA_URL = '/storage/'
MEDIA_ROOT = BASE_DIR / 'media'

# =============================================================================
# DJANGO REST FRAMEWORK
# =============================================================================

REST_FRAMEWORK = {
    # Authentication
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    
    # Permissions
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    
    # Pagination
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    
    # Filtering
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    
    # Throttling (rate limiting)
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '1000/hour',
        'user': '5000/hour',
    },
    
    # Schema generation
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    
    # Exception handling
    'EXCEPTION_HANDLER': 'rest_framework.views.exception_handler',
    
    # Renderers
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
}

# =============================================================================
# JWT CONFIGURATION
# =============================================================================

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

# =============================================================================
# CORS CONFIGURATION
# =============================================================================

# Will be overridden in environment-specific settings
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# =============================================================================
# API DOCUMENTATION (drf-spectacular)
# =============================================================================

SPECTACULAR_SETTINGS = {
    'TITLE': 'Nature Marketplace API',
    'DESCRIPTION': 'API for eco-luxury marketplace - tree adoption, wellness retreats, and sustainable products',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
    'TAGS': [
        {'name': 'Products', 'description': 'Product catalog operations'},
        {'name': 'Orders', 'description': 'Cart and order management'},
        {'name': 'Payments', 'description': 'Payment processing'},
        {'name': 'Ecosystems', 'description': 'Tree tracking and adoption'},
        {'name': 'Users', 'description': 'User management and profiles'},
    ],
}

# =============================================================================
# DJANGO-ALLAUTH CONFIGURATION
# =============================================================================

SITE_ID = 1

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
]

# Account settings
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_USERNAME_REQUIRED = False
ACCOUNT_AUTHENTICATION_METHOD = 'email'
ACCOUNT_EMAIL_VERIFICATION = 'optional'
ACCOUNT_UNIQUE_EMAIL = True

# Social account settings
SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'SCOPE': ['profile', 'email'],
        'AUTH_PARAMS': {'access_type': 'online'},
        'APP': {
            'client_id': os.environ.get('GOOGLE_CLIENT_ID', ''),
            'secret': os.environ.get('GOOGLE_CLIENT_SECRET', ''),
        }
    }
}

# REST Auth settings
REST_AUTH = {
    'USE_JWT': True,
    'JWT_AUTH_HTTPONLY': False,
    'SESSION_LOGIN': False,
}

# =============================================================================
# FILE STORAGE CONFIGURATION
# =============================================================================

# Default: Local file storage (works with Hostinger, VPS, etc.)
# Files are stored in MEDIA_ROOT and served via MEDIA_URL
# For S3/MinIO, set USE_S3=true in environment variables

USE_S3 = os.environ.get('USE_S3', 'false').lower() == 'true'

# Debug: Print S3 configuration status
print(f"[Settings] USE_S3={USE_S3}")

if USE_S3:
    # Support both AWS_* and MINIO_* variable names for flexibility
    AWS_S3_ENDPOINT_URL = os.environ.get('AWS_S3_ENDPOINT_URL') or os.environ.get('MINIO_ENDPOINT_URL', '')
    AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID') or os.environ.get('MINIO_ACCESS_KEY', '')
    AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY') or os.environ.get('MINIO_SECRET_KEY', '')
    AWS_STORAGE_BUCKET_NAME = os.environ.get('AWS_STORAGE_BUCKET_NAME') or os.environ.get('MINIO_BUCKET', 'media')
    
    # SSL configuration
    minio_use_ssl = os.environ.get('AWS_S3_USE_SSL') or os.environ.get('MINIO_USE_SSL', 'false')
    AWS_S3_USE_SSL = minio_use_ssl.lower() == 'true'
    
    AWS_QUERYSTRING_AUTH = False
    AWS_DEFAULT_ACL = 'public-read'
    
    # Custom domain for public URLs (browser-accessible URL)
    # For MinIO dev: localhost:9000/bucket
    # For production: your-cdn.com or s3.region.amazonaws.com
    AWS_S3_CUSTOM_DOMAIN = os.environ.get('AWS_S3_CUSTOM_DOMAIN') or os.environ.get('MINIO_PUBLIC_HOST', '')
    
    if AWS_S3_CUSTOM_DOMAIN:
        AWS_S3_URL_PROTOCOL = 'https:' if AWS_S3_USE_SSL else 'http:'
    
    # Django 4.2+ uses STORAGES instead of DEFAULT_FILE_STORAGE
    STORAGES = {
        "default": {
            "BACKEND": "storages.backends.s3boto3.S3Boto3Storage",
        },
        "staticfiles": {
            "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
        },
    }
    
    # Debug: Print S3 configuration
    print(f"[Settings] S3 Endpoint: {AWS_S3_ENDPOINT_URL}")
    print(f"[Settings] S3 Bucket: {AWS_STORAGE_BUCKET_NAME}")
    print(f"[Settings] S3 Custom Domain: {AWS_S3_CUSTOM_DOMAIN}")

# =============================================================================
# STRIPE CONFIGURATION
# =============================================================================

STRIPE_SECRET_KEY = os.environ.get('STRIPE_SECRET_KEY', '')
STRIPE_PUBLISHABLE_KEY = os.environ.get('STRIPE_PUBLISHABLE_KEY', '')
STRIPE_WEBHOOK_SECRET = os.environ.get('STRIPE_WEBHOOK_SECRET', '')

# =============================================================================
# LOGGING CONFIGURATION
# =============================================================================

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': os.environ.get('DJANGO_LOG_LEVEL', 'INFO'),
            'propagate': False,
        },
        'django.request': {
            'handlers': ['console'],
            'level': 'ERROR',
            'propagate': False,
        },
    },
}

# =============================================================================
# JAZZMIN ADMIN THEME
# =============================================================================

JAZZMIN_SETTINGS = {
    # Title & Branding
    "site_title": "Nature Admin",
    "site_header": "Nature Marketplace",
    "site_brand": "Nature",
    "site_logo": None,
    "login_logo": None,
    "login_logo_dark": None,
    "site_logo_classes": "img-circle",
    "site_icon": None,
    "welcome_sign": "Welcome to Nature Marketplace Admin",
    "copyright": "Nature Marketplace",
    
    # Search
    "search_model": ["products.Product", "users.User", "orders.Order"],
    
    # User Menu
    "topmenu_links": [
        {"name": "Home", "url": "admin:index", "permissions": ["auth.view_user"]},
        {"name": "API Docs", "url": "/api/docs/", "new_window": True},
        {"name": "View Site", "url": "/", "new_window": True},
    ],
    
    # Side Menu
    "show_sidebar": True,
    "navigation_expanded": True,
    "hide_apps": [],
    "hide_models": [],
    "order_with_respect_to": [
        "products",
        "orders", 
        "payments",
        "users",
        "ecosystems",
    ],
    
    # Icons - using Font Awesome
    "icons": {
        "auth": "fas fa-users-cog",
        "auth.user": "fas fa-user",
        "auth.Group": "fas fa-users",
        "users.User": "fas fa-user-circle",
        "products.Product": "fas fa-tree",
        "products.Category": "fas fa-tags",
        "products.ProductImage": "fas fa-images",
        "products.ProductUpdate": "fas fa-bell",
        "products.SponsorshipUnit": "fas fa-leaf",
        "products.UnitImage": "fas fa-camera",
        "products.UnitUpdate": "fas fa-sync",
        "orders.Order": "fas fa-shopping-cart",
        "orders.OrderItem": "fas fa-box",
        "orders.Cart": "fas fa-shopping-basket",
        "orders.CartItem": "fas fa-cube",
        "payments.Payment": "fas fa-credit-card",
        "ecosystems.Ecosystem": "fas fa-globe-americas",
    },
    "default_icon_parents": "fas fa-folder",
    "default_icon_children": "fas fa-circle",
    
    # Related Modal
    "related_modal_active": True,
    
    # UI Tweaks
    "custom_css": None,
    "custom_js": None,
    "use_google_fonts_cdn": True,
    "show_ui_builder": False,
    
    # Change view
    "changeform_format": "horizontal_tabs",
    "changeform_format_overrides": {
        "auth.user": "collapsible",
        "auth.group": "vertical_tabs",
    },
}

JAZZMIN_UI_TWEAKS = {
    "navbar_small_text": False,
    "footer_small_text": False,
    "body_small_text": False,
    "brand_small_text": False,
    "brand_colour": "navbar-dark",
    "accent": "accent-primary",
    "navbar": "navbar-dark navbar-secondary",
    "no_navbar_border": True,
    "navbar_fixed": True,
    "layout_boxed": False,
    "footer_fixed": False,
    "sidebar_fixed": True,
    "sidebar": "sidebar-dark-primary",
    "sidebar_nav_small_text": False,
    "sidebar_disable_expand": False,
    "sidebar_nav_child_indent": False,
    "sidebar_nav_compact_style": False,
    "sidebar_nav_legacy_style": False,
    "sidebar_nav_flat_style": False,
    "theme": "flatly",
    "dark_mode_theme": "slate",
    "button_classes": {
        "primary": "btn-primary",
        "secondary": "btn-outline-secondary",
        "info": "btn-info",
        "warning": "btn-warning",
        "danger": "btn-danger",
        "success": "btn-success"
    }
}
