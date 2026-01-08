import { getStoreForward, addStoreForward, incrementRetries, removeStoreForward } from './db.js';
import { publish } from './mqtt.js';

export async function initStoreForward() {
  // Cargar mensajes pendientes
  const messages = await getStoreForward();
  console.log(`Cargados ${messages.length} mensajes en store & forward global`);

  // Procesar reintentos
  setInterval(processRetries, 60000); // Cada minuto
}

async function processRetries() {
  const messages = await getStoreForward();
  for (const msg of messages) {
    // Lógica de reintento (simplificada)
    await incrementRetries(msg.id);
    if (msg.retries >= msg.max_retries) {
      await removeStoreForward(msg.id);
      console.log(`Mensaje ${msg.id} descartado por máximo reintentos`);
    } else {
      // Intentar reenviar
      publish('r3net/global/storeforward', msg);
    }
  }
}

export async function addGlobalStoreForward(id, fromUser, toUser, payload, priority = 'normal') {
  const timestamp = Math.floor(Date.now() / 1000);
  await addStoreForward(id, fromUser, toUser, payload, timestamp, priority);
}

export async function getGlobalStoreForward() {
  return await getStoreForward();
}