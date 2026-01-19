#iniciar el proyecto desde cero

# En el VPS - Reset completo desde cero
cd /opt/nature_marketplace/nature_marketplace
# 1. Down completo (detiene y elimina contenedores, redes, volúmenes anónimos)
docker compose -f docker-compose.prod.yml down
# 2. Up con rebuild completo
docker compose -f docker-compose.prod.yml up -d --build
# 3. Esperar a que todos los servicios estén listos
sleep 40
# 4. Verificar que todos estén UP
docker compose -f docker-compose.prod.yml ps
# 5. Correr migraciones
docker compose -f docker-compose.prod.yml exec backend python manage.py migrate
# 6. Crear cache table
docker compose -f docker-compose.prod.yml exec backend python manage.py createcachetable
# 7. Limpiar cache de throttling
docker compose -f docker-compose.prod.yml exec db psql -U nature_user -d nature_marketplace -c "TRUNCATE TABLE django_cache_table;"
# 8. Seed completo con imágenes aleatorias y usuarios demo
docker compose -f docker-compose.prod.yml exec backend python manage.py seed_all --clear
# 9. Limpiar cache de nuevo después de seed
docker compose -f docker-compose.prod.yml exec db psql -U nature_user -d nature_marketplace -c "TRUNCATE TABLE django_cache_table;"
# 10. Verificar estado final
docker compose -f docker-compose.prod.yml ps