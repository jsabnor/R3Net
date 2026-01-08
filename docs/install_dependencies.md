# Guía de Instalación de Dependencias para R3Net

## ¿Qué Hace el Script `install_dependencies.sh`?

Este script prepara un VPS basado en Ubuntu/Debian desde cero para ejecutar la red R3Net. Instala todas las dependencias del sistema necesarias, configura servicios básicos como firewall y MQTT, crea la estructura de carpetas del proyecto, y establece permisos seguros. Es diseñado para ser idempotente, lo que significa que puede ejecutarse múltiples veces sin causar problemas.

El script **no** instala ni configura módulos específicos de R3Net (como el global o regional), ni el bot de Telegram. Solo prepara el entorno base.

## Cómo Ejecutarlo Paso a Paso

### Prerrequisitos
- Un VPS con Ubuntu 20.04+ o Debian 11+ recién instalado.
- Acceso root o sudo.
- Conexión a Internet.

### 1. Conectar al VPS
```bash
ssh root@tu-vps-ip
```

### 2. Descargar el Script
Asume que tienes el repositorio clonado. Si no, clónalo primero:
```bash
cd /opt
git clone https://github.com/tu-usuario/r3net.git
cd r3net
```

### 3. Hacer el Script Ejecutable
```bash
chmod +x install/install_dependencies.sh
```

### 4. Ejecutar el Script
Ejecuta con sudo (o como root):
```bash
sudo bash install/install_dependencies.sh
```
El script tomará varios minutos. Verás logs en la consola indicando el progreso.

### 5. Verificar la Instalación
Después de que termine, verifica:

- **Node.js y npm**:
  ```bash
  node --version
  npm --version
  ```
  Debería mostrar versiones LTS.

- **Dependencias instaladas**:
  ```bash
  dpkg -l | grep -E "(curl|git|ufw|fail2ban|sqlite3|wireguard|mosquitto)"
  ```

- **Estructura de carpetas**:
  ```bash
  ls -la /opt/r3net/
  ```
  Deberías ver todas las carpetas: install/, scripts/, global/, etc.

- **Base de datos**:
  ```bash
  ls -la /opt/r3net/var/db/
  ```
  Debería existir `r3net_global.db`.

- **UFW**:
  ```bash
  ufw status
  ```
  Debería mostrar reglas para SSH, 51820/udp, 1883/tcp, 80/tcp, 443/tcp.

- **Mosquitto**:
  ```bash
  systemctl status mosquitto
  ```
  Debería estar activo. Verifica configuración:
  ```bash
  cat /etc/mosquitto/conf.d/r3net.conf
  ```

- **Usuario r3net**:
  ```bash
  id r3net
  ```
  Debería existir sin shell de login.

- **Permisos**:
  ```bash
  ls -ld /opt/r3net/var /opt/r3net/etc
  ```
  Deberían ser propiedad de `r3net:r3net`.

## Qué Hace Después de Ejecutar el Script

Una vez completado, el VPS está preparado, pero necesitas pasos adicionales para tener R3Net funcional:

1. **Configurar WireGuard**: Crea la interfaz `wg0` y conecta nodos regionales/locales. Consulta la documentación de WireGuard.

2. **Configurar Mosquitto Passwords**: Agrega usuarios y ACLs para MQTT.
   ```bash
   mosquitto_passwd -c /etc/mosquitto/passwd r3net_user
   ```
   Edita `/etc/mosquitto/acl` para permisos.

3. **Instalar Módulos de R3Net**:
   - Copia el código generado (global/, regional/, etc.) a `/opt/r3net/`.
   - Instala dependencias: `cd /opt/r3net/global && npm install`.
   - Configura variables de entorno y servicios systemd (usa los archivos en `etc/`).

4. **Configurar el Bot de Telegram**: En un paso separado, instala y configura el módulo `telegram-bot/`.

5. **Probar la Red**: Una vez todo configurado, inicia los servicios y verifica conectividad entre nodos.

Si encuentras errores, revisa los logs del script o ejecuta `journalctl -u mosquitto` para Mosquitto. Para soporte, consulta la documentación completa en `docs/`.

Este script es seguro: no expone puertos innecesarios, crea usuarios sin privilegios, y configura firewall básico. Siempre actualiza el sistema regularmente después de la instalación.