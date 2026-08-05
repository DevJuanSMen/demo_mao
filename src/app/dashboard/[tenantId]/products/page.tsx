import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatCOP, parseJsonArray, PLATFORM_LABELS } from "@/lib/constants";
import { scoreColor } from "@/lib/ai/scoring";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const SCORE_STYLES: Record<string, string> = {
  green: "bg-emerald-100 text-emerald-700",
  yellow: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700",
};

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  const products = await prisma.product.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    include: { externalSyncs: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Productos</h1>
          <p className="text-sm text-neutral-500">
            {products.length} productos en tu catálogo · El AI Score mide la
            probabilidad de venta de cada listing
          </p>
        </div>
        <Button asChild className="bg-violet-600 hover:bg-violet-700">
          <Link href={`/dashboard/${tenantId}/products/new`}>
            <Sparkles className="mr-2 h-4 w-4" /> Crear con IA
          </Link>
        </Button>
      </div>

      <div className="rounded-xl border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16"></TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Canales</TableHead>
              <TableHead className="text-center">AI Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => {
              const img = parseJsonArray(p.images)[0];
              const color = scoreColor(p.aiScore);
              const synced = p.externalSyncs.filter((s) => s.status === "SYNCED");
              return (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="relative h-11 w-11 overflow-hidden rounded-lg bg-neutral-100">
                      {img && (
                        <Image src={img} alt="" fill sizes="44px" className="object-cover" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/p/${p.id}`}
                      className="line-clamp-1 max-w-md font-medium hover:text-violet-700"
                    >
                      {p.title}
                    </Link>
                    <p className="text-xs text-neutral-500">{p.sku}</p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{formatCOP(p.basePrice)}</p>
                    {p.suggestedPrice && (
                      <p className="text-xs text-violet-600">
                        IA sugiere: {formatCOP(p.suggestedPrice)}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={cn(p.stock <= 12 && "font-medium text-red-600")}>
                      {p.stock}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {synced.length > 0 ? (
                        synced.map((s) => (
                          <Badge key={s.id} variant="secondary" className="text-xs font-normal">
                            {PLATFORM_LABELS[s.platform] ?? s.platform}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-neutral-400">Solo MAO</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={cn(
                        "inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold",
                        SCORE_STYLES[color]
                      )}
                    >
                      {p.aiScore ?? "–"}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
