# Recopilación Completa de R3Net

## Resumen del Proyecto

R3Net es una red distribuida para radioaficionados, completamente implementada con Node.js, MQTT, WireGuard y SQLite. Incluye scripts de instalación automatizados, módulos funcionales y documentación exhaustiva.

## Componentes Desarrollados

### 1. Estructura del Proyecto
- `install/install_dependencies.sh`: Instala dependencias del sistema (Node.js, MQTT, WireGuard, etc.).
- `scripts/configure_r3net.sh`: Configura WireGuard, MQTT, env vars y servicios de forma interactiva.
- `scripts/verify_system.sh`: Verifica que todo esté funcionando.
- `global/`: Módulo VPS maestro (base de datos, MQTT, API HTTP, sincronización).
- `telegram-bot/`: Bot de Telegram para notificaciones y respuestas.
- `docs/`: Documentación completa para cada componente.

### 2. Arquitectura Implementada
- **VPS Maestro**: Módulo global + bot Telegram.
- **Comunicación**: MQTT para mensajes internos, WireGuard para encriptación.
- **Almacenamiento**: SQLite para rutas y store & forward.
- **Seguridad**: Autenticación MQTT, firewall UFW, permisos restringidos.

### 3. Funcionalidades
- Mensajería resiliente sin Internet.
- Store & forward distribuido.
- Movilidad entre nodos.
- Integración con Telegram.
- API HTTP para diagnóstico.

## Flujo de Instalación Completo

1. **Clonar repositorio**:
   ```bash
   git clone <repo> && cd r3net
   ```

2. **Instalar dependencias**:
   ```bash
   sudo bash install/install_dependencies.sh
   ```

3. **Copiar módulos**:
   ```bash
   sudo cp -r global telegram-bot /opt/r3net/
   cd /opt/r3net/global && sudo npm install
   cd /opt/r3net/telegram-bot && sudo npm install
   ```

4. **Configurar sistema**:
   ```bash
   sudo bash scripts/configure_r3net.sh
   # Responde preguntas: IP WG, clave, usuario MQTT, token TG, etc.
   ```

5. **Verificar**:
   ```bash
   bash scripts/verify_system.sh
   ```

6. **Iniciar**:
   ```bash
   sudo systemctl start r3net-global r3net-telegram
   ```

## Verificación Final
- Node.js, Mosquitto, base de datos, API, módulos instalados y funcionales.
- Listo para agregar nodos regionales/locales y conectar clientes.

## Documentación
- README.md: Guía principal.
- docs/install_dependencies.md: Detalles de instalación.
- docs/configure_r3net.md: Configuración interactiva.
- docs/global-module.md: Módulo VPS.
- docs/telegram-bot.md: Bot Telegram.

Todo está claro, paso a paso, con comandos exactos y verificaciones.