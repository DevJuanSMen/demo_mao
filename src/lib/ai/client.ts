// Cliente de chat-completions compartido por las funciones de IA.
// Prioridad: Groq (GROQ_API_KEY, Llama 3.3 70B) → OpenAI (OPENAI_API_KEY,
// GPT-4o) → null (el caller usa su generador simulado).
// Groq expone una API compatible con OpenAI, así que el mismo request sirve
// para ambos proveedores.

export type AiSource = "groq" | "openai";

const PROVIDERS: {
  source: AiSource;
  envKey: string;
  url: string;
  model: string;
}[] = [
  {
    source: "groq",
    envKey: "GROQ_API_KEY",
    url: "https://api.groq.com/openai/v1/chat/completions",
    model: "llama-3.3-70b-versatile",
  },
  {
    source: "openai",
    envKey: "OPENAI_API_KEY",
    url: "https://api.openai.com/v1/chat/completions",
    model: "gpt-4o",
  },
];

export const AI_SOURCE_LABELS: Record<string, string> = {
  groq: "Llama 3.3 · Groq",
  openai: "GPT-4o",
  mock: "IA (modo demo)",
};

/**
 * Llama al primer proveedor configurado pidiendo respuesta JSON.
 * Devuelve null si no hay ninguna API key en el entorno; lanza si el
 * proveedor configurado falla (el caller decide el fallback).
 */
export async function chatJSON<T>(
  system: string,
  user: string
): Promise<{ data: T; source: AiSource } | null> {
  const provider = PROVIDERS.find((p) => process.env[p.envKey]);
  if (!provider) return null;

  const res = await fetch(provider.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env[provider.envKey]}`,
    },
    body: JSON.stringify({
      model: provider.model,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`${provider.source} respondió ${res.status}: ${await res.text()}`);
  }
  const payload = await res.json();
  return {
    data: JSON.parse(payload.choices[0].message.content) as T,
    source: provider.source,
  };
}
