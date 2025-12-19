"""
Management command to populate English translations for products and categories.

Run with: python manage.py populate_translations
"""

from django.core.management.base import BaseCommand
from products.models import Category, Product


# Category translations (Spanish -> English)
CATEGORY_TRANSLATIONS = {
    'Árboles': 'Trees',
    'Arboles': 'Trees',
    'Bosques': 'Forests',
    'Lagunas': 'Lagoons',
    'Experiencias': 'Experiences',
    'Retiros': 'Retreats',
    'Remedios': 'Remedies',
    'Productos': 'Products',
}

# Complete product translations with all fields
PRODUCT_TRANSLATIONS = {
    'Roble Andino': {
        'title_en': 'Andean Oak',
        'short_description_en': 'Sponsor a majestic Andean Oak in the mountains of Boyacá',
        'description_en': 'The Andean Oak (Quercus humboldtii) is a native species of Colombian cloud forests. Your sponsorship helps protect this centuries-old tree and its ecosystem. You will receive periodic updates with photos and data about your tree\'s growth.',
        'purpose_en': 'Protect cloud forests and their unique biodiversity',
        'impact_description_en': 'Each oak absorbs approximately 22kg of CO2 per year and provides home to dozens of species.',
        'features_en': ['Digital certificate', 'Monthly updates', 'GPS coordinates', 'Custom name'],
    },
    'Ceiba Sagrada': {
        'title_en': 'Sacred Ceiba',
        'short_description_en': 'The Ceiba is the sacred tree of Amazonian cultures',
        'description_en': 'The Ceiba pentandra can reach over 70 meters in height. It is considered sacred by many indigenous cultures of the Americas. Sponsoring a Ceiba is connecting with the ancestral spirituality of the jungle.',
        'purpose_en': 'Preserve sacred trees and Amazonian indigenous culture',
        'impact_description_en': 'Ceibas are home to hundreds of species and are fundamental to the Amazonian ecosystem.',
        'features_en': ['Centennial tree', 'Guided tour included', 'Physical certificate', 'Indigenous community connection'],
    },
    'Palma de Cera': {
        'title_en': 'Wax Palm',
        'short_description_en': 'Colombia\'s national tree, the tallest palm in the world',
        'description_en': 'The Quindío Wax Palm can reach up to 60 meters in height, being the tallest palm in the world. It is Colombia\'s national tree and is endangered.',
        'purpose_en': 'Protect the national tree of Colombia',
        'impact_description_en': 'The Wax Palm is essential for the Andean ecosystem and is home to the yellow-eared parrot.',
        'features_en': ['National tree', 'Endangered species', 'Cocora Valley tour', 'Commemorative plaque'],
    },
    'Hectárea de Bosque Andino': {
        'title_en': 'Andean Forest Hectare',
        'short_description_en': 'Protect an entire hectare of Andean forest',
        'description_en': 'Sponsor a complete hectare of Andean forest, home to hundreds of species of flora and fauna. Your contribution helps preserve one of the most biodiverse ecosystems on the planet.',
        'purpose_en': 'Preserve complete forest ecosystems',
        'impact_description_en': 'One hectare of Andean forest absorbs approximately 200 tons of CO2 and is home to over 500 species.',
        'features_en': ['Full hectare', 'Biodiversity hotspot', 'Annual visit', 'Impact report'],
    },
    '1/4 Hectárea Bosque Nublado': {
        'title_en': 'Quarter Hectare Cloud Forest',
        'short_description_en': 'Protect a quarter hectare of cloud forest',
        'description_en': 'Sponsor a quarter hectare of cloud forest, one of the most threatened and biodiverse ecosystems in the world.',
        'purpose_en': 'Preserve cloud forest ecosystems',
        'impact_description_en': 'Cloud forests capture water from fog and are home to unique species.',
        'features_en': ['Cloud forest', 'Water capture', 'Unique species', 'Conservation certificate'],
    },
    'Humedal La Conejera': {
        'title_en': 'La Conejera Wetland',
        'short_description_en': 'Help preserve this urban wetland in Bogotá',
        'description_en': 'La Conejera Wetland is one of the most important urban wetlands in Bogotá. It is home to over 100 bird species and is vital for the city\'s water regulation.',
        'purpose_en': 'Protect urban wetlands and their biodiversity',
        'impact_description_en': 'Wetlands filter water, prevent floods, and are home to migratory birds.',
        'features_en': ['Urban wetland', 'Bird sanctuary', 'Water regulation', 'Guided tours'],
    },
    'Laguna de Guatavita': {
        'title_en': 'Guatavita Lagoon',
        'short_description_en': 'Support the conservation of this sacred lagoon',
        'description_en': 'The Guatavita Lagoon is a sacred site for the Muisca culture and the origin of the El Dorado legend. Your sponsorship helps preserve this cultural and natural heritage.',
        'purpose_en': 'Preserve cultural and natural heritage',
        'impact_description_en': 'The lagoon is a vital water source and a site of great cultural importance.',
        'features_en': ['Sacred site', 'El Dorado legend', 'Cultural heritage', 'Muisca history'],
    },
    'Avistamiento de Ballenas': {
        'title_en': 'Whale Watching',
        'short_description_en': 'Unique experience watching humpback whales on the Pacific coast',
        'description_en': 'Live the incredible experience of watching humpback whales in their natural habitat on the Colombian Pacific coast. Includes boat tour, expert guide, and lunch.',
        'purpose_en': 'Support sustainable marine tourism',
        'impact_description_en': 'Responsible tourism helps protect whales and supports local communities.',
        'duration_en': '6 hours',
        'includes_en': ['Boat tour', 'Expert guide', 'Lunch', 'Life jacket', 'Binoculars'],
        'features_en': ['Humpback whales', 'Pacific coast', 'Small groups', 'Photography'],
    },
    'Caminata Bosque de Niebla': {
        'title_en': 'Cloud Forest Hike',
        'short_description_en': 'A 4-hour hike through ancestral trails of the cloud forest',
        'description_en': 'A 4-hour hike through ancestral trails of the cloud forest. Bird watching, identification of native flora, and connection with nature.',
        'purpose_en': 'Connect people with nature',
        'impact_description_en': 'Ecotourism generates income for local communities and promotes conservation.',
        'duration_en': '4 hours',
        'includes_en': ['Bilingual guide', 'Organic snack', 'Adventure insurance', 'Binoculars'],
        'features_en': ['Beginner friendly', 'Bird watching', 'Nature photography'],
    },
    'Retiro de Bienestar Andino': {
        'title_en': 'Andean Wellness Retreat',
        'short_description_en': '3-day wellness retreat in the Andean mountains',
        'description_en': 'A 3-day retreat in the Andean mountains with yoga, meditation, organic food, and connection with nature. Includes accommodation, all meals, and guided activities.',
        'purpose_en': 'Promote wellness and connection with nature',
        'impact_description_en': 'Retreats support local communities and promote sustainable tourism.',
        'duration_en': '3 days',
        'includes_en': ['Accommodation', 'All meals', 'Yoga sessions', 'Meditation', 'Nature walks'],
        'features_en': ['Yoga', 'Meditation', 'Organic food', 'Mountain views'],
    },
}


class Command(BaseCommand):
    help = 'Populate English translations for categories and products'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be updated without making changes',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Overwrite existing translations',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        force = options['force']
        
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN - No changes will be made\n'))
        if force:
            self.stdout.write(self.style.WARNING('FORCE MODE - Will overwrite existing translations\n'))
        
        # Update categories
        self.stdout.write(self.style.MIGRATE_HEADING('Updating Categories...'))
        categories_updated = 0
        
        for category in Category.objects.all():
            translation = CATEGORY_TRANSLATIONS.get(category.name)
            if translation and (force or not category.name_en):
                if dry_run:
                    self.stdout.write(f'  Would update: {category.name} -> {translation}')
                else:
                    category.name_en = translation
                    category.save(update_fields=['name_en'])
                    self.stdout.write(self.style.SUCCESS(f'  ✓ {category.name} -> {translation}'))
                categories_updated += 1
            elif category.name_en and not force:
                self.stdout.write(f'  - {category.name} (already has: {category.name_en})')
            else:
                self.stdout.write(self.style.WARNING(f'  ? {category.name} (no translation found)'))
        
        self.stdout.write(f'\nCategories updated: {categories_updated}\n')
        
        # Update products
        self.stdout.write(self.style.MIGRATE_HEADING('Updating Products...'))
        products_updated = 0
        
        for product in Product.objects.all():
            translations = PRODUCT_TRANSLATIONS.get(product.title)
            if not translations:
                self.stdout.write(self.style.WARNING(f'  ? {product.title} (no translation found)'))
                continue
            
            updates = []
            fields_to_update = []
            
            # Update each translation field
            for field, value in translations.items():
                current_value = getattr(product, field, '')
                if force or not current_value:
                    if not dry_run:
                        setattr(product, field, value)
                    fields_to_update.append(field)
                    updates.append(field.replace('_en', ''))
            
            if updates:
                if dry_run:
                    self.stdout.write(f'  Would update: {product.title} ({", ".join(updates)})')
                else:
                    product.save(update_fields=fields_to_update)
                    self.stdout.write(self.style.SUCCESS(f'  ✓ {product.title} ({", ".join(updates)})'))
                products_updated += 1
            else:
                self.stdout.write(f'  - {product.title} (already has all translations)')
        
        self.stdout.write(f'\nProducts updated: {products_updated}\n')
        
        # Summary
        self.stdout.write(self.style.MIGRATE_HEADING('Summary'))
        self.stdout.write(f'  Categories: {categories_updated} updated')
        self.stdout.write(f'  Products: {products_updated} updated')
        
        if dry_run:
            self.stdout.write(self.style.WARNING('\nThis was a dry run. Run without --dry-run to apply changes.'))
        else:
            self.stdout.write(self.style.SUCCESS('\n✓ Translations populated successfully!'))
