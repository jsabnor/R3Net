import WebSocket from 'ws';
import nacl from 'tweetnacl';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import readline from 'readline';
import { createInterface } from 'readline';

// Configuración
const CONFIG_FILE = './config.json';
let HUB_URL = 'ws://localhost:8082'; // Default

try {
  const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  HUB_URL = config.hubUrl || HUB_URL;
} catch (error) {
  console.log('Usando configuración por defecto (config.json no encontrado)');
}
const PRIVATE_KEY_FILE = './r3net_private_key.json'; // Archivo descargado de keygen.html

// Cargar clave privada
let privateKey, publicKey;
try {
  let fileContent = fs.readFileSync(PRIVATE_KEY_FILE, 'utf8');
  if (fileContent.charCodeAt(0) === 0xFEFF) {
    fileContent = fileContent.slice(1); // Quitar BOM
  }
  const keyData = JSON.parse(fileContent);
  privateKey = Buffer.from(keyData.privateKey, 'base64');
  publicKey = nacl.sign.keyPair.fromSecretKey(privateKey).publicKey;
} catch (error) {
  console.error('Error cargando clave privada:', error.message);
  process.exit(1);
}

const indicativo = process.argv[2];
if (!indicativo) {
  console.error('Uso: node client.js <tu_indicativo>');
  process.exit(1);
}

console.log(`Iniciando cliente R3Net para ${indicativo}...`);

const ws = new WebSocket(HUB_URL);

ws.on('open', () => {
  console.log('Conectado a r3-hub');

  // Registrar
  const registerMsg = {
    type: 'register',
    indicativo: indicativo,
    pubkey: Buffer.from(publicKey).toString('base64')
  };
  ws.send(JSON.stringify(registerMsg));
});

ws.on('message', (data) => {
  const msg = JSON.parse(data.toString());
  console.log('Respuesta:', msg);

  if (msg.type === 'registered') {
    console.log('Registrado exitosamente. Puedes enviar mensajes.');
    startCLI();
  }
});

ws.on('close', () => {
  console.log('Desconectado de r3-hub');
  process.exit(0);
});

ws.on('error', (error) => {
  console.error('Error WS:', error);
});

function startCLI() {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  function prompt() {
    rl.question('Mensaje (formato: destinatario:texto) o "exit": ', (input) => {
      if (input.toLowerCase() === 'exit') {
        ws.close();
        rl.close();
        return;
      }

      const parts = input.split(':');
      if (parts.length !== 2) {
        console.log('Formato: EA7YYY:Mensaje de prueba');
        prompt();
        return;
      }

      const to = parts[0].trim();
      const payload = parts[1].trim();

      // Crear mensaje
      const message = {
        id: uuidv4(),
        type: 'message',
        from: indicativo,
        to: to,
        timestamp: Math.floor(Date.now() / 1000),
        payload: payload
      };

      // Firmar
      const msgStr = JSON.stringify({
        id: message.id,
        from: message.from,
        to: message.to,
        timestamp: message.timestamp,
        payload: message.payload
      });
      const signature = nacl.sign.detached(Buffer.from(msgStr, 'utf8'), privateKey);
      message.signature = Buffer.from(signature).toString('base64');

      // Enviar
      console.log('Enviando mensaje JSON:', JSON.stringify(message));
      ws.send(JSON.stringify(message));
      console.log('Mensaje enviado');

      prompt();
    });
  }

  prompt();
}