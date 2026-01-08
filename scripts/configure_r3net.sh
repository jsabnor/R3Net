#!/bin/bash

# Script de configuración interactiva para R3Net
# Configura WireGuard, MQTT, variables de entorno y bot de Telegram.
# Ejecutar como root después de install_dependencies.sh.

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Verificar root
if [[ $EUID -ne 0 ]]; then
    error "Ejecuta como root: sudo bash scripts/configure_r3net.sh"
    exit 1
fi

log "Iniciando configuración de R3Net..."

# 1. Configurar WireGuard
log "Configuración de WireGuard"
read -p "Ingresa la IP privada del VPS maestro (ej. 10.0.0.1): " WG_IP
read -p "Ingresa el puerto WireGuard (ej. 51820): " WG_PORT
read -p "Ingresa la clave privada WireGuard del VPS (genera con wg genkey): " WG_PRIVATE_KEY

# Crear interfaz wg0
cat > /etc/wireguard/wg0.conf <<EOF
[Interface]
Address = $WG_IP/24
ListenPort = $WG_PORT
PrivateKey = $WG_PRIVATE_KEY
EOF

# Habilitar y iniciar
systemctl enable wg-quick@wg0
systemctl start wg-quick@wg0
log "WireGuard configurado en wg0 con IP $WG_IP"

# 2. Configurar MQTT
log "Configuración de MQTT"
read -p "Ingresa el usuario MQTT para R3Net: " MQTT_USER
read -s -p "Ingresa la contraseña MQTT: " MQTT_PASS
echo

# Crear usuario
mosquitto_passwd -b /etc/mosquitto/passwd $MQTT_USER $MQTT_PASS

# ACL
cat > /etc/mosquitto/acl <<EOF
user $MQTT_USER
topic readwrite r3net/#
EOF

# Cambiar a autenticado
sed -i 's/allow_anonymous true/allow_anonymous false/' /etc/mosquitto/conf.d/r3net.conf
systemctl restart mosquitto
log "MQTT configurado con usuario $MQTT_USER"

# 3. Variables de entorno para módulos
log "Configuración de variables de entorno"
PROJECT_DIR="/opt/r3net"

# Global
cat > $PROJECT_DIR/global/.env <<EOF
R3NET_DB_PATH=$PROJECT_DIR/var/db/r3net_global.db
R3NET_MQTT_URL=mqtt://$MQTT_USER:$MQTT_PASS@localhost:1883
R3NET_WG_INTERFACE=wg0
EOF

# Telegram Bot (asumiendo que existe)
if [[ -d "$PROJECT_DIR/telegram-bot" ]]; then
    read -p "Ingresa el token del bot de Telegram: " TG_TOKEN
    read -p "Ingresa el chat ID de Telegram para notificaciones: " TG_CHAT_ID
    cat > $PROJECT_DIR/telegram-bot/.env <<EOF
TELEGRAM_TOKEN=$TG_TOKEN
TELEGRAM_CHAT_ID=$TG_CHAT_ID
R3NET_MQTT_URL=mqtt://$MQTT_USER:$MQTT_PASS@localhost:1883
EOF
    log "Bot de Telegram configurado"
else
    warn "Carpeta telegram-bot no encontrada. Instala el módulo primero."
fi

# 4. Servicios systemd (asumiendo que existen)
log "Habilitando servicios"
if [[ -f /etc/systemd/system/r3net-global.service ]]; then
    systemctl enable r3net-global
    systemctl start r3net-global
    log "Servicio r3net-global habilitado"
else
    warn "Archivo r3net-global.service no encontrado en /etc/systemd/system/"
fi

if [[ -f /etc/systemd/system/r3net-telegram.service ]]; then
    systemctl enable r3net-telegram
    systemctl start r3net-telegram
    log "Servicio r3net-telegram habilitado"
else
    warn "Archivo r3net-telegram.service no encontrado"
fi

log "Configuración completada. Reinicia el sistema si es necesario."
log "Verifica con: systemctl status r3net-global"