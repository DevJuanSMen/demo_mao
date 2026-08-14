import { prisma } from "@/lib/prisma";
import {
  AFFILIATE_COMMISSION_RATE,
  formatCOP,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_STYLES,
} from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  AddAffiliateDialog,
  CopyRefLinkButton,
  PayCommissionsButton,
} from "./affiliate-ui";
import { Users, Trophy, HandCoins, TrendingUp } from "lucide-react";

type AffiliateStats = {
  id: string;
  name: string;
  code: string;
  salesCount: number;
  totalSales: number;
  pendingCommission: number;
  paidCommission: number;
};

export default async function AffiliatesPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;

  const [tenant, affiliates, referredOrders] = await Promise.all([
    prisma.tenant.findUnique({ where: { id: tenantId } }),
    prisma.user.findMany({
      where: { role: "AFFILIATE", affiliateCode: { not: null } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.order.findMany({
      where: { tenantId, affiliateId: { not: null } },
      orderBy: { createdAt: "desc" },
      include: { affiliate: true },
    }),
  ]);

  const slug = tenant?.slug ?? "";

  // Estadísticas por afiliado sobre órdenes efectivas (ni pendientes ni canceladas)
  const stats = new Map<string, AffiliateStats>();
  for (const a of affiliates) {
    stats.set(a.id, {
      id: a.id,
      name: a.name ?? "—",
      code: a.affiliateCode!,
      salesCount: 0,
      totalSales: 0,
      pendingCommission: 0,
      paidCommission: 0,
    });
  }
  for (const o of referredOrders) {
    const s = stats.get(o.affiliateId!);
    if (!s || o.status === "PENDING" || o.status === "CANCELLED") continue;
    s.salesCount++;
    s.totalSales += o.total;
    const commission = o.total * AFFILIATE_COMMISSION_RATE;
    if (o.commissionPaid) s.paidCommission += commission;
    else s.pendingCommission += commission;
  }

  const ranking = [...stats.values()].sort((a, b) => b.totalSales - a.totalSales);
  const totalReferred = ranking.reduce((s, a) => s + a.totalSales, 0);
  const totalPending = ranking.reduce((s, a) => s + a.pendingCommission, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Programa de Afiliados</h1>
          <p className="text-sm text-neutral-500">
            Influencers y creadores venden por ti a cambio del{" "}
            {AFFILIATE_COMMISSION_RATE * 100}% de comisión
          </p>
        </div>
        <AddAffiliateDialog tenantId={tenantId} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-neutral-500">Ventas referidas</p>
            <p className="text-2xl font-bold">{formatCOP(totalReferred)}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600">
              <TrendingUp className="h-3 w-3" /> Generadas por afiliados
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-neutral-500">Comisiones por pagar</p>
            <p className="text-2xl font-bold">{formatCOP(totalPending)}</p>
            <p className="mt-1 text-xs text-neutral-500">
              {AFFILIATE_COMMISSION_RATE * 100}% por venta referida
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-neutral-500">Afiliados activos</p>
            <p className="text-2xl font-bold">{ranking.length}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
              <Users className="h-3 w-3" /> Con código de referido
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ranking de afiliados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-4 w-4 text-amber-500" /> Ranking de afiliados
          </CardTitle>
          <CardDescription>
            Comparte el link personalizado de cada afiliado — sus ventas quedan
            atribuidas automáticamente con <span className="font-mono">?ref=CODIGO</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {ranking.length === 0 ? (
            <p className="py-6 text-center text-sm text-neutral-500">
              Aún no tienes afiliados. Crea el primero con el botón de arriba.
            </p>
          ) : (
            ranking.map((a, i) => (
              <div
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                      i === 0
                        ? "bg-amber-100 text-amber-700"
                        : "bg-neutral-100 text-neutral-500"
                    )}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{a.name}</p>
                    <p className="text-xs text-neutral-500">
                      <span className="font-mono text-violet-600">{a.code}</span> ·{" "}
                      {a.salesCount} {a.salesCount === 1 ? "venta" : "ventas"} ·{" "}
                      {formatCOP(a.totalSales)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="mr-2 text-right text-xs">
                    <p className="font-bold text-violet-700">
                      {formatCOP(a.pendingCommission)}
                    </p>
                    <p className="text-neutral-500">
                      pendiente · {formatCOP(a.paidCommission)} pagado
                    </p>
                  </div>
                  {slug && <CopyRefLinkButton slug={slug} code={a.code} />}
                  <PayCommissionsButton
                    tenantId={tenantId}
                    affiliateId={a.id}
                    amount={a.pendingCommission}
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Ventas referidas recientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <HandCoins className="h-4 w-4 text-violet-600" /> Ventas referidas
          </CardTitle>
          <CardDescription>
            Órdenes que llegaron a través de un link de afiliado
          </CardDescription>
        </CardHeader>
        <CardContent>
          {referredOrders.length === 0 ? (
            <p className="py-6 text-center text-sm text-neutral-500">
              Todavía no hay ventas por afiliados. Comparte un link con{" "}
              <span className="font-mono">?ref=CODIGO</span> para empezar.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Afiliado</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Comisión</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referredOrders.map((o) => {
                  const effective = o.status !== "PENDING" && o.status !== "CANCELLED";
                  return (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium">{o.customerName}</TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-violet-600">
                          {o.affiliate?.affiliateCode ?? "—"}
                        </span>
                      </TableCell>
                      <TableCell>{formatCOP(o.total)}</TableCell>
                      <TableCell>
                        {effective ? (
                          <span className="text-sm">
                            {formatCOP(o.total * AFFILIATE_COMMISSION_RATE)}{" "}
                            <Badge
                              variant="secondary"
                              className={cn(
                                "ml-1 font-normal",
                                o.commissionPaid
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-amber-100 text-amber-700"
                              )}
                            >
                              {o.commissionPaid ? "pagada" : "pendiente"}
                            </Badge>
                          </span>
                        ) : (
                          <span className="text-xs text-neutral-400">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-xs font-medium",
                            ORDER_STATUS_STYLES[o.status]
                          )}
                        >
                          {ORDER_STATUS_LABELS[o.status] ?? o.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-neutral-500">
                        {o.createdAt.toLocaleDateString("es-CO", {
                          day: "numeric",
                          month: "short",
                        })}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
