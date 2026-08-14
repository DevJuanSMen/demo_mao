// Social Designer (Fase 6): genera variaciones de copy para redes sociales
// a partir de un producto del catálogo. Con GROQ_API_KEY u OPENAI_API_KEY
// llama a la API real; si no, usa el generador simulado de la demo.

import { chatJSON } from "./client";

export type SocialPost = {
  style: string;
  caption: string;
  hashtags: string[];
  cta: string;
};

export type GeneratedSocial = {
  posts: SocialPost[];
  source: "groq" | "openai" | "mock";
};

export const SOCIAL_FORMATS = {
  INSTAGRAM_POST: "Post de Instagram",
  INSTAGRAM_STORY: "Story de Instagram",
  FACEBOOK_AD: "Anuncio de Facebook",
} as const;

export const SOCIAL_TONES = {
  VENDEDOR: "Vendedor directo",
  ASPIRACIONAL: "Aspiracional",
  DIVERTIDO: "Divertido",
} as const;

export type SocialFormat = keyof typeof SOCIAL_FORMATS;
export type SocialTone = keyof typeof SOCIAL_TONES;

export async function generateSocialPosts(input: {
  title: string;
  price: number;
  brand: string;
  format: SocialFormat;
  tone: SocialTone;
  description?: string | null;
}): Promise<GeneratedSocial> {
  try {
    const result = await chatJSON<{ posts: SocialPost[] }>(
      `Eres un social media manager experto en e-commerce latinoamericano. Creas copy de alta conversión en español para redes sociales. Respondes solo JSON con la clave "posts": array de exactamente 3 objetos con las claves: style (nombre corto del enfoque, ej "Beneficio directo"), caption (texto del post, 2-4 líneas, con 1-2 emojis bien puestos), hashtags (array de 5 strings sin el símbolo #), cta (llamado a la acción de una línea).`,
      `Marca: ${input.brand}. Producto: "${input.title}". Precio: ${input.price} COP. Formato: ${SOCIAL_FORMATS[input.format]}. Tono: ${SOCIAL_TONES[input.tone]}.${input.description ? ` Contexto del producto: ${input.description.slice(0, 400)}` : ""} Genera las 3 variaciones de copy.`
    );
    if (result && Array.isArray(result.data.posts) && result.data.posts.length > 0) {
      return { posts: result.data.posts.slice(0, 3), source: result.source };
    }
  } catch (error) {
    console.error("Fallo la llamada a la IA, usando mock:", error);
  }
  return generateMock(input);
}

// --- Generador simulado (demo sin API key) ---

function generateMock(input: {
  title: string;
  price: number;
  brand: string;
  tone: SocialTone;
}): GeneratedSocial {
  const { title, brand } = input;
  const price = new Intl.NumberFormat("es-CO").format(input.price);
  const word = title.split(" ")[0].toLowerCase();
  const hashtags = [word, brand.toLowerCase().replace(/\s+/g, ""), "colombia", "compralocal", "enviogratis"];

  const byTone: Record<SocialTone, SocialPost[]> = {
    VENDEDOR: [
      {
        style: "Beneficio directo",
        caption: `✨ ${title} ya está disponible.\nCalidad que se nota desde el primer uso, al mejor precio: $${price}.\nEnvío a toda Colombia. 🚚`,
        hashtags,
        cta: "Compra ahora con envío rápido →",
      },
      {
        style: "Urgencia",
        caption: `⏰ Últimas unidades de ${title}.\nNuestros clientes lo están agotando — asegura el tuyo hoy por $${price}.`,
        hashtags,
        cta: "Pide el tuyo antes de que se agote",
      },
      {
        style: "Prueba social",
        caption: `⭐ El favorito de la comunidad ${brand}.\n${title}: cientos de clientes felices lo recomiendan.\nDescúbrelo por $${price}.`,
        hashtags,
        cta: "Únete a los que ya lo tienen",
      },
    ],
    ASPIRACIONAL: [
      {
        style: "Estilo de vida",
        caption: `Hay detalles que transforman tu día. ✨\n${title} es uno de ellos.\nDiseñado para quienes eligen bien.`,
        hashtags,
        cta: "Descúbrelo en nuestra tienda",
      },
      {
        style: "Identidad",
        caption: `No es solo ${word}. Es tu estilo. 💫\n${title}, de ${brand} — hecho para acompañarte en todo.`,
        hashtags,
        cta: "Hazlo tuyo hoy",
      },
      {
        style: "Momento",
        caption: `Imagina tu rutina con ${title}. ✨\nPequeños cambios, gran diferencia.\nDisponible ya en ${brand}.`,
        hashtags,
        cta: "Empieza hoy →",
      },
    ],
    DIVERTIDO: [
      {
        style: "Humor",
        caption: `POV: encontraste ${title} a $${price} y tu billetera dijo que sí. 😎\nNo era señal, era ${brand}.`,
        hashtags,
        cta: "Dale al link antes de arrepentirte",
      },
      {
        style: "Complicidad",
        caption: `Nadie:\nAbsolutamente nadie:\nTú, estrenando ${title}: 🤩\nTe entendemos. Por eso existe ${brand}.`,
        hashtags,
        cta: "Cae en la tentación aquí",
      },
      {
        style: "Reto",
        caption: `Apuesta: no puedes ver ${title} y no quererlo. 👀\nPerdiste. Está a $${price}.`,
        hashtags,
        cta: "Reclama tu premio →",
      },
    ],
  };

  return { posts: byTone[input.tone], source: "mock" };
}
