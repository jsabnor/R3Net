# Cliente Básico R3Net

Este es un cliente de línea de comandos simple para probar R3Net. Se conecta a un r3-hub local, registra al usuario y permite enviar mensajes firmados a otros indicativos.

## Requisitos

- Node.js >= 18
- Archivo `r3net_private_key.json` generado con `tools/keygen.html`
- r3-hub ejecutándose localmente

## Instalación

```bash
cd client
npm install
```

## Uso

1. Asegúrate de que el r3-hub esté corriendo (ej. en localhost:8082).
2. Registra tu clave pública en el VPS global:
   ```bash
   curl -X POST http://tu-vps:8080/register -H "Content-Type: application/json" -d '{"indicativo":"TU_INDICATIVO","pubkey":"CLAVE_PUBLICA"}'
   ```
3. Ejecuta el cliente:
   ```bash
   node client.js TU_INDICATIVO
   ```
4. Envía mensajes en formato: `destinatario:texto`
   Ejemplo: `EA7YYY:Hola desde R3Net`

## Notas

- Este cliente es para pruebas; no es una app completa.
- Los mensajes se firman con Ed25519 y se enrutan via r3-hub.
- Para recibir mensajes, necesitarías un cliente que escuche respuestas (no implementado aquí).

## Seguridad

- La clave privada se carga desde archivo local; no se envía.
- Mensajes firmados para autenticidad.</content>
<parameter name="filePath">/home/j0s3m4/r3net/client/README.md