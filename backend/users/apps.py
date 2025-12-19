"""
Users app configuration.

This app handles user profiles, preferences, and gamification.
"""

from django.apps import AppConfig


class UsersConfig(AppConfig):
    """Configuration for the users application."""
    
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'users'
    verbose_name = 'User Management'
    
    def ready(self) -> None:
        """Import signals when app is ready."""
        # Import signals here to avoid circular imports
        # from . import signals  # noqa: F401
        pass
