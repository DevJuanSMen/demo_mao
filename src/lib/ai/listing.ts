// AI Listing Generator (Fase 2): genera título SEO, descripción persuasiva
// y tags a partir de un nombre básico de producto.
// Si OPENAI_API_KEY está configurada llama a la API real (GPT-4o);
// si no, usa un generador simulado para la demo.

export type GeneratedListing = {
  title: string;
  description: string;
  tags: string[];
  suggestedPrice: number;
  source: "openai" | "mock";
};

export async function generateListing(
  basicName: string,
  basePrice: number,
  category?: string
): Promise<GeneratedListing> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    try {
      return await generateWithOpenAI(apiKey, basicName, basePrice, category);
    } catch (error) {
      console.error("Fallo la llamada a OpenAI, usando mock:", error);
    }
  }
  return generateMock(basicName, basePrice);
}

async function generateWithOpenAI(
  apiKey: string,
  basicName: string,
  basePrice: number,
  category?: string
): Promise<GeneratedListing> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Eres un experto en e-commerce latinoamericano. Generas listings de alta conversión en español. Respondes solo JSON con las claves: title (título SEO de 40-70 caracteres), description (descripción persuasiva de 3 párrafos), tags (array de 5 strings), suggestedPrice (número en COP).",
        },
        {
          role: "user",
          content: `Producto: "${basicName}". Precio base: ${basePrice} COP.${category ? ` Categoría: ${category}.` : ""} Genera el listing optimizado.`,
        },
      ],
    }),
  });

  if (!res.ok) throw new Error(`OpenAI respondió ${res.status}`);
  const data = await res.json();
  const parsed = JSON.parse(data.choices[0].message.content);
  return {
    title: parsed.title,
    description: parsed.description,
    tags: parsed.tags ?? [],
    suggestedPrice: parsed.suggestedPrice ?? Math.round(basePrice * 1.15),
    source: "openai",
  };
}

// --- Generador simulado (demo sin API key) ---

const HOOKS = [
  "Calidad premium garantizada",
  "El favorito de nuestros clientes",
  "Edición de alta demanda",
  "Diseño que enamora",
];

const BENEFITS = [
  "materiales de primera calidad que garantizan durabilidad por años",
  "un diseño pensado para el estilo de vida moderno",
  "la mejor relación calidad-precio de su categoría",
  "acabados premium que se sienten desde el primer uso",
];

function generateMock(basicName: string, basePrice: number): GeneratedListing {
  const clean = basicName.trim().replace(/\s+/g, " ");
  const capitalized = clean.charAt(0).toUpperCase() + clean.slice(1);
  const hook = HOOKS[clean.length % HOOKS.length];
  const benefit = BENEFITS[clean.length % BENEFITS.length];
  const benefit2 = BENEFITS[(clean.length + 2) % BENEFITS.length];

  let title = `${capitalized} Premium — Envío Rápido en Colombia`;
  if (title.length > 70) title = `${capitalized} — Calidad Premium`.slice(0, 70);

  const description = [
    `${hook}. ${capitalized} combina ${benefit}, ideal para quienes buscan destacar sin complicaciones.`,
    `Cada unidad pasa por control de calidad riguroso y cuenta con ${benefit2}. Perfecto para uso diario o para regalar.`,
    `🚚 Envío a toda Colombia con Servientrega y Coordinadora. 💳 Paga contra entrega o con tarjeta. ⭐ Garantía de satisfacción de 30 días.`,
  ].join("\n\n");

  const baseWord = clean.split(" ")[0].toLowerCase();
  const tags = [
    baseWord,
    `${baseWord} colombia`,
    `comprar ${baseWord}`,
    `${baseWord} envío gratis`,
    `${baseWord} original`,
  ];

  return {
    title,
    description,
    tags,
    suggestedPrice: Math.round((basePrice * 1.18) / 100) * 100,
    source: "mock",
  };
}

// Adaptación de listing por canal (Fase 3): versión simulada que aplica
// las reglas de cada marketplace (límites de caracteres, sin emojis en ML, etc.)
export function adaptListingForChannel(
  title: string,
  description: string | null,
  platform: string
): { title: string; description: string } {
  const desc = description ?? "";
  switch (platform) {
    case "MERCADOLIBRE":
      // ML: máx 60 caracteres en título, sin emojis ni datos de contacto
      return {
        title: stripEmojis(title).slice(0, 60).trim(),
        description: stripEmojis(desc).replace(/https?:\/\/\S+/g, ""),
      };
    case "FALABELLA":
      return { title: title.slice(0, 80).trim(), description: desc };
    case "EXITO":
      return { title: title.slice(0, 100).trim(), description: desc };
    default:
      return { title, description: desc };
  }
}

function stripEmojis(text: string): string {
  return text.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "").replace(/\s{2,}/g, " ");
}
