"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatCOP } from "@/lib/constants";
import {
  optimizeProductAction,
  optimizeCatalogAction,
  applySuggestedPriceAction,
} from "./actions";
import { Sparkles, Wand2, TrendingUp } from "lucide-react";

export function OptimizeProductButton({
  tenantId,
  productId,
}: {
  tenantId: string;
  productId: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      size="sm"
      variant="outline"
      className="border-violet-300 text-violet-700 hover:bg-violet-50"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const { from, to } = await optimizeProductAction(tenantId, productId);
          toast.success(`Listing optimizado: AI Score ${from} → ${to}`);
          router.refresh();
        })
      }
    >
      <Sparkles className={`mr-1.5 h-3.5 w-3.5 ${pending ? "animate-pulse" : ""}`} />
      {pending ? "Optimizando..." : "Optimizar con IA"}
    </Button>
  );
}

export function OptimizeCatalogButton({
  tenantId,
  count,
}: {
  tenantId: string;
  count: number;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      className="bg-violet-600 hover:bg-violet-700"
      disabled={pending || count === 0}
      onClick={() =>
        startTransition(async () => {
          const { optimized } = await optimizeCatalogAction(tenantId);
          toast.success(
            `${optimized} ${optimized === 1 ? "listing optimizado" : "listings optimizados"} por la IA`
          );
          router.refresh();
        })
      }
    >
      <Wand2 className={`mr-2 h-4 w-4 ${pending ? "animate-pulse" : ""}`} />
      {pending ? "Optimizando catálogo..." : `Optimizar todos (${count})`}
    </Button>
  );
}

export function ApplyPriceButton({
  tenantId,
  productId,
  price,
}: {
  tenantId: string;
  productId: string;
  price: number;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await applySuggestedPriceAction(tenantId, productId);
          toast.success(`Nuevo precio aplicado: ${formatCOP(price)}`);
          router.refresh();
        })
      }
    >
      <TrendingUp className="mr-1.5 h-3.5 w-3.5" />
      {pending ? "Aplicando..." : "Aplicar precio"}
    </Button>
  );
}
