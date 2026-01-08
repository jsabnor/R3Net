import express from 'express';
import { initDB } from './db.js';
import { initMQTT } from './mqtt.js';
import { initRoutes } from './routes.js';
import { initStoreForward } from './storeforward.js';

export async function createServer() {
  const app = express();
  app.use(express.json());

  // Inicializar componentes
  const db = initDB();
  const mqttClient = await initMQTT();
  const routesManager = initRoutes(db, mqttClient);
  const sfManager = initStoreForward(db, mqttClient);

  // Rutas API
  app.get('/status', (req, res) => {
    res.json({ status: 'ok', module: 'regional', region: process.env.R3NET_REGION });
  });

  app.get('/routes', (req, res) => {
    const routes = routesManager.getAllRoutes();
    res.json(routes);
  });

  app.get('/storeforward', (req, res) => {
    const messages = sfManager.getPendingMessages();
    res.json(messages);
  });

  // Endpoint para inyectar mensajes desde global (ej. respuestas Telegram)
  app.post('/inject', (req, res) => {
    const message = req.body;
    // Procesar mensaje inyectado
    routesManager.routeMessage(message);
    res.json({ status: 'injected' });
  });

  return app;
}