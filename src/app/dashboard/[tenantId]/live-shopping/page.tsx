import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatCOP, parseJsonArray } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ScheduleStreamDialog, StreamControls } from "./stream-ui";
import { Radio, Calendar, Eye, ShoppingCart, Sparkles } from "lucide-react";

// Métricas demo deterministas por transmisión (en producción vienen del
// reproductor: Mux / AWS IVS + órdenes atribuidas al live).
function demoMetrics(id: string) {
  const hash = [...id].reduce((s, c) => s + c.charCodeAt(0), 0);
  const viewers = 180 + (hash % 420);
  const orders = 3 + (hash % 12);
  return {
    viewers,
    peak: Math.round(viewers * 1.6),
    orders,
    conversion: ((orders / viewers) * 100).toFixed(1),
  };
}

const STREAM_STATUS_STYLES: Record<string, string> = {
  SCHEDULED: "bg-blue-100 text-blue-700",
  LIVE: "bg-red-100 text-red-700",
  ENDED: "bg-neutral-100 text-neutral-600",
};

const STREAM_STATUS_LABELS: Record<string, string> = {
  SCHEDULED: "Programada",
  LIVE: "EN VIVO",
  ENDED: "Finalizada",
};

export default async function LiveShoppingPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;

  const [streams, featured] = await Promise.all([
    prisma.liveStream.findMany({
      where: { tenantId },
      orderBy: { scheduledFor: "desc" },
    }),
    prisma.product.findMany({
      where: { tenantId, stock: { gt: 0 } },
      orderBy: { aiScore: "desc" },
      take: 4,
    }),
  ]);

  const live = streams.filter((s) => s.status === "LIVE");
  const scheduled = streams.filter((s) => s.status === "SCHEDULED");
  const ended = streams.filter((s) => s.status === "ENDED");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Live Shopping</h1>
          <p className="text-sm text-neutral-500">
            Transmisiones en vivo con compra en un clic, el formato que rompe
            récords de conversión en LATAM
          </p>
        </div>
        <ScheduleStreamDialog tenantId={tenantId} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className={cn(live.length > 0 && "border-red-300")}>
          <CardContent className="pt-6">
            <p className="text-xs text-neutral-500">En vivo ahora</p>
            <p className="text-2xl font-bold">{live.length}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
              <Radio className="h-3 w-3" /> Transmisiones activas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-neutral-500">Programadas</p>
            <p className="text-2xl font-bold">{scheduled.length}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
              <Calendar className="h-3 w-3" /> Próximas transmisiones
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-neutral-500">Finalizadas</p>
            <p className="text-2xl font-bold">{ended.length}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
              <Eye className="h-3 w-3" /> Con métricas de audiencia
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Agenda de transmisiones */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tus transmisiones</CardTitle>
          <CardDescription>
            Programa, inicia y finaliza tus lives desde aquí
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {streams.length === 0 ? (
            <p className="py-6 text-center text-sm text-neutral-500">
              Aún no tienes transmisiones. Programa la primera con el botón de arriba.
            </p>
          ) : (
            streams.map((s) => {
              const metrics = s.status === "ENDED" ? demoMetrics(s.id) : null;
              return (
                <div
                  key={s.id}
                  className={cn(
                    "flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4",
                    s.status === "LIVE" && "border-red-300 bg-red-50/50"
                  )}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {s.status === "LIVE" && (
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-600" />
                        </span>
                      )}
                      <p className="font-medium">{s.title}</p>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs font-medium",
                          STREAM_STATUS_STYLES[s.status]
                        )}
                      >
                        {STREAM_STATUS_LABELS[s.status] ?? s.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-neutral-500">
                      {s.scheduledFor.toLocaleDateString("es-CO", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}{" "}
                      ·{" "}
                      {s.scheduledFor.toLocaleTimeString("es-CO", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                      {s.streamUrl && (
                        <>
                          {" · "}
                          <a
                            href={s.streamUrl}
                            target="_blank"
                            rel="noopener"
                            className="text-violet-600 underline-offset-2 hover:underline"
                          >
                            Link de la sala
                          </a>
                        </>
                      )}
                    </p>
                    {metrics && (
                      <div className="mt-2 flex flex-wrap gap-4 text-xs text-neutral-600">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5 text-violet-600" />
                          {metrics.viewers} espectadores (pico {metrics.peak})
                        </span>
                        <span className="flex items-center gap-1">
                          <ShoppingCart className="h-3.5 w-3.5 text-violet-600" />
                          {metrics.orders} órdenes · {metrics.conversion}% conversión
                        </span>
                        <Badge variant="secondary" className="font-normal">
                          métricas demo
                        </Badge>
                      </div>
                    )}
                  </div>
                  <StreamControls
                    tenantId={tenantId}
                    streamId={s.id}
                    status={s.status}
                  />
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Productos sugeridos para el próximo live */}
      <Card className="border-violet-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-violet-600" /> Destacados para tu próximo live
          </CardTitle>
          <CardDescription>
            La IA sugiere tus productos con mejor score y stock disponible para el
            carrusel de compra en un clic
          </CardDescription>
        </CardHeader>
        <CardContent>
          {featured.length === 0 ? (
            <p className="py-4 text-center text-sm text-neutral-500">
              No hay productos con stock para destacar.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {featured.map((p) => {
                const img = parseJsonArray(p.images)[0];
                return (
                  <div key={p.id} className="overflow-hidden rounded-lg border">
                    <div className="relative aspect-square bg-neutral-100">
                      {img && (
                        <Image
                          src={img}
                          alt={p.title}
                          fill
                          sizes="(max-width: 640px) 50vw, 25vw"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="line-clamp-2 text-xs font-medium leading-snug">
                        {p.title}
                      </p>
                      <p className="mt-1 text-sm font-bold">{formatCOP(p.basePrice)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
