#!/bin/bash
# CrowdSec Installation Script for Nature Marketplace
# Sistema de seguridad colaborativo y ligero

set -e

echo "🛡️  Instalando CrowdSec - Sistema de Seguridad Colaborativo"
echo "============================================================"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar que se ejecuta como root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Por favor ejecuta como root (sudo)${NC}"
    exit 1
fi

# Detectar sistema operativo
if [ -f /etc/debian_version ]; then
    OS="debian"
elif [ -f /etc/redhat-release ]; then
    OS="redhat"
else
    echo -e "${RED}Sistema operativo no soportado${NC}"
    exit 1
fi

echo -e "${YELLOW}Sistema detectado: $OS${NC}"

# Instalar CrowdSec
echo -e "\n${GREEN}1. Instalando CrowdSec...${NC}"
if [ "$OS" = "debian" ]; then
    curl -s https://install.crowdsec.net | bash
    apt-get update
    apt-get install -y crowdsec
else
    curl -s https://install.crowdsec.net | bash
    yum install -y crowdsec
fi

# Instalar bouncer para Nginx
echo -e "\n${GREEN}2. Instalando Nginx Bouncer...${NC}"
if [ "$OS" = "debian" ]; then
    apt-get install -y crowdsec-nginx-bouncer
else
    yum install -y crowdsec-nginx-bouncer
fi

# Instalar colecciones útiles
echo -e "\n${GREEN}3. Instalando colecciones de seguridad...${NC}"
cscli collections install crowdsecurity/nginx
cscli collections install crowdsecurity/http-cve
cscli collections install crowdsecurity/whitelist-good-actors
cscli collections install crowdsecurity/sshd  # Si tienes SSH

# Instalar scenarios adicionales
echo -e "\n${GREEN}4. Instalando scenarios de detección...${NC}"
cscli scenarios install crowdsecurity/http-bad-user-agent
cscli scenarios install crowdsecurity/http-crawl-non_statics
cscli scenarios install crowdsecurity/http-probing
cscli scenarios install crowdsecurity/http-sensitive-files
cscli scenarios install crowdsecurity/http-sqli
cscli scenarios install crowdsecurity/http-xss

# Configurar para leer logs de Nginx
echo -e "\n${GREEN}5. Configurando lectura de logs...${NC}"
cat > /etc/crowdsec/acquis.yaml << 'EOF'
# Nginx access logs
filenames:
  - /var/log/nginx/access.log
  - /var/log/nginx/security.log
labels:
  type: nginx
---
# Nginx error logs
filenames:
  - /var/log/nginx/error.log
labels:
  type: nginx
---
# SSH logs (opcional)
filenames:
  - /var/log/auth.log
labels:
  type: syslog
EOF

# Configurar whitelist para IPs de Cloudflare
echo -e "\n${GREEN}6. Configurando whitelist de Cloudflare...${NC}"
cat > /etc/crowdsec/parsers/s02-enrich/cloudflare-whitelist.yaml << 'EOF'
# Whitelist Cloudflare IPs
name: crowdsecurity/cloudflare-whitelist
description: "Whitelist Cloudflare IP ranges"
filter: "evt.Parsed.source_ip in ['103.21.244.0/22', '103.22.200.0/22', '103.31.4.0/22', '104.16.0.0/13', '104.24.0.0/14', '108.162.192.0/18', '131.0.72.0/22', '141.101.64.0/18', '162.158.0.0/15', '172.64.0.0/13', '173.245.48.0/20', '188.114.96.0/20', '190.93.240.0/20', '197.234.240.0/22', '198.41.128.0/17']"
whitelist:
  reason: "Cloudflare IP"
  ip: "evt.Parsed.source_ip"
EOF

# Configurar notificaciones (opcional - Slack/Discord/Email)
echo -e "\n${GREEN}7. Configuración de notificaciones...${NC}"
cat > /etc/crowdsec/notifications/http.yaml << 'EOF'
# Webhook notifications (Slack, Discord, etc.)
# Descomentar y configurar según necesidad
#
# type: http
# name: slack_notification
# log_level: info
# format: |
#   {
#     "text": "🚨 CrowdSec Alert: {{.Alert.Scenario}} from {{.Alert.Source.IP}} ({{.Alert.Source.Cn}})"
#   }
# url: "YOUR_SLACK_WEBHOOK_URL"
# method: POST
# headers:
#   Content-Type: application/json
EOF

# Reiniciar servicios
echo -e "\n${GREEN}8. Reiniciando servicios...${NC}"
systemctl restart crowdsec
systemctl enable crowdsec
systemctl restart nginx

# Verificar estado
echo -e "\n${GREEN}9. Verificando instalación...${NC}"
cscli metrics

echo -e "\n${GREEN}✅ CrowdSec instalado correctamente${NC}"
echo ""
echo "Comandos útiles:"
echo "  cscli metrics              - Ver métricas en tiempo real"
echo "  cscli decisions list       - Ver IPs bloqueadas"
echo "  cscli alerts list          - Ver alertas recientes"
echo "  cscli bouncers list        - Ver bouncers activos"
echo "  cscli hub update           - Actualizar colecciones"
echo ""
echo "Dashboard (opcional):"
echo "  cscli console enroll       - Conectar al dashboard de CrowdSec"
echo ""
echo -e "${YELLOW}⚠️  Recuerda revisar /etc/crowdsec/acquis.yaml si tus logs están en otra ubicación${NC}"
