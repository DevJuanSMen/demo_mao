import { prisma } from "@/lib/prisma";
import { formatCOP, ORDER_STATUS_LABELS, PLATFORM_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Truck } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-neutral-100 text-neutral-600",
  PAID: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-amber-100 text-amber-700",
  SHIPPED: "bg-violet-100 text-violet-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
};

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
          {orders.length} órdenes de todos tus canales de venta
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((o) => (
              <TableRow key={o.id}>
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
                      STATUS_STYLES[o.status]
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
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
