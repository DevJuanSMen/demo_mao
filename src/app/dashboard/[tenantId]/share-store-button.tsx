"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Store, Link2 } from "lucide-react";

export function ShareStoreButton({ slug }: { slug: string }) {
  const copyLink = async () => {
    const url = `${window.location.origin}/t/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link de tu tienda copiado", { description: url });
    } catch {
      toast.info(url, { description: "Copia el link manualmente" });
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <Button variant="outline" size="sm" asChild>
        <a href={`/t/${slug}`} target="_blank">
          <Store className="mr-1 h-4 w-4" /> Mi tienda
        </a>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={copyLink}
        title="Copiar link de la tienda para compartir"
      >
        <Link2 className="mr-1 h-4 w-4" /> Compartir
      </Button>
    </div>
  );
}
