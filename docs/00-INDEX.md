# 📚 Nature Marketplace - Documentación Completa

> Guía técnica y de negocio del proyecto Nature Marketplace

## Índice de Documentación

### 🎯 Fundamentos
| Documento | Descripción |
|-----------|-------------|
| [01-VISION-NEGOCIO.md](./01-VISION-NEGOCIO.md) | Visión del proyecto, propuesta de valor y modelo de negocio |
| [02-ARQUITECTURA.md](./02-ARQUITECTURA.md) | Arquitectura del sistema, stack tecnológico y decisiones técnicas |
| [03-MODELOS-DATOS.md](./03-MODELOS-DATOS.md) | Modelos de base de datos con explicaciones detalladas |

### 🔐 Seguridad
| Documento | Descripción |
|-----------|-------------|
| [04-SEGURIDAD.md](./04-SEGURIDAD.md) | Capas de seguridad, autenticación y protección contra ataques |
| [CLOUDFLARE_SETUP.md](./CLOUDFLARE_SETUP.md) | Configuración de Cloudflare y protección DDoS |

### 🖥️ Backend
| Documento | Descripción |
|-----------|-------------|
| [05-BACKEND-API.md](./05-BACKEND-API.md) | API REST, endpoints, serializers y vistas |
| [06-BACKEND-ADMIN.md](./06-BACKEND-ADMIN.md) | Panel de administración Django (CMS) |

### 🎨 Frontend
| Documento | Descripción |
|-----------|-------------|
| [07-FRONTEND-ESTRUCTURA.md](./07-FRONTEND-ESTRUCTURA.md) | Estructura del proyecto Next.js y componentes |
| [08-FRONTEND-ESTILOS.md](./08-FRONTEND-ESTILOS.md) | Sistema de diseño, Tailwind CSS y componentes UI |

### 👤 Experiencia de Usuario
| Documento | Descripción |
|-----------|-------------|
| [09-USER-JOURNEYS.md](./09-USER-JOURNEYS.md) | Flujos de usuario paso a paso |
| [10-FUNCIONALIDADES.md](./10-FUNCIONALIDADES.md) | Funcionalidades detalladas del sistema |

### 🚀 Despliegue
| Documento | Descripción |
|-----------|-------------|
| [11-DEPLOYMENT.md](./11-DEPLOYMENT.md) | Guía de despliegue con Docker y producción |
| [12-CONFIGURACION.md](./12-CONFIGURACION.md) | Variables de entorno y configuraciones |

---

## Inicio Rápido

```bash
# Clonar repositorio
git clone <repo-url>
cd nature_marketplace

# Copiar variables de entorno
cp .env.example .env

# Iniciar con Docker
docker compose up -d

# Acceder
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/api/
# Admin: http://localhost:8000/admin/
```

## Stack Tecnológico

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│  Next.js 14 · React 18 · TypeScript · Tailwind CSS         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                         NGINX                               │
│  Reverse Proxy · Rate Limiting · SSL Termination           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                              │
│  Django 5 · Django REST Framework · PostgreSQL             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       SERVICIOS                             │
│  MinIO (Storage) · Stripe (Pagos) · Cloudflare (CDN)       │
└─────────────────────────────────────────────────────────────┘
```

## Contacto

Para preguntas técnicas, revisar la documentación o abrir un issue en el repositorio.
