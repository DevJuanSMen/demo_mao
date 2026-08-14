import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatCOP, parseJsonArray } from "@/lib/constants";
import { scoreColor } from "@/lib/ai/scoring";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  OptimizeProductButton,
  OptimizeCatalogButton,
  ApplyPriceButton,
} from "./hub-ui";
import {
  Sparkles,
  Wand2,
  TrendingUp,
  Palette,
  Share2,
  ArrowRight,
  CircleCheck,
} from "lucide-react";

const SCORE_STYLES: Record<string, string> = {
  red: "bg-red-100 text-red-700",
  yellow: "bg-amber-100 text-amber-700",
  green: "bg-emerald-100 text-emerald-700",
};

export default async function AiHubPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;

  const [tenant, products] = await Promise.all([
    prisma.tenant.findUnique({ where: { id: tenantId } }),
    prisma.product.findMany({
      where: { tenantId },
      orderBy: { aiScore: "asc" },
    }),
  ]);

  const lowScore = products.filter((p) => (p.aiScore ?? 0) < 70);
  const priceOpportunities = products.filter(
    (p) => p.suggestedPrice != null && p.suggestedPrice > p.basePrice
  );
  const potentialUplift = priceOpportunities.reduce(
    (s, p) => s + ((p.suggestedPrice ?? 0) - p.basePrice) * Math.min(p.stock, 10),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">AI Hub</h1>
          <p className="text-sm text-neutral-500">
            El centro de comando de la IA para tu marca
          </p>
        </div>
        <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100">
          <Sparkles className="mr-1 h-3 w-3" /> {tenant?.aiCredits ?? 0} créditos de IA
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-neutral-500">Listings por optimizar</p>
            <p className="text-2xl font-bold">{lowScore.length}</p>
            <p className="mt-1 text-xs text-neutral-500">Con AI Score menor a 70</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-neutral-500">Oportunidades de precio</p>
            <p className="text-2xl font-bold">{priceOpportunities.length}</p>
            <p className="mt-1 text-xs text-neutral-500">
              Precio sugerido mayor al actual
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-neutral-500">Ingreso potencial extra</p>
            <p className="text-2xl font-bold">{formatCOP(potentialUplift)}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600">
              <TrendingUp className="h-3 w-3" /> Si aplicas los precios sugeridos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Optimización masiva de listings */}
      <Card className="border-violet-200">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Wand2 className="h-4 w-4 text-violet-600" /> Optimización del catálogo
              </CardTitle>
              <CardDescription>
                La IA regenera título SEO, descripción persuasiva y tags de tus
                listings más débiles (1 crédito por producto)
              </CardDescription>
            </div>
            <OptimizeCatalogButton
              tenantId={tenantId}
              count={Math.min(lowScore.length, 6)}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {lowScore.length === 0 ? (
            <p className="flex items-center justify-center gap-2 py-6 text-sm text-emerald-700">
              <CircleCheck className="h-4 w-4" /> Todo tu catálogo tiene AI Score
              saludable. ¡Bien hecho!
            </p>
          ) : (
            lowScore.map((p) => {
              const img = parseJsonArray(p.images)[0];
              const color = scoreColor(p.aiScore);
              return (
                <div
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border bg-neutral-100">
                      {img && (
                        <Image
                          src={img}
                          alt={p.title}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="line-clamp-1 text-sm font-medium">{p.title}</p>
                      <p className="text-xs text-neutral-500">
                        {formatCOP(p.basePrice)}
                        {p.sku && <span className="font-mono"> · {p.sku}</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-bold",
                        SCORE_STYLES[color]
                      )}
                    >
                      Score {p.aiScore ?? 0}
                    </span>
                    <OptimizeProductButton tenantId={tenantId} productId={p.id} />
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Optimización de precios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-violet-600" /> Optimización de precios
          </CardTitle>
          <CardDescription>
            La IA compara tu precio con el sugerido de mercado — aplícalo en un clic
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {priceOpportunities.length === 0 ? (
            <p className="py-6 text-center text-sm text-neutral-500">
              Sin oportunidades de precio por ahora. Optimiza listings para
              generar nuevos precios sugeridos.
            </p>
          ) : (
            priceOpportunities.map((p) => {
              const uplift = ((p.suggestedPrice! - p.basePrice) / p.basePrice) * 100;
              return (
                <div
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
                >
                  <div className="min-w-0">
                    <p className="line-clamp-1 text-sm font-medium">{p.title}</p>
                    <p className="text-xs text-neutral-500">
                      {formatCOP(p.basePrice)}{" "}
                      <ArrowRight className="inline h-3 w-3" />{" "}
                      <span className="font-bold text-emerald-700">
                        {formatCOP(p.suggestedPrice!)}
                      </span>{" "}
                      <span className="text-emerald-600">(+{uplift.toFixed(0)}%)</span>
                    </p>
                  </div>
                  <ApplyPriceButton
                    tenantId={tenantId}
                    productId={p.id}
                    price={p.suggestedPrice!}
                  />
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Otras herramientas de IA */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Palette className="h-4 w-4 text-violet-600" /> AI Copywriter para redes
            </CardTitle>
            <CardDescription>
              Copy con hashtags y CTA para posts, stories y ads — con vista previa
              visual sobre la foto del producto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link href={`/dashboard/${tenantId}/social-designer`}>
                Abrir Social Designer <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Share2 className="h-4 w-4 text-violet-600" /> Adaptación por canal
            </CardTitle>
            <CardDescription>
              La IA ajusta cada listing a las reglas de MercadoLibre, Falabella y
              Éxito al publicar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link href={`/dashboard/${tenantId}/channels`}>
                Ir a Canales <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
