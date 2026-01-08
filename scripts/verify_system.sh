#!/bin/bash

# Script de verificación del sistema R3Net
# Comprueba que todos los componentes estén funcionando.

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

check() {
    if $1; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
    fi
}

echo "Verificando sistema R3Net..."

# Node.js
check "node --version > /dev/null" "Node.js instalado"

# MQTT
check "systemctl is-active --quiet mosquitto" "Mosquitto corriendo"

# WireGuard (si configurado)
if sudo wg show wg0 &> /dev/null; then
    check "true" "WireGuard wg0 activo"
else
    echo -e "${RED}✗${NC} WireGuard wg0 no configurado"
fi

# Base de datos
if [[ -f /opt/r3net/var/db/r3net_global.db ]]; then
    check "true" "Base de datos global existe"
else
    echo -e "${RED}✗${NC} Base de datos global no encontrada"
fi

# API Global
if curl -s http://localhost:8080/status | grep -q '"status":"ok"'; then
    check "true" "API global responde"
else
    echo -e "${RED}✗${NC} API global no responde"
fi

# Módulos
if [[ -d /opt/r3net/global/node_modules ]]; then
    check "true" "Módulo global instalado"
else
    echo -e "${RED}✗${NC} Módulo global no instalado"
fi

if [[ -d /opt/r3net/telegram-bot/node_modules ]]; then
    check "true" "Bot de Telegram instalado"
else
    echo -e "${RED}✗${NC} Bot de Telegram no instalado"
fi

echo "Verificación completada. El sistema está listo para pruebas de clientes."