import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatCOP, parseJsonArray } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Store, BadgeCheck, ShieldCheck, Truck } from "lucide-react";

// La tienda cambia con cada producto creado: siempre render dinámico
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/t/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  if (!tenant) return {};
  return {
    title: `${tenant.name} — Tienda oficial en MAO`,
    description:
      tenant.description ??
      `Compra los productos de ${tenant.name} en MAO, el marketplace potenciado por IA.`,
  };
}

export default async function StorePage({ params }: PageProps<"/t/[slug]">) {
  const { slug } = await params;
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    include: {
      products: {
        orderBy: { aiScore: "desc" },
        include: { reviews: true },
      },
    },
  });
  if (!tenant) notFound();

  const totalReviews = tenant.products.reduce((s, p) => s + p.reviews.length, 0);

  return (
    <div className="min-h-screen w-full bg-white text-neutral-900">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white">
              <Sparkles className="h-4 w-4" />
            </span>
            MAO
          </Link>
          <Button variant="outline" size="sm" asChild>
            <Link href="/register">
              <Store className="mr-1 h-4 w-4" /> Crea tu tienda gratis
            </Link>
          </Button>
        </div>
      </header>

      {/* Portada de la tienda */}
      <section className="border-b bg-gradient-to-br from-violet-600 via-violet-500 to-fuchsia-500 text-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-3xl font-bold ring-2 ring-white/30 backdrop-blur">
              {tenant.name.charAt(0).toUpperCase()}
            </span>
            <div>
              <div className="flex items-center justify-center gap-2 sm:justify-start">
                <h1 className="text-3xl font-bold">{tenant.name}</h1>
                <BadgeCheck className="h-6 w-6 text-white/90" />
              </div>
              {tenant.description && (
                <p className="mt-1 max-w-2xl text-white/85">{tenant.description}</p>
              )}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <Badge className="bg-white/15 text-white hover:bg-white/15">
                  {tenant.products.length} productos
                </Badge>
                {totalReviews > 0 && (
                  <Badge className="bg-white/15 text-white hover:bg-white/15">
                    ★ {totalReviews} reseñas
                  </Badge>
                )}
                <Badge className="bg-white/15 text-white hover:bg-white/15">
                  Tienda verificada MAO
                </Badge>
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-white/85 sm:justify-start">
            <span className="flex items-center gap-1.5">
              <Truck className="h-4 w-4" /> Envío a toda Colombia
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" /> Garantía de satisfacción
            </span>
          </div>
        </div>
      </section>

      {/* Catálogo de la marca */}
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-xl font-bold">Catálogo de {tenant.name}</h2>
          <span className="text-sm text-neutral-500">
            {tenant.products.length} productos
          </span>
        </div>
        {tenant.products.length === 0 ? (
          <p className="py-16 text-center text-neutral-500">
            Esta tienda aún no tiene productos publicados.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {tenant.products.map((p) => {
              const img = parseJsonArray(p.images)[0];
              const avgRating =
                p.reviews.length > 0
                  ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length
                  : null;
              return (
                <Link
                  key={p.id}
                  href={`/p/${p.id}`}
                  className="group overflow-hidden rounded-xl border bg-white transition-shadow hover:shadow-lg"
                >
                  <div className="relative aspect-square overflow-hidden bg-neutral-100">
                    {img && (
                      <Image
                        src={img}
                        alt={p.title}
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="line-clamp-2 text-sm font-medium leading-snug">
                      {p.title}
                    </h3>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-bold">{formatCOP(p.basePrice)}</span>
                      {avgRating && (
                        <span className="text-xs text-amber-600">
                          ★ {avgRating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <footer className="border-t bg-neutral-50 py-10 text-center">
        <p className="text-sm text-neutral-600">
          ¿Quieres una tienda como esta para tu marca?
        </p>
        <Button asChild className="mt-3 bg-violet-600 hover:bg-violet-700">
          <Link href="/register">
            <Store className="mr-2 h-4 w-4" /> Crear mi tienda en MAO
          </Link>
        </Button>
        <p className="mt-6 text-xs text-neutral-400">
          Tienda de {tenant.name} · Potenciada por MAO — Marketplace AI Omnicanal
        </p>
      </footer>
    </div>
  );
}
