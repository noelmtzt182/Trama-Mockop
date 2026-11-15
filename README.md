# Trama · Marketplace de emprendedores (mockup con IA)

Sitio estático (HTML + CSS + JS) más una función serverless (`api/ia.js`). Los datos son de ejemplo.

## Qué hace la IA
- **Trama IA (compradores):** asistente que recomienda productos del catálogo según para quién es y el presupuesto.
- **Ficha con IA (vendedores):** en "Vender", genera título, descripción, etiquetas y consejos de foto a partir de una frase.

Sin llave de IA el sitio funciona en **modo demo** (búsqueda por palabras clave), así que puedes enseñarlo sin gastar nada.

## Subir a Vercel
1. Sube esta carpeta a un repositorio de GitHub (o arrástrala en https://vercel.com/new).
2. Framework Preset: **Other**. Build Command y Output Directory vacíos.
3. Para activar la IA real: Settings > Environment Variables > agrega `ANTHROPIC_API_KEY` (llave de https://console.anthropic.com) y vuelve a desplegar.
4. Pon un límite de gasto en la consola de Anthropic y activa el firewall de Vercel (rate limiting). La función tiene un límite básico por IP, pero no sustituye lo anterior.

La llave vive solo en el servidor; nunca va en el navegador.

## Probar en tu computadora
`npx vercel dev` (con un archivo `.env` basado en `.env.example`). Con cualquier servidor estático el sitio funciona en modo demo.

## Siguientes pasos
- Cambiar los datos de `data.js` por tu catálogo real.
- Guardar el formulario de vendedores (Formspree, Google Forms o base de datos).
- Pasar a Next.js, cuentas de vendedor y pagos (Mercado Pago o Stripe Connect) cuando haya marcas reales.
