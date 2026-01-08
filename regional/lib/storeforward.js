const SF_TIMEOUT = parseInt(process.env.R3NET_SF_TIMEOUT) || 86400; // 24 horas
const MAX_RETRIES = 5;

export function initStoreForward(db, mqttClient) {
  const REGION = process.env.R3NET_REGION || 'default';

  function storeMessage(message) {
    const { id, timestamp } = message;
    const now = Math.floor(Date.now() / 1000);
    if (now - timestamp > SF_TIMEOUT) {
      console.log(`Mensaje ${id} expirado, descartando`);
      return;
    }

    db.insertSFMessage.run(id, JSON.stringify(message), timestamp, message.priority || 'normal');

    // Publicar a global para sync
    mqttClient.publish('r3net/global/storeforward', JSON.stringify(message));
  }

  function getPendingMessages() {
    return db.getPendingSF.all();
  }

  function retryMessage(id) {
    const msg = db.getSFMessage.get(id);
    if (!msg) return;

    const message = JSON.parse(msg.message);
    const retries = msg.retries + 1;

    if (retries > MAX_RETRIES) {
      console.log(`Mensaje ${id} alcanzó máximo reintentos, descartando`);
      db.deleteSFMessage.run(id);
      return;
    }

    db.incrementRetries.run(id);

    // Intentar reenviar
    // Lógica de reenvío (simplificada)
    console.log(`Reintentando mensaje ${id}, intento ${retries}`);
  }

  function deliverMessage(id) {
    db.deleteSFMessage.run(id);
    console.log(`Mensaje ${id} entregado, removido de store & forward`);
  }

  // Proceso periódico de reintentos
  setInterval(() => {
    const pending = getPendingMessages();
    pending.forEach(msg => {
      // Lógica para decidir si retry (ej. basado en tiempo)
      retryMessage(msg.id);
    });
  }, 300000); // Cada 5 minutos

  return {
    storeMessage,
    getPendingMessages,
    retryMessage,
    deliverMessage
  };
}