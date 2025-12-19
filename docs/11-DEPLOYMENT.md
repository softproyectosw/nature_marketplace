# 🚀 Deployment (Despliegue)

## Visión General

El proyecto usa Docker para containerización y puede desplegarse en cualquier VPS o servicio de cloud.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      ARQUITECTURA DE PRODUCCIÓN                         │
└─────────────────────────────────────────────────────────────────────────┘

                              INTERNET
                                  │
                                  ▼
                         ┌───────────────┐
                         │  CLOUDFLARE   │
                         │  CDN + WAF    │
                         └───────┬───────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              VPS                                        │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                         DOCKER                                   │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐            │   │
│  │  │  NGINX  │  │ FRONTEND│  │ BACKEND │  │  MINIO  │            │   │
│  │  │  :80    │  │  :3000  │  │  :8000  │  │  :9000  │            │   │
│  │  └────┬────┘  └─────────┘  └────┬────┘  └─────────┘            │   │
│  │       │                         │                               │   │
│  │       │                    ┌────┴────┐                          │   │
│  │       │                    │POSTGRES │                          │   │
│  │       │                    │  :5432  │                          │   │
│  │       │                    └─────────┘                          │   │
│  └───────┼─────────────────────────────────────────────────────────┘   │
│          │                                                              │
│          ▼                                                              │
│    Puerto 80/443                                                        │
└─────────────────────────────────────────────────────────────────────────┘
```

## Requisitos del Servidor

### Mínimos

| Recurso | Mínimo | Recomendado |
|---------|--------|-------------|
| CPU | 2 cores | 4 cores |
| RAM | 4 GB | 8 GB |
| Disco | 40 GB SSD | 80 GB SSD |
| Red | 100 Mbps | 1 Gbps |

### Software

- Ubuntu 22.04 LTS (o similar)
- Docker 24+
- Docker Compose 2+
- Git

## Estructura de Archivos

```
nature_marketplace/
├── docker-compose.yml          # Desarrollo local
├── docker-compose.prod.yml     # Producción
├── .env                        # Variables de entorno (no commitear)
├── .env.example                # Plantilla de variables
├── .env.production.example     # Plantilla para producción
│
├── backend/
│   ├── Dockerfile              # Desarrollo
│   └── Dockerfile.prod         # Producción (multi-stage)
│
├── frontend/
│   ├── Dockerfile              # Desarrollo
│   └── Dockerfile.prod         # Producción (multi-stage)
│
├── nginx/
│   ├── nginx.conf              # Configuración principal
│   └── conf.d/
│       └── default.conf        # Configuración del sitio
│
└── scripts/
    ├── setup-firewall.sh       # Configurar UFW
    └── setup-crowdsec.sh       # Instalar CrowdSec
```

## Docker Compose - Producción

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - static_volume:/var/www/static:ro
      - ./certbot/conf:/etc/letsencrypt:ro
    depends_on:
      - frontend
      - backend
    restart: always

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
    restart: always

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    environment:
      - DEBUG=False
      - SECRET_KEY=${SECRET_KEY}
      - DATABASE_URL=${DATABASE_URL}
      - ALLOWED_HOSTS=${ALLOWED_HOSTS}
      - CORS_ALLOWED_ORIGINS=${CORS_ALLOWED_ORIGINS}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
      - STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}
    volumes:
      - static_volume:/app/static
    depends_on:
      - db
    restart: always

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      - MINIO_ROOT_USER=${MINIO_ROOT_USER}
      - MINIO_ROOT_PASSWORD=${MINIO_ROOT_PASSWORD}
    volumes:
      - minio_data:/data
    restart: always

volumes:
  postgres_data:
  minio_data:
  static_volume:
```

## Guía de Despliegue Paso a Paso

### 1. Preparar el Servidor

```bash
# Conectar al servidor
ssh root@tu-servidor-ip

# Actualizar sistema
apt update && apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com | sh

# Instalar Docker Compose
apt install docker-compose-plugin -y

# Crear usuario para la aplicación
adduser nature
usermod -aG docker nature
usermod -aG sudo nature

# Cambiar a usuario nature
su - nature
```

### 2. Clonar el Repositorio

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/nature_marketplace.git
cd nature_marketplace

# Crear archivo de variables de entorno
cp .env.production.example .env
nano .env  # Editar con valores reales
```

### 3. Configurar Variables de Entorno

```bash
# .env (producción)

# Django
DEBUG=False
SECRET_KEY=tu-secret-key-muy-larga-y-segura-generada-aleatoriamente
ALLOWED_HOSTS=tu-dominio.com,www.tu-dominio.com
CORS_ALLOWED_ORIGINS=https://tu-dominio.com,https://www.tu-dominio.com

# Base de datos
POSTGRES_DB=nature_marketplace
POSTGRES_USER=nature_user
POSTGRES_PASSWORD=contraseña-segura-para-postgres
DATABASE_URL=postgres://nature_user:contraseña@db:5432/nature_marketplace

# MinIO
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=contraseña-segura-para-minio
MINIO_ENDPOINT=minio:9000
MINIO_BUCKET=nature-media

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Frontend
NEXT_PUBLIC_API_URL=https://tu-dominio.com
NEXT_PUBLIC_MINIO_URL=https://tu-dominio.com/storage
```

### 4. Generar SECRET_KEY

```bash
# Generar una SECRET_KEY segura
python3 -c "import secrets; print(secrets.token_urlsafe(50))"
```

### 5. Construir y Levantar

```bash
# Construir imágenes
docker compose -f docker-compose.prod.yml build

# Levantar servicios
docker compose -f docker-compose.prod.yml up -d

# Ver logs
docker compose -f docker-compose.prod.yml logs -f

# Verificar que todo está corriendo
docker compose -f docker-compose.prod.yml ps
```

### 6. Ejecutar Migraciones

```bash
# Ejecutar migraciones de Django
docker compose -f docker-compose.prod.yml exec backend python manage.py migrate

# Crear superusuario
docker compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser

# Recolectar archivos estáticos
docker compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput
```

### 7. Configurar Cloudflare

1. Agregar dominio a Cloudflare
2. Configurar DNS (A record apuntando a IP del servidor)
3. Activar proxy (nube naranja)
4. Configurar SSL: Full (strict)
5. Activar Bot Fight Mode
6. Configurar reglas de firewall

Ver [CLOUDFLARE_SETUP.md](./CLOUDFLARE_SETUP.md) para detalles.

### 8. Configurar Firewall

```bash
# Ejecutar script de firewall
chmod +x scripts/setup-firewall.sh
sudo ./scripts/setup-firewall.sh
```

### 9. Instalar CrowdSec (Opcional pero recomendado)

```bash
# Ejecutar script de CrowdSec
chmod +x scripts/setup-crowdsec.sh
sudo ./scripts/setup-crowdsec.sh
```

## Comandos Útiles

### Docker

```bash
# Ver estado de servicios
docker compose -f docker-compose.prod.yml ps

# Ver logs en tiempo real
docker compose -f docker-compose.prod.yml logs -f

# Ver logs de un servicio específico
docker compose -f docker-compose.prod.yml logs -f backend

# Reiniciar un servicio
docker compose -f docker-compose.prod.yml restart backend

# Reconstruir y reiniciar
docker compose -f docker-compose.prod.yml up -d --build backend

# Entrar a un contenedor
docker compose -f docker-compose.prod.yml exec backend bash

# Ver uso de recursos
docker stats
```

### Django

```bash
# Ejecutar comando de Django
docker compose -f docker-compose.prod.yml exec backend python manage.py <comando>

# Ejemplos:
# - migrate
# - createsuperuser
# - collectstatic
# - shell
# - dbshell
```

### Base de Datos

```bash
# Backup de base de datos
docker compose -f docker-compose.prod.yml exec db pg_dump -U nature_user nature_marketplace > backup.sql

# Restaurar backup
cat backup.sql | docker compose -f docker-compose.prod.yml exec -T db psql -U nature_user nature_marketplace
```

## Actualizaciones

### Proceso de Actualización

```bash
# 1. Hacer pull de cambios
git pull origin main

# 2. Reconstruir imágenes
docker compose -f docker-compose.prod.yml build

# 3. Aplicar migraciones (si hay)
docker compose -f docker-compose.prod.yml exec backend python manage.py migrate

# 4. Recolectar estáticos (si hay cambios)
docker compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput

# 5. Reiniciar servicios
docker compose -f docker-compose.prod.yml up -d
```

### Zero-Downtime Deployment

Para actualizaciones sin downtime:

```bash
# Escalar a 2 instancias del backend
docker compose -f docker-compose.prod.yml up -d --scale backend=2

# Esperar a que la nueva instancia esté lista
sleep 30

# Reducir a 1 instancia (la nueva)
docker compose -f docker-compose.prod.yml up -d --scale backend=1
```

## Monitoreo

### Health Checks

```bash
# Verificar que el backend responde
curl http://localhost:8000/api/health/

# Verificar que el frontend responde
curl http://localhost:3000/

# Verificar desde fuera (a través de Cloudflare)
curl https://tu-dominio.com/api/health/
```

### Logs

```bash
# Logs de Nginx
docker compose -f docker-compose.prod.yml exec nginx cat /var/log/nginx/access.log
docker compose -f docker-compose.prod.yml exec nginx cat /var/log/nginx/error.log

# Logs de aplicación
docker compose -f docker-compose.prod.yml logs backend --tail=100
```

### Métricas del Sistema

```bash
# Uso de CPU y memoria
htop

# Uso de disco
df -h

# Conexiones de red
ss -tuln

# Procesos Docker
docker stats
```

## Backups

### Script de Backup Automático

```bash
#!/bin/bash
# scripts/backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=/home/nature/backups

# Crear directorio si no existe
mkdir -p $BACKUP_DIR

# Backup de base de datos
docker compose -f docker-compose.prod.yml exec -T db pg_dump -U nature_user nature_marketplace > $BACKUP_DIR/db_$DATE.sql

# Backup de MinIO
docker compose -f docker-compose.prod.yml exec -T minio mc mirror /data $BACKUP_DIR/minio_$DATE

# Comprimir
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz $BACKUP_DIR/db_$DATE.sql $BACKUP_DIR/minio_$DATE

# Limpiar archivos temporales
rm $BACKUP_DIR/db_$DATE.sql
rm -rf $BACKUP_DIR/minio_$DATE

# Eliminar backups de más de 30 días
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +30 -delete

echo "Backup completado: backup_$DATE.tar.gz"
```

### Cron para Backups Diarios

```bash
# Editar crontab
crontab -e

# Agregar línea para backup diario a las 3am
0 3 * * * /home/nature/nature_marketplace/scripts/backup.sh >> /var/log/backup.log 2>&1
```

## Troubleshooting

### El sitio no carga

1. Verificar que los contenedores están corriendo:
   ```bash
   docker compose -f docker-compose.prod.yml ps
   ```

2. Ver logs de errores:
   ```bash
   docker compose -f docker-compose.prod.yml logs
   ```

3. Verificar que Nginx puede conectar al backend:
   ```bash
   docker compose -f docker-compose.prod.yml exec nginx curl http://backend:8000/api/health/
   ```

### Error 502 Bad Gateway

- El backend no está respondiendo
- Verificar logs del backend
- Verificar que las migraciones se ejecutaron

### Error 504 Gateway Timeout

- El backend está tardando mucho
- Verificar queries lentas en la base de datos
- Aumentar timeout en Nginx

### Base de datos no conecta

```bash
# Verificar que PostgreSQL está corriendo
docker compose -f docker-compose.prod.yml exec db pg_isready

# Verificar conexión desde backend
docker compose -f docker-compose.prod.yml exec backend python manage.py dbshell
```
