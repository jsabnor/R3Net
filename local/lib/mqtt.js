import mqtt from 'mqtt';

const MQTT_URL = process.env.R3NET_MQTT_URL;
const REGION = process.env.R3NET_REGION || 'local';
const NODE_ID = process.env.R3NET_NODE_ID || 'r3hub-01';

export async function initMQTT() {
  const options = {
    username: process.env.R3NET_MQTT_USER || 'r3net',
    password: process.env.R3NET_MQTT_PASS || 'r3net'
  };
  const client = mqtt.connect(MQTT_URL, options);

  return new Promise((resolve, reject) => {
    client.on('connect', () => {
      console.log('r3-hub conectado a MQTT');

      // Suscribirse a mensajes entrantes para este nodo
      client.subscribe(`r3net/local/${NODE_ID}/messages`);

      // Suscribirse a global/regional para rutas
      client.subscribe('r3net/global/routes');
      client.subscribe(`r3net/region/${REGION}/routes`);

      resolve(client);
    });

    client.on('error', (err) => {
      console.error('Error MQTT en r3-hub:', err);
      reject(err);
    });

    client.on('message', (topic, message) => {
      // Manejar mensajes entrantes (ej. respuestas)
      console.log(`Mensaje MQTT en r3-hub: ${topic}`);
      // Enviar a cliente correspondiente
    });
  });
}