import dotenv from 'dotenv';
import { WebSocketServer } from 'ws';
import { initMQTT } from './lib/mqtt.js';
import { handleClientConnection } from './lib/client.js';

dotenv.config();

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