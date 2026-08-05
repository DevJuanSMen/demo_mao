import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCOP, PLATFORM_LABELS, ORDER_STATUS_LABELS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, Package, ShoppingCart, Share2, Sparkles, ArrowRight } from "lucide-react";

export default async function DashboardHome({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;

  const [productCount, orders, syncedCount, integrations] = await Promise.all([
    prisma.product.count({ where: { tenantId } }),
    prisma.order.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.externalSync.count({
      where: { status: "SYNCED", product: { tenantId } },
    }),
    prisma.integration.findMany({ where: { tenantId, isActive: true } }),
  ]);

  const revenue = orders
    .filter((o) => o.status !== "CANCELLED" && o.status !== "PENDING")
    .reduce((s, o) => s + o.total, 0);
  const recentOrders = orders.slice(0, 5);

  const kpis = [
    {
      label: "Ingresos (30 días)",
      value: formatCOP(revenue),
      icon: DollarSign,
      accent: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Productos activos",
      value: String(productCount),
      icon: Package,
      accent: "text-violet-600 bg-violet-50",
    },
    {
      label: "Órdenes recibidas",
      value: String(orders.length),
      icon: ShoppingCart,
      accent: "text-blue-600 bg-blue-50",
    },
    {
      label: "Publicaciones en canales",
      value: String(syncedCount),
      icon: Share2,
      accent: "text-fuchsia-600 bg-fuchsia-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Resumen</h1>
          <p className="text-sm text-neutral-500">
            Así va tu marca en todos los canales
          </p>
        </div>
        <Button asChild className="bg-violet-600 hover:bg-violet-700">
          <Link href={`/dashboard/${tenantId}/products/new`}>
            <Sparkles className="mr-2 h-4 w-4" /> Crear producto con IA
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="flex items-center gap-4 pt-6">
              <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${k.accent}`}>
                <k.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs text-neutral-500">{k.label}</p>
                <p className="text-xl font-bold">{k.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Órdenes recientes</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/dashboard/${tenantId}/orders`}>
                Ver todas <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{o.customerName}</p>
                  <p className="text-xs text-neutral-500">
                    {PLATFORM_LABELS[o.source] ?? o.source} ·{" "}
                    {o.createdAt.toLocaleDateString("es-CO")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{formatCOP(o.total)}</p>
                  <Badge variant="secondary" className="text-xs font-normal">
                    {ORDER_STATUS_LABELS[o.status] ?? o.status}
                  </Badge>
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && (
              <p className="py-6 text-center text-sm text-neutral-500">
                Aún no hay órdenes.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Canales conectados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {integrations.map((i) => (
              <div key={i.id} className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm">{PLATFORM_LABELS[i.platform] ?? i.platform}</span>
                <span className="flex items-center gap-1.5 text-xs text-emerald-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Activo
                </span>
              </div>
            ))}
            <Button variant="outline" size="sm" className="mt-2 w-full" asChild>
              <Link href={`/dashboard/${tenantId}/channels`}>Gestionar canales</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
