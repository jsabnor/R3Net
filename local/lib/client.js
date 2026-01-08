import nacl from 'tweetnacl';
import { v4 as uuidv4 } from 'uuid';

const CLIENT_TIMEOUT = parseInt(process.env.R3NET_CLIENT_TIMEOUT) || 300;
const clients = new Map(); // indicativo -> { ws, lastSeen, pubkey }

export function handleClientConnection(ws, mqttClient) {
  let userIndicativo = null;
  let userPubkey = null;

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());

      if (message.type === 'register') {
        // Registro local: verificar con global
        userIndicativo = message.indicativo;
        userPubkey = message.pubkey;
        clients.set(userIndicativo, { ws, lastSeen: Date.now(), pubkey: userPubkey });

        // Publicar presencia
        mqttClient.publish('r3net/global/presence', JSON.stringify({
          indicativo: userIndicativo,
          action: 'connect',
          node: process.env.R3NET_NODE_ID
        }));

        ws.send(JSON.stringify({ type: 'registered', status: 'ok' }));
        console.log(`Usuario ${userIndicativo} registrado en r3-hub`);

      } else if (message.type === 'message') {
        // Verificar firma
        if (!verifySignature(message, userPubkey)) {
          ws.send(JSON.stringify({ type: 'error', message: 'Firma inválida' }));
          return;
        }

        // Enrutar mensaje
        const routedMessage = {
          id: uuidv4(),
          ...message,
          timestamp: Math.floor(Date.now() / 1000)
        };

        // Publicar via MQTT
        mqttClient.publish('r3net/global/messages', JSON.stringify(routedMessage));
        console.log(`Mensaje de ${userIndicativo} enrutado`);

        ws.send(JSON.stringify({ type: 'sent', id: routedMessage.id }));

      } else if (message.type === 'ping') {
        // Actualizar lastSeen
        if (userIndicativo && clients.has(userIndicativo)) {
          clients.get(userIndicativo).lastSeen = Date.now();
        }
        ws.send(JSON.stringify({ type: 'pong' }));
      }

    } catch (error) {
      console.error('Error procesando mensaje:', error);
      ws.send(JSON.stringify({ type: 'error', message: 'Mensaje inválido' }));
    }
  });

  ws.on('close', () => {
    if (userIndicativo) {
      clients.delete(userIndicativo);
      mqttClient.publish('r3net/global/presence', JSON.stringify({
        indicativo: userIndicativo,
        action: 'disconnect'
      }));
      console.log(`Usuario ${userIndicativo} desconectado`);
    }
  });

  // Timeout de clientes inactivos
  const timeout = setInterval(() => {
    const now = Date.now();
    for (const [indicativo, client] of clients) {
      if (now - client.lastSeen > CLIENT_TIMEOUT * 1000) {
        client.ws.close();
        clients.delete(indicativo);
        console.log(`Cliente ${indicativo} expirado por inactividad`);
      }
    }
  }, 60000); // Cada minuto

  ws.on('close', () => clearInterval(timeout));
}

function verifySignature(message, pubkey) {
  try {
    const msgStr = JSON.stringify({ id: message.id, from: message.from, to: message.to, timestamp: message.timestamp, payload: message.payload });
    const signature = nacl.util.decodeBase64(message.signature);
    const publicKey = nacl.util.decodeBase64(pubkey);
    return nacl.sign.detached.verify(nacl.util.decodeUTF8(msgStr), signature, publicKey);
  } catch (error) {
    console.error('Error verificando firma:', error);
    return false;
  }
}