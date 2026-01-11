"""
Management command to seed the database with sample products.
Run with: python manage.py seed_products
"""

import hashlib
import random
from django.core.management.base import BaseCommand
from products.models import Category, Product, ProductImage


class Command(BaseCommand):
    help = 'Seed the database with sample products for Nature Marketplace'

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

    def handle(self, *args, **options):
        self.stdout.write('Seeding database...')
        
        # Create categories
        categories_data = [
            {'name': 'Bosque Vivo', 'slug': 'bosque-vivo', 'icon': 'forest', 'description': 'Adopta un metro cuadrado de bosque y sigue su crecimiento en tiempo real'},
            {'name': 'Guardianes del Agua', 'slug': 'guardianes-del-agua', 'icon': 'water', 'description': 'Apadrina un cuerpo de agua y recibe historias del territorio que estás protegiendo'},
            {'name': 'Economía del Corazón', 'slug': 'economia-del-corazon', 'icon': 'volunteer_activism', 'description': 'Apoya proyectos regenerativos y de educación ambiental'},
            {'name': 'Micro-retreats', 'slug': 'micro-retreats', 'icon': 'hiking', 'description': 'Experiencias inmersivas en ecosistemas vivos, diseñadas para reconectar'},
        ]
        
        categories = {}
        for cat_data in categories_data:
            cat, created = Category.objects.get_or_create(
                slug=cat_data['slug'],
                defaults=cat_data
            )
            categories[cat_data['slug']] = cat
            status = 'Created' if created else 'Already exists'
            self.stdout.write(f'  Category: {cat.name} - {status}')

        legacy_slugs = ['trees', 'forests', 'lagoons', 'experiences']
        Category.objects.filter(slug__in=legacy_slugs).update(is_active=False)
        
        # Create products with images
        products_data = [
            # Trees
            {
                'data': {
                    'title': 'Roble Andino',
                    'slug': 'roble-andino',
                    'category': categories['bosque-vivo'],
                    'product_type': 'tree',
                    'price': 49.00,
                    'pricing_type': 'annual',
                    'short_description': 'Apadrina un majestuoso Roble Andino en las montañas de Boyacá',
                    'description': 'El Roble Andino es una especie nativa de los bosques de niebla colombianos. Tu apadrinamiento ayuda a proteger este árbol centenario y su ecosistema.',
                    'rating': 4.9,
                    'reviews_count': 128,
                    'co2_offset_kg': 22,
                    'location_name': 'Boyacá, Colombia',
                    'species': 'Quercus humboldtii',
                    'is_unlimited_stock': True,
                    'is_featured': True,
                },
                'image_url': 'https://lh3.googleusercontent.com/aida-public/AB6AXuA57d8-crjcjBcF7YSMwpjlCwOgxjuIMr_-ft7LPHaYWNRZFBtgEyVb6ik914ymF0nlxS0sy3CpfzfuzEg6n1aIgHgZ73mAfGBEHFE5i6ILJCiFjSG582VjSgeNDxH2kRfEKNmuhxFJDH9pQ4jzrpUX3QdM6tdqCNMk-prHTFJ3M52-0YSf8X78H3lFF1fPMb2GeFHr-gQpLKK9qDfefwoYzzcKoXYY0qSipZsvnaY8HN_il1xJdV5q7wirCuBPxSOFwN0EIh4aPV4w',
            },
            {
                'data': {
                    'title': 'Árbol Ceiba Sagrada',
                    'slug': 'ceiba-sagrada',
                    'category': categories['bosque-vivo'],
                    'product_type': 'tree',
                    'price': 79.00,
                    'pricing_type': 'annual',
                    'short_description': 'La Ceiba es el árbol sagrado de las culturas amazónicas',
                    'description': 'La Ceiba pentandra puede alcanzar más de 70 metros de altura. Es considerada sagrada por muchas culturas indígenas de América.',
                    'rating': 4.8,
                    'reviews_count': 89,
                    'co2_offset_kg': 45,
                    'location_name': 'Amazonas, Colombia',
                    'species': 'Ceiba pentandra',
                    'stock': 5,
                    'is_unlimited_stock': False,
                    'is_featured': True,
                },
                'image_url': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDc1vS64gPJ7mXS0GZZ4J9GV3_vtbWnbqLpusdOe_mhtvKZl9800EWClKpEZdAlyu3an5ggEVNg7N47tWtonYYZ8DmGfRsPJxg0ciMgo7upHpfxUxlArq869hYXzEpwQLC8Uzu2y87lPyuSkSXOHREny1z0SNoRC7BiCi8FS6cOWljPP1Fz_GAVL2S0UTtXUxcLoAZ7YDvoBokf-hWw6QOmnSzCmTLX4xmCnwJ_sCpwPySc0wos40KisRYa9s7E7kq3z9ZHt-09Nghy',
            },
            # Forests
            {
                'data': {
                    'title': 'Hectárea de Bosque Andino',
                    'slug': 'hectarea-bosque-andino',
                    'category': categories['bosque-vivo'],
                    'product_type': 'forest',
                    'price': 299.00,
                    'pricing_type': 'annual',
                    'short_description': 'Protege una hectárea completa de bosque andino',
                    'description': 'Una hectárea de bosque andino alberga cientos de especies de flora y fauna. Tu apadrinamiento garantiza su protección.',
                    'rating': 4.9,
                    'reviews_count': 45,
                    'co2_offset_kg': 500,
                    'location_name': 'Sierra Nevada, Colombia',
                    'area_size': '1 hectárea',
                    'stock': 3,
                    'is_unlimited_stock': False,
                    'is_featured': True,
                },
                'image_url': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBX4GrNj0sPqAN5xJxaK64uqZpTTEKtSygiiYRmXrZxt4JO1G2-xrHV9g9UNTrwj6087J-dT1TcDXjVvl_uGkXDHj3PTVYgO3CY80SS3Y9jwNPu0bu9BrI3ouI1PJJKYWdOZ25Jbhwev1RIldC_gsZoj8zZEHYsrOLOpaqJBVxN_S_irVlY3NdiYbDtH9TwvmsrbnX9ZVCbvg7r8PJpb1Z8puza8b7nV2J5tQ4s-I_BcPTbVrDW10_XQ8aRtshGzZI-yYRXQhGqYfsy',
            },
            {
                'data': {
                    'title': '1/4 Hectárea Bosque Nublado',
                    'slug': 'cuarto-hectarea-bosque-nublado',
                    'category': categories['bosque-vivo'],
                    'product_type': 'forest',
                    'price': 99.00,
                    'pricing_type': 'annual',
                    'short_description': 'Protege 2,500 m² de bosque de niebla',
                    'description': 'Los bosques nublados son ecosistemas únicos que capturan agua de las nubes. Protege este tesoro natural.',
                    'rating': 4.7,
                    'reviews_count': 67,
                    'co2_offset_kg': 125,
                    'location_name': 'Chingaza, Colombia',
                    'area_size': '2,500 m²',
                    'stock': 0,
                    'is_unlimited_stock': False,
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
                    'price': 149.00,
                    'pricing_type': 'annual',
                    'short_description': 'Contribuye a la conservación de la legendaria Laguna de Guatavita',
                    'description': 'La Laguna de Guatavita es un sitio sagrado para los Muiscas y origen de la leyenda de El Dorado.',
                    'rating': 4.8,
                    'reviews_count': 34,
                    'location_name': 'Cundinamarca, Colombia',
                    'area_size': '1,000 m²',
                    'is_unlimited_stock': True,
                },
                'image_url': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCb7qaFmCmW_aGhTbq42JWuifGkh94nQpfJmiA9_F7aE8mZuTVw1S2ZtiDI9B-5jU0vLKt5IKaOtya60cBgZj2wKfJ3j4IsKyEeBlu1TPRyskyshIO7j0j_BxGAd7hYkVPPU7FTpDe-STzCv0orJsz-2tY9VRCRpR1lvmaocHMDNtF3VpyzQfbrLD7ATHv2_gmJKdZZR6lIv6ypEojiay4KM3doCIohLK-JXcU-pINVpOCYB--Fz29aHoLH9qeX1Teo5j7JmZcnb07j',
            },
            {
                'data': {
                    'title': 'Humedal La Conejera',
                    'slug': 'humedal-conejera',
                    'category': categories['guardianes-del-agua'],
                    'product_type': 'lagoon',
                    'price': 89.00,
                    'pricing_type': 'annual',
                    'short_description': 'Protege el humedal urbano más importante de Bogotá',
                    'description': 'El Humedal La Conejera es refugio de más de 100 especies de aves. Tu aporte ayuda a su conservación.',
                    'rating': 4.6,
                    'reviews_count': 52,
                    'location_name': 'Bogotá, Colombia',
                    'area_size': '500 m²',
                    'stock': 10,
                    'is_unlimited_stock': False,
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
                    'price': 599.00,
                    'pricing_type': 'one_time',
                    'short_description': '3 días de conexión con la naturaleza en los Andes',
                    'description': 'Vive una experiencia transformadora en las montañas andinas. Incluye alojamiento, alimentación y actividades guiadas.',
                    'rating': 4.9,
                    'reviews_count': 23,
                    'location_name': 'Villa de Leyva, Colombia',
                    'duration': '3 días',
                    'max_participants': 12,
                    'includes': ['Alojamiento', 'Alimentación', 'Transporte', 'Guía experto', 'Yoga y meditación'],
                    'stock': 12,
                    'is_unlimited_stock': False,
                    'is_featured': True,
                },
                'image_url': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCb7qaFmCmW_aGhTbq42JWuifGkh94nQpfJmiA9_F7aE8mZuTVw1S2ZtiDI9B-5jU0vLKt5IKaOtya60cBgZj2wKfJ3j4IsKyEeBlu1TPRyskyshIO7j0j_BxGAd7hYkVPPU7FTpDe-STzCv0orJsz-2tY9VRCRpR1lvmaocHMDNtF3VpyzQfbrLD7ATHv2_gmJKdZZR6lIv6ypEojiay4KM3doCIohLK-JXcU-pINVpOCYB--Fz29aHoLH9qeX1Teo5j7JmZcnb07j',
            },
            {
                'data': {
                    'title': 'Caminata Bosque de Niebla',
                    'slug': 'caminata-bosque-niebla',
                    'category': categories['micro-retreats'],
                    'product_type': 'experience',
                    'price': 89.00,
                    'pricing_type': 'one_time',
                    'short_description': 'Explora el mágico bosque de niebla con guías expertos',
                    'description': 'Una caminata de 4 horas por senderos ancestrales del bosque de niebla. Observación de aves y flora nativa.',
                    'rating': 4.7,
                    'reviews_count': 156,
                    'location_name': 'Chicaque, Colombia',
                    'duration': '4 horas',
                    'max_participants': 15,
                    'includes': ['Guía bilingüe', 'Refrigerio', 'Seguro'],
                    'stock': 15,
                    'is_unlimited_stock': False,
                },
                'image_url': 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-6GUNZKUR7_k_ZGZ0RbbevuXmvn9LOA0ukszskzKq8Qu9DAcS9RnbeRMCxxsDilRqpucyAIDDsCW0VhAIoXYPZY2imaFkgPFz2r5wammp0aiUc_pV6nBF4EpzpYMnoTR9par3UGszUC9mdx5Nfeee2UrRzkdNKqzzvz-N_HZNKBu2me2QX3-WBzBTL9irFLpr6fbBD8cPxjRc2mAWYdNquWY53gmbKoXckcMcyXc7M3OrNBHvmm5DBw_tAB74cN4BB1tFvBUSvJG3',
            },
            {
                'data': {
                    'title': 'Economía del Corazón - Educación Ambiental',
                    'slug': 'economia-del-corazon-educacion-ambiental',
                    'category': categories['economia-del-corazon'],
                    'product_type': 'experience',
                    'price': 25.00,
                    'pricing_type': 'one_time',
                    'short_description': 'Apoya talleres y materiales de educación ambiental en comunidades locales',
                    'description': 'Tu aporte financia talleres, guías y actividades educativas enfocadas en conservación, restauración y cuidado del territorio.',
                    'rating': 5.0,
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
                    'price': 50.00,
                    'pricing_type': 'one_time',
                    'short_description': 'Acelera proyectos regenerativos y guardianía comunitaria del territorio',
                    'description': 'Contribuye al fortalecimiento de iniciativas locales: restauración, viveros, monitoreo y economía comunitaria.',
                    'rating': 5.0,
                    'reviews_count': 0,
                    'is_unlimited_stock': True,
                },
                'image_url': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
            },
        ]
        
        for item in products_data:
            prod_data = item['data']
            image_urls = self._pick_demo_images(
                slug=prod_data['slug'],
                product_type=prod_data.get('product_type', ''),
                provided=item.get('image_urls') or [item.get('image_url')],
            )
            
            product, created = Product.objects.get_or_create(
                slug=prod_data['slug'],
                defaults=prod_data
            )

            desired_category = prod_data.get('category')
            if desired_category and product.category_id != desired_category.id:
                product.category = desired_category
                product.save(update_fields=['category'])
            
            # Create primary image if product was created
            if created:
                primary_url = (image_urls[0] or '') if image_urls else ''
                secondary_url = image_urls[1] if len(image_urls) > 1 and image_urls[1] else primary_url

                ProductImage.objects.create(
                    product=product,
                    image_url=primary_url,
                    alt_text=prod_data['title'],
                    is_primary=True,
                    display_order=0
                )

                ProductImage.objects.create(
                    product=product,
                    image_url=secondary_url,
                    alt_text=prod_data['title'],
                    is_primary=False,
                    display_order=1
                )
            
            status = 'Created' if created else 'Already exists'
            self.stdout.write(f'  Product: {product.title} - {status}')
        
        self.stdout.write(self.style.SUCCESS('\n✓ Database seeded successfully!'))
        self.stdout.write(f'  Categories: {Category.objects.count()}')
        self.stdout.write(f'  Products: {Product.objects.count()}')
