import dotenv from 'dotenv';
import { WebSocketServer } from 'ws';
import { initMQTT } from './lib/mqtt.js';
import { handleClientConnection } from './lib/client.js';

dotenv.config();

console.log('Configuración .env:');
console.log('R3NET_MQTT_URL:', process.env.R3NET_MQTT_URL);
console.log('R3NET_MQTT_USER:', process.env.R3NET_MQTT_USER);
console.log('R3NET_MQTT_PASS:', process.env.R3NET_MQTT_PASS);
console.log('R3NET_WS_PORT:', process.env.R3NET_WS_PORT);
console.log('R3NET_NODE_ID:', process.env.R3NET_NODE_ID);
console.log('R3NET_REGION:', process.env.R3NET_REGION);
console.log('R3NET_CLIENT_TIMEOUT:', process.env.R3NET_CLIENT_TIMEOUT);

const WS_PORT = process.env.R3NET_WS_PORT || 8082;

console.log('Iniciando r3-hub local R3Net...');

const wss = new WebSocketServer({ port: WS_PORT });
const mqttClient = await initMQTT();

wss.on('connection', (ws, req) => {
  console.log(`Cliente conectado desde ${req.socket.remoteAddress}`);
  handleClientConnection(ws, mqttClient);
});

console.log(`r3-hub escuchando en puerto ${WS_PORT}`);

// Manejo de señales
process.on('SIGINT', () => {
  console.log('Cerrando r3-hub...');
  wss.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Cerrando r3-hub...');
  wss.close();
  process.exit(0);
});