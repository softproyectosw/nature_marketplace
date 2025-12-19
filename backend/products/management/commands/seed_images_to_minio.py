"""
Management command to download all seed images and upload them to MinIO/S3.
This ensures all demo images are served from MinIO instead of external URLs.

Run with: python manage.py seed_images_to_minio
"""

import requests
from io import BytesIO
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.conf import settings
from products.models import Product, ProductImage, Category
from users.models import UserProfile

# High-quality nature images from Unsplash (free to use)
PRODUCT_IMAGES = {
    # Trees
    'roble-andino': [
        'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&q=80',
        'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800&q=80',
    ],
    'ceiba-sagrada': [
        'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&q=80',
        'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&q=80',
    ],
    'palma-de-cera': [
        'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    ],
    # Forests
    'hectarea-bosque-andino': [
        'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80',
        'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=800&q=80',
    ],
    'cuarto-hectarea-bosque-nublado': [
        'https://images.unsplash.com/photo-1440342359743-84fcb8c21f21?w=800&q=80',
        'https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?w=800&q=80',
    ],
    # Lagoons
    'laguna-guatavita': [
        'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&q=80',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    ],
    'humedal-conejera': [
        'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80',
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
    ],
    # Experiences
    'retiro-bienestar-andino': [
        'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    ],
    'caminata-bosque-niebla': [
        'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=800&q=80',
        'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
    ],
    'avistamiento-ballenas': [
        'https://images.unsplash.com/photo-1568430462989-44163eb1752f?w=800&q=80',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    ],
}

# Category images
CATEGORY_IMAGES = {
    'trees': 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600&q=80',
    'forests': 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80',
    'lagoons': 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=600&q=80',
    'experiences': 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&q=80',
}

# Demo user avatars
USER_AVATARS = {
    'admin': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
    'demo': 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80',
    'maria': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
    'carlos': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    'ana': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
}


class Command(BaseCommand):
    help = 'Download all seed images and upload them to MinIO/S3 storage'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force re-upload even if images exist',
        )
        parser.add_argument(
            '--products-only',
            action='store_true',
            help='Only upload product images',
        )
        parser.add_argument(
            '--users-only',
            action='store_true',
            help='Only upload user avatars',
        )

    def handle(self, *args, **options):
        force = options['force']
        products_only = options['products_only']
        users_only = options['users_only']
        
        if not getattr(settings, 'USE_S3', False):
            self.stdout.write(self.style.ERROR(
                '❌ USE_S3 is not enabled. Cannot upload to MinIO.\n'
                'Set USE_S3=true in environment variables.'
            ))
            return
        
        self.stdout.write(f'\n📦 MinIO Configuration:')
        self.stdout.write(f'   Bucket: {settings.AWS_STORAGE_BUCKET_NAME}')
        self.stdout.write(f'   Endpoint: {settings.AWS_S3_ENDPOINT_URL}')
        custom_domain = getattr(settings, 'AWS_S3_CUSTOM_DOMAIN', '')
        if custom_domain:
            self.stdout.write(f'   Public URL: http://{custom_domain}')
        self.stdout.write('')
        
        if not users_only:
            self.upload_product_images(force)
        
        if not products_only:
            self.upload_user_avatars(force)
        
        self.stdout.write(self.style.SUCCESS('\n✅ All images uploaded to MinIO!'))

    def download_image(self, url, timeout=30):
        """Download image from URL and return content."""
        try:
            response = requests.get(url, timeout=timeout, allow_redirects=True)
            response.raise_for_status()
            
            # Verify it's an image
            content_type = response.headers.get('content-type', '')
            if 'image' not in content_type:
                return None
            
            return response.content
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'     Failed to download: {e}'))
            return None

    def upload_product_images(self, force=False):
        """Upload product images to MinIO."""
        self.stdout.write('\n🖼️  Uploading product images...')
        
        uploaded = 0
        skipped = 0
        failed = 0
        
        for product_slug, image_urls in PRODUCT_IMAGES.items():
            try:
                product = Product.objects.get(slug=product_slug)
            except Product.DoesNotExist:
                self.stdout.write(f'  ⚠ Product not found: {product_slug}')
                continue
            
            # Check if product already has uploaded images
            existing_images = product.gallery.filter(image__isnull=False).exclude(image='')
            if existing_images.exists() and not force:
                self.stdout.write(f'  ✓ {product.title} - Already has {existing_images.count()} images')
                skipped += 1
                continue
            
            # Delete existing images if force
            if force:
                product.gallery.all().delete()
            
            self.stdout.write(f'  ↓ {product.title}...')
            
            for idx, url in enumerate(image_urls):
                content = self.download_image(url)
                if not content:
                    failed += 1
                    continue
                
                # Create ProductImage
                filename = f'{product_slug}-{idx + 1}.jpg'
                product_image = ProductImage.objects.create(
                    product=product,
                    alt_text=f'{product.title} - Imagen {idx + 1}',
                    is_primary=(idx == 0),
                    display_order=idx,
                )
                
                # Save image to MinIO
                product_image.image.save(filename, ContentFile(content), save=True)
                
                # Clear external URL
                product_image.image_url = ''
                product_image.save()
                
                self.stdout.write(f'     ✓ Uploaded {filename}')
                uploaded += 1
        
        self.stdout.write(f'\n   Products: Uploaded {uploaded}, Skipped {skipped}, Failed {failed}')

    def upload_user_avatars(self, force=False):
        """Upload user avatars to MinIO."""
        self.stdout.write('\n👤 Uploading user avatars...')
        
        uploaded = 0
        skipped = 0
        
        for username, avatar_url in USER_AVATARS.items():
            try:
                profile = UserProfile.objects.select_related('user').get(user__username=username)
            except UserProfile.DoesNotExist:
                self.stdout.write(f'  ⚠ User not found: {username}')
                continue
            
            # Check if user already has uploaded photo
            if profile.photo and not force:
                self.stdout.write(f'  ✓ {username} - Already has avatar')
                skipped += 1
                continue
            
            self.stdout.write(f'  ↓ {username}...')
            
            content = self.download_image(avatar_url)
            if not content:
                continue
            
            # Save avatar to MinIO
            filename = f'{username}-avatar.jpg'
            profile.photo.save(filename, ContentFile(content), save=True)
            
            # Clear external URL
            profile.photo_url = ''
            profile.save()
            
            self.stdout.write(f'     ✓ Uploaded {filename}')
            uploaded += 1
        
        self.stdout.write(f'\n   Users: Uploaded {uploaded}, Skipped {skipped}')
