import { prisma } from "@/lib/prisma";
import {
  formatCOP,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_STYLES,
  PLATFORM_LABELS,
} from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Truck, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { OrderRow } from "./order-row";

export default async function OrdersPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  const orders = await prisma.order.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: { select: { title: true } } } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Órdenes</h1>
        <p className="text-sm text-neutral-500">
          {orders.length} órdenes de todos tus canales de venta — haz clic en una
          para ver el detalle
        </p>
      </div>

      <div className="rounded-xl border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Productos</TableHead>
              <TableHead>Canal</TableHead>
              <TableHead>Logística</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((o) => (
              <OrderRow key={o.id} href={`/dashboard/${tenantId}/orders/${o.id}`}>
                <TableCell>
                  <p className="font-medium">{o.customerName}</p>
                  <p className="text-xs text-neutral-500">{o.customerEmail}</p>
                  {o.shippingAddress && (
                    <p className="text-xs text-neutral-400">📍 {o.shippingAddress}</p>
                  )}
                </TableCell>
                <TableCell className="max-w-56">
                  <p className="line-clamp-2 text-sm text-neutral-600">
                    {o.items
                      .map((i) => `${i.quantity}× ${i.product.title.split("—")[0].trim()}`)
                      .join(", ")}
                  </p>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-normal">
                    {PLATFORM_LABELS[o.source] ?? o.source}
                  </Badge>
                </TableCell>
                <TableCell>
                  {o.isDropshipping ? (
                    <div className="flex items-center gap-1.5 text-xs text-neutral-600">
                      <Truck className="h-3.5 w-3.5 text-violet-600" />
                      <span>
                        {o.shippingProvider}
                        <br />
                        <span className="font-mono text-neutral-400">{o.trackingNumber}</span>
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-neutral-400">Directa</span>
                  )}
                </TableCell>
                <TableCell className="font-bold">{formatCOP(o.total)}</TableCell>
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
                <TableCell>
                  <ChevronRight className="h-4 w-4 text-neutral-300" />
                </TableCell>
              </OrderRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
