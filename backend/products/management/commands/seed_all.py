"""
Management command to seed the entire database with realistic test data.
Run with: python manage.py seed_all

Creates:
- Test users (admin, regular users)
- Categories
- Products with images
- Orders and order items
- Carts
"""

import hashlib
import random
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from products.models import Category, Product, ProductImage
from orders.models import Order, OrderItem, Cart, CartItem
from users.models import UserProfile

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed the entire database with realistic test data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before seeding',
        )
        parser.add_argument(
            '--skip-images',
            action='store_true',
            help='Skip uploading images to MinIO',
        )

    def handle(self, *args, **options):
        from django.core.management import call_command
        from django.conf import settings
        
        if options['clear']:
            self.stdout.write('Clearing existing data...')
            OrderItem.objects.all().delete()
            Order.objects.all().delete()
            CartItem.objects.all().delete()
            Cart.objects.all().delete()
            ProductImage.objects.all().delete()
            Product.objects.all().delete()
            Category.objects.all().delete()
            UserProfile.objects.all().delete()
            User.objects.filter(is_superuser=False).delete()
            self.stdout.write(self.style.WARNING('  Data cleared!'))

        self.stdout.write('\n🌱 Seeding Nature Marketplace Database...\n')
        
        # 1. Create Users
        users = self.create_users()
        
        # 2. Create Categories
        categories = self.create_categories()
        
        # 3. Create Products
        products = self.create_products(categories)
        
        # 4. Create Orders for test users
        self.create_orders(users, products)
        
        # 5. Create active carts
        self.create_carts(users, products)
        
        self.stdout.write(self.style.SUCCESS('\n✅ Database seeded successfully!\n'))
        self.print_summary()
        self.print_test_credentials()
        
        # 6. Upload images to MinIO (if enabled)
        if not options.get('skip_images') and getattr(settings, 'USE_S3', False):
            self.stdout.write('\n📸 Uploading images to MinIO...')
            try:
                call_command('seed_images_to_minio', force=options['clear'])
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'  ⚠ Image upload failed: {e}'))
                self.stdout.write('  Run manually: python manage.py seed_images_to_minio')
        elif not getattr(settings, 'USE_S3', False):
            self.stdout.write(self.style.WARNING('\n⚠ USE_S3 not enabled - images not uploaded to MinIO'))

    def _pick_demo_images(self, slug: str, product_type: str, provided: list[str] | None) -> list[str]:
        pools: dict[str, list[str]] = {
            'tree': [
                'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1200&q=80',
                'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=1200&q=80',
                'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=1200&q=80',
                'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=1200&q=80',
            ],
            'forest': [
                'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=80',
                'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=1200&q=80',
                'https://images.unsplash.com/photo-1440342359743-84fcb8c21f21?w=1200&q=80',
                'https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?w=1200&q=80',
            ],
            'lagoon': [
                'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1200&q=80',
                'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
                'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&q=80',
                'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80',
            ],
            'experience': [
                'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&q=80',
                'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80',
                'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=1200&q=80',
                'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
            ],
        }

        candidates = [u for u in (provided or []) if u]
        for u in pools.get(product_type, []):
            if u not in candidates:
                candidates.append(u)

        if not candidates:
            candidates = pools.get('forest', [])

        seed = int(hashlib.md5(slug.encode('utf-8')).hexdigest(), 16)
        rnd = random.Random(seed)
        rnd.shuffle(candidates)

        picked: list[str] = []
        for u in candidates:
            if u and u not in picked:
                picked.append(u)
            if len(picked) >= 2:
                break

        if len(picked) == 1:
            picked.append(picked[0])

        return picked

    def create_users(self):
        self.stdout.write('👤 Creating users...')
        
        users_data = [
            {
                'email': 'admin@nature.com',
                'username': 'admin',
                'password': 'admin123',
                'first_name': 'Admin',
                'last_name': 'Nature',
                'is_staff': True,
                'is_superuser': True,
            },
            {
                'email': 'maria@test.com',
                'username': 'maria',
                'password': 'test123',
                'first_name': 'María',
                'last_name': 'García',
                'is_staff': False,
                'is_superuser': False,
            },
            {
                'email': 'carlos@test.com',
                'username': 'carlos',
                'password': 'test123',
                'first_name': 'Carlos',
                'last_name': 'Rodríguez',
                'is_staff': False,
                'is_superuser': False,
            },
            {
                'email': 'ana@test.com',
                'username': 'ana',
                'password': 'test123',
                'first_name': 'Ana',
                'last_name': 'Martínez',
                'is_staff': False,
                'is_superuser': False,
            },
            {
                'email': 'demo@nature.com',
                'username': 'demo',
                'password': 'demo123',
                'first_name': 'Demo',
                'last_name': 'User',
                'is_staff': False,
                'is_superuser': False,
            },
        ]
        
        users = {}
        for user_data in users_data:
            email = user_data.pop('email')
            password = user_data.pop('password')
            username = user_data.get('username', email.split('@')[0])
            
            user, created = User.objects.get_or_create(
                username=username,
                defaults={'email': email, **user_data}
            )
            if created:
                user.set_password(password)
                user.save()
            
            # Create UserProfile for each user
            profile, profile_created = UserProfile.objects.get_or_create(
                user=user,
                defaults={
                    'display_name': username,
                    'theme': 'dark',
                    'currency': 'USD',
                }
            )
            
            users[email] = user
            status = 'Created' if created else 'Exists'
            self.stdout.write(f'  {email} - {status}')
        
        return users

    def create_categories(self):
        self.stdout.write('\n📁 Creating categories...')
        
        categories_data = [
            {'name': 'Bosque Vivo', 'slug': 'bosque-vivo', 'icon': 'forest', 'description': 'Adopta un metro cuadrado de bosque y sigue su crecimiento en tiempo real', 'display_order': 1},
            {'name': 'Guardianes del Agua', 'slug': 'guardianes-del-agua', 'icon': 'water', 'description': 'Apadrina un cuerpo de agua y recibe historias del territorio que estás protegiendo', 'display_order': 2},
            {'name': 'Economía del Corazón', 'slug': 'economia-del-corazon', 'icon': 'volunteer_activism', 'description': 'Apoya proyectos regenerativos y de educación ambiental', 'display_order': 3},
            {'name': 'Micro-retreats', 'slug': 'micro-retreats', 'icon': 'hiking', 'description': 'Experiencias inmersivas en ecosistemas vivos, diseñadas para reconectar', 'display_order': 4},
        ]
        
        categories = {}
        for cat_data in categories_data:
            cat, created = Category.objects.get_or_create(
                slug=cat_data['slug'],
                defaults=cat_data
            )
            categories[cat_data['slug']] = cat
            status = 'Created' if created else 'Exists'
            self.stdout.write(f'  {cat.name} - {status}')

        legacy_slugs = ['trees', 'forests', 'lagoons', 'experiences']
        Category.objects.filter(slug__in=legacy_slugs).update(is_active=False)
        
        return categories

    def create_products(self, categories):
        self.stdout.write('\n🌳 Creating products...')
        
        # Base URL for MinIO images (will be uploaded separately)
        minio_base = '/api/media/products'
        
        products_data = [
            # Trees
            {
                'data': {
                    'title': 'Roble Andino',
                    'slug': 'roble-andino',
                    'category': categories['bosque-vivo'],
                    'product_type': 'tree',
                    'price': Decimal('49.00'),
                    'pricing_type': 'annual',
                    'short_description': 'Apadrina un majestuoso Roble Andino en las montañas de Boyacá',
                    'description': 'El Roble Andino (Quercus humboldtii) es una especie nativa de los bosques de niebla colombianos. Tu apadrinamiento ayuda a proteger este árbol centenario y su ecosistema. Recibirás actualizaciones periódicas con fotos y datos sobre el crecimiento de tu árbol.',
                    'purpose': 'Proteger los bosques de niebla y su biodiversidad única',
                    'impact_description': 'Cada roble absorbe aproximadamente 22kg de CO2 al año y provee hogar a decenas de especies.',
                    'rating': Decimal('4.9'),
                    'reviews_count': 128,
                    'co2_offset_kg': Decimal('22'),
                    'location_name': 'Boyacá, Colombia',
                    'location_lat': Decimal('5.5353'),
                    'location_lng': Decimal('-73.3678'),
                    'species': 'Quercus humboldtii',
                    'is_unlimited_stock': True,
                    'is_featured': True,
                    'features': ['Certificado digital', 'Actualizaciones mensuales', 'Coordenadas GPS', 'Nombre personalizado'],
                },
                'image_url': 'https://lh3.googleusercontent.com/aida-public/AB6AXuA57d8-crjcjBcF7YSMwpjlCwOgxjuIMr_-ft7LPHaYWNRZFBtgEyVb6ik914ymF0nlxS0sy3CpfzfuzEg6n1aIgHgZ73mAfGBEHFE5i6ILJCiFjSG582VjSgeNDxH2kRfEKNmuhxFJDH9pQ4jzrpUX3QdM6tdqCNMk-prHTFJ3M52-0YSf8X78H3lFF1fPMb2GeFHr-gQpLKK9qDfefwoYzzcKoXYY0qSipZsvnaY8HN_il1xJdV5q7wirCuBPxSOFwN0EIh4aPV4w',
            },
            {
                'data': {
                    'title': 'Ceiba Sagrada',
                    'slug': 'ceiba-sagrada',
                    'category': categories['bosque-vivo'],
                    'product_type': 'tree',
                    'price': Decimal('79.00'),
                    'pricing_type': 'annual',
                    'short_description': 'La Ceiba es el árbol sagrado de las culturas amazónicas',
                    'description': 'La Ceiba pentandra puede alcanzar más de 70 metros de altura. Es considerada sagrada por muchas culturas indígenas de América. Apadrinar una Ceiba es conectar con la espiritualidad ancestral de la selva.',
                    'purpose': 'Preservar árboles sagrados y la cultura indígena amazónica',
                    'impact_description': 'Las Ceibas son hogar de cientos de especies y son fundamentales para el ecosistema amazónico.',
                    'rating': Decimal('4.8'),
                    'reviews_count': 89,
                    'co2_offset_kg': Decimal('45'),
                    'location_name': 'Amazonas, Colombia',
                    'location_lat': Decimal('-1.0123'),
                    'location_lng': Decimal('-69.9876'),
                    'species': 'Ceiba pentandra',
                    'stock': 5,
                    'is_unlimited_stock': False,
                    'is_featured': True,
                    'features': ['Árbol centenario', 'Visita guiada incluida', 'Certificado físico', 'Conexión con comunidad indígena'],
                },
                'image_url': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDc1vS64gPJ7mXS0GZZ4J9GV3_vtbWnbqLpusdOe_mhtvKZl9800EWClKpEZdAlyu3an5ggEVNg7N47tWtonYYZ8DmGfRsPJxg0ciMgo7upHpfxUxlArq869hYXzEpwQLC8Uzu2y87lPyuSkSXOHREny1z0SNoRC7BiCi8FS6cOWljPP1Fz_GAVL2S0UTtXUxcLoAZ7YDvoBokf-hWw6QOmnSzCmTLX4xmCnwJ_sCpwPySc0wos40KisRYa9s7E7kq3z9ZHt-09Nghy',
            },
            {
                'data': {
                    'title': 'Palma de Cera',
                    'slug': 'palma-de-cera',
                    'category': categories['bosque-vivo'],
                    'product_type': 'tree',
                    'price': Decimal('99.00'),
                    'pricing_type': 'annual',
                    'short_description': 'El árbol nacional de Colombia, la palma más alta del mundo',
                    'description': 'La Palma de Cera del Quindío puede alcanzar hasta 60 metros de altura, siendo la palma más alta del mundo. Es el árbol nacional de Colombia y está en peligro de extinción.',
                    'rating': Decimal('5.0'),
                    'reviews_count': 45,
                    'co2_offset_kg': Decimal('35'),
                    'location_name': 'Valle del Cocora, Quindío',
                    'location_lat': Decimal('4.6389'),
                    'location_lng': Decimal('-75.4875'),
                    'species': 'Ceroxylon quindiuense',
                    'stock': 10,
                    'is_unlimited_stock': False,
                    'is_featured': True,
                    'features': ['Árbol nacional', 'Especie en peligro', 'Tour al Valle del Cocora', 'Placa conmemorativa'],
                },
                'image_url': 'https://lh3.googleusercontent.com/aida-public/AB6AXuA57d8-crjcjBcF7YSMwpjlCwOgxjuIMr_-ft7LPHaYWNRZFBtgEyVb6ik914ymF0nlxS0sy3CpfzfuzEg6n1aIgHgZ73mAfGBEHFE5i6ILJCiFjSG582VjSgeNDxH2kRfEKNmuhxFJDH9pQ4jzrpUX3QdM6tdqCNMk-prHTFJ3M52-0YSf8X78H3lFF1fPMb2GeFHr-gQpLKK9qDfefwoYzzcKoXYY0qSipZsvnaY8HN_il1xJdV5q7wirCuBPxSOFwN0EIh4aPV4w',
            },
            # Forests
            {
                'data': {
                    'title': 'Hectárea de Bosque Andino',
                    'slug': 'hectarea-bosque-andino',
                    'category': categories['bosque-vivo'],
                    'product_type': 'forest',
                    'price': Decimal('299.00'),
                    'pricing_type': 'annual',
                    'short_description': 'Protege una hectárea completa de bosque andino',
                    'description': 'Una hectárea de bosque andino alberga cientos de especies de flora y fauna. Tu apadrinamiento garantiza su protección y mantenimiento por un año completo.',
                    'rating': Decimal('4.9'),
                    'reviews_count': 45,
                    'co2_offset_kg': Decimal('500'),
                    'location_name': 'Sierra Nevada, Colombia',
                    'area_size': '1 hectárea',
                    'stock': 3,
                    'is_unlimited_stock': False,
                    'is_featured': True,
                    'is_collective': True,
                    'features': ['10,000 m²', 'Monitoreo satelital', 'Reporte trimestral', 'Visita anual'],
                },
                'image_url': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBX4GrNj0sPqAN5xJxaK64uqZpTTEKtSygiiYRmXrZxt4JO1G2-xrHV9g9UNTrwj6087J-dT1TcDXjVvl_uGkXDHj3PTVYgO3CY80SS3Y9jwNPu0bu9BrI3ouI1PJJKYWdOZ25Jbhwev1RIldC_gsZoj8zZEHYsrOLOpaqJBVxN_S_irVlY3NdiYbDtH9TwvmsrbnX9ZVCbvg7r8PJpb1Z8puza8b7nV2J5tQ4s-I_BcPTbVrDW10_XQ8aRtshGzZI-yYRXQhGqYfsy',
            },
            {
                'data': {
                    'title': '1/4 Hectárea Bosque Nublado',
                    'slug': 'cuarto-hectarea-bosque-nublado',
                    'category': categories['bosque-vivo'],
                    'product_type': 'forest',
                    'price': Decimal('99.00'),
                    'pricing_type': 'annual',
                    'short_description': 'Protege 2,500 m² de bosque de niebla',
                    'description': 'Los bosques nublados son ecosistemas únicos que capturan agua de las nubes. Protege este tesoro natural y contribuye a la conservación del agua.',
                    'rating': Decimal('4.7'),
                    'reviews_count': 67,
                    'co2_offset_kg': Decimal('125'),
                    'location_name': 'Chingaza, Colombia',
                    'area_size': '2,500 m²',
                    'stock': 0,
                    'is_unlimited_stock': False,
                    'features': ['Ecosistema único', 'Fuente de agua', 'Biodiversidad extrema'],
                },
                'image_url': 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-6GUNZKUR7_k_ZGZ0RbbevuXmvn9LOA0ukszskzKq8Qu9DAcS9RnbeRMCxxsDilRqpucyAIDDsCW0VhAIoXYPZY2imaFkgPFz2r5wammp0aiUc_pV6nBF4EpzpYMnoTR9par3UGszUC9mdx5Nfeee2UrRzkdNKqzzvz-N_HZNKBu2me2QX3-WBzBTL9irFLpr6fbBD8cPxjRc2mAWYdNquWY53gmbKoXckcMcyXc7M3OrNBHvmm5DBw_tAB74cN4BB1tFvBUSvJG3',
            },
            # Lagoons
            {
                'data': {
                    'title': 'Laguna de Guatavita',
                    'slug': 'laguna-guatavita',
                    'category': categories['guardianes-del-agua'],
                    'product_type': 'lagoon',
                    'price': Decimal('149.00'),
                    'pricing_type': 'annual',
                    'short_description': 'Contribuye a la conservación de la legendaria Laguna de Guatavita',
                    'description': 'La Laguna de Guatavita es un sitio sagrado para los Muiscas y origen de la leyenda de El Dorado. Tu aporte ayuda a preservar este patrimonio cultural y natural.',
                    'rating': Decimal('4.8'),
                    'reviews_count': 34,
                    'location_name': 'Cundinamarca, Colombia',
                    'area_size': '1,000 m²',
                    'is_unlimited_stock': True,
                    'features': ['Sitio sagrado', 'Patrimonio cultural', 'Leyenda de El Dorado'],
                },
                'image_url': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCb7qaFmCmW_aGhTbq42JWuifGkh94nQpfJmiA9_F7aE8mZuTVw1S2ZtiDI9B-5jU0vLKt5IKaOtya60cBgZj2wKfJ3j4IsKyEeBlu1TPRyskyshIO7j0j_BxGAd7hYkVPPU7FTpDe-STzCv0orJsz-2tY9VRCRpR1lvmaocHMDNtF3VpyzQfbrLD7ATHv2_gmJKdZZR6lIv6ypEojiay4KM3doCIohLK-JXcU-pINVpOCYB--Fz29aHoLH9qeX1Teo5j7JmZcnb07j',
            },
            {
                'data': {
                    'title': 'Humedal La Conejera',
                    'slug': 'humedal-conejera',
                    'category': categories['guardianes-del-agua'],
                    'product_type': 'lagoon',
                    'price': Decimal('89.00'),
                    'pricing_type': 'annual',
                    'short_description': 'Protege el humedal urbano más importante de Bogotá',
                    'description': 'El Humedal La Conejera es refugio de más de 100 especies de aves. Tu aporte ayuda a su conservación en medio de la ciudad.',
                    'rating': Decimal('4.6'),
                    'reviews_count': 52,
                    'location_name': 'Bogotá, Colombia',
                    'area_size': '500 m²',
                    'stock': 10,
                    'is_unlimited_stock': False,
                    'features': ['Humedal urbano', '100+ especies de aves', 'Educación ambiental'],
                },
                'image_url': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCb7qaFmCmW_aGhTbq42JWuifGkh94nQpfJmiA9_F7aE8mZuTVw1S2ZtiDI9B-5jU0vLKt5IKaOtya60cBgZj2wKfJ3j4IsKyEeBlu1TPRyskyshIO7j0j_BxGAd7hYkVPPU7FTpDe-STzCv0orJsz-2tY9VRCRpR1lvmaocHMDNtF3VpyzQfbrLD7ATHv2_gmJKdZZR6lIv6ypEojiay4KM3doCIohLK-JXcU-pINVpOCYB--Fz29aHoLH9qeX1Teo5j7JmZcnb07j',
            },
            # Experiences
            {
                'data': {
                    'title': 'Retiro de Bienestar Andino',
                    'slug': 'retiro-bienestar-andino',
                    'category': categories['micro-retreats'],
                    'product_type': 'experience',
                    'price': Decimal('599.00'),
                    'pricing_type': 'one_time',
                    'short_description': '3 días de conexión con la naturaleza en los Andes',
                    'description': 'Vive una experiencia transformadora en las montañas andinas. Incluye alojamiento en eco-lodge, alimentación orgánica, yoga al amanecer, meditación guiada y caminatas por senderos ancestrales.',
                    'rating': Decimal('4.9'),
                    'reviews_count': 23,
                    'location_name': 'Villa de Leyva, Colombia',
                    'duration': '3 días / 2 noches',
                    'max_participants': 12,
                    'includes': ['Alojamiento eco-lodge', 'Alimentación orgánica', 'Transporte desde Bogotá', 'Guía experto', 'Yoga y meditación', 'Caminata guiada'],
                    'stock': 12,
                    'is_unlimited_stock': False,
                    'is_featured': True,
                    'features': ['Todo incluido', 'Grupos pequeños', 'Certificado de participación'],
                },
                'image_url': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCb7qaFmCmW_aGhTbq42JWuifGkh94nQpfJmiA9_F7aE8mZuTVw1S2ZtiDI9B-5jU0vLKt5IKaOtya60cBgZj2wKfJ3j4IsKyEeBlu1TPRyskyshIO7j0j_BxGAd7hYkVPPU7FTpDe-STzCv0orJsz-2tY9VRCRpR1lvmaocHMDNtF3VpyzQfbrLD7ATHv2_gmJKdZZR6lIv6ypEojiay4KM3doCIohLK-JXcU-pINVpOCYB--Fz29aHoLH9qeX1Teo5j7JmZcnb07j',
            },
            {
                'data': {
                    'title': 'Caminata Bosque de Niebla',
                    'slug': 'caminata-bosque-niebla',
                    'category': categories['micro-retreats'],
                    'product_type': 'experience',
                    'price': Decimal('89.00'),
                    'pricing_type': 'one_time',
                    'short_description': 'Explora el mágico bosque de niebla con guías expertos',
                    'description': 'Una caminata de 4 horas por senderos ancestrales del bosque de niebla. Observación de aves, identificación de flora nativa y conexión con la naturaleza.',
                    'rating': Decimal('4.7'),
                    'reviews_count': 156,
                    'location_name': 'Chicaque, Colombia',
                    'duration': '4 horas',
                    'max_participants': 15,
                    'includes': ['Guía bilingüe', 'Refrigerio orgánico', 'Seguro de aventura', 'Binoculares'],
                    'stock': 15,
                    'is_unlimited_stock': False,
                    'features': ['Apto para principiantes', 'Observación de aves', 'Fotografía de naturaleza'],
                },
                'image_url': 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-6GUNZKUR7_k_ZGZ0RbbevuXmvn9LOA0ukszskzKq8Qu9DAcS9RnbeRMCxxsDilRqpucyAIDDsCW0VhAIoXYPZY2imaFkgPFz2r5wammp0aiUc_pV6nBF4EpzpYMnoTR9par3UGszUC9mdx5Nfeee2UrRzkdNKqzzvz-N_HZNKBu2me2QX3-WBzBTL9irFLpr6fbBD8cPxjRc2mAWYdNquWY53gmbKoXckcMcyXc7M3OrNBHvmm5DBw_tAB74cN4BB1tFvBUSvJG3',
            },
            {
                'data': {
                    'title': 'Avistamiento de Ballenas',
                    'slug': 'avistamiento-ballenas',
                    'category': categories['micro-retreats'],
                    'product_type': 'experience',
                    'price': Decimal('299.00'),
                    'pricing_type': 'one_time',
                    'short_description': 'Observa ballenas jorobadas en el Pacífico colombiano',
                    'description': 'Vive la magia de ver ballenas jorobadas en su migración anual. Incluye transporte en lancha, guía especializado y contribución a la conservación marina.',
                    'rating': Decimal('4.9'),
                    'reviews_count': 78,
                    'location_name': 'Bahía Solano, Chocó',
                    'duration': '6 horas',
                    'max_participants': 10,
                    'includes': ['Transporte en lancha', 'Guía marino', 'Chaleco salvavidas', 'Refrigerio', 'Seguro'],
                    'stock': 20,
                    'is_unlimited_stock': False,
                    'is_featured': True,
                    'features': ['Temporada Jul-Oct', 'Avistamiento garantizado', 'Fotografía incluida'],
                },
                'image_url': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCb7qaFmCmW_aGhTbq42JWuifGkh94nQpfJmiA9_F7aE8mZuTVw1S2ZtiDI9B-5jU0vLKt5IKaOtya60cBgZj2wKfJ3j4IsKyEeBlu1TPRyskyshIO7j0j_BxGAd7hYkVPPU7FTpDe-STzCv0orJsz-2tY9VRCRpR1lvmaocHMDNtF3VpyzQfbrLD7ATHv2_gmJKdZZR6lIv6ypEojiay4KM3doCIohLK-JXcU-pINVpOCYB--Fz29aHoLH9qeX1Teo5j7JmZcnb07j',
            },
            {
                'data': {
                    'title': 'Economía del Corazón - Educación Ambiental',
                    'slug': 'economia-del-corazon-educacion-ambiental',
                    'category': categories['economia-del-corazon'],
                    'product_type': 'experience',
                    'price': Decimal('25.00'),
                    'pricing_type': 'one_time',
                    'short_description': 'Apoya talleres y materiales de educación ambiental en comunidades locales',
                    'description': 'Tu aporte financia talleres, guías y actividades educativas enfocadas en conservación, restauración y cuidado del territorio.',
                    'rating': Decimal('5.0'),
                    'reviews_count': 0,
                    'is_unlimited_stock': True,
                },
                'image_url': 'https://images.unsplash.com/photo-1469474968028-56623f02e42e',
            },
            {
                'data': {
                    'title': 'Economía del Corazón - Proyectos Regenerativos',
                    'slug': 'economia-del-corazon-proyectos-regenerativos',
                    'category': categories['economia-del-corazon'],
                    'product_type': 'experience',
                    'price': Decimal('50.00'),
                    'pricing_type': 'one_time',
                    'short_description': 'Acelera proyectos regenerativos y guardianía comunitaria del territorio',
                    'description': 'Contribuye al fortalecimiento de iniciativas locales: restauración, viveros, monitoreo y economía comunitaria.',
                    'rating': Decimal('5.0'),
                    'reviews_count': 0,
                    'is_unlimited_stock': True,
                },
                'image_url': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
            },
        ]
        
        products = {}
        for item in products_data:
            prod_data = item['data']
            image_urls = self._pick_demo_images(
                slug=prod_data['slug'],
                product_type=prod_data.get('product_type', ''),
                provided=item.get('image_urls') or [item.get('image_url')],
            )
            slug = prod_data['slug']
            
            product, created = Product.objects.get_or_create(
                slug=slug,
                defaults=prod_data
            )

            desired_category = prod_data.get('category')
            if desired_category and product.category_id != desired_category.id:
                product.category = desired_category
                product.save(update_fields=['category'])
            
            if created:
                from django.conf import settings

                # NOTE: ProductImage.image_url is a URLField (default max_length=200).
                # Some seed URLs can exceed that length and break the seed in Postgres.
                # If USE_S3 is enabled, we skip creating external-URL images here and
                # let `seed_images_to_minio` create/upload images later.
                if getattr(settings, 'USE_S3', False):
                    image_url_to_save = ''
                else:
                    image_url_to_save = (image_urls[0] or '') if image_urls else ''

                fallback_secondary_url = 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e'
                if len(image_urls) > 1 and image_urls[1]:
                    secondary_image_url_to_save = image_urls[1]
                elif getattr(settings, 'USE_S3', False):
                    secondary_image_url_to_save = ''
                else:
                    secondary_image_url_to_save = fallback_secondary_url

                ProductImage.objects.create(
                    product=product,
                    image_url=image_url_to_save,
                    alt_text=prod_data['title'],
                    is_primary=True,
                    display_order=0
                )

                ProductImage.objects.create(
                    product=product,
                    image_url=secondary_image_url_to_save,
                    alt_text=prod_data['title'],
                    is_primary=False,
                    display_order=1
                )
            
            products[slug] = product
            status = 'Created' if created else 'Exists'
            self.stdout.write(f'  {product.title} - {status}')
        
        return products

    def create_orders(self, users, products):
        self.stdout.write('\n🛒 Creating orders...')
        
        # María has 2 completed orders
        maria = users['maria@test.com']
        
        # Order 1 - Fulfilled
        order1, created = Order.objects.get_or_create(
            user=maria,
            order_number='NM-20241201-0001',
            defaults={
                'status': 'Fulfilled',
                'subtotal': Decimal('148.00'),
                'tax_amount': Decimal('0'),
                'total_amount': Decimal('148.00'),
                'customer_name': 'María García',
                'customer_email': 'maria@test.com',
                'customer_notes': 'Primera compra - Apadrinamiento de árbol',
            }
        )
        if created:
            OrderItem.objects.create(
                order=order1,
                product=products['roble-andino'],
                quantity=1,
                unit_price=Decimal('49.00'),
            )
            OrderItem.objects.create(
                order=order1,
                product=products['cuarto-hectarea-bosque-nublado'],
                quantity=1,
                unit_price=Decimal('99.00'),
            )
            self.stdout.write(f'  Order {order1.order_number} for María - Created')
        
        # Order 2 - Paid
        order2, created = Order.objects.get_or_create(
            user=maria,
            order_number='NM-20241215-0005',
            defaults={
                'status': 'Paid',
                'subtotal': Decimal('599.00'),
                'tax_amount': Decimal('0'),
                'total_amount': Decimal('599.00'),
                'customer_name': 'María García',
                'customer_email': 'maria@test.com',
            }
        )
        if created:
            OrderItem.objects.create(
                order=order2,
                product=products['retiro-bienestar-andino'],
                quantity=1,
                unit_price=Decimal('599.00'),
            )
            self.stdout.write(f'  Order {order2.order_number} for María - Created')
        
        # Carlos has 1 pending order
        carlos = users['carlos@test.com']
        order3, created = Order.objects.get_or_create(
            user=carlos,
            order_number='NM-20241218-0008',
            defaults={
                'status': 'Pending',
                'subtotal': Decimal('168.00'),
                'tax_amount': Decimal('0'),
                'total_amount': Decimal('168.00'),
                'customer_name': 'Carlos Rodríguez',
                'customer_email': 'carlos@test.com',
            }
        )
        if created:
            OrderItem.objects.create(
                order=order3,
                product=products['ceiba-sagrada'],
                quantity=1,
                unit_price=Decimal('79.00'),
            )
            OrderItem.objects.create(
                order=order3,
                product=products['caminata-bosque-niebla'],
                quantity=1,
                unit_price=Decimal('89.00'),
            )
            self.stdout.write(f'  Order {order3.order_number} for Carlos - Created')

    def create_carts(self, users, products):
        self.stdout.write('\n🧺 Creating active carts...')
        
        # Ana has items in cart
        ana = users['ana@test.com']
        cart, created = Cart.objects.get_or_create(user=ana)
        if created or cart.items.count() == 0:
            CartItem.objects.get_or_create(
                cart=cart,
                product=products['laguna-guatavita'],
                defaults={'quantity': 1}
            )
            CartItem.objects.get_or_create(
                cart=cart,
                product=products['avistamiento-ballenas'],
                defaults={'quantity': 2}
            )
            self.stdout.write(f'  Cart for Ana - {cart.items.count()} items')
        
        # Demo user has items in cart
        demo = users['demo@nature.com']
        cart2, created = Cart.objects.get_or_create(user=demo)
        if created or cart2.items.count() == 0:
            CartItem.objects.get_or_create(
                cart=cart2,
                product=products['roble-andino'],
                defaults={'quantity': 1}
            )
            self.stdout.write(f'  Cart for Demo - {cart2.items.count()} items')

    def print_summary(self):
        self.stdout.write('\n📊 Summary:')
        self.stdout.write(f'  Users: {User.objects.count()}')
        self.stdout.write(f'  Categories: {Category.objects.count()}')
        self.stdout.write(f'  Products: {Product.objects.count()}')
        self.stdout.write(f'  Orders: {Order.objects.count()}')
        self.stdout.write(f'  Carts with items: {Cart.objects.filter(items__isnull=False).distinct().count()}')

    def print_test_credentials(self):
        self.stdout.write('\n🔑 Test Credentials:')
        self.stdout.write(self.style.WARNING('  Admin:'))
        self.stdout.write('    Email: admin@nature.com')
        self.stdout.write('    Password: admin123')
        self.stdout.write(self.style.WARNING('  Demo User:'))
        self.stdout.write('    Email: demo@nature.com')
        self.stdout.write('    Password: demo123')
        self.stdout.write(self.style.WARNING('  Test Users:'))
        self.stdout.write('    Email: maria@test.com / carlos@test.com / ana@test.com')
        self.stdout.write('    Password: test123')
