#!/bin/bash
# Firewall Configuration for Nature Marketplace
# Solo acepta conexiones de Cloudflare + SSH

set -e

echo "🔥 Configurando Firewall (UFW)"
echo "=============================="

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Por favor ejecuta como root (sudo)${NC}"
    exit 1
fi

# Instalar UFW si no existe
apt-get update
apt-get install -y ufw

# Reset UFW
echo -e "\n${GREEN}1. Reseteando reglas...${NC}"
ufw --force reset

# Políticas por defecto
echo -e "\n${GREEN}2. Configurando políticas por defecto...${NC}"
ufw default deny incoming
ufw default allow outgoing

# SSH (IMPORTANTE: no bloquearte a ti mismo)
echo -e "\n${GREEN}3. Permitiendo SSH...${NC}"
ufw allow 22/tcp comment 'SSH'

# Cloudflare IPs - HTTP/HTTPS
echo -e "\n${GREEN}4. Permitiendo IPs de Cloudflare...${NC}"

# IPv4 de Cloudflare
CLOUDFLARE_IPS_V4=(
    "103.21.244.0/22"
    "103.22.200.0/22"
    "103.31.4.0/22"
    "104.16.0.0/13"
    "104.24.0.0/14"
    "108.162.192.0/18"
    "131.0.72.0/22"
    "141.101.64.0/18"
    "162.158.0.0/15"
    "172.64.0.0/13"
    "173.245.48.0/20"
    "188.114.96.0/20"
    "190.93.240.0/20"
    "197.234.240.0/22"
    "198.41.128.0/17"
)

# IPv6 de Cloudflare
CLOUDFLARE_IPS_V6=(
    "2400:cb00::/32"
    "2606:4700::/32"
    "2803:f800::/32"
    "2405:b500::/32"
    "2405:8100::/32"
    "2a06:98c0::/29"
    "2c0f:f248::/32"
)

for ip in "${CLOUDFLARE_IPS_V4[@]}"; do
    ufw allow from $ip to any port 80,443 proto tcp comment 'Cloudflare'
done

for ip in "${CLOUDFLARE_IPS_V6[@]}"; do
    ufw allow from $ip to any port 80,443 proto tcp comment 'Cloudflare IPv6'
done

# Opcional: Permitir tu IP de administración
# echo -e "\n${GREEN}5. Permitiendo IP de admin...${NC}"
# ufw allow from YOUR_ADMIN_IP comment 'Admin IP'

# Habilitar UFW
echo -e "\n${GREEN}6. Habilitando firewall...${NC}"
ufw --force enable

# Mostrar estado
echo -e "\n${GREEN}7. Estado del firewall:${NC}"
ufw status verbose

echo -e "\n${GREEN}✅ Firewall configurado${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo "  - Solo Cloudflare puede acceder a puertos 80/443"
echo "  - SSH (22) está abierto desde cualquier IP"
echo "  - Para restringir SSH: ufw delete allow 22/tcp && ufw allow from YOUR_IP to any port 22"
echo ""
echo "Comandos útiles:"
echo "  ufw status numbered    - Ver reglas numeradas"
echo "  ufw delete [número]    - Eliminar regla"
echo "  ufw reload             - Recargar reglas"
