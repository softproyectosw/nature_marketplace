# 🎨 Frontend - Sistema de Diseño

## Identidad Visual

### Concepto: "Eco-Luxury"

La marca combina ecología con sofisticación. La interfaz es oscura, elegante y usa efectos de glassmorphism.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PRINCIPIOS DE DISEÑO                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  🌙 MODO OSCURO                                                         │
│     Fondo oscuro que evoca el bosque nocturno                          │
│                                                                         │
│  ✨ GLASSMORPHISM                                                       │
│     Efectos de vidrio esmerilado para cards y modales                  │
│                                                                         │
│  🌿 COLORES NATURALES                                                   │
│     Paleta inspirada en la naturaleza                                   │
│                                                                         │
│  📱 MOBILE FIRST                                                        │
│     Diseño responsive desde móvil hacia desktop                        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Paleta de Colores

### Colores Principales

```css
/* tailwind.config.ts */
colors: {
  /* Primario - Verde Oliva */
  primary: {
    DEFAULT: '#6B7B3C',
    light: '#8A9B5C',
    dark: '#4A5A2C',
  },
  
  /* Secundario - Azul Marino */
  secondary: {
    DEFAULT: '#1E3A5F',
    light: '#2E4A7F',
    dark: '#0E2A4F',
  },
  
  /* Fondos Oscuros */
  background: {
    dark: '#0D1117',      /* Fondo principal */
    card: '#161B22',      /* Cards y contenedores */
    elevated: '#21262D',  /* Elementos elevados */
  },
  
  /* Acentos */
  accent: {
    gold: '#8B6914',      /* Tierra, premium */
    success: '#238636',   /* Éxito, crecimiento */
    warning: '#9E6A03',   /* Advertencia */
    error: '#DA3633',     /* Error */
  },
  
  /* Texto */
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255, 255, 255, 0.7)',
    muted: 'rgba(255, 255, 255, 0.5)',
  }
}
```

### Uso de Colores

| Color | Uso |
|-------|-----|
| `primary` | Botones principales, links, acentos |
| `secondary` | Fondos de secciones, bordes |
| `background-dark` | Fondo de página |
| `background-card` | Cards, modales |
| `accent-gold` | Elementos premium, badges |
| `accent-success` | Estados positivos, confirmaciones |

### Ejemplo Visual

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ██████  PRIMARY (#6B7B3C) - Botones, CTAs                             │
│  ██████  SECONDARY (#1E3A5F) - Fondos secundarios                      │
│  ██████  BACKGROUND (#0D1117) - Fondo principal                        │
│  ██████  CARD (#161B22) - Cards y contenedores                         │
│  ██████  GOLD (#8B6914) - Elementos premium                            │
│  ██████  SUCCESS (#238636) - Estados positivos                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Tipografía

### Fuentes

```css
/* globals.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

body {
  font-family: 'Inter', system-ui, sans-serif;
}
```

### Escala Tipográfica

```css
/* Tailwind classes */
text-xs    /* 12px - Etiquetas pequeñas */
text-sm    /* 14px - Texto secundario */
text-base  /* 16px - Texto normal */
text-lg    /* 18px - Texto destacado */
text-xl    /* 20px - Subtítulos */
text-2xl   /* 24px - Títulos de sección */
text-3xl   /* 30px - Títulos de página */
text-4xl   /* 36px - Títulos hero */
text-5xl   /* 48px - Títulos landing */
```

### Pesos

```css
font-normal   /* 400 - Texto normal */
font-medium   /* 500 - Énfasis leve */
font-semibold /* 600 - Subtítulos */
font-bold     /* 700 - Títulos */
```

## Espaciado

### Sistema de 4px

```css
/* Tailwind usa múltiplos de 4px */
p-1   /* 4px */
p-2   /* 8px */
p-3   /* 12px */
p-4   /* 16px */
p-5   /* 20px */
p-6   /* 24px */
p-8   /* 32px */
p-10  /* 40px */
p-12  /* 48px */
p-16  /* 64px */
```

### Guía de Espaciado

| Contexto | Espaciado |
|----------|-----------|
| Entre elementos de texto | `gap-1` a `gap-2` |
| Entre elementos de UI | `gap-3` a `gap-4` |
| Padding de cards | `p-4` a `p-6` |
| Padding de secciones | `py-8` a `py-16` |
| Margen entre secciones | `my-8` a `my-16` |

## Componentes UI

### Button

```tsx
// components/ui/Button.tsx
'use client';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled,
  loading,
  className = '',
}: ButtonProps) {
  const baseStyles = `
    inline-flex items-center justify-center
    font-medium rounded-lg
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-primary/50
    disabled:opacity-50 disabled:cursor-not-allowed
  `;
  
  const variants = {
    primary: 'bg-primary hover:bg-primary-light text-white',
    secondary: 'bg-secondary hover:bg-secondary-light text-white',
    outline: 'border-2 border-primary text-primary hover:bg-primary/10',
    ghost: 'text-white/70 hover:text-white hover:bg-white/10',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
```

**Uso:**
```tsx
<Button variant="primary" size="lg">Apadrinar Ahora</Button>
<Button variant="outline">Ver Detalles</Button>
<Button variant="ghost" size="sm">Cancelar</Button>
```

### Card

```tsx
// components/ui/Card.tsx
interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
}

export function Card({ children, className = '', hover = false, glass = false }: CardProps) {
  const baseStyles = 'rounded-xl overflow-hidden';
  
  const glassStyles = glass
    ? 'bg-white/5 backdrop-blur-md border border-white/10'
    : 'bg-background-card';
  
  const hoverStyles = hover
    ? 'transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl'
    : '';
  
  return (
    <div className={`${baseStyles} ${glassStyles} ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
}
```

**Uso:**
```tsx
<Card hover>
  <img src={product.image} alt={product.title} />
  <div className="p-4">
    <h3>{product.title}</h3>
    <p>{product.price}</p>
  </div>
</Card>

<Card glass className="p-6">
  <h2>Contenido con efecto glass</h2>
</Card>
```

### Input

```tsx
// components/ui/Input.tsx
'use client';

import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-white/70 mb-1">
            {label}
          </label>
        )}
        
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            className={`
              w-full px-4 py-2 
              ${icon ? 'pl-10' : ''}
              bg-background-elevated 
              border border-white/10 
              rounded-lg
              text-white placeholder-white/30
              focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
              transition-colors
              ${error ? 'border-red-500' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-red-400">{error}</p>
        )}
      </div>
    );
  }
);
```

**Uso:**
```tsx
<Input 
  label="Email"
  type="email"
  placeholder="tu@email.com"
  icon={<MailIcon />}
  error={errors.email}
/>
```

### ProductCard

```tsx
// components/products/ProductCard.tsx
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';

interface ProductCardProps {
  product: {
    id: number;
    slug: string;
    title: string;
    short_description: string;
    price: string;
    price_label: string;
    primary_image: string;
    co2_offset_kg: string;
    location_name: string;
    is_featured: boolean;
    is_new: boolean;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.slug}`}>
      <Card hover className="h-full">
        {/* Imagen */}
        <div className="relative aspect-[4/3]">
          <Image
            src={product.primary_image}
            alt={product.title}
            fill
            className="object-cover"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {product.is_featured && (
              <span className="px-2 py-1 bg-accent-gold text-white text-xs font-medium rounded-full">
                Destacado
              </span>
            )}
            {product.is_new && (
              <span className="px-2 py-1 bg-primary text-white text-xs font-medium rounded-full">
                Nuevo
              </span>
            )}
          </div>
        </div>
        
        {/* Contenido */}
        <div className="p-4">
          <h3 className="font-semibold text-lg text-white mb-1">
            {product.title}
          </h3>
          
          <p className="text-white/60 text-sm mb-3 line-clamp-2">
            {product.short_description}
          </p>
          
          {/* Métricas */}
          <div className="flex items-center gap-4 text-sm text-white/50 mb-3">
            <span className="flex items-center gap-1">
              <span className="text-primary">🌿</span>
              {product.co2_offset_kg} kg CO2/año
            </span>
            <span className="flex items-center gap-1">
              <span className="text-primary">📍</span>
              {product.location_name}
            </span>
          </div>
          
          {/* Precio */}
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-primary">
              ${product.price}
            </span>
            <span className="text-white/50">
              {product.price_label}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
```

## Efectos y Animaciones

### Glassmorphism

```css
/* Efecto de vidrio esmerilado */
.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Tailwind equivalente */
className="bg-white/5 backdrop-blur-md border border-white/10"
```

### Hover Effects

```css
/* Elevación suave */
.card-hover {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

/* Tailwind */
className="transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
```

### Animaciones con Tailwind

```tsx
// Fade in
<div className="animate-fade-in">...</div>

// Pulse (para loading)
<div className="animate-pulse">...</div>

// Spin (para spinners)
<svg className="animate-spin h-5 w-5">...</svg>

// Bounce (para notificaciones)
<div className="animate-bounce">...</div>
```

### Animaciones Personalizadas

```js
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
};
```

## Responsive Design

### Breakpoints

```css
/* Tailwind breakpoints */
sm: 640px   /* Móvil grande */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Desktop grande */
2xl: 1536px /* Pantallas grandes */
```

### Mobile First

```tsx
// Diseño mobile first
<div className="
  grid 
  grid-cols-1        /* 1 columna en móvil */
  sm:grid-cols-2     /* 2 columnas desde 640px */
  lg:grid-cols-3     /* 3 columnas desde 1024px */
  xl:grid-cols-4     /* 4 columnas desde 1280px */
  gap-4
  sm:gap-6
">
  {products.map(p => <ProductCard key={p.id} product={p} />)}
</div>
```

### Ejemplo Completo

```tsx
function ProductPage({ product }) {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Layout responsive */}
      <div className="
        flex flex-col        /* Stack en móvil */
        lg:flex-row          /* Side by side en desktop */
        gap-8
      ">
        {/* Galería */}
        <div className="
          w-full               /* Full width en móvil */
          lg:w-1/2             /* 50% en desktop */
        ">
          <ProductGallery images={product.gallery} />
        </div>
        
        {/* Info */}
        <div className="
          w-full
          lg:w-1/2
          lg:sticky            /* Sticky solo en desktop */
          lg:top-24
          lg:self-start
        ">
          <h1 className="
            text-2xl           /* Más pequeño en móvil */
            md:text-3xl        /* Más grande en tablet */
            lg:text-4xl        /* Aún más grande en desktop */
            font-bold
          ">
            {product.title}
          </h1>
          
          {/* Precio */}
          <div className="
            flex 
            flex-col           /* Stack en móvil */
            sm:flex-row        /* Inline desde tablet */
            sm:items-center
            gap-2
            mt-4
          ">
            <span className="text-3xl font-bold text-primary">
              ${product.price}
            </span>
            <span className="text-white/50">
              {product.price_label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Dark Mode

El sitio usa modo oscuro por defecto. Si quisieras agregar modo claro:

```tsx
// lib/context/ThemeContext.tsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'dark' | 'light' | 'system';

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
} | null>(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState<Theme>('dark');
  
  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

```css
/* globals.css */
:root {
  --background: #ffffff;
  --foreground: #0d1117;
}

.dark {
  --background: #0d1117;
  --foreground: #ffffff;
}
```

## Iconografía

### Lucide React

```tsx
import { 
  Heart, 
  ShoppingCart, 
  User, 
  Search,
  MapPin,
  Leaf,
  Calendar,
  ChevronRight
} from 'lucide-react';

function Example() {
  return (
    <div className="flex items-center gap-2">
      <Leaf className="w-5 h-5 text-primary" />
      <span>22 kg CO2/año</span>
    </div>
  );
}
```

### Tamaños Recomendados

| Contexto | Tamaño |
|----------|--------|
| Inline con texto | `w-4 h-4` |
| Botones | `w-5 h-5` |
| Cards | `w-6 h-6` |
| Hero/destacados | `w-8 h-8` a `w-12 h-12` |

## Accesibilidad

### Contraste

```css
/* Asegurar contraste suficiente */
/* Texto principal sobre fondo oscuro: ratio 7:1+ */
text-white          /* #FFFFFF sobre #0D1117 = 15.4:1 ✓ */

/* Texto secundario: ratio 4.5:1+ */
text-white/70       /* rgba(255,255,255,0.7) = 10.8:1 ✓ */

/* Texto muted: ratio 3:1+ (solo decorativo) */
text-white/50       /* rgba(255,255,255,0.5) = 7.7:1 ✓ */
```

### Focus States

```tsx
<button className="
  focus:outline-none 
  focus:ring-2 
  focus:ring-primary 
  focus:ring-offset-2 
  focus:ring-offset-background-dark
">
  Click me
</button>
```

### ARIA Labels

```tsx
<button 
  aria-label="Agregar al carrito"
  className="p-2 rounded-full hover:bg-white/10"
>
  <ShoppingCart className="w-5 h-5" />
</button>

<nav aria-label="Navegación principal">
  ...
</nav>

<main role="main" aria-label="Contenido principal">
  ...
</main>
```
