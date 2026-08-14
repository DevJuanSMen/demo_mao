"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export type StreamFormState = {
  error?: string;
  ok?: boolean;
};

async function assertMember(tenantId: string) {
  const user = await getSessionUser();
  if (!user || !user.tenants.some((t) => t.tenantId === tenantId)) {
    throw new Error("No autorizado");
  }
}

export async function scheduleStreamAction(
  tenantId: string,
  _prev: StreamFormState | null,
  formData: FormData
): Promise<StreamFormState> {
  await assertMember(tenantId);

  const title = String(formData.get("title") ?? "").trim();
  const scheduledForRaw = String(formData.get("scheduledFor") ?? "");
  const streamUrl = String(formData.get("streamUrl") ?? "").trim() || null;

  if (!title) return { error: "Ponle un título a tu transmisión." };
  const scheduledFor = new Date(scheduledForRaw);
  if (!scheduledForRaw || isNaN(scheduledFor.getTime())) {
    return { error: "Elige fecha y hora para la transmisión." };
  }

  await prisma.liveStream.create({
    data: { tenantId, title, streamUrl, status: "SCHEDULED", scheduledFor },
  });

  revalidatePath(`/dashboard/${tenantId}/live-shopping`);
  return { ok: true };
}

export async function setStreamStatusAction(
  tenantId: string,
  streamId: string,
  status: "LIVE" | "ENDED"
) {
  await assertMember(tenantId);
  if (status !== "LIVE" && status !== "ENDED") throw new Error("Estado inválido");

  const result = await prisma.liveStream.updateMany({
    where: { id: streamId, tenantId },
    data: { status },
  });
  if (result.count === 0) throw new Error("Transmisión no encontrada");

  revalidatePath(`/dashboard/${tenantId}/live-shopping`);
}

export async function deleteStreamAction(tenantId: string, streamId: string) {
  await assertMember(tenantId);
  await prisma.liveStream.deleteMany({ where: { id: streamId, tenantId } });
  revalidatePath(`/dashboard/${tenantId}/live-shopping`);
}
