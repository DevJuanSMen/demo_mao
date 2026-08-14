export const PLATFORMS = [
  "MERCADOLIBRE",
  "FALABELLA",
  "EXITO",
  "META",
  "WHATSAPP",
] as const;

export type PlatformId = (typeof PLATFORMS)[number] | "MARKETPLACE";

export const PLATFORM_LABELS: Record<string, string> = {
  MARKETPLACE: "Marketplace MAO",
  MERCADOLIBRE: "MercadoLibre",
  FALABELLA: "Falabella",
  EXITO: "Éxito",
  META: "Facebook / Instagram",
  WHATSAPP: "WhatsApp Business",
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  PAID: "Pagada",
  PROCESSING: "En proceso",
  SHIPPED: "Enviada",
  DELIVERED: "Entregada",
  CANCELLED: "Cancelada",
};

export const ORDER_STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-neutral-100 text-neutral-600",
  PAID: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-amber-100 text-amber-700",
  SHIPPED: "bg-violet-100 text-violet-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
};

// Flujo natural de una orden: siguiente estado sugerido
export const ORDER_NEXT_STATUS: Record<string, string | undefined> = {
  PENDING: "PAID",
  PAID: "PROCESSING",
  PROCESSING: "SHIPPED",
  SHIPPED: "DELIVERED",
};

// Comisión que gana un afiliado por venta referida
export const AFFILIATE_COMMISSION_RATE = 0.1;

export const PLAN_LABELS: Record<string, string> = {
  BASIC: "Básico",
  PRO: "Pro",
  ENTERPRISE: "Enterprise",
};

export function formatCOP(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
