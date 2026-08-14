"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

const VALID_STATUSES = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

async function assertMember(tenantId: string) {
  const user = await getSessionUser();
  if (!user || !user.tenants.some((t) => t.tenantId === tenantId)) {
    throw new Error("No autorizado");
  }
}

export async function updateOrderStatusAction(
  tenantId: string,
  orderId: string,
  status: string
) {
  await assertMember(tenantId);
  if (!VALID_STATUSES.includes(status)) throw new Error("Estado inválido");

  const result = await prisma.order.updateMany({
    where: { id: orderId, tenantId },
    data: { status },
  });
  if (result.count === 0) throw new Error("Orden no encontrada");

  revalidatePath(`/dashboard/${tenantId}/orders`);
  revalidatePath(`/dashboard/${tenantId}/orders/${orderId}`);
}
