import mqtt from 'mqtt';

let client;

export async function initMQTT(url) {
  return new Promise((resolve, reject) => {
    client = mqtt.connect(url);

    client.on('connect', () => {
      console.log('Conectado al broker MQTT global');

      // Suscribirse a topics globales
      client.subscribe('r3net/global/routes', { qos: 1 });
      client.subscribe('r3net/global/storeforward', { qos: 1 });
      client.subscribe('r3net/global/presence', { qos: 1 });
      client.subscribe('r3net/global/mobility', { qos: 1 });

      resolve();
    });

    client.on('error', (error) => {
      console.error('Error en MQTT:', error);
      reject(error);
    });

    client.on('message', (topic, message) => {
      handleMessage(topic, message);
    });
  });
}

function handleMessage(topic, message) {
  try {
    const data = JSON.parse(message.toString());
    console.log(`Mensaje recibido en ${topic}:`, data);

    // Procesar según topic
    if (topic === 'r3net/global/routes') {
      // Actualizar rutas globales
    } else if (topic === 'r3net/global/storeforward') {
      // Gestionar store & forward
    } else if (topic === 'r3net/global/presence') {
      // Actualizar presencia
    } else if (topic === 'r3net/global/mobility') {
      // Gestionar movilidad
    }
  } catch (error) {
    console.error('Error procesando mensaje MQTT:', error);
  }
}

export function publish(topic, message) {
  if (client) {
    client.publish(topic, JSON.stringify(message), { qos: 1 });
  }
}