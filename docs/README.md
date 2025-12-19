# 🌱 Nature Marketplace

> An eco-luxury marketplace for tree adoption, wellness retreats, and sustainable products.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![Django](https://img.shields.io/badge/Django-5-green?logo=django)](https://djangoproject.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-yellow?logo=python)](https://python.org/)

---

## 📚 Documentación Completa

Ver **[00-INDEX.md](./00-INDEX.md)** para el índice completo de documentación técnica.

| Documento | Descripción |
|-----------|-------------|
| [01-VISION-NEGOCIO](./01-VISION-NEGOCIO.md) | Modelo de negocio y gamificación |
| [02-ARQUITECTURA](./02-ARQUITECTURA.md) | Stack tecnológico y decisiones |
| [03-MODELOS-DATOS](./03-MODELOS-DATOS.md) | Base de datos explicada |
| [04-SEGURIDAD](./04-SEGURIDAD.md) | Autenticación y protección |
| [05-BACKEND-API](./05-BACKEND-API.md) | Endpoints y ejemplos |
| [06-BACKEND-ADMIN](./06-BACKEND-ADMIN.md) | Panel CMS |
| [07-FRONTEND-ESTRUCTURA](./07-FRONTEND-ESTRUCTURA.md) | Next.js y componentes |
| [08-FRONTEND-ESTILOS](./08-FRONTEND-ESTILOS.md) | Tailwind y diseño |
| [09-USER-JOURNEYS](./09-USER-JOURNEYS.md) | Flujos de usuario |
| [10-FUNCIONALIDADES](./10-FUNCIONALIDADES.md) | Features del sistema |
| [11-DEPLOYMENT](./11-DEPLOYMENT.md) | Despliegue Docker |
| [12-CONFIGURACION](./12-CONFIGURACION.md) | Variables de entorno |

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Development](#-development)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Documentation](#-documentation)

---

## Overview

Nature Marketplace is a sustainable e-commerce platform that connects conscious consumers with:

- **Tree Adoption**: Adopt trees and track their growth with real-time updates
- **Wellness Retreats**: Book eco-friendly retreat experiences
- **Sustainable Products**: Shop curated eco-conscious products

### Key Features

- **SEO-Optimized**: Server-side rendering for public pages
- **Internationalization**: Full support for English and Spanish
- **Secure Payments**: Stripe integration with PCI compliance
- **Real-time Tracking**: Monitor your adopted trees' growth journey
- **Gamification**: Earn green points and unlock achievements

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS, next-intl |
| **Backend** | Django 5, Django REST Framework, Python 3.11+ |
| **Database** | Supabase (PostgreSQL) |
| **Authentication** | Supabase Auth |
| **Payments** | Stripe |
| **Infrastructure** | Docker, Docker Compose |

---

## 📂 Project Structure

```
nature_marketplace/
├── frontend/                 # Next.js application (Presentation Layer)
│   ├── app/                  # App Router pages
│   │   ├── (public)/         # SEO-optimized public pages
│   │   ├── (auth)/           # Authentication pages
│   │   └── (dashboard)/      # Protected user pages
│   ├── components/           # Reusable UI components
│   ├── lib/                  # Utilities, API client, state
│   └── i18n/                 # Internationalization files
│
├── backend/                  # Django application (Business + Data Layer)
│   ├── config/               # Django settings and configuration
│   ├── users/                # User management app
│   ├── products/             # Products catalog app
│   ├── orders/               # Cart and orders app
│   ├── payments/             # Stripe integration app
│   └── ecosystems/           # Tree tracking app
│
├── docker/                   # Docker configuration files
├── docker-compose.yml        # Service orchestration
├── .env.example              # Environment variables template
└── README.md                 # This file
```

---

## 🚀 Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- [Node.js](https://nodejs.org/) 18+ (for local frontend development)
- [Python](https://python.org/) 3.11+ (for local backend development)

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/your-org/nature_marketplace.git
cd nature_marketplace

# Copy environment variables
cp .env.example .env

# Edit .env with your credentials
# (Supabase, Stripe, etc.)
```

### 2. Start with Docker (Recommended)

```bash
# Build and start all services
docker compose up --build

# Frontend: http://localhost:3000
# Backend:  http://localhost:8000
```

### 3. Start Locally (Alternative)

```bash
# Terminal 1: Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
```

---

## 💻 Development

### Common Commands

```bash
# Start all services
docker compose up

# Rebuild after dependency changes
docker compose up --build

# Stop all services
docker compose down

# View logs
docker compose logs -f [service_name]
```

### Backend Commands

```bash
cd backend

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run tests
python manage.py test

# Linting
flake8 .
black .
isort .
mypy .
```

### Frontend Commands

```bash
cd frontend

# Development server
npm run dev

# Production build
npm run build

# Linting
npm run lint

# Type checking
npm run type-check
```

---

## 🔐 Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description |
|----------|-------------|
| `DJANGO_SECRET_KEY` | Django secret key for cryptographic signing |
| `DATABASE_URL` | Supabase PostgreSQL connection string |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase service role key (backend only) |
| `STRIPE_SECRET_KEY` | Stripe API secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `NEXT_PUBLIC_API_URL` | Backend API URL for frontend |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL (public) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (public) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (public) |

See `.env.example` for the complete list.

---

## 📚 API Documentation

Once the backend is running, access the API documentation at:

- **Swagger UI**: http://localhost:8000/api/docs/
- **ReDoc**: http://localhost:8000/api/redoc/

### Main Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/products/` | GET | List all products |
| `/api/products/{id}/` | GET | Get product details |
| `/api/cart/` | GET/POST | Manage shopping cart |
| `/api/orders/` | GET/POST | Manage orders |
| `/api/ecosystems/trees/` | GET | List adopted trees |
| `/api/payments/checkout/` | POST | Create Stripe checkout session |

---

## 🚢 Deployment

### Production Checklist

- [ ] Set `DJANGO_DEBUG=False`
- [ ] Configure `ALLOWED_HOSTS`
- [ ] Set secure `DJANGO_SECRET_KEY`
- [ ] Enable HTTPS
- [ ] Configure production database
- [ ] Set up Stripe production keys
- [ ] Configure CORS for production domain
- [ ] Run `python manage.py check --deploy`

### Recommended Platforms

- **Frontend**: Vercel, Netlify, Cloudflare Pages
- **Backend**: Railway, Render, Fly.io
- **Database**: Supabase (managed PostgreSQL)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is proprietary. All rights reserved.

---

<p align="center">
  🌿 <strong>Build with intention. Ship with simplicity. Grow with nature.</strong> 🌿
</p>
