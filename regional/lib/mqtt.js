import mqtt from 'mqtt';

const MQTT_URL = process.env.R3NET_MQTT_URL;
const REGION = process.env.R3NET_REGION || 'default';

export async function initMQTT() {
  const options = { username: 'r3net', password: 'r3net' };
  
  const client = mqtt.connect(MQTT_URL, options);

  return new Promise((resolve, reject) => {
    client.on('connect', () => {
      console.log('Conectado a MQTT global');

      // Suscribirse a topics regionales
      client.subscribe(`r3net/region/${REGION}/routes`);
      client.subscribe(`r3net/region/${REGION}/storeforward`);
      client.subscribe(`r3net/region/${REGION}/presence`);

      // Suscribirse a global para sync
      client.subscribe('r3net/global/routes');
      client.subscribe('r3net/global/storeforward');

      resolve(client);
    });

    client.on('error', (err) => {
      console.error('Error MQTT:', err);
      reject(err);
    });

    client.on('message', (topic, message) => {
      // Manejar mensajes MQTT
      console.log(`Mensaje MQTT: ${topic} - ${message.toString()}`);
      // Aquí se integrará con routes y sf managers
    });
  });
}