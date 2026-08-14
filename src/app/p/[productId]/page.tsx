import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCOP, parseJsonArray, PLATFORM_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { OrderForm } from "./order-form";
import { ArrowLeft, Sparkles, Truck, ShieldCheck, MessageCircle } from "lucide-react";

export default async function ProductPage({ params }: PageProps<"/p/[productId]">) {
  const { productId } = await params;
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      tenant: true,
      reviews: { orderBy: { createdAt: "desc" } },
      externalSyncs: { where: { status: "SYNCED" } },
    },
  });
  if (!product) notFound();

  const whatsapp = await prisma.integration.findUnique({
    where: {
      tenantId_platform: { tenantId: product.tenantId, platform: "WHATSAPP" },
    },
  });
  const whatsappAskUrl =
    whatsapp?.isActive && whatsapp.sellerId
      ? `https://wa.me/${whatsapp.sellerId}?text=${encodeURIComponent(
          `Hola ${product.tenant.name} 👋 Me interesa "${product.title}" que vi en tu tienda MAO. ¿Me das más información?`
        )}`
      : null;

  const images = parseJsonArray(product.images);
  const tags = parseJsonArray(product.aiTags);
  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : null;

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="mr-1 h-4 w-4" /> Volver al marketplace
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-2xl border bg-neutral-100">
            {images[0] && (
              <Image
                src={images[0]}
                alt={product.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            )}
          </div>

          <div>
            <p className="text-sm text-neutral-500">
              Vendido por{" "}
              <Link
                href={`/t/${product.tenant.slug}`}
                className="font-medium text-neutral-900 underline-offset-2 hover:text-violet-700 hover:underline"
              >
                {product.tenant.name}
              </Link>
            </p>
            <h1 className="mt-1 text-2xl font-bold leading-tight">{product.title}</h1>

            {avgRating && (
              <p className="mt-2 text-sm text-amber-600">
                {"★".repeat(Math.round(avgRating))}
                <span className="ml-1 text-neutral-500">
                  {avgRating.toFixed(1)} · {product.reviews.length} reseñas
                </span>
              </p>
            )}

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-bold">{formatCOP(product.basePrice)}</span>
              {product.stock > 0 ? (
                <Badge variant="outline" className="border-emerald-300 text-emerald-700">
                  {product.stock} disponibles
                </Badge>
              ) : (
                <Badge variant="outline" className="border-red-300 text-red-600">
                  Agotado
                </Badge>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <OrderForm
                productId={product.id}
                productTitle={product.title}
                price={product.basePrice}
                stock={product.stock}
                brandName={product.tenant.name}
              />
              {whatsappAskUrl && (
                <Button size="lg" variant="outline" asChild>
                  <a href={whatsappAskUrl} target="_blank" rel="noopener">
                    <MessageCircle className="mr-2 h-4 w-4" /> Preguntar por WhatsApp
                  </a>
                </Button>
              )}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-neutral-600">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-violet-600" /> Envío a toda Colombia
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-violet-600" /> Garantía de satisfacción
              </div>
            </div>

            {product.externalSyncs.length > 0 && (
              <p className="mt-4 text-xs text-neutral-500">
                También disponible en:{" "}
                {product.externalSyncs.map((s) => PLATFORM_LABELS[s.platform]).join(" · ")}
              </p>
            )}

            <Separator className="my-6" />

            <div className="prose prose-sm max-w-none whitespace-pre-line text-neutral-700">
              {product.description}
            </div>

            {tags.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-500" />
                {tags.map((t) => (
                  <Badge key={t} variant="secondary" className="font-normal">
                    {t}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {product.reviews.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-xl font-bold">Reseñas de clientes</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {product.reviews.map((r) => (
                <div key={r.id} className="rounded-xl border p-4">
                  <p className="text-amber-500">{"★".repeat(r.rating)}</p>
                  <p className="mt-1 text-sm text-neutral-700">{r.comment}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
