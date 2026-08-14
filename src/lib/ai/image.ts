// Retoque de fotos de producto con IA (Fase 6 — Social Designer).
// Usa Gemini 2.5 Flash Image ("nano banana"): edición de imagen por
// instrucciones que conserva el producto original (no es texto-a-imagen).
// Sin GEMINI_API_KEY devuelve la foto original en modo simulado.
// Nota: se descartó el endpoint hospedado de NVIDIA (FLUX.1 Kontext) porque
// el playground de build.nvidia.com solo acepta sus imágenes de ejemplo.

import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent";

// El guard va en el prompt para que el modelo retoque la escena sin
// reinventar el producto.
const EDIT_GUARD =
  "Photo editing task on the attached image. Keep the main product EXACTLY as it is: same shape, colors, materials, branding and proportions. Do not replace or redraw the product. Only modify the scene, background or surroundings as instructed. Instruction: ";

export type EditedImage = {
  imagePath: string;
  source: "gemini" | "mock";
};

export async function editProductImage(
  publicImagePath: string,
  context: string
): Promise<EditedImage> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Modo demo: sin key no hay edición real, se devuelve la original
    return { imagePath: publicImagePath, source: "mock" };
  }

  // Normalizar la foto: JPEG ≤1024px para mandarla inline en base64
  const absPath = path.join(process.cwd(), "public", publicImagePath);
  const jpeg = await sharp(await readFile(absPath))
    .resize(1024, 1024, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 88 })
    .toBuffer();

  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { inlineData: { mimeType: "image/jpeg", data: jpeg.toString("base64") } },
            { text: EDIT_GUARD + context },
          ],
        },
      ],
      generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
    }),
  });
  if (!res.ok) {
    throw new Error(`Gemini respondió ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }

  const data = await res.json();
  const parts: { inlineData?: { mimeType: string; data: string } }[] =
    data.candidates?.[0]?.content?.parts ?? [];
  const imagePart = parts.find((p) => p.inlineData?.data);
  if (!imagePart?.inlineData) {
    throw new Error(
      "Gemini no devolvió imagen (finishReason: " + data.candidates?.[0]?.finishReason + ")"
    );
  }

  const ext = imagePart.inlineData.mimeType.includes("png") ? "png" : "jpg";
  const filename = `edit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), Buffer.from(imagePart.inlineData.data, "base64"));

  return { imagePath: `/uploads/${filename}`, source: "gemini" };
}
