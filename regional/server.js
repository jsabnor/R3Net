import dotenv from 'dotenv';
import { createServer } from './lib/server.js';

dotenv.config();

const PORT = process.env.R3NET_HTTP_PORT || 8081;

console.log('Iniciando módulo regional R3Net...');

const app = await createServer();

app.listen(PORT, () => {
  console.log(`Módulo regional escuchando en puerto ${PORT}`);
});

// Manejo de señales para cierre graceful
process.on('SIGINT', () => {
  console.log('Cerrando módulo regional...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Cerrando módulo regional...');
  process.exit(0);
});