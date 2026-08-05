import { prisma } from "@/lib/prisma";
import { formatCOP, PLATFORM_LABELS } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, TrendingUp, Smile, Meh, Frown } from "lucide-react";
import { cn } from "@/lib/utils";

const TAKE_RATE = 0.08; // Comisión de la plataforma (8%)

const CHANNEL_COLORS: Record<string, string> = {
  MARKETPLACE: "bg-violet-500",
  MERCADOLIBRE: "bg-yellow-400",
  FALABELLA: "bg-green-600",
  EXITO: "bg-red-500",
  META: "bg-blue-600",
  WHATSAPP: "bg-emerald-500",
};

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;

  const [orders, reviews, affiliateOrders] = await Promise.all([
    prisma.order.findMany({
      where: { tenantId, status: { notIn: ["CANCELLED", "PENDING"] } },
    }),
    prisma.review.findMany({ where: { product: { tenantId } } }),
    prisma.order.findMany({
      where: { tenantId, affiliateId: { not: null } },
      include: { affiliate: true },
    }),
  ]);

  const revenue = orders.reduce((s, o) => s + o.total, 0);
  const takeRate = revenue * TAKE_RATE;

  // Ventas por canal
  const byChannel = new Map<string, number>();
  for (const o of orders) {
    byChannel.set(o.source, (byChannel.get(o.source) ?? 0) + o.total);
  }
  const channels = [...byChannel.entries()].sort((a, b) => b[1] - a[1]);
  const maxChannel = channels[0]?.[1] ?? 1;

  // Sentimiento
  const sentiments = {
    POSITIVE: reviews.filter((r) => r.sentiment === "POSITIVE").length,
    NEUTRAL: reviews.filter((r) => r.sentiment === "NEUTRAL").length,
    NEGATIVE: reviews.filter((r) => r.sentiment === "NEGATIVE").length,
  };
  const negativeComments = reviews
    .filter((r) => r.sentiment === "NEGATIVE")
    .map((r) => r.comment ?? "");
  const shippingComplaints = negativeComments.filter((c) =>
    /env[ií]o|tard[oó]|semana|embalad/i.test(c)
  ).length;

  const aiSummary =
    reviews.length === 0
      ? "Aún no hay reseñas suficientes para analizar."
      : shippingComplaints > 0
        ? `Tus clientes aman la calidad de tus productos (${sentiments.POSITIVE} reseñas positivas), pero ${shippingComplaints} de ${negativeComments.length || 1} quejas mencionan demoras en el envío. Recomendación: activa dropshipping con Coordinadora para reducir tiempos de entrega en un 40%.`
        : `El sentimiento general es positivo (${sentiments.POSITIVE} de ${reviews.length} reseñas). Mantén la calidad del empaque, es lo más mencionado por tus clientes.`;

  // Afiliados
  const byAffiliate = new Map<string, { name: string; total: number; count: number }>();
  for (const o of affiliateOrders) {
    const key = o.affiliateId!;
    const prev = byAffiliate.get(key) ?? { name: o.affiliate?.name ?? "—", total: 0, count: 0 };
    prev.total += o.total;
    prev.count++;
    byAffiliate.set(key, prev);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-neutral-500">
          El cerebro financiero de tu marca, potenciado por IA
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-neutral-500">Ingresos totales</p>
            <p className="text-2xl font-bold">{formatCOP(revenue)}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600">
              <TrendingUp className="h-3 w-3" /> Órdenes pagadas y entregadas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-neutral-500">Take rate plataforma (8%)</p>
            <p className="text-2xl font-bold">{formatCOP(takeRate)}</p>
            <p className="mt-1 text-xs text-neutral-500">Comisión sobre transacciones</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-neutral-500">Ticket promedio</p>
            <p className="text-2xl font-bold">
              {formatCOP(orders.length ? revenue / orders.length : 0)}
            </p>
            <p className="mt-1 text-xs text-neutral-500">{orders.length} órdenes efectivas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Ventas por canal */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ventas por canal</CardTitle>
            <CardDescription>Distribución omnicanal de tus ingresos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {channels.map(([channel, total]) => (
              <div key={channel}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{PLATFORM_LABELS[channel] ?? channel}</span>
                  <span className="font-medium">{formatCOP(total)}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className={cn("h-full rounded-full", CHANNEL_COLORS[channel] ?? "bg-neutral-400")}
                    style={{ width: `${Math.max((total / maxChannel) * 100, 4)}%` }}
                  />
                </div>
              </div>
            ))}
            {channels.length === 0 && (
              <p className="py-6 text-center text-sm text-neutral-500">Sin ventas aún.</p>
            )}
          </CardContent>
        </Card>

        {/* AI Sentiment */}
        <Card className="border-violet-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-violet-600" /> AI Sentiment Analysis
            </CardTitle>
            <CardDescription>
              {reviews.length} reseñas analizadas automáticamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-emerald-50 p-3">
                <Smile className="mx-auto h-5 w-5 text-emerald-600" />
                <p className="mt-1 text-xl font-bold text-emerald-700">{sentiments.POSITIVE}</p>
                <p className="text-xs text-emerald-600">Positivas</p>
              </div>
              <div className="rounded-lg bg-neutral-50 p-3">
                <Meh className="mx-auto h-5 w-5 text-neutral-500" />
                <p className="mt-1 text-xl font-bold text-neutral-600">{sentiments.NEUTRAL}</p>
                <p className="text-xs text-neutral-500">Neutrales</p>
              </div>
              <div className="rounded-lg bg-red-50 p-3">
                <Frown className="mx-auto h-5 w-5 text-red-500" />
                <p className="mt-1 text-xl font-bold text-red-600">{sentiments.NEGATIVE}</p>
                <p className="text-xs text-red-500">Negativas</p>
              </div>
            </div>
            <div className="rounded-lg bg-violet-50 p-4 text-sm text-violet-900">
              <p className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-violet-500">
                <Sparkles className="h-3 w-3" /> Resumen de la IA
              </p>
              {aiSummary}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Afiliados */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ventas por afiliados</CardTitle>
          <CardDescription>Comisión del 10% por venta referida</CardDescription>
        </CardHeader>
        <CardContent>
          {byAffiliate.size === 0 ? (
            <p className="py-4 text-center text-sm text-neutral-500">
              Sin ventas por afiliados aún.
            </p>
          ) : (
            <div className="space-y-2">
              {[...byAffiliate.values()].map((a) => (
                <div
                  key={a.name}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{a.name}</p>
                    <p className="text-xs text-neutral-500">{a.count} ventas referidas</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{formatCOP(a.total)}</p>
                    <p className="text-xs text-violet-600">
                      Comisión: {formatCOP(a.total * 0.1)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
