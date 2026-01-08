#!/bin/bash

# Script de instalación de dependencias para R3Net
# Este script prepara un VPS Ubuntu/Debian desde cero para ejecutar R3Net.
# Debe ejecutarse con privilegios de root: sudo bash install_dependencies.sh
# Es idempotente: puede ejecutarse múltiples veces sin problemas.

set -e  # Salir en caso de error

# Función para logging
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Verificar si estamos en root
if [[ $EUID -ne 0 ]]; then
    echo "Este script debe ejecutarse como root. Usa: sudo bash install_dependencies.sh"
    exit 1
fi

log "Iniciando instalación de dependencias para R3Net..."

# 1. Actualizar el sistema
log "Actualizando el sistema..."
apt update && apt upgrade -y

# 2. Instalar Node.js LTS y npm
if ! command -v node &> /dev/null; then
    log "Instalando Node.js LTS..."
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt install -y nodejs
else
    log "Node.js ya está instalado."
fi

# 3. Instalar dependencias del sistema
log "Instalando dependencias del sistema..."
apt install -y curl git ufw fail2ban sqlite3 wireguard wireguard-tools mosquitto mosquitto-clients

# 4. Crear estructura de carpetas
log "Creando estructura de carpetas..."
PROJECT_DIR="/opt/r3net"
mkdir -p "$PROJECT_DIR"/{install,scripts,global,telegram-bot,regional,local,docs,etc,var,var/db}

# 5. Crear base de datos global SQLite si no existe
DB_PATH="$PROJECT_DIR/var/db/r3net_global.db"
if [[ ! -f "$DB_PATH" ]]; then
    log "Creando base de datos global SQLite..."
    sqlite3 "$DB_PATH" "VACUUM;"  # Solo crea el archivo vacío
else
    log "Base de datos global ya existe."
fi

# 6. Configurar UFW
log "Configurando UFW..."
ufw --force enable
ufw allow ssh
ufw allow 51820/udp  # WireGuard
ufw allow 1883/tcp   # MQTT
ufw allow 80/tcp     # HTTP
ufw allow 443/tcp    # HTTPS
ufw reload

# 7. Configurar Mosquitto
log "Configurando Mosquitto..."
MOSQUITTO_CONF="/etc/mosquitto/conf.d/r3net.conf"
cat > "$MOSQUITTO_CONF" <<EOF
listener 1883
allow_anonymous false
password_file /etc/mosquitto/passwd
acl_file /etc/mosquitto/acl
EOF

# Crear archivos de password y ACL si no existen
touch /etc/mosquitto/passwd
touch /etc/mosquitto/acl

# Reiniciar Mosquitto
systemctl restart mosquitto

# 8. Crear usuario del sistema r3net
if ! id -u r3net &> /dev/null; then
    log "Creando usuario r3net..."
    useradd --system --no-create-home --shell /bin/false r3net
else
    log "Usuario r3net ya existe."
fi

# 9. Preparar permisos
log "Configurando permisos..."
chown -R r3net:r3net "$PROJECT_DIR/var"
chown -R r3net:r3net "$PROJECT_DIR/etc"
chown -R r3net:r3net "$PROJECT_DIR"

# Asegurar que /var/r3net existe y tiene permisos (aunque usamos /opt/r3net)
mkdir -p /var/r3net
chown r3net:r3net /var/r3net

log "Instalación completada exitosamente."
log "Recuerda configurar WireGuard, Mosquitto passwords, y copiar el código de R3Net a $PROJECT_DIR."