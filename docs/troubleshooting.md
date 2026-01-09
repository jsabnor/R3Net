# Guía de Solución de Problemas - R3Net

Esta guía documenta problemas comunes durante la configuración y operación de R3Net, con soluciones paso a paso.

## Problemas de Instalación

### Node.js no se instala correctamente
**Síntomas**: `node --version` falla o muestra versión incorrecta.
**Solución**:
1. Verifica el sistema operativo: `cat /etc/os-release`.
2. Si es Ubuntu/Debian, ejecuta:
   ```
   curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```
3. Confirma: `node --version` (debe ser v22.x).
4. Si falla, instala manualmente desde [nodejs.org](https://nodejs.org).

### Mosquitto MQTT no inicia
**Síntomas**: `systemctl status mosquitto` muestra errores.
**Solución**:
1. Instala dependencias: `sudo apt update && sudo apt install mosquitto mosquitto-clients`.
2. Verifica configuración en `/etc/mosquitto/mosquitto.conf`.
3. Reinicia: `sudo systemctl restart mosquitto`.
4. Logs: `journalctl -u mosquitto --since "1 hour ago"`.

## Problemas de Configuración

### WireGuard no conecta
**Síntomas**: `wg show` no muestra peers o `ping` falla en IP privada.
**Solución**:
1. Genera claves: `wg genkey | tee privatekey | wg pubkey > publickey`.
2. Edita `/etc/wireguard/wg0.conf`:
   ```
   [Interface]
   PrivateKey = <tu_clave_privada>
   Address = 10.0.0.1/24
   ListenPort = 51820

   [Peer]
   PublicKey = <clave_pública_del_peer>
   AllowedIPs = 10.0.0.2/32
   Endpoint = <IP_pública_del_peer>:51820
   ```
3. Levanta interfaz: `sudo wg-quick up wg0`.
4. Verifica: `wg show wg0`.
5. Si persiste, revisa firewall: `sudo ufw allow 51820/udp`.

### MQTT autenticación falla
**Síntomas**: Conexión rechazada en logs de Mosquitto.
**Solución**:
1. Crea usuario: `sudo mosquitto_passwd -c /etc/mosquitto/passwd r3net`.
2. Configura ACL en `/etc/mosquitto/acl`:
   ```
   user r3net
   topic r3net/#
   ```
3. Edita `/etc/mosquitto/mosquitto.conf`:
   ```
   allow_anonymous false
   password_file /etc/mosquitto/passwd
   acl_file /etc/mosquitto/acl
   ```
4. Reinicia: `sudo systemctl restart mosquitto`.
5. Prueba: `mosquitto_pub -h localhost -t "r3net/test" -u r3net -P <password> -m "test"`.

## Problemas de Operación

### Mensajes no llegan al nodo global
**Síntomas**: Cliente envía, pero global no recibe; logs muestran "Mensaje inválido".
**Solución**:
1. Verifica firma Ed25519: Asegúrate de que el cliente use claves correctas (`r3net_public_key.json`, `r3net_private_key.json`).
2. Revisa MQTT en hub local: Logs en `local/server.js` deben mostrar publicación exitosa.
3. Cambia QoS a 0 en `local/lib/mqtt.js` si QoS 1 falla:
   ```javascript
   client.publish(topic, JSON.stringify(message), { qos: 0 }, (err) => {
     if (err) console.error('Error publicando:', err);
   });
   ```
4. Prueba manual: `mosquitto_pub -h <IP_global> -t "r3net/global/messages" -u r3net -P <password> -m '{"test": "manual"}'`.

### Cliente no conecta al hub local
**Síntomas**: Error de conexión WebSocket.
**Solución**:
1. Verifica IP y puerto en `client/config.json`.
2. Asegúrate de que `local/server.js` esté corriendo: `sudo systemctl status r3net-local`.
3. Logs: `journalctl -u r3net-local --since "10 minutes ago"`.
4. Firewall: `sudo ufw allow <puerto_ws>`.

### Store & Forward no funciona
**Síntomas**: Mensajes no se entregan cuando el destinatario está offline.
**Solución**:
1. Verifica DB en global/regional: `sqlite3 /var/r3net/global.db "SELECT * FROM storeforward;"`.
2. Asegúrate de que el módulo regional esté sincronizado via MQTT.
3. Reintentos: Configura timeout en `global/lib/storeforward.js` (ej. 5 minutos).
4. Logs: Busca "store & forward" en `journalctl -u r3net-global`.

### Telegram no envía notificaciones
**Síntomas**: Mensajes llegan, pero Telegram no recibe.
**Solución**:
1. Verifica token en `telegram-bot/.env`.
2. Chat ID: Envía mensaje al bot y obtén con `curl https://api.telegram.org/bot<TOKEN>/getUpdates`.
3. Logs del bot: `journalctl -u r3net-telegram`.
4. MQTT en bot: Asegúrate de que subscribe a `r3net/global/telegram/send`.

## Comandos Útiles para Diagnóstico

- Ver logs global: `journalctl -u r3net-global --since "1 hour ago" -f`
- Ver logs local: `journalctl -u r3net-local --since "1 hour ago" -f`
- Probar MQTT: `mosquitto_sub -h localhost -t "r3net/#" -u r3net -P <password>`
- Ver DB: `sqlite3 /var/r3net/global.db ".tables"`
- Ver WireGuard: `wg show all`
- Ver procesos: `ps aux | grep node`

Si el problema persiste, recopila logs y describe el error exacto para más ayuda.