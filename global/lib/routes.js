import { getRoutes, updateRoute } from './db.js';
import { publish } from './mqtt.js';

export async function initRoutes() {
  // Cargar rutas existentes
  const routes = await getRoutes();
  console.log(`Cargadas ${routes.length} rutas globales`);
}

export async function updateGlobalRoute(indicativo, via, nextHop) {
  const lastSeen = Math.floor(Date.now() / 1000);
  await updateRoute(indicativo, via, nextHop, lastSeen);

  // Publicar actualización
  publish('r3net/global/routes', {
    indicativo,
    via,
    next_hop: nextHop,
    last_seen: lastSeen
  });
}

export async function getGlobalRoutes() {
  return await getRoutes();
}