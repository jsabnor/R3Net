import { getGlobalRoutes } from './routes.js';
import { getGlobalStoreForward } from './storeforward.js';
import { registerUser, getUser, getAllUsers } from './db.js';

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

  // Endpoints para usuarios
  app.post('/register', async (req, res) => {
    try {
      const { indicativo, pubkey, telegram_id } = req.body;
      if (!indicativo || !pubkey) {
        return res.status(400).json({ error: 'Indicativo y pubkey requeridos' });
      }
      await registerUser(indicativo, pubkey, telegram_id);
      res.json({ status: 'registered', indicativo });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/users', async (req, res) => {
    try {
      const users = await getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/users/:indicativo', async (req, res) => {
    try {
      const user = await getUser(req.params.indicativo);
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ error: 'Usuario no encontrado' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}