"""
Django development settings for Nature Marketplace project.

These settings are for local development only.
DO NOT use in production.
"""

from .base import *  # noqa: F401, F403

# =============================================================================
# DEBUG CONFIGURATION
# =============================================================================

DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0', 'backend']

# =============================================================================
# DATABASE CONFIGURATION
# =============================================================================

# Use SQLite for local development (easy setup, no external dependencies)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',  # noqa: F405
    }
}

# Uncomment to use PostgreSQL locally (requires DATABASE_URL in .env)
# import dj_database_url
# if os.environ.get('DATABASE_URL'):
#     DATABASES['default'] = dj_database_url.config(
#         default=os.environ.get('DATABASE_URL'),
#         conn_max_age=600,
#     )

# =============================================================================
# CORS CONFIGURATION (Development)
# =============================================================================

# Allow all origins in development for easier testing
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

# =============================================================================
# EMAIL CONFIGURATION (Development)
# =============================================================================

# Use console backend for development (prints emails to console)
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# =============================================================================
# CACHING (Development)
# =============================================================================

# Use local memory cache for development
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    }
}

# =============================================================================
# STATIC FILES (Development)
# =============================================================================

# Use simple storage in development (no compression)
STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.StaticFilesStorage'

# =============================================================================
# REST FRAMEWORK (Development)
# =============================================================================

# Add browsable API renderer for development
REST_FRAMEWORK['DEFAULT_RENDERER_CLASSES'] = [  # noqa: F405
    'rest_framework.renderers.JSONRenderer',
    'rest_framework.renderers.BrowsableAPIRenderer',
]

# Disable throttling in development
REST_FRAMEWORK['DEFAULT_THROTTLE_CLASSES'] = []  # noqa: F405

# =============================================================================
# LOGGING (Development)
# =============================================================================

LOGGING['root']['level'] = 'DEBUG'  # noqa: F405
LOGGING['loggers']['django']['level'] = 'DEBUG'  # noqa: F405

# =============================================================================
# SECURITY (Development - Relaxed)
# =============================================================================

# These are intentionally relaxed for development
CSRF_COOKIE_SECURE = False
SESSION_COOKIE_SECURE = False
SECURE_SSL_REDIRECT = False

# Disable CSRF for API endpoints in development
CSRF_TRUSTED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:8000',
    'http://127.0.0.1:*',
]

# Use only JWT authentication in development (no CSRF required)
REST_FRAMEWORK = {
    **REST_FRAMEWORK,  # noqa: F405
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
}

# =============================================================================
# DEBUG TOOLBAR (Optional)
# =============================================================================

# Uncomment to enable Django Debug Toolbar
# INSTALLED_APPS += ['debug_toolbar']
# MIDDLEWARE.insert(0, 'debug_toolbar.middleware.DebugToolbarMiddleware')
# INTERNAL_IPS = ['127.0.0.1']
