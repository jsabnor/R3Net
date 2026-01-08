# Módulo Bot de Telegram para R3Net

## Descripción

El bot de Telegram maestro (`r3net-telegram-bot`) es el puente entre R3Net y Telegram. Permite enviar notificaciones de mensajes a usuarios vinculados y recibir respuestas desde Telegram, inyectándolas de vuelta en la red R3Net.

Funciones:
- Vinculación de cuentas de radioaficionados.
- Envío paralelo de mensajes.
- Recepción de respuestas y inyección en R3Net.
- Comandos básicos (/start, /vincular, /estado).

## Instalación
1. Clona el repositorio.
2. `cd telegram-bot && npm install`
3. Configura `.env` con TOKEN y CHAT_ID.
4. `node bot.js`

## Configuración
- `TELEGRAM_TOKEN`: Token del bot (de @BotFather).
- `TELEGRAM_CHAT_ID`: ID del chat para notificaciones.
- `R3NET_MQTT_URL`: URL del broker MQTT.

## Seguridad
- Token solo en este módulo.
- No se replica ni expone.

## Uso
- Envía mensajes desde R3Net: Publica en `r3net/global/telegram/send`.
- Respuestas desde Telegram: Se publican en `r3net/global/telegram/inject`.