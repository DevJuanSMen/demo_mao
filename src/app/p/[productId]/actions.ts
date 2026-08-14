"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { formatCOP } from "@/lib/constants";

export type OrderState = {
  error?: string;
  ok?: boolean;
  orderNumber?: string;
  whatsappUrl?: string | null;
};

export async function placeOrderAction(
  productId: string,
  _prev: OrderState | null,
  formData: FormData
): Promise<OrderState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const quantity = Math.max(1, Math.floor(Number(formData.get("quantity") ?? 1)));

  if (!name || !email || !phone || !address || !city) {
    return { error: "Completa todos los datos para el envío." };
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { tenant: true },
  });
  if (!product) return { error: "Producto no encontrado." };
  if (product.stock < quantity) {
    return { error: `Solo quedan ${product.stock} unidades disponibles.` };
  }

  const total = product.basePrice * quantity;
  const shippingAddress = `${address}, ${city}`;

  const order = await prisma.order.create({
    data: {
      tenantId: product.tenantId,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      total,
      status: "PENDING",
      source: "MARKETPLACE",
      shippingAddress,
      items: {
        create: { productId: product.id, quantity, price: product.basePrice },
      },
    },
  });
  await prisma.product.update({
    where: { id: product.id },
    data: { stock: { decrement: quantity } },
  });

  const orderNumber = order.id.slice(-6).toUpperCase();

  // Sin pasarela de pagos: el pago se coordina por el WhatsApp de la marca
  const whatsapp = await prisma.integration.findUnique({
    where: {
      tenantId_platform: { tenantId: product.tenantId, platform: "WHATSAPP" },
    },
  });
  let whatsappUrl: string | null = null;
  if (whatsapp?.isActive && whatsapp.sellerId) {
    const message = [
      `Hola ${product.tenant.name} 👋 Acabo de hacer un pedido en tu tienda MAO:`,
      "",
      `📦 Pedido #${orderNumber}`,
      `• ${quantity}× ${product.title} — ${formatCOP(total)}`,
      "",
      `🙋 ${name}`,
      `📍 ${shippingAddress}`,
      `📱 ${phone}`,
      "",
      "¿Cómo coordinamos el pago?",
    ].join("\n");
    whatsappUrl = `https://wa.me/${whatsapp.sellerId}?text=${encodeURIComponent(message)}`;
  }

  revalidatePath(`/dashboard/${product.tenantId}`, "layout");
  revalidatePath(`/p/${product.id}`);

  return { ok: true, orderNumber, whatsappUrl };
}
