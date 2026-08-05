// AI Product Scoring (Fase 2 del documento de arquitectura):
// evalúa la calidad del listing y asigna un score de 0 a 100.

type ScorableProduct = {
  title: string;
  description: string | null;
  basePrice: number;
  images: string[];
  aiTags: string[];
};

export function computeAiScore(product: ScorableProduct): number {
  let score = 0;

  // Título: longitud óptima para SEO (40–70 caracteres)
  const titleLen = product.title.trim().length;
  if (titleLen >= 40 && titleLen <= 70) score += 25;
  else if (titleLen >= 20) score += 15;
  else if (titleLen > 0) score += 5;

  // Descripción: persuasiva y completa
  const descLen = (product.description ?? "").trim().length;
  if (descLen >= 300) score += 30;
  else if (descLen >= 120) score += 20;
  else if (descLen > 0) score += 8;

  // Imágenes
  const imgCount = product.images.length;
  if (imgCount >= 3) score += 25;
  else if (imgCount >= 1) score += 15;

  // Tags para descubrimiento
  if (product.aiTags.length >= 5) score += 10;
  else if (product.aiTags.length >= 3) score += 6;

  // Precio definido y razonable
  if (product.basePrice > 0) score += 10;

  return Math.min(score, 100);
}

export function scoreColor(score: number | null | undefined): "red" | "yellow" | "green" {
  if (score == null || score < 40) return "red";
  if (score < 70) return "yellow";
  return "green";
}
