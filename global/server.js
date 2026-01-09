import express from 'express';
import { createServer } from 'http';
import { initMQTT } from './lib/mqtt.js';
import { initDB } from './lib/db.js';
import { initAPI } from './lib/api.js';
import { initSync } from './lib/sync.js';

const app = express();
app.use(express.json());
const server = createServer(app);

// Variables de entorno
const DB_PATH = process.env.R3NET_DB_PATH || './var/db/r3net_global.db';
const MQTT_URL = process.env.R3NET_MQTT_URL || 'mqtt://localhost:1883';
const WG_INTERFACE = process.env.R3NET_WG_INTERFACE || 'wg0';

async function start() {
  try {
    console.log('Iniciando módulo global R3Net...');

    // Inicializar base de datos
    await initDB(DB_PATH);

    // Inicializar MQTT
    await initMQTT(MQTT_URL);

    // Inicializar sincronización
    await initSync();

    // Inicializar API HTTP
    initAPI(app);

    // Iniciar servidor HTTP
    const PORT = 8080;
    server.listen(PORT, () => {
      console.log(`Servidor global R3Net escuchando en puerto ${PORT}`);
    });

  } catch (error) {
    console.error('Error al iniciar el módulo global:', error);
    process.exit(1);
  }
}

start();