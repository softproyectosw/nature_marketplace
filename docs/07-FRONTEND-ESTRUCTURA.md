# 🎨 Frontend - Estructura

## Visión General

El frontend está construido con Next.js 14 usando el App Router, React 18 y TypeScript.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         STACK FRONTEND                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Next.js 14          Framework React con SSR/SSG                       │
│  React 18            Biblioteca de UI con Server Components            │
│  TypeScript          Tipado estático                                   │
│  Tailwind CSS        Estilos utilitarios                               │
│  Lucide React        Iconografía                                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Estructura de Carpetas

```
frontend/
├── app/                        # App Router de Next.js
│   ├── (auth)/                # Grupo: rutas de autenticación
│   │   ├── login/
│   │   │   └── page.tsx       # /login
│   │   ├── register/
│   │   │   └── page.tsx       # /register
│   │   └── layout.tsx         # Layout compartido para auth
│   │
│   ├── (dashboard)/           # Grupo: rutas protegidas
│   │   ├── profile/
│   │   │   └── page.tsx       # /profile
│   │   ├── favorites/
│   │   │   └── page.tsx       # /favorites
│   │   ├── tracker/
│   │   │   └── page.tsx       # /tracker
│   │   ├── checkout/
│   │   │   └── page.tsx       # /checkout
│   │   └── layout.tsx         # Layout con navbar
│   │
│   ├── (public)/              # Grupo: rutas públicas
│   │   ├── products/
│   │   │   ├── page.tsx       # /products (listado)
│   │   │   └── [slug]/
│   │   │       └── page.tsx   # /products/roble-andino (detalle)
│   │   ├── units/
│   │   │   └── [slug]/
│   │   │       └── page.tsx   # /units/tree-2024-001
│   │   └── about/
│   │       └── page.tsx       # /about
│   │
│   ├── layout.tsx             # Layout raíz
│   ├── page.tsx               # Página principal (/)
│   ├── globals.css            # Estilos globales
│   ├── loading.tsx            # Loading UI global
│   ├── error.tsx              # Error UI global
│   └── not-found.tsx          # 404 page
│
├── components/                 # Componentes reutilizables
│   ├── ui/                    # Componentes base
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── index.ts           # Barrel export
│   │
│   ├── layout/                # Componentes de layout
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Navbar.tsx
│   │   └── Sidebar.tsx
│   │
│   ├── products/              # Componentes de productos
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── ProductFilters.tsx
│   │   └── ProductGallery.tsx
│   │
│   ├── maps/                  # Componentes de mapas
│   │   └── LocationMap.tsx
│   │
│   └── seo/                   # Componentes de SEO
│       └── MetaTags.tsx
│
├── lib/                        # Utilidades y configuración
│   ├── api/
│   │   ├── client.ts          # Cliente HTTP
│   │   ├── products.ts        # API de productos
│   │   ├── auth.ts            # API de autenticación
│   │   └── orders.ts          # API de órdenes
│   │
│   ├── hooks/                 # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useCart.ts
│   │   └── useProducts.ts
│   │
│   ├── context/               # React Context
│   │   ├── AuthContext.tsx
│   │   └── CartContext.tsx
│   │
│   └── utils/                 # Funciones helper
│       ├── formatters.ts
│       └── validators.ts
│
├── public/                     # Archivos estáticos
│   ├── images/
│   └── fonts/
│
├── middleware.ts               # Middleware de Next.js
├── next.config.js              # Configuración de Next.js
├── tailwind.config.ts          # Configuración de Tailwind
└── tsconfig.json               # Configuración de TypeScript
```

## App Router

### ¿Qué es el App Router?

El App Router es el nuevo sistema de rutas de Next.js 13+. Usa la estructura de carpetas para definir rutas:

```
app/
├── page.tsx              →  /
├── about/
│   └── page.tsx          →  /about
├── products/
│   ├── page.tsx          →  /products
│   └── [slug]/
│       └── page.tsx      →  /products/:slug
```

### Archivos Especiales

| Archivo | Propósito |
|---------|-----------|
| `page.tsx` | Define la UI de una ruta |
| `layout.tsx` | UI compartida entre rutas hijas |
| `loading.tsx` | UI de carga (Suspense) |
| `error.tsx` | UI de error |
| `not-found.tsx` | UI para 404 |

### Grupos de Rutas

Los paréntesis `()` crean grupos que no afectan la URL:

```
app/
├── (auth)/               # Grupo para autenticación
│   ├── login/
│   │   └── page.tsx      →  /login (no /auth/login)
│   └── layout.tsx        # Layout solo para auth
│
├── (dashboard)/          # Grupo para área privada
│   ├── profile/
│   │   └── page.tsx      →  /profile
│   └── layout.tsx        # Layout con navbar
```

## Server Components vs Client Components

### Server Components (Por defecto)

```tsx
// app/products/page.tsx
// Este es un Server Component (por defecto)

async function ProductsPage() {
  // Puedes hacer fetch directamente
  const products = await fetch('https://api.example.com/products');
  
  return (
    <div>
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
```

**Ventajas:**
- Se ejecutan en el servidor
- No envían JavaScript al cliente
- Pueden acceder directamente a la base de datos
- Mejor SEO

### Client Components

```tsx
// components/ui/Button.tsx
'use client';  // ← Marca como Client Component

import { useState } from 'react';

export function Button({ onClick, children }) {
  const [loading, setLoading] = useState(false);
  
  const handleClick = async () => {
    setLoading(true);
    await onClick();
    setLoading(false);
  };
  
  return (
    <button onClick={handleClick} disabled={loading}>
      {loading ? 'Cargando...' : children}
    </button>
  );
}
```

**Cuándo usar Client Components:**
- Interactividad (onClick, onChange)
- Hooks de React (useState, useEffect)
- APIs del navegador (localStorage, window)
- Librerías que usan hooks

### Patrón Recomendado

```tsx
// app/products/[slug]/page.tsx (Server Component)
import { ProductGallery } from '@/components/products/ProductGallery';

async function ProductPage({ params }) {
  // Fetch en el servidor
  const product = await getProduct(params.slug);
  
  return (
    <div>
      <h1>{product.title}</h1>
      {/* Pasar datos a Client Component */}
      <ProductGallery images={product.gallery} />
    </div>
  );
}

// components/products/ProductGallery.tsx (Client Component)
'use client';

export function ProductGallery({ images }) {
  const [activeIndex, setActiveIndex] = useState(0);
  
  return (
    <div>
      <img src={images[activeIndex].url} />
      <div>
        {images.map((img, i) => (
          <button key={i} onClick={() => setActiveIndex(i)}>
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
```

## Layouts

### Layout Raíz

```tsx
// app/layout.tsx
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Nature Marketplace',
  description: 'Apadrina árboles y protege el planeta',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-background-dark text-white`}>
        {children}
      </body>
    </html>
  );
}
```

### Layout de Dashboard

```tsx
// app/(dashboard)/layout.tsx
import { Navbar } from '@/components/layout/Navbar';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function DashboardLayout({ children }) {
  return (
    <AuthGuard>
      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
```

## Data Fetching

### En Server Components

```tsx
// app/products/page.tsx
async function ProductsPage() {
  // Fetch directo (se ejecuta en el servidor)
  const res = await fetch('https://api.example.com/products', {
    next: { revalidate: 60 }  // Revalidar cada 60 segundos
  });
  const products = await res.json();
  
  return <ProductGrid products={products} />;
}
```

### Con el Cliente API

```tsx
// lib/api/products.ts
import { apiClient } from './client';

export async function getProducts(params?: ProductFilters) {
  return apiClient.get('/api/products/', { params });
}

export async function getProduct(slug: string) {
  return apiClient.get(`/api/products/${slug}/`);
}

// app/products/[slug]/page.tsx
import { getProduct } from '@/lib/api/products';

async function ProductPage({ params }) {
  const product = await getProduct(params.slug);
  return <ProductDetail product={product} />;
}
```

### En Client Components

```tsx
// components/products/ProductSearch.tsx
'use client';

import { useState, useEffect } from 'react';
import { getProducts } from '@/lib/api/products';

export function ProductSearch() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  
  useEffect(() => {
    const search = async () => {
      if (query.length < 2) return;
      
      setLoading(true);
      const results = await getProducts({ search: query });
      setProducts(results);
      setLoading(false);
    };
    
    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [query]);
  
  return (
    <div>
      <input 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar productos..."
      />
      {loading ? <Spinner /> : <ProductGrid products={products} />}
    </div>
  );
}
```

## Middleware

El middleware intercepta requests antes de que lleguen a las páginas:

```tsx
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas que requieren autenticación
const protectedRoutes = ['/dashboard', '/profile', '/favorites', '/checkout'];

// Rutas de auth (redirigir si ya está logueado)
const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Obtener token de cookies
  const token = request.cookies.get('nature_access_token')?.value;
  const isAuthenticated = !!token;
  
  // Proteger rutas privadas
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  // Redirigir usuarios logueados fuera de auth
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public|api).*)'],
};
```

## Manejo de Estado

### Context API

```tsx
// lib/context/CartContext.tsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, options?: object) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState<CartItem[]>([]);
  
  // Cargar carrito del localStorage al montar
  useEffect(() => {
    const saved = localStorage.getItem('cart');
    if (saved) setItems(JSON.parse(saved));
  }, []);
  
  // Guardar en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);
  
  const addItem = (product, options = {}) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i => 
          i.product.id === product.id 
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { product, quantity: 1, options }];
    });
  };
  
  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity, 
    0
  );
  
  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
```

### Custom Hooks

```tsx
// lib/hooks/useAuth.ts
'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('nature_access_token');
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const userData = await apiClient.get('/api/users/me/');
        setUser(userData);
      } catch (error) {
        localStorage.removeItem('nature_access_token');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  const login = async (email: string, password: string) => {
    const response = await apiClient.post('/api/auth/login/', { email, password });
    localStorage.setItem('nature_access_token', response.access);
    setUser(response.user);
    return response;
  };
  
  const logout = async () => {
    const refresh = localStorage.getItem('nature_refresh_token');
    await apiClient.post('/api/auth/logout/', { refresh });
    localStorage.removeItem('nature_access_token');
    localStorage.removeItem('nature_refresh_token');
    setUser(null);
  };
  
  return { user, loading, login, logout, isAuthenticated: !!user };
}
```

## Rutas Dinámicas

### Parámetros de Ruta

```tsx
// app/products/[slug]/page.tsx
interface Props {
  params: { slug: string };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProduct(params.slug);
  
  if (!product) {
    notFound();  // Muestra app/not-found.tsx
  }
  
  return <ProductDetail product={product} />;
}

// Generar rutas estáticas en build time
export async function generateStaticParams() {
  const products = await getProducts();
  
  return products.map((product) => ({
    slug: product.slug,
  }));
}
```

### Catch-All Routes

```tsx
// app/docs/[...slug]/page.tsx
// Captura: /docs/intro, /docs/getting-started/installation, etc.

interface Props {
  params: { slug: string[] };
}

export default function DocsPage({ params }: Props) {
  // params.slug = ['getting-started', 'installation']
  const path = params.slug.join('/');
  return <DocContent path={path} />;
}
```

## Optimizaciones

### Imágenes

```tsx
import Image from 'next/image';

function ProductCard({ product }) {
  return (
    <div>
      <Image
        src={product.image}
        alt={product.title}
        width={400}
        height={300}
        placeholder="blur"
        blurDataURL="/placeholder.jpg"
        priority={product.is_featured}  // Cargar primero si es destacado
      />
    </div>
  );
}
```

### Lazy Loading

```tsx
import dynamic from 'next/dynamic';

// Cargar componente solo cuando se necesite
const Map = dynamic(() => import('@/components/maps/LocationMap'), {
  loading: () => <div className="h-64 bg-gray-800 animate-pulse" />,
  ssr: false,  // No renderizar en servidor (usa APIs del navegador)
});

function ProductPage({ product }) {
  return (
    <div>
      <h1>{product.title}</h1>
      <Map location={product.location} />
    </div>
  );
}
```

### Prefetching

```tsx
import Link from 'next/link';

// Next.js prefetch automáticamente los links visibles
function ProductCard({ product }) {
  return (
    <Link 
      href={`/products/${product.slug}`}
      prefetch={true}  // true por defecto
    >
      <div className="card">
        {product.title}
      </div>
    </Link>
  );
}
```
