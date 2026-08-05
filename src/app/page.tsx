import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatCOP, parseJsonArray } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Store, Zap, ShoppingBag } from "lucide-react";

// El catálogo cambia con cada producto creado: siempre render dinámico
export const dynamic = "force-dynamic";

export default async function MarketplaceHome() {
  const products = await prisma.product.findMany({
    where: { aiScore: { gte: 40 } },
    orderBy: { aiScore: "desc" },
    include: { tenant: true, reviews: true },
  });

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
            <span className="hidden text-sm font-normal text-neutral-500 sm:inline">
              Marketplace AI Omnicanal
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Ingresar</Link>
            </Button>
            <Button asChild className="bg-violet-600 hover:bg-violet-700">
              <Link href="/register">Vende con nosotros</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b bg-gradient-to-br from-violet-50 via-white to-fuchsia-50">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <Badge className="mb-4 bg-violet-100 text-violet-700 hover:bg-violet-100">
            <Zap className="mr-1 h-3 w-3" /> Potenciado por Inteligencia Artificial
          </Badge>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Sube una foto y nosotros hacemos el resto.
            <span className="block bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
              Vendemos tu producto en todas partes.
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-600">
            La IA crea tu listing, lo optimiza y lo publica en MercadoLibre,
            Falabella, Éxito, Instagram y WhatsApp. Tú solo vendes.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button size="lg" asChild className="bg-violet-600 hover:bg-violet-700">
              <Link href="/register">
                <Store className="mr-2 h-4 w-4" /> Crear mi tienda gratis
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#catalogo">
                <ShoppingBag className="mr-2 h-4 w-4" /> Explorar productos
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Catálogo */}
      <main id="catalogo" className="mx-auto w-full max-w-6xl px-4 py-12">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold">Destacados del marketplace</h2>
            <p className="text-sm text-neutral-500">
              Productos de todas nuestras marcas, curados por IA
            </p>
          </div>
          <span className="text-sm text-neutral-500">{products.length} productos</span>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => {
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
                  <p className="text-xs text-neutral-500">{p.tenant.name}</p>
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
      </main>

      <footer className="border-t py-8 text-center text-sm text-neutral-500">
        MAO — Marketplace AI Omnicanal · Demo MVP · Hecho en Colombia 🇨🇴
      </footer>
    </div>
  );
}
