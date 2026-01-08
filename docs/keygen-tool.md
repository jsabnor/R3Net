# Herramienta de Generación de Claves R3Net

## Descripción

La herramienta `tools/keygen.html` es una página web simple que permite generar pares de claves Ed25519 de forma segura y unificada en cualquier plataforma con navegador (PC, móvil, tablet).

## Uso

1. Abre el archivo `tools/keygen.html` en tu navegador web (doble clic o arrastra al navegador).
2. Haz clic en "Generar Claves".
3. Descarga la clave privada como archivo JSON y guárdala en un lugar seguro (ej. USB encriptado).
4. Copia la clave pública y regístrala en el VPS de R3Net via API:
   ```bash
   curl -X POST http://tu-vps:8080/register -H "Content-Type: application/json" -d '{"indicativo":"TU_INDICATIVO","pubkey":"CLAVE_PUBLICA_AQUI"}'
   ```

## Seguridad

- Las claves se generan localmente en el navegador; nada se envía a internet.
- La clave privada nunca se muestra en pantalla completa; solo se descarga.
- Usa HTTPS si alojas la página en un servidor para evitar MITM.

## Requisitos

- Navegador moderno con JavaScript habilitado.
- Conexión a internet solo para cargar la librería (tweetnacl via CDN); la generación es offline.

## Notas

Esta herramienta es temporal. En el futuro, se integrará en la app cliente de R3Net.</content>
<parameter name="filePath">/home/j0s3m4/r3net/docs/keygen-tool.md