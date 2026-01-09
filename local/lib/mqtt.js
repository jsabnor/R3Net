import mqtt from 'mqtt';

const MQTT_URL = process.env.R3NET_MQTT_URL || 'mqtt://10.0.0.1:1883';
let client;

export async function initMQTT(url = MQTT_URL) {
  const options = {
    username: process.env.R3NET_MQTT_USER || 'r3net',
    password: process.env.R3NET_MQTT_PASS || 'r3net'
  };
  
  client = mqtt.connect(url, options);

  return new Promise((resolve, reject) => {
    client.on('connect', () => {
      console.log('r3-hub conectado a MQTT');
      resolve(client);
    });

    client.on('error', (err) => {
      console.error('Error MQTT en r3-hub:', err);
      reject(err);
    });
  });
}

export function publish(topic, message) {
  if (client && client.connected) {
    client.publish(topic, message, { qos: 0 });
    return true;
  }
  return false;
}