const ROUTE_TIMEOUT = parseInt(process.env.R3NET_ROUTE_TIMEOUT) || 3600;

export function initRoutes(db, mqttClient) {
  const REGION = process.env.R3NET_REGION || 'default';

  function updateRoute(indicativo, via, nextHop) {
    const now = Math.floor(Date.now() / 1000);
    db.insertRoute.run(indicativo, via, nextHop, now);

    // Publicar actualización
    mqttClient.publish(`r3net/region/${REGION}/routes`, JSON.stringify({
      indicativo,
      via,
      next_hop: nextHop,
      last_seen: now
    }));
  }

  function getRoute(indicativo) {
    const route = db.getRoute.get(indicativo);
    if (route) {
      const now = Math.floor(Date.now() / 1000);
      if (now - route.last_seen > ROUTE_TIMEOUT) {
        // Ruta expirada
        db.deleteRoute.run(indicativo);
        return null;
      }
    }
    return route;
  }

  function getAllRoutes() {
    return db.getAllRoutes.all();
  }

  function routeMessage(message) {
    const { to } = message;
    const route = getRoute(to);
    if (route) {
      // Enviar al next_hop
      // Lógica de enrutamiento (simplificada)
      console.log(`Enrutando mensaje a ${to} via ${route.next_hop}`);
    } else {
      // Store & forward
      console.log(`Mensaje para ${to} en store & forward`);
    }
  }

  // Cleanup de rutas expiradas periódicamente
  setInterval(() => {
    const now = Math.floor(Date.now() / 1000);
    // Nota: En producción, usar una query para eliminar expiradas
  }, 60000); // Cada minuto

  return {
    updateRoute,
    getRoute,
    getAllRoutes,
    routeMessage
  };
}