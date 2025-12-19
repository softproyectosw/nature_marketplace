# Configuración de Cloudflare para Nature Marketplace

## 1. Agregar tu dominio a Cloudflare

1. Ve a [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click "Add a Site"
3. Ingresa tu dominio (ej: `naturemarketplace.com`)
4. Selecciona el plan Free
5. Cloudflare escaneará tus DNS records

## 2. Actualizar Nameservers

Cloudflare te dará 2 nameservers. Actualízalos en Hostinger:

1. Ve a Hostinger Panel > Dominios
2. Selecciona tu dominio
3. Cambia los nameservers a los de Cloudflare:
   - `xxx.ns.cloudflare.com`
   - `yyy.ns.cloudflare.com`

## 3. Configurar DNS Records

En Cloudflare Dashboard > DNS > Records, agrega:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | @ | TU_IP_VPS | ✅ Proxied |
| A | www | TU_IP_VPS | ✅ Proxied |
| A | api | TU_IP_VPS | ✅ Proxied |

## 4. Configurar SSL/TLS

Ve a SSL/TLS > Overview:

1. Selecciona **Full (strict)** - Recomendado
   - O **Flexible** si no tienes SSL en el servidor

Ve a SSL/TLS > Edge Certificates:

1. ✅ Always Use HTTPS
2. ✅ Automatic HTTPS Rewrites
3. Minimum TLS Version: TLS 1.2

## 5. Configurar Page Rules (Opcional)

Ve a Rules > Page Rules:

### Forzar HTTPS
- URL: `*yourdomain.com/*`
- Setting: Always Use HTTPS

### Cache de assets estáticos
- URL: `*yourdomain.com/storage/*`
- Setting: Cache Level = Cache Everything
- Edge Cache TTL: 1 month

## 6. Configurar Firewall y Seguridad (IMPORTANTE)

### 6.1 WAF (Web Application Firewall)

Ve a Security > WAF:

1. ✅ Activa "Managed Rules" (protección básica gratis)
2. ✅ Activa "Bot Fight Mode" - Bloquea bots maliciosos
3. ✅ Activa "Browser Integrity Check"

### 6.2 Security Settings

Ve a Security > Settings:

1. Security Level: **High** (recomendado para e-commerce)
2. Challenge Passage: 30 minutes
3. ✅ Privacy Pass Support

### 6.3 Rate Limiting (Plan Pro o superior, o usar Nginx)

Ve a Security > WAF > Rate limiting rules:

```
Rule 1: Login Protection
- URI Path contains "/api/auth" OR "/admin"
- Rate: 5 requests per minute
- Action: Block for 1 hour

Rule 2: API Protection  
- URI Path starts with "/api/"
- Rate: 60 requests per minute
- Action: Challenge

Rule 3: General Protection
- All traffic
- Rate: 100 requests per 10 seconds
- Action: Challenge
```

### 6.4 Firewall Rules (Gratis)

Ve a Security > WAF > Custom rules:

```
Rule: Block Bad Bots
Expression:
(cf.client.bot) or 
(http.user_agent contains "sqlmap") or
(http.user_agent contains "nikto") or
(http.user_agent contains "nmap") or
(http.user_agent contains "masscan") or
(http.request.uri.path contains ".env") or
(http.request.uri.path contains ".git") or
(http.request.uri.path contains "wp-admin") or
(http.request.uri.path contains "phpmyadmin")
Action: Block
```

```
Rule: Challenge Suspicious Countries (Opcional - NO bloquear)
Expression:
(ip.geoip.country in {"RU" "CN" "KP"}) and 
(http.request.uri.path contains "/api/")
Action: Managed Challenge (NO Block - mantener abierto)
```

### 6.5 DDoS Protection

Ve a Security > DDoS:

1. ✅ HTTP DDoS attack protection: On
2. Sensitivity: High
3. ✅ Enable all mitigations

## 7. Optimización de Performance

Ve a Speed > Optimization:

1. ✅ Auto Minify: JavaScript, CSS, HTML
2. ✅ Brotli compression
3. ✅ Early Hints
4. ✅ Rocket Loader (prueba, puede causar issues con React)

Ve a Caching > Configuration:

1. Caching Level: Standard
2. Browser Cache TTL: 4 hours

## 8. Variables de Entorno

Actualiza tu `.env.production`:

```env
DOMAIN=yourdomain.com
NEXT_PUBLIC_API_URL=https://yourdomain.com
NEXT_PUBLIC_MINIO_URL=https://yourdomain.com/storage
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## 9. Verificar Configuración

Después del deploy, verifica:

1. ✅ `https://yourdomain.com` - Frontend carga
2. ✅ `https://yourdomain.com/api/health/` - Backend responde
3. ✅ `https://yourdomain.com/api/docs/` - API docs funcionan
4. ✅ SSL certificate válido (candado verde)

## Troubleshooting

### Error 522 (Connection timed out)
- Verifica que el VPS está corriendo
- Verifica que los puertos 80/443 están abiertos
- Verifica que nginx está corriendo: `docker compose -f docker-compose.prod.yml logs nginx`

### Error 524 (Timeout)
- El backend está tardando mucho
- Revisa logs: `docker compose -f docker-compose.prod.yml logs backend`

### Mixed Content Errors
- Asegúrate que todas las URLs usan HTTPS
- Verifica `NEXT_PUBLIC_API_URL` y `NEXT_PUBLIC_MINIO_URL`

### CORS Errors
- Verifica `CORS_ALLOWED_ORIGINS` incluye tu dominio con https://
- Revisa que nginx está pasando los headers correctamente

## 10. Protección del Servidor (VPS)

### 10.1 Firewall UFW - Solo Cloudflare

Ejecuta el script de configuración:

```bash
chmod +x scripts/setup-firewall.sh
sudo ./scripts/setup-firewall.sh
```

Esto configura UFW para:
- ✅ Solo aceptar HTTP/HTTPS desde IPs de Cloudflare
- ✅ Permitir SSH (puerto 22)
- ❌ Bloquear todo lo demás

### 10.2 CrowdSec - Detección de Intrusos

Sistema ligero y colaborativo de seguridad:

```bash
chmod +x scripts/setup-crowdsec.sh
sudo ./scripts/setup-crowdsec.sh
```

CrowdSec proporciona:
- 🔍 Detección de ataques en tiempo real
- 🚫 Bloqueo automático de IPs maliciosas
- 🌐 Base de datos colaborativa de amenazas
- 📊 Dashboard de métricas

Comandos útiles:
```bash
# Ver métricas
sudo cscli metrics

# Ver IPs bloqueadas
sudo cscli decisions list

# Ver alertas
sudo cscli alerts list

# Desbloquear IP manualmente
sudo cscli decisions delete --ip X.X.X.X
```

### 10.3 Fail2Ban (Alternativa a CrowdSec)

Si prefieres Fail2Ban:

```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

Configuración `/etc/fail2ban/jail.local`:
```ini
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 5

[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true
logpath = /var/log/nginx/error.log

[sshd]
enabled = true
```

### 10.4 Monitoreo de Logs

Script para analizar ataques:

```bash
# Top 10 IPs con más requests
cat /var/log/nginx/security.log | awk '{print $3}' | sort | uniq -c | sort -rn | head -10

# Requests bloqueados (444)
grep " 444 " /var/log/nginx/access.log | wc -l

# Países con más tráfico
cat /var/log/nginx/security.log | awk '{print $4}' | sort | uniq -c | sort -rn | head -10

# User agents sospechosos
grep -E "(sqlmap|nikto|nmap)" /var/log/nginx/access.log
```

## Comandos Útiles

```bash
# Ver estado de servicios
docker compose -f docker-compose.prod.yml ps

# Ver logs en tiempo real
docker compose -f docker-compose.prod.yml logs -f

# Ver logs de seguridad
tail -f /var/log/nginx/security.log

# Reiniciar un servicio
docker compose -f docker-compose.prod.yml restart nginx

# Ver uso de recursos
docker stats

# Ver conexiones activas
ss -tuln

# Ver IPs conectadas
netstat -ntu | awk '{print $5}' | cut -d: -f1 | sort | uniq -c | sort -n
```

## Resumen de Capas de Seguridad

```
┌─────────────────────────────────────────────────────────────┐
│                      INTERNET                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE                               │
│  ✅ DDoS Protection                                         │
│  ✅ WAF (SQL injection, XSS)                               │
│  ✅ Bot Fight Mode                                          │
│  ✅ Rate Limiting                                           │
│  ✅ SSL/TLS Termination                                     │
│  ✅ Geo-blocking (challenge, no block)                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    UFW FIREWALL                             │
│  ✅ Solo IPs de Cloudflare en 80/443                       │
│  ✅ SSH restringido                                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    CROWDSEC                                 │
│  ✅ Detección de patrones de ataque                        │
│  ✅ Bloqueo automático                                      │
│  ✅ Base de datos colaborativa                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    NGINX                                    │
│  ✅ Rate limiting por zona                                  │
│  ✅ Bloqueo de user agents maliciosos                      │
│  ✅ Bloqueo de URIs sospechosas                            │
│  ✅ Límite de conexiones por IP                            │
│  ✅ Security headers                                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    DJANGO                                   │
│  ✅ CSRF Protection                                         │
│  ✅ SQL Injection Prevention (ORM)                         │
│  ✅ XSS Prevention                                          │
│  ✅ JWT Authentication                                      │
└─────────────────────────────────────────────────────────────┘
```
