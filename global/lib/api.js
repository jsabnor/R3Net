import { getGlobalRoutes } from './routes.js';
import { getGlobalStoreForward } from './storeforward.js';

export function initAPI(app) {
  app.get('/status', (req, res) => {
    res.json({ status: 'ok', module: 'global', timestamp: Math.floor(Date.now() / 1000) });
  });

  app.get('/routes', async (req, res) => {
    try {
      const routes = await getGlobalRoutes();
      res.json(routes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/storeforward', async (req, res) => {
    try {
      const messages = await getGlobalStoreForward();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}