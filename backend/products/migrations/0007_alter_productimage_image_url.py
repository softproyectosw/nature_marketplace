from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0006_add_includes_features_duration_translations'),
    ]

    operations = [
        migrations.AlterField(
            model_name='productimage',
            name='image_url',
            field=models.URLField(blank=True, help_text='URL externa de imagen (alternativa a subir archivo)', max_length=1000),
        ),
    ]
