# Módulo Local R3Net (r3-hub)

## Descripción

El módulo local, también conocido como r3-hub, es el punto de conexión para clientes finales en R3Net. Actúa como un router ligero que:

- Acepta conexiones WebSocket de clientes.
- Verifica firmas Ed25519 de mensajes.
- Enruta mensajes al regional/global via MQTT sobre WireGuard.
- Gestiona presencia de usuarios y desconexiones por inactividad.

No almacena mensajes ni mantiene bases de datos pesadas; es puramente un puente.

## Instalación

1. Provisiona un dispositivo ligero (Raspberry Pi, mini-PC, etc.) en la ubicación local.
2. Instala dependencias básicas (Node.js, WireGuard).
3. Copia el módulo local:
   ```bash
   sudo cp -r /path/to/r3net/local /opt/r3net/
   cd /opt/r3net/local
   npm install
   ```
4. Configura WireGuard para conectar al regional/global.
5. Edita `.env` con los valores apropiados.
6. Inicia:
   ```bash
   npm start
   ```

## Configuración

- `R3NET_WS_PORT`: Puerto para WebSocket (default: 8082).
- `R3NET_MQTT_URL`: URL del broker MQTT.
- `R3NET_REGION`: Región local.
- `R3NET_NODE_ID`: ID único del r3-hub.
- `R3NET_CLIENT_TIMEOUT`: Timeout para desconectar clientes inactivos (segundos).

## Protocolo de Clientes

Los clientes se conectan via WebSocket y envían mensajes JSON:

- **Registro**: `{"type":"register","indicativo":"EA7XXX","pubkey":"..."}`
- **Mensaje**: `{"type":"message","from":"EA7XXX","to":"EA7YYY","payload":"texto","signature":"..."}`
- **Ping**: `{"type":"ping"}`

El r3-hub verifica firmas y enruta mensajes.

## Seguridad

- Firmas Ed25519 verificadas antes de enrutar.
- Conexiones encriptadas via WireGuard.
- Timeout automático de sesiones inactivas.

## Monitoreo

Logs en consola. Monitorea conexiones activas y errores de verificación.

## Próximos Pasos

Después de instalar r3-hubs, desarrolla clientes para PC/móvil que se conecten y envíen mensajes.</content>
<parameter name="filePath">/home/j0s3m4/r3net/docs/local-module.md