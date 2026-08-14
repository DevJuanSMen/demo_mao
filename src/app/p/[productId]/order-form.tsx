"use client";

import { useActionState, useState } from "react";
import { placeOrderAction, type OrderState } from "./actions";
import { formatCOP } from "@/lib/constants";
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
import { ShoppingCart, CircleCheck, MessageCircle } from "lucide-react";

export function OrderForm({
  productId,
  productTitle,
  price,
  stock,
  brandName,
}: {
  productId: string;
  productTitle: string;
  price: number;
  stock: number;
  brandName: string;
}) {
  const [state, formAction, pending] = useActionState(
    placeOrderAction.bind(null, productId),
    null as OrderState | null
  );
  const [quantity, setQuantity] = useState(1);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="flex-1 bg-violet-600 hover:bg-violet-700"
          disabled={stock <= 0}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {stock > 0 ? "Hacer pedido" : "Agotado"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {state?.ok ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CircleCheck className="h-6 w-6 text-emerald-600" /> ¡Pedido recibido!
              </DialogTitle>
              <DialogDescription>
                Tu pedido <span className="font-mono font-medium">#{state.orderNumber}</span>{" "}
                quedó registrado con {brandName}.
              </DialogDescription>
            </DialogHeader>
            {state.whatsappUrl ? (
              <div className="space-y-3">
                <p className="text-sm text-neutral-600">
                  Para concretar el pago, continúa la conversación por WhatsApp —
                  el mensaje ya va con el detalle de tu pedido.
                </p>
                <Button asChild size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700">
                  <a href={state.whatsappUrl} target="_blank" rel="noopener">
                    <MessageCircle className="mr-2 h-4 w-4" /> Coordinar pago por WhatsApp
                  </a>
                </Button>
              </div>
            ) : (
              <p className="text-sm text-neutral-600">
                {brandName} te contactará al correo o teléfono que dejaste para
                coordinar el pago y el envío.
              </p>
            )}
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Hacer pedido</DialogTitle>
              <DialogDescription>
                {productTitle} · {formatCOP(price)} — el pago se coordina
                directamente con {brandName} por WhatsApp.
              </DialogDescription>
            </DialogHeader>
            <form action={formAction} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="quantity">Cantidad</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min={1}
                    max={stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    required
                  />
                </div>
                <div className="flex items-end justify-end pb-1.5">
                  <p className="text-sm text-neutral-500">
                    Total:{" "}
                    <span className="font-bold text-neutral-900">
                      {formatCOP(price * (quantity || 1))}
                    </span>
                  </p>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="name">Nombre completo</Label>
                <Input id="name" name="name" placeholder="Ana Pérez" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Correo</Label>
                  <Input id="email" name="email" type="email" placeholder="ana@correo.com" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Celular</Label>
                  <Input id="phone" name="phone" type="tel" placeholder="300 123 4567" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="address">Dirección de entrega</Label>
                <Input id="address" name="address" placeholder="Cra 7 # 45-10, Apto 201" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">Ciudad</Label>
                <Input id="city" name="city" placeholder="Bogotá" required />
              </div>
              {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
              <Button
                type="submit"
                size="lg"
                className="w-full bg-violet-600 hover:bg-violet-700"
                disabled={pending}
              >
                {pending ? "Registrando tu pedido..." : "Confirmar pedido"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
