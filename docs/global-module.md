# Módulo Global de R3Net

## Descripción

El módulo global (`r3net-global`) es el núcleo central de la red R3Net, ejecutándose en el VPS maestro. Su función principal es mantener la base de datos global de rutas y mensajes en store & forward, coordinar la sincronización con nodos regionales, y proporcionar una API HTTP para diagnóstico y monitoreo. No maneja conexiones directas con clientes ni Telegram; esos roles están delegados a módulos específicos.

Este módulo asegura la resiliencia de la red al mantener un registro centralizado de rutas activas y reenviar mensajes cuando los nodos locales o regionales no puedan entregarlos directamente.

## Instalación Paso a Paso

### Prerrequisitos
- VPS con Linux (Ubuntu/Debian recomendado).
- Node.js >= 16.0.0 instalado.
- Broker MQTT instalado y ejecutándose (ej. Mosquitto).
- WireGuard instalado y configurado (interfaz `wg0` por defecto).
- SQLite3 instalado.

### 1. Clonar el Repositorio
```bash
cd /opt
git clone https://github.com/tu-usuario/r3net.git
cd r3net
```

### 2. Instalar Dependencias
```bash
cd global
npm install
```

### 3. Estructura de Carpetas Esperada
Después de la instalación, la estructura debe ser:
```
/opt/r3net/
├── global/
│   ├── server.js
│   ├── lib/
│   │   ├── mqtt.js
│   │   ├── db.js
│   │   ├── routes.js
│   │   ├── storeforward.js
│   │   ├── sync.js
│   │   └── api.js
│   └── package.json
├── docs/
└── var/  # Para bases de datos y logs
```

### 4. Configurar Variables de Entorno
Crea un archivo `.env` en `/opt/r3net/global/` o configura las variables globalmente:

```bash
export R3NET_DB_PATH=/opt/r3net/var/r3net-global.db
export R3NET_MQTT_URL=mqtt://localhost:1883
export R3NET_WG_INTERFACE=wg0
```

- `R3NET_DB_PATH`: Ruta absoluta a la base de datos SQLite global (ej. `/opt/r3net/var/r3net-global.db`).
- `R3NET_MQTT_URL`: URL del broker MQTT global (ej. `mqtt://localhost:1883`).
- `R3NET_WG_INTERFACE`: Nombre de la interfaz WireGuard (ej. `wg0`).

### 5. Iniciar el Servicio Manualmente
Para pruebas, inicia manualmente:
```bash
cd /opt/r3net/global
node server.js
```

Deberías ver logs como:
```
Iniciando módulo global R3Net...
Base de datos global inicializada
Conectado al broker MQTT global
Sincronización global iniciada
Servidor global R3Net escuchando en puerto 8080
```

### 6. Integración con systemd
Asume que tienes un archivo de servicio `r3net-global.service` en `/etc/systemd/system/` apuntando a `/opt/r3net/global/server.js`.

Para recargar y iniciar:
```bash
sudo systemctl daemon-reload
sudo systemctl enable r3net-global
sudo systemctl start r3net-global
sudo systemctl status r3net-global
```

### 7. Comprobar Funcionamiento
Usa `curl` para verificar la API HTTP:

- Estado del módulo:
  ```bash
  curl http://localhost:8080/status
  ```
  Respuesta esperada: `{"status":"ok","module":"global","timestamp":1730000000}`

- Listar rutas globales:
  ```bash
  curl http://localhost:8080/routes
  ```
  Respuesta: Array de objetos con rutas activas.

- Ver mensajes en store & forward:
  ```bash
  curl http://localhost:8080/storeforward
  ```
  Respuesta: Array de mensajes pendientes.

### 8. Logs y Monitoreo
- Logs de aplicación: Se imprimen en consola. Con systemd, usa:
  ```bash
  journalctl -u r3net-global -f
  ```
- Monitorea errores en MQTT o base de datos en los logs.
- Buenas prácticas: Rota logs con `logrotate` si es necesario, y configura alertas para fallos críticos.

Si encuentras problemas, verifica las variables de entorno y la conectividad MQTT/WireGuard.