'use client';

import { useEffect, useRef } from 'react';

/**
 * LocationMap Component
 * 
 * Muestra un mapa con la ubicación de una unidad de apadrinamiento.
 * - Ubicación exacta: marcador preciso (para padrinos)
 * - Ubicación aproximada: círculo difuso (para visitantes)
 * 
 * Estilo similar a Airbnb: los no-padrinos ven un área general,
 * los padrinos ven la ubicación exacta.
 */

interface LocationData {
  type: 'exact' | 'approximate';
  name: string;
  lat: number | null;
  lng: number | null;
  area?: string;
  radius_km?: number;
  message?: string;
  can_visit?: boolean;
}

interface LocationMapProps {
  location: LocationData;
  className?: string;
  height?: string;
}

export function LocationMap({ location, className = '', height = '300px' }: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  // Si no hay coordenadas, mostrar placeholder
  if (!location.lat || !location.lng) {
    return (
      <div 
        className={`bg-dark-card rounded-xl flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center text-white/50">
          <span className="material-symbols-outlined text-4xl mb-2 block">location_off</span>
          <p>Ubicación no disponible</p>
        </div>
      </div>
    );
  }

  const isExact = location.type === 'exact';

  return (
    <div className={`relative rounded-xl overflow-hidden ${className}`} style={{ height }}>
      {/* Mapa estático (placeholder - en producción usar Mapbox/Google Maps) */}
      <div 
        ref={mapRef}
        className="w-full h-full bg-dark-card relative"
        style={{
          backgroundImage: `url('https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/${location.lng},${location.lat},${isExact ? 14 : 11},0/600x400?access_token=pk.placeholder')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Fallback visual cuando no hay API key */}
        <div className="absolute inset-0 bg-gradient-to-br from-olive-green/20 to-navy-blue/30">
          {/* Grid pattern para simular mapa */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }}
          />
          
          {/* Centro del mapa */}
          <div className="absolute inset-0 flex items-center justify-center">
            {isExact ? (
              // Marcador exacto
              <div className="relative">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/50 animate-pulse">
                  <span className="material-symbols-outlined text-background-dark text-lg">
                    location_on
                  </span>
                </div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rotate-45" />
              </div>
            ) : (
              // Círculo aproximado (estilo Airbnb)
              <div className="relative">
                {/* Círculo difuso exterior - más grande */}
                <div 
                  className="rounded-full bg-primary/15 border-2 border-primary/30 border-dashed"
                  style={{
                    width: `${Math.min(280, Math.max(120, (location.radius_km || 5) * 40))}px`,
                    height: `${Math.min(280, Math.max(120, (location.radius_km || 5) * 40))}px`,
                  }}
                >
                  {/* Gradiente interno para efecto difuso */}
                  <div className="absolute inset-0 rounded-full bg-gradient-radial from-primary/30 via-primary/10 to-transparent" />
                </div>
                {/* Punto central difuso */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-primary/40 rounded-full blur-sm" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-primary/60 rounded-full" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay con información */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background-dark/90 to-transparent p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-primary text-lg">
                {isExact ? 'location_on' : 'location_searching'}
              </span>
              <span className="text-white font-medium">
                {location.name}
              </span>
            </div>
            
            {!isExact && location.message && (
              <p className="text-white/50 text-sm flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">info</span>
                {location.message}
              </p>
            )}
            
            {isExact && location.can_visit && (
              <p className="text-primary text-sm flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">check_circle</span>
                Puedes visitar tu apadrinamiento
              </p>
            )}
          </div>
          
          {isExact && (
            <button 
              className="btn-secondary text-sm px-3 py-1.5 flex items-center gap-1"
              onClick={() => {
                window.open(
                  `https://www.google.com/maps?q=${location.lat},${location.lng}`,
                  '_blank'
                );
              }}
            >
              <span className="material-symbols-outlined text-sm">directions</span>
              Cómo llegar
            </button>
          )}
        </div>
      </div>

      {/* Badge de tipo de ubicación */}
      <div className="absolute top-3 left-3">
        <div className={`
          px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1
          ${isExact 
            ? 'bg-primary text-background-dark' 
            : 'bg-white/10 text-white/70 backdrop-blur-sm'
          }
        `}>
          <span className="material-symbols-outlined text-xs">
            {isExact ? 'verified' : 'blur_on'}
          </span>
          {isExact ? 'Ubicación exacta' : 'Área aproximada'}
        </div>
      </div>
    </div>
  );
}

/**
 * LocationMapSkeleton - Loading state
 */
export function LocationMapSkeleton({ height = '300px' }: { height?: string }) {
  return (
    <div 
      className="bg-dark-card rounded-xl animate-pulse"
      style={{ height }}
    >
      <div className="w-full h-full flex items-center justify-center">
        <span className="material-symbols-outlined text-white/20 text-4xl">map</span>
      </div>
    </div>
  );
}
