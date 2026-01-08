# Guía de Configuración de R3Net

## ¿Qué Hace el Script `configure_r3net.sh`?

Este script interactivo configura todo el sistema R3Net en el VPS maestro después de ejecutar `install_dependencies.sh`. Pide datos clave como IPs, claves, tokens y contraseñas, y configura:

- WireGuard para el backbone privado.
- Autenticación MQTT con usuario y ACLs.
- Variables de entorno para módulos (global y telegram-bot).
- Servicios systemd para iniciar automáticamente.

Es seguro: no guarda contraseñas en logs, y asume que los módulos están instalados.

## Prerrequisitos
- Ejecutar `install_dependencies.sh` primero.
- Tener claves WireGuard generadas (usa `wg genkey`).
- Token del bot de Telegram (obtén de @BotFather en Telegram).
- Chat ID de Telegram (envía un mensaje al bot y usa `curl` para obtenerlo).

## Cómo Ejecutarlo
1. Copia el script a `/opt/r3net/scripts/` si no está.
2. Hazlo ejecutable: `chmod +x scripts/configure_r3net.sh`
3. Ejecuta como root: `sudo bash scripts/configure_r3net.sh`
4. Responde a las preguntas:
   - IP privada del VPS (ej. 10.0.0.1).
   - Puerto WireGuard (51820 por defecto).
   - Clave privada WireGuard.
   - Usuario MQTT (ej. r3net).
   - Contraseña MQTT.
   - Token de Telegram.
   - Chat ID de Telegram.

El script tomará unos minutos y mostrará progreso.

## Qué Configura

### WireGuard
- Crea `/etc/wireguard/wg0.conf` con la IP y clave privada.
- Inicia la interfaz `wg0`.
- Para agregar peers (nodos regionales), edita manualmente el archivo.

### MQTT
- Crea usuario y contraseña en `/etc/mosquitto/passwd`.
- Configura ACLs en `/etc/mosquitto/acl` para topics `r3net/#`.
- Cambia a autenticación requerida y reinicia Mosquitto.

### Variables de Entorno
- Para `global/.env`: DB_PATH, MQTT_URL, WG_INTERFACE.
- Para `telegram-bot/.env`: TOKEN, CHAT_ID, MQTT_URL (si existe la carpeta).

### Servicios
- Habilita e inicia `r3net-global.service` y `r3net-telegram.service` (si existen).

## Verificación Post-Configuración

Después de configurar la infraestructura (WireGuard, MQTT, DB), verifica que todo esté operativo antes de activar los servicios Node.js:

### Verificaciones Básicas
- **WireGuard**: `sudo wg show wg0` (debe mostrar peers conectados y handshakes recientes)
- **MQTT**: `mosquitto_sub -h localhost -t r3net/test -u r3net -P <contraseña>` (debe suscribirse sin errores)
- **Ping VPN**: Desde nodos conectados, `ping 10.0.0.1` (debe responder)
- **Base de Datos**: Verifica que `r3net_global.db` exista en `global/var/db/`
- **Dependencias**: `cd global && npm list` (debe mostrar paquetes instalados)

### Estado Actual Esperado
- Infraestructura: ✅ Configurada y funcional
- Servicios Node.js: ❌ No activos (requieren configuración de .env y servicios systemd)

### Próximos Pasos
1. Configurar variables de entorno (.env para telegram-bot)
2. Crear servicios systemd para módulos global y telegram-bot
3. Iniciar servicios y verificar logs
4. Probar integración completa (envío de mensajes vía MQTT y Telegram)

#### Configuración Manual de Servicios (si no usas el script completo)
Si la infraestructura ya está configurada, sigue estos pasos:

1. **Crear .env para Telegram Bot**:
   - Copia `telegram-bot/.env.example` a `telegram-bot/.env`
   - Edita con tu `TELEGRAM_TOKEN` y `TELEGRAM_CHAT_ID`
   - Ajusta `R3NET_MQTT_URL` con la contraseña MQTT

2. **Instalar Servicios Systemd**:
   - Copia `etc/r3net-global.service` y `etc/r3net-telegram.service` a `/etc/systemd/system/`
   - Ejecuta `sudo systemctl daemon-reload`
   - Habilita: `sudo systemctl enable r3net-global r3net-telegram`
   - Inicia: `sudo systemctl start r3net-global r3net-telegram`

3. **Verificar**:
   - `systemctl status r3net-global`
   - `systemctl status r3net-telegram`
   - Logs: `journalctl -u r3net-global -f`

## Seguridad
- Las contraseñas se piden en input oculto.
- Archivos `.env` tienen permisos restringidos.
- No expone datos en logs.

## Próximos Pasos
- Agrega peers WireGuard para nodos regionales.
- Despliega módulos regional/local en otras máquinas.
- Prueba la red con clientes.

Si hay errores, revisa logs de systemd: `journalctl -u r3net-global`.