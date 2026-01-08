import TelegramBot from 'node-telegram-bot-api';
import mqtt from 'mqtt';
import dotenv from 'dotenv';

dotenv.config();

const TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const MQTT_URL = process.env.R3NET_MQTT_URL || 'mqtt://localhost:1883';

if (!TOKEN) {
  console.error('Error: TELEGRAM_TOKEN no configurado');
  process.exit(1);
}

const bot = new TelegramBot(TOKEN, { polling: true });
let mqttClient;

async function initMQTT() {
  mqttClient = mqtt.connect(MQTT_URL);

  mqttClient.on('connect', () => {
    console.log('Bot conectado a MQTT');
    mqttClient.subscribe('r3net/global/telegram/send');
  });

  mqttClient.on('message', (topic, message) => {
    if (topic === 'r3net/global/telegram/send') {
      const data = JSON.parse(message.toString());
      sendMessage(data);
    }
  });

  mqttClient.on('error', (error) => {
    console.error('Error en MQTT:', error);
  });
}

function sendMessage(data) {
  const { to, message } = data;
  if (CHAT_ID) {
    bot.sendMessage(CHAT_ID, `Mensaje para ${to}: ${message}`);
  }
}

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text.startsWith('/start')) {
    bot.sendMessage(chatId, 'Bienvenido a R3Net. Usa /vincular <indicativo> para vincular tu cuenta.');
  } else if (text.startsWith('/vincular ')) {
    const indicativo = text.split(' ')[1];
    // Lógica para vincular (simplificada)
    bot.sendMessage(chatId, `Cuenta vinculada a ${indicativo}`);
  } else if (text.startsWith('/estado')) {
    bot.sendMessage(chatId, 'Estado: Conectado a R3Net');
  } else {
    // Enviar respuesta a R3Net
    if (mqttClient) {
      mqttClient.publish('r3net/global/telegram/inject', JSON.stringify({
        from: 'telegram',
        to: 'indicativo', // Resolver desde chat
        message: text,
        timestamp: Math.floor(Date.now() / 1000)
      }));
    }
  }
});

async function start() {
  console.log('Iniciando bot de Telegram para R3Net...');
  await initMQTT();
}

start();