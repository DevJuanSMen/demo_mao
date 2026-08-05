import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { parseJsonArray } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, AlertTriangle, PackageCheck } from "lucide-react";
import { cn } from "@/lib/utils";

// Predicción de inventario (Fase 9): ritmo de ventas de los últimos 30 días
// vs stock actual → días estimados hasta agotarse.
async function getProductsWithRecentSales(tenantId: string) {
  const since = new Date(Date.now() - 30 * 24 * 3600e3);
  return prisma.product.findMany({
    where: { tenantId },
    include: {
      orderItems: {
        where: {
          order: {
            createdAt: { gte: since },
            status: { notIn: ["CANCELLED"] },
          },
        },
      },
    },
  });
}

export default async function InventoryPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  const products = await getProductsWithRecentSales(tenantId);

  const analyzed = products
    .map((p) => {
      const sold30d = p.orderItems.reduce((s, i) => s + i.quantity, 0);
      const dailyRate = sold30d / 30;
      const daysLeft = dailyRate > 0 ? Math.floor(p.stock / dailyRate) : Infinity;
      return { ...p, sold30d, dailyRate, daysLeft };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const critical = analyzed.filter((p) => p.daysLeft <= 7);
  const warning = analyzed.filter((p) => p.daysLeft > 7 && p.daysLeft <= 21);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          Inventario
          <Sparkles className="h-5 w-5 text-violet-600" />
        </h1>
        <p className="text-sm text-neutral-500">
          Predicción de agotamiento por IA: ritmo de ventas de 30 días vs stock actual
        </p>
      </div>

      {critical.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="flex items-center gap-2 font-medium text-red-700">
            <AlertTriangle className="h-4 w-4" />
            {critical.length} producto{critical.length > 1 ? "s" : ""} se agotará
            {critical.length > 1 ? "n" : ""} en menos de 7 días — programa restock ya
          </p>
        </div>
      )}

      <div className="grid gap-4">
        {analyzed.map((p) => {
          const img = parseJsonArray(p.images)[0];
          const level =
            p.daysLeft <= 7 ? "critical" : p.daysLeft <= 21 ? "warning" : "ok";
          return (
            <Card
              key={p.id}
              className={cn(
                level === "critical" && "border-red-300",
                level === "warning" && "border-amber-300"
              )}
            >
              <CardContent className="flex items-center gap-4 py-4">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                  {img && <Image src={img} alt="" fill sizes="56px" className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 font-medium">{p.title}</p>
                  <p className="text-sm text-neutral-500">
                    Stock: <span className="font-medium text-neutral-900">{p.stock}</span> ·
                    Vendidos (30d): {p.sold30d} · Ritmo: {p.dailyRate.toFixed(1)}/día
                  </p>
                </div>
                <div className="text-right">
                  {level === "critical" ? (
                    <span className="flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Se agota en {p.daysLeft} día{p.daysLeft !== 1 ? "s" : ""}
                    </span>
                  ) : level === "warning" ? (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
                      ~{p.daysLeft} días de stock
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
                      <PackageCheck className="h-3.5 w-3.5" /> Saludable
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {warning.length === 0 && critical.length === 0 && analyzed.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Todo en orden</CardTitle>
            <CardDescription>
              Ningún producto en riesgo de agotarse en los próximos 21 días.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
