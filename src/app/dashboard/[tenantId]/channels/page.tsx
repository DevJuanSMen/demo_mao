import { prisma } from "@/lib/prisma";
import { PLATFORM_LABELS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChannelActions, ConnectToggle } from "./channel-buttons";
import { cn } from "@/lib/utils";

const CHANNEL_META: Record<
  string,
  { color: string; auth: string }
> = {
  MERCADOLIBRE: { color: "bg-yellow-400", auth: "OAuth 2.0" },
  FALABELLA: { color: "bg-green-600", auth: "API Key + HMAC" },
  EXITO: { color: "bg-red-500", auth: "API Key (Mirakl)" },
  META: { color: "bg-blue-600", auth: "OAuth (Graph API)" },
  WHATSAPP: { color: "bg-emerald-500", auth: "Cloud API Token" },
};

const STATUS_STYLES: Record<string, string> = {
  SYNCED: "bg-emerald-100 text-emerald-700",
  PENDING: "bg-amber-100 text-amber-700",
  FAILED: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  SYNCED: "Publicado",
  PENDING: "En cola",
  FAILED: "Falló",
};

export default async function ChannelsPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;

  const [integrations, syncs] = await Promise.all([
    prisma.integration.findMany({ where: { tenantId } }),
    prisma.externalSync.findMany({
      where: { product: { tenantId } },
      include: { product: { select: { title: true } } },
      orderBy: [{ status: "asc" }, { lastSync: "desc" }],
    }),
  ]);

  const pendingCount = syncs.filter((s) => s.status !== "SYNCED").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Canales de venta</h1>
          <p className="text-sm text-neutral-500">
            Conecta tus canales y publica todo tu catálogo con un clic. La IA
            adapta cada listing a las reglas de cada plataforma.
          </p>
        </div>
        <ChannelActions tenantId={tenantId} pendingCount={pendingCount} />
      </div>

      {/* Integraciones */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Object.keys(CHANNEL_META).map((platform) => {
          const integration = integrations.find((i) => i.platform === platform);
          const connected = Boolean(integration?.isActive);
          const meta = CHANNEL_META[platform];
          return (
            <Card key={platform} className={cn(!connected && "opacity-70")}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn("h-3 w-3 rounded-full", meta.color)} />
                    <CardTitle className="text-base">
                      {PLATFORM_LABELS[platform]}
                    </CardTitle>
                  </div>
                  {connected ? (
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                      Conectado
                    </Badge>
                  ) : (
                    <Badge variant="outline">Sin conectar</Badge>
                  )}
                </div>
                <CardDescription>
                  Autenticación: {meta.auth}
                  {integration?.sellerId && ` · Seller: ${integration.sellerId}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ConnectToggle
                  tenantId={tenantId}
                  platform={platform}
                  connected={connected}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Cola de sincronización */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sincronización de listings</CardTitle>
          <CardDescription>
            {syncs.length} publicaciones · {pendingCount} en cola. En producción
            este proceso corre como background job con reintentos automáticos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Canal</TableHead>
                <TableHead>Título adaptado por IA</TableHead>
                <TableHead>ID externo</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {syncs.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="max-w-56">
                    <p className="line-clamp-1 text-sm">{s.product.title}</p>
                  </TableCell>
                  <TableCell className="text-sm">
                    {PLATFORM_LABELS[s.platform] ?? s.platform}
                  </TableCell>
                  <TableCell className="max-w-64">
                    <p className="line-clamp-1 text-sm text-neutral-600">
                      {s.externalTitle ?? "—"}
                    </p>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-neutral-500">
                    {s.externalId ?? "—"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-medium",
                        STATUS_STYLES[s.status]
                      )}
                    >
                      {STATUS_LABELS[s.status] ?? s.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {syncs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-sm text-neutral-500">
                    Aún no has publicado en canales externos. Usa &quot;Publicar
                    todo el catálogo&quot;.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
