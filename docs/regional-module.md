# Módulo Regional R3Net

El módulo regional es un nodo intermedio en la arquitectura de R3Net, diseñado para manejar rutas y store & forward a nivel regional. Proporciona resiliencia permitiendo que los mensajes se entreguen incluso si el VPS maestro (global) no está disponible temporalmente.

## Funciones

- **Gestión de rutas regionales**: Mantiene un registro de usuarios conectados en la región y sus rutas hacia nodos locales o globales.
- **Store & Forward regional**: Almacena temporalmente mensajes que no pueden entregarse inmediatamente y los reintenta periódicamente.
- **Sincronización con global**: Se conecta al VPS maestro vía MQTT sobre WireGuard para sincronizar rutas y mensajes.
- **Enrutamiento de mensajes**: Dirige mensajes entre nodos locales dentro de la región.
- **API HTTP**: Expone endpoints para monitoreo y administración.

## Instalación

1. Provisiona un servidor dedicado para la región.
2. Instala dependencias básicas:
   ```bash
   sudo bash /path/to/r3net/install/install_dependencies.sh
   ```
3. Copia el módulo regional:
   ```bash
   sudo cp -r /path/to/r3net/regional /opt/r3net/
   cd /opt/r3net/regional
   npm install
   ```
4. Configura WireGuard: Agrega el servidor regional como peer en el VPS maestro y configura la conexión inversa.
5. Configura el archivo `.env` con los valores apropiados (ver sección Configuración).
6. Inicia el módulo:
   ```bash
   npm start
   ```
7. Opcional: Configura como servicio systemd.

## Configuración

Edita el archivo `.env` en `/opt/r3net/regional/`:

- `R3NET_DB_PATH`: Ruta a la base de datos SQLite regional.
- `R3NET_MQTT_URL`: URL del broker MQTT global (ej. `mqtt://usuario:password@10.0.0.1:1883`).
- `R3NET_REGION`: Nombre de la región (ej. `europe`).
- `R3NET_HTTP_PORT`: Puerto para la API HTTP (default: 8081).
- `R3NET_ROUTE_TIMEOUT`: Timeout para invalidar rutas expiradas (segundos).
- `R3NET_SF_TIMEOUT`: Timeout para descartar mensajes en store & forward (segundos).

## API Endpoints

- `GET /status`: Estado del módulo.
- `GET /routes`: Lista de rutas regionales.
- `GET /storeforward`: Mensajes pendientes en store & forward.
- `POST /inject`: Inyectar mensaje desde el global (usado para respuestas Telegram).

## Topics MQTT

- Suscripción: `r3net/region/<region>/routes`, `r3net/region/<region>/storeforward`, `r3net/region/<region>/presence`, `r3net/global/routes`, `r3net/global/storeforward`.
- Publicación: Actualizaciones de rutas y mensajes a los topics correspondientes.

## Seguridad

- Conexión MQTT autenticada.
- Mensajes en tránsito sobre WireGuard encriptado.
- No almacena mensajes permanentemente; solo temporalmente para reintentos.

## Monitoreo

Usa los endpoints API y logs para monitorear el estado. Integra con herramientas de monitoreo externas si es necesario.

## Próximos Pasos

Después de instalar el regional, configura nodos locales para conectar clientes finales.