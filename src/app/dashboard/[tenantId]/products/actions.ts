"use server";

import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { generateListing, type GeneratedListing } from "@/lib/ai/listing";
import { computeAiScore } from "@/lib/ai/scoring";

export type GenerateState = {
  error?: string;
  listing?: GeneratedListing;
  imagePath?: string;
  basicName?: string;
  basePrice?: number;
};

async function assertMember(tenantId: string) {
  const user = await getSessionUser();
  if (!user || !user.tenants.some((t) => t.tenantId === tenantId)) {
    throw new Error("No autorizado");
  }
  return user;
}

export async function generateListingAction(
  tenantId: string,
  _prev: GenerateState | null,
  formData: FormData
): Promise<GenerateState> {
  await assertMember(tenantId);

  const basicName = String(formData.get("basicName") ?? "").trim();
  const basePrice = Number(formData.get("basePrice") ?? 0);
  const photo = formData.get("photo");

  if (!basicName || !basePrice) {
    return { error: "Ingresa el nombre básico y el precio del producto." };
  }

  // Subida de imagen: en producción va a Supabase Storage; en la demo
  // se guarda en public/uploads para servirla localmente.
  let imagePath: string | undefined;
  if (photo instanceof File && photo.size > 0) {
    const ext = (photo.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), Buffer.from(await photo.arrayBuffer()));
    imagePath = `/uploads/${filename}`;
  }

  const listing = await generateListing(basicName, basePrice);

  // Cada generación consume 1 crédito de IA del tenant
  await prisma.tenant.update({
    where: { id: tenantId },
    data: { aiCredits: { decrement: 1 } },
  });
  revalidatePath(`/dashboard/${tenantId}`, "layout");

  return { listing, imagePath, basicName, basePrice };
}

export async function saveProductAction(tenantId: string, formData: FormData) {
  await assertMember(tenantId);

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const basePrice = Number(formData.get("basePrice") ?? 0);
  const suggestedPrice = Number(formData.get("suggestedPrice") ?? 0) || null;
  const stock = Number(formData.get("stock") ?? 0);
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const imagePath = String(formData.get("imagePath") ?? "");
  const images = imagePath ? [imagePath] : [];

  const aiScore = computeAiScore({
    title,
    description,
    basePrice,
    images,
    aiTags: tags,
  });

  await prisma.product.create({
    data: {
      tenantId,
      title,
      description,
      basePrice,
      suggestedPrice,
      stock,
      images: JSON.stringify(images),
      aiTags: JSON.stringify(tags),
      aiScore,
      sku: `GEN-${Date.now().toString(36).toUpperCase()}`,
    },
  });

  revalidatePath(`/dashboard/${tenantId}/products`);
  redirect(`/dashboard/${tenantId}/products`);
}
