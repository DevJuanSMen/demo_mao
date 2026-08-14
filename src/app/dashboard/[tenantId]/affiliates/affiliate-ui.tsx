"use client";

import { useState, useTransition } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatCOP } from "@/lib/constants";
import {
  createAffiliateAction,
  payCommissionsAction,
  type AffiliateFormState,
} from "./actions";
import { Link2, UserPlus, CircleCheck, HandCoins } from "lucide-react";

// Copia el link de la tienda con el código de referido del afiliado
export function CopyRefLinkButton({ slug, code }: { slug: string; code: string }) {
  const copyLink = async () => {
    const url = `${window.location.origin}/t/${slug}?ref=${code}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success(`Link de afiliado ${code} copiado`, { description: url });
    } catch {
      toast.info(url, { description: "Copia el link manualmente" });
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={copyLink}>
      <Link2 className="mr-1.5 h-3.5 w-3.5" /> Copiar link
    </Button>
  );
}

export function AddAffiliateDialog({ tenantId }: { tenantId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    createAffiliateAction.bind(null, tenantId),
    null as AffiliateFormState | null
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-violet-600 hover:bg-violet-700">
          <UserPlus className="mr-2 h-4 w-4" /> Nuevo afiliado
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {state?.ok ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CircleCheck className="h-6 w-6 text-emerald-600" /> ¡Afiliado creado!
              </DialogTitle>
              <DialogDescription>
                {state.name} ya puede vender con el código{" "}
                <span className="font-mono font-medium text-violet-700">{state.code}</span>.
                Comparte su link desde el ranking.
              </DialogDescription>
            </DialogHeader>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Listo
            </Button>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Nuevo afiliado</DialogTitle>
              <DialogDescription>
                Influencers y creadores venden por ti a cambio del 10% de comisión.
              </DialogDescription>
            </DialogHeader>
            <form action={formAction} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="aff-name">Nombre</Label>
                <Input id="aff-name" name="name" placeholder="Laura Influencer" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="aff-email">Correo</Label>
                <Input
                  id="aff-email"
                  name="email"
                  type="email"
                  placeholder="laura@correo.com"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="aff-code">Código de referido</Label>
                <Input
                  id="aff-code"
                  name="code"
                  placeholder="LAURA10"
                  className="font-mono uppercase"
                  required
                />
                <p className="text-xs text-neutral-500">
                  Sus ventas llegarán con links como{" "}
                  <span className="font-mono">/t/tu-tienda?ref=CODIGO</span>
                </p>
              </div>
              {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
              <Button
                type="submit"
                className="w-full bg-violet-600 hover:bg-violet-700"
                disabled={pending}
              >
                {pending ? "Creando..." : "Crear afiliado"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function PayCommissionsButton({
  tenantId,
  affiliateId,
  amount,
}: {
  tenantId: string;
  affiliateId: string;
  amount: number;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending || amount <= 0}
      onClick={() =>
        startTransition(async () => {
          const { paid } = await payCommissionsAction(tenantId, affiliateId);
          toast.success(
            `Comisiones pagadas: ${formatCOP(amount)} (${paid} ${paid === 1 ? "venta" : "ventas"})`
          );
          router.refresh();
        })
      }
    >
      <HandCoins className="mr-1.5 h-3.5 w-3.5" />
      {pending ? "Pagando..." : "Pagar comisiones"}
    </Button>
  );
}
