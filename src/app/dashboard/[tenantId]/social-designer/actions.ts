"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import {
  generateSocialPosts,
  SOCIAL_FORMATS,
  SOCIAL_TONES,
  type GeneratedSocial,
  type SocialFormat,
  type SocialTone,
} from "@/lib/ai/social";

export type SocialState = {
  error?: string;
  result?: GeneratedSocial;
  productId?: string;
  format?: SocialFormat;
  tone?: SocialTone;
};

async function assertMember(tenantId: string) {
  const user = await getSessionUser();
  if (!user || !user.tenants.some((t) => t.tenantId === tenantId)) {
    throw new Error("No autorizado");
  }
  return user;
}

export async function generateSocialAction(
  tenantId: string,
  _prev: SocialState | null,
  formData: FormData
): Promise<SocialState> {
  await assertMember(tenantId);

  const productId = String(formData.get("productId") ?? "");
  const format = String(formData.get("format") ?? "") as SocialFormat;
  const tone = String(formData.get("tone") ?? "") as SocialTone;

  if (!productId || !(format in SOCIAL_FORMATS) || !(tone in SOCIAL_TONES)) {
    return { error: "Elige un producto, un formato y un tono." };
  }

  const product = await prisma.product.findFirst({
    where: { id: productId, tenantId },
    include: { tenant: true },
  });
  if (!product) return { error: "Producto no encontrado." };

  const result = await generateSocialPosts({
    title: product.title,
    price: product.basePrice,
    brand: product.tenant.name,
    description: product.description,
    format,
    tone,
  });

  // Cada generación consume 1 crédito de IA del tenant
  await prisma.tenant.update({
    where: { id: tenantId },
    data: { aiCredits: { decrement: 1 } },
  });
  revalidatePath(`/dashboard/${tenantId}`, "layout");

  return { result, productId, format, tone };
}

/* Retoque de fotos con IA — deshabilitado por ahora: los proveedores
   probados no tienen tier gratuito utilizable para edición de imagen
   (NVIDIA capa su endpoint a imágenes de ejemplo; el free tier de Gemini
   responde 429 en el modelo de imagen). La lib queda en src/lib/ai/image.ts
   lista para reconectar cuando haya proveedor.

export type EditImageState = {
  error?: string;
  editedPath?: string;
  originalPath?: string;
  source?: "gemini" | "mock";
  productId?: string;
  context?: string;
};

export async function editImageAction(
  tenantId: string,
  _prev: EditImageState | null,
  formData: FormData
): Promise<EditImageState> {
  await assertMember(tenantId);

  const productId = String(formData.get("productId") ?? "");
  const context = String(formData.get("context") ?? "").trim();
  if (!productId || !context) {
    return { error: "Elige un producto y describe el retoque que quieres." };
  }

  const product = await prisma.product.findFirst({
    where: { id: productId, tenantId },
  });
  if (!product) return { error: "Producto no encontrado." };
  const originalPath = parseJsonArray(product.images)[0];
  if (!originalPath) return { error: "El producto no tiene foto para retocar." };

  try {
    const edited = await editProductImage(originalPath, context);

    // Cada retoque consume 1 crédito de IA del tenant
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { aiCredits: { decrement: 1 } },
    });
    revalidatePath(`/dashboard/${tenantId}`, "layout");

    return {
      editedPath: edited.imagePath,
      originalPath,
      source: edited.source,
      productId,
      context,
    };
  } catch (error) {
    console.error("Fallo el retoque con Gemini:", error);
    return { error: "El retoque falló. Revisa la GEMINI_API_KEY o inténtalo de nuevo.", context };
  }
}

export async function saveEditedImageAction(tenantId: string, formData: FormData) {
  await assertMember(tenantId);

  const productId = String(formData.get("productId") ?? "");
  const imagePath = String(formData.get("imagePath") ?? "");
  if (!productId || !imagePath.startsWith("/uploads/")) return;

  const product = await prisma.product.findFirst({
    where: { id: productId, tenantId },
  });
  if (!product) return;

  const images = parseJsonArray(product.images);
  await prisma.product.update({
    where: { id: productId },
    data: { images: JSON.stringify([imagePath, ...images.filter((i) => i !== imagePath)]) },
  });
  revalidatePath(`/dashboard/${tenantId}/products`);
  revalidatePath(`/dashboard/${tenantId}/social-designer`);
}
*/
