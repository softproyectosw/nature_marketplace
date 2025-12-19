"""
Management command to download seed images and upload them to MinIO/S3.
Run with: python manage.py upload_seed_images
"""

import os
import requests
from io import BytesIO
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.conf import settings
from products.models import Product, ProductImage

# Sample images from Unsplash (free to use)
SEED_IMAGES = {
    'tree-1': 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&q=80',
    'tree-2': 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&q=80',
    'tree-3': 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800&q=80',
    'forest-1': 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80',
    'forest-2': 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=800&q=80',
    'lagoon-1': 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&q=80',
    'lagoon-2': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    'experience-1': 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
    'experience-2': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    'experience-3': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
}

# Map products to images
PRODUCT_IMAGE_MAP = {
    'roble-andino': 'tree-1',
    'ceiba-sagrada': 'tree-2',
    'palma-de-cera': 'tree-3',
    'hectarea-bosque-andino': 'forest-1',
    'cuarto-hectarea-bosque-nublado': 'forest-2',
    'laguna-guatavita': 'lagoon-1',
    'humedal-conejera': 'lagoon-2',
    'retiro-bienestar-andino': 'experience-1',
    'caminata-bosque-niebla': 'experience-2',
    'avistamiento-ballenas': 'experience-3',
}


class Command(BaseCommand):
    help = 'Download seed images and upload them to MinIO/S3 storage'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force re-upload even if images exist',
        )

    def handle(self, *args, **options):
        force = options['force']
        
        if not getattr(settings, 'USE_S3', False):
            self.stdout.write(self.style.WARNING(
                'USE_S3 is not enabled. Images will be stored locally.\n'
                'Set USE_S3=true in environment to use MinIO/S3.'
            ))
        
        self.stdout.write('\n📸 Uploading seed images to storage...\n')
        
        products = Product.objects.all()
        uploaded = 0
        skipped = 0
        
        for product in products:
            image_key = PRODUCT_IMAGE_MAP.get(product.slug)
            if not image_key:
                self.stdout.write(f'  ⚠ No image mapping for {product.slug}')
                continue
            
            image_url = SEED_IMAGES.get(image_key)
            if not image_url:
                self.stdout.write(f'  ⚠ No image URL for {image_key}')
                continue
            
            # Check if product already has an uploaded image
            existing_image = product.gallery.filter(image__isnull=False).exclude(image='').first()
            if existing_image and not force:
                self.stdout.write(f'  ✓ {product.title} - Already has image')
                skipped += 1
                continue
            
            # Download image
            try:
                self.stdout.write(f'  ↓ Downloading image for {product.title}...')
                response = requests.get(image_url, timeout=30)
                response.raise_for_status()
                
                # Create filename
                filename = f'{product.slug}.jpg'
                
                # Get or create ProductImage
                product_image, created = ProductImage.objects.get_or_create(
                    product=product,
                    is_primary=True,
                    defaults={
                        'alt_text': product.title,
                        'display_order': 0,
                    }
                )
                
                # Save image to storage (will use S3 if configured)
                product_image.image.save(
                    filename,
                    ContentFile(response.content),
                    save=True
                )
                
                # Clear the external URL since we now have a local/S3 image
                product_image.image_url = ''
                product_image.save()
                
                uploaded += 1
                self.stdout.write(f'  ✓ {product.title} - Uploaded')
                
            except requests.RequestException as e:
                self.stdout.write(self.style.ERROR(f'  ✗ {product.title} - Failed: {e}'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'  ✗ {product.title} - Error: {e}'))
        
        self.stdout.write(self.style.SUCCESS(f'\n✅ Done! Uploaded: {uploaded}, Skipped: {skipped}'))
        
        if getattr(settings, 'USE_S3', False):
            self.stdout.write(f'\n📦 Images stored in MinIO bucket: {settings.AWS_STORAGE_BUCKET_NAME}')
            self.stdout.write(f'   Endpoint: {settings.AWS_S3_ENDPOINT_URL}')
