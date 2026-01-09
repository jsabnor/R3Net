import net from 'net';

const MQTT_URL = process.env.R3NET_MQTT_URL;
let tcpClient;

export async function initMQTT() {
  return new Promise((resolve, reject) => {
    const [host, port] = MQTT_URL.replace('mqtt://', '').split(':');
    
    tcpClient = net.createConnection({ host, port: parseInt(port) }, () => {
      console.log('r3-hub conectado via TCP');
      
      // Enviar CONNECT packet simple (MQTT protocol)
      const connectPacket = Buffer.from([
        0x10, 0x0C, // Fixed header
        0x00, 0x04, 0x4D, 0x51, 0x54, 0x54, // Protocol name
        0x04, // Protocol level
        0x02, // Connect flags (clean session)
        0x00, 0x3C // Keep alive
      ]);
      tcpClient.write(connectPacket);
      
      resolve(tcpClient);
    });

    tcpClient.on('error', (err) => {
      console.error('Error TCP en r3-hub:', err);
      reject(err);
    });

    tcpClient.on('data', (data) => {
      // Handle MQTT responses if needed
      console.log('Datos TCP recibidos:', data);
    });
  });
}

export function publish(topic, message) {
  if (tcpClient && tcpClient.writable) {
    const topicBytes = Buffer.from(topic, 'utf8');
    const messageBytes = Buffer.from(message, 'utf8');
    
    const remainingLength = 2 + topicBytes.length + messageBytes.length;
    const fixedHeader = Buffer.from([0x30, remainingLength]); // PUBLISH packet
    
    const packet = Buffer.concat([
      fixedHeader,
      Buffer.from([0x00, topicBytes.length]), // Topic length
      topicBytes,
      messageBytes
    ]);
    
    tcpClient.write(packet);
    console.log('Mensaje enviado via TCP');
    return true;
  }
  return false;
}