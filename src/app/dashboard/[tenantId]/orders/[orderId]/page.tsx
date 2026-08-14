import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  formatCOP,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_STYLES,
  PLATFORM_LABELS,
  parseJsonArray,
} from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { OrderStatusActions } from "./status-actions";
import {
  ArrowLeft,
  Truck,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  UserRound,
  Store,
} from "lucide-react";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ tenantId: string; orderId: string }>;
}) {
  const { tenantId, orderId } = await params;
  const order = await prisma.order.findFirst({
    where: { id: orderId, tenantId },
    include: {
      items: { include: { product: true } },
      affiliate: true,
    },
  });
  if (!order) notFound();

  const orderNumber = order.id.slice(-6).toUpperCase();
  const itemsTotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);

  // Link directo a WhatsApp del cliente (números colombianos de 10 dígitos)
  const phoneDigits = (order.customerPhone ?? "").replace(/\D/g, "");
  const whatsappUrl =
    phoneDigits.length >= 10
      ? `https://wa.me/${phoneDigits.length === 10 ? `57${phoneDigits}` : phoneDigits}`
      : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Button variant="ghost" size="sm" asChild className="-ml-2 mb-1">
            <Link href={`/dashboard/${tenantId}/orders`}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Volver a órdenes
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">
              Orden <span className="font-mono">#{orderNumber}</span>
            </h1>
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-medium",
                ORDER_STATUS_STYLES[order.status]
              )}
            >
              {ORDER_STATUS_LABELS[order.status] ?? order.status}
            </span>
          </div>
          <p className="mt-1 text-sm text-neutral-500">
            {order.createdAt.toLocaleDateString("es-CO", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}{" "}
            ·{" "}
            {order.createdAt.toLocaleTimeString("es-CO", {
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        </div>
        <OrderStatusActions
          tenantId={tenantId}
          orderId={order.id}
          status={order.status}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Productos de la orden */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">
              {order.items.length} {order.items.length === 1 ? "producto" : "productos"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.items.map((item) => {
              const img = parseJsonArray(item.product.images)[0];
              return (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-neutral-100">
                    {img && (
                      <Image
                        src={img}
                        alt={item.product.title}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/p/${item.productId}`}
                      className="line-clamp-2 text-sm font-medium leading-snug hover:text-violet-700 hover:underline"
                    >
                      {item.product.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      {item.product.sku && (
                        <span className="font-mono">{item.product.sku} · </span>
                      )}
                      {item.quantity} × {formatCOP(item.price)}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-bold">
                    {formatCOP(item.price * item.quantity)}
                  </p>
                </div>
              );
            })}

            <Separator />

            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span>{formatCOP(itemsTotal)}</span>
              </div>
              {order.total !== itemsTotal && (
                <div className="flex justify-between text-neutral-600">
                  <span>Ajustes del canal</span>
                  <span>{formatCOP(order.total - itemsTotal)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span>{formatCOP(order.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UserRound className="h-4 w-4 text-violet-600" /> Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium">{order.customerName}</p>
              <p className="flex items-center gap-2 text-neutral-600">
                <Mail className="h-3.5 w-3.5 shrink-0" /> {order.customerEmail}
              </p>
              {order.customerPhone && (
                <p className="flex items-center gap-2 text-neutral-600">
                  <Phone className="h-3.5 w-3.5 shrink-0" /> {order.customerPhone}
                </p>
              )}
              {whatsappUrl && (
                <Button
                  asChild
                  size="sm"
                  className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  <a href={whatsappUrl} target="_blank" rel="noopener">
                    <MessageCircle className="mr-2 h-4 w-4" /> Escribir por WhatsApp
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Envío y logística */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Truck className="h-4 w-4 text-violet-600" /> Envío y logística
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {order.shippingAddress ? (
                <p className="flex items-start gap-2 text-neutral-600">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {order.shippingAddress}
                </p>
              ) : (
                <p className="text-neutral-400">Sin dirección registrada</p>
              )}
              {order.isDropshipping ? (
                <div className="rounded-lg bg-violet-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-violet-500">
                    Dropshipping
                  </p>
                  <p className="mt-1 font-medium text-violet-900">
                    {order.shippingProvider}
                  </p>
                  <p className="font-mono text-xs text-violet-700">
                    Guía: {order.trackingNumber}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-neutral-400">Entrega directa del vendedor</p>
              )}
            </CardContent>
          </Card>

          {/* Origen de la venta */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Store className="h-4 w-4 text-violet-600" /> Origen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Canal</span>
                <Badge variant="secondary" className="font-normal">
                  {PLATFORM_LABELS[order.source] ?? order.source}
                </Badge>
              </div>
              {order.affiliate && (
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Afiliado</span>
                  <span className="font-medium">
                    {order.affiliate.name}
                    {order.affiliate.affiliateCode && (
                      <span className="ml-1 font-mono text-xs text-violet-600">
                        ({order.affiliate.affiliateCode})
                      </span>
                    )}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Última actualización</span>
                <span className="text-neutral-500">
                  {order.updatedAt.toLocaleDateString("es-CO", {
                    day: "numeric",
                    month: "short",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
