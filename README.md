# R3Net - Red Distribuida Resiliente para Radioaficionados

## Descripción

R3Net es una red distribuida, resiliente y descentralizada diseñada específicamente para radioaficionados. Permite la mensajería instantánea incluso en entornos sin Internet, con movilidad entre nodos, enrutamiento dinámico y store & forward distribuido. La red integra Telegram como canal secundario para notificaciones y respuestas, asegurando comunicación continua en situaciones de desconexión.

### Características Principales
- **Mensajería Resiliente**: Funciona sin Internet usando protocolos como MQTT y WireGuard.
- **Movilidad**: Los usuarios pueden cambiar de nodo sin perder mensajes.
- **Store & Forward**: Mensajes se almacenan temporalmente y se reenvían cuando el destinatario esté disponible.
- **Integración con Telegram**: Envío paralelo de mensajes y recepción de respuestas.
- **Seguridad**: Firmas Ed25519, encriptación WireGuard, y autenticación MQTT.
- **Arquitectura Distribuida**: Tres tipos de nodos (VPS Maestro, Regionales, Locales) para escalabilidad.

### Arquitectura de Nodos
- **VPS Maestro (Global Node)**: Núcleo central con base de datos global, broker MQTT, bot de Telegram y API HTTP.
- **Nodos Regionales**: Intermedios para rutas regionales y store & forward.
- **Nodos Locales (r3-hub)**: Routers ligeros para conexiones de clientes.

La red usa MQTT para comunicación interna, WireGuard para backbone cifrada, SQLite para almacenamiento, y Ed25519 para firmas.

## Instalación Paso a Paso

Sigue estos pasos para desplegar R3Net en un VPS. Asume Ubuntu/Debian.

### 1. Preparar el VPS
Ejecuta el script de instalación de dependencias:
```bash
sudo bash install/install_dependencies.sh
```
Esto instala Node.js, dependencias del sistema, configura firewall y MQTT. Ver [docs/install_dependencies.md](docs/install_dependencies.md) para detalles.

### 2. Configurar WireGuard
Crea la interfaz `wg0` y conecta nodos regionales/locales. Consulta la documentación de WireGuard para peers.

### 3. Configurar Mosquitto
Agrega usuarios y ACLs:
```bash
mosquitto_passwd -c /etc/mosquitto/passwd r3net_user
```
Edita `/etc/mosquitto/acl` para permisos. Reinicia: `sudo systemctl restart mosquitto`.

### 4. Instalar Módulos
- **Módulo Global**: Copia `global/` a `/opt/r3net/global/`, instala dependencias y configura. Ver [docs/global-module.md](docs/global-module.md).
- **Módulos Regionales y Locales**: Repite para `regional/` y `local/`.
- **Bot de Telegram**: Copia `telegram-bot/` a `/opt/r3net/telegram-bot/`, instala dependencias y configura. Ver [docs/telegram-bot.md](docs/telegram-bot.md).

### 4. Configurar el Sistema
Ejecuta el script interactivo de configuración:
```bash
sudo bash scripts/configure_r3net.sh
```
Esto configura WireGuard, MQTT autenticado, variables de entorno y servicios. Ver [docs/configure_r3net.md](docs/configure_r3net.md).

### 6. Iniciar Servicios
Usa systemd. Copia archivos de `etc/` a `/etc/systemd/system/` y habilita:
```bash
sudo systemctl enable r3net-global
sudo systemctl start r3net-global
```

### 7. Verificar
- API: `curl http://localhost:8080/status`
- Logs: `journalctl -u r3net-global -f`

Para despliegues completos, configura nodos regionales y locales conectados por WireGuard.

## Uso
- Conecta clientes (apps móviles/desktop) a nodos locales via WebSocket.
- Envía mensajes; se enrutan dinámicamente.
- Recibe notificaciones en Telegram si configurado.

## Documentación
- [Recopilación Completa](docs/recopilacion_completa.md): Visión general del sistema y estado actual.
- [Instalación de Dependencias](docs/install_dependencies.md): Detalles técnicos de instalación.
- [Configuración Interactiva](docs/configure_r3net.md): Guía paso a paso para configurar el sistema.
- [Módulo Global](docs/global-module.md): Documentación del nodo maestro.
- [Módulo Regional](docs/regional-module.md): Detalles del nodo regional.
- [Módulo Local](docs/local-module.md): Documentación del r3-hub.
- [Bot de Telegram](docs/telegram-bot.md): Integración con Telegram.
- [Herramienta de Claves](docs/keygen-tool.md): Generación de claves Ed25519.
- [Solución de Problemas](docs/troubleshooting.md): Problemas comunes y soluciones.

## Contribución
Contribuciones son bienvenidas. Sigue la guía de estilo: Node.js moderno, async/await, logs claros. Crea issues para bugs o features.

## Licencia
MIT. Ver LICENSE.

## Soporte
Para soporte, únete a la comunidad de radioaficionados o crea un issue en el repo.