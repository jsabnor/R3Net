import { publish } from './mqtt.js';

export async function initSync() {
  // Suscribirse a sincronización con regionales
  // Esto se maneja en MQTT, pero aquí podemos iniciar lógica adicional si es necesario
  console.log('Sincronización global iniciada');
}

export async function syncWithRegional(region) {
  // Publicar rutas globales a una región específica
  publish(`r3net/region/${region}/routes`, { sync: true });
}