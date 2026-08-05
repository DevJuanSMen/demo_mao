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
