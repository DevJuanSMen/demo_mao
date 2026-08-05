# MAO — Marketplace AI Omnicanal

MVP demo de la plataforma descrita en el *Documento de Arquitectura y Prompts*
(carpeta raíz). **"Sube una foto y nosotros hacemos el resto. Vendemos tu
producto en todas partes."**

## Requisitos

- **Node.js 22.6 o superior** (el seed ejecuta TypeScript directamente con
  `node`; desarrollado con Node 26). Verificar con `node --version`.
- **Git** con acceso al repositorio.

No hace falta instalar ninguna base de datos: la demo usa SQLite en un
archivo local.

## Clonar y correr la demo

```bash
git clone https://github.com/DevJuanSMen/demo_mao.git
cd demo_mao
```

Crear el archivo `.env` en la raíz del proyecto (no viene en el repo):

```env
# Base de datos (SQLite para demo local)
DATABASE_URL="file:./dev.db"

# Secreto para firmar la cookie de sesión de la demo
AUTH_SECRET="mao-demo-secret-cambiar-en-produccion"

# IA — si se define, el AI Listing Generator llama a la API real.
# Si está vacío, usa el modo simulado (mock) integrado.
OPENAI_API_KEY=""
```

Instalar dependencias y arrancar:

```bash
npm install
npm run demo   # crea la DB (SQLite), carga datos demo y levanta el servidor
```

Abrir **http://localhost:3000**

> `npm run demo` hace todo en un paso. Para arranques posteriores basta con
> `npm run dev` (la DB ya queda creada).

| Acceso | Credenciales |
|---|---|
| Panel de marca | `demo@mao.co` / `demo1234` (ya precargadas en el login) |

## Guión sugerido para la demo (5 minutos)

1. **Marketplace público** (`/`) — la vitrina B2C con productos de varias
   marcas, curados por AI Score. Entrar a un producto: reseñas, tags de IA,
   canales donde está publicado.
2. **Login** (`/login`) — credenciales precargadas, un clic.
3. **Resumen del dashboard** — KPIs de ingresos, órdenes multicanal
   (MercadoLibre, WhatsApp, Falabella) y canales conectados. Arriba a la
   derecha: créditos de IA del plan.
4. **El momento wow — Crear producto con IA** (`Productos → Crear con IA`):
   subir cualquier foto, escribir un nombre básico (ej. *"botilito deportivo
   1 litro"*) y un precio. La IA genera título SEO, descripción persuasiva,
   5 tags y precio sugerido. Guardar → aparece en el catálogo con su AI Score
   calculado y en el marketplace público.
5. **Productos** — el semáforo de AI Score (verde/amarillo/rojo) mide la
   calidad de cada listing.
6. **Canales** — "Publicar todo el catálogo" encola los productos;
   "Procesar cola" simula el job que adapta cada título a las reglas del
   canal (60 caracteres y sin emojis en MercadoLibre) y los marca publicados.
7. **Órdenes** — ventas unificadas de todos los canales, con dropshipping
   (Servientrega/Coordinadora) y número de guía.
8. **Inventario** — predicción de agotamiento: ritmo de ventas vs stock,
   alertas rojas si se agota en menos de 7 días.
9. **Analytics** — take rate de la plataforma, ventas por canal, ventas por
   afiliados y análisis de sentimiento de reseñas con resumen de la IA.
10. Las demás secciones (AI Hub, Afiliados, Live Shopping, Social Designer)
    muestran el roadmap por fases — útiles para cerrar con la visión.

También se puede mostrar el **onboarding B2B** (`/register`): crear una marca
nueva con selección de plan en menos de un minuto.

## IA real vs simulada

Sin configuración, el generador usa un **mock convincente** (sin dependencias
externas — imposible que falle en vivo). Para usar GPT-4o real, poner la key
en `.env`:

```env
OPENAI_API_KEY="sk-..."
```

## Decisiones tomadas para la demo (vs producción)

| Demo | Producción (según documento) |
|---|---|
| SQLite local (`prisma/dev.db`) | PostgreSQL en Supabase (`sa-east-1`) |
| Estados como `String` | Enums de Postgres |
| Cookie firmada HMAC | NextAuth.js |
| Contraseña en texto plano (seed) | Hash bcrypt |
| Sincronización simulada de canales | OAuth MercadoLibre + APIs reales, jobs con BullMQ/Inngest |
| Imágenes en `public/uploads` | Supabase Storage |

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Shadcn UI ·
Prisma 6 · SQLite · Server Actions

## Reset de datos

```bash
npm run db:seed   # vuelve a dejar los datos demo como al inicio
```
