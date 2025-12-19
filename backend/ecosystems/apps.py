"""
Ecosystems app configuration.

This app handles tree adoption tracking, timeline events, and gallery images.
"""

from django.apps import AppConfig


class EcosystemsConfig(AppConfig):
    """Configuration for the ecosystems application."""
    
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'ecosystems'
    verbose_name = 'Tree Ecosystem Tracking'
