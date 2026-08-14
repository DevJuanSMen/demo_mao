import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PLAN_LABELS } from "@/lib/constants";
import { saveWhatsappAction } from "./actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageCircle } from "lucide-react";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  const [tenant, whatsapp] = await Promise.all([
    prisma.tenant.findUnique({ where: { id: tenantId } }),
    prisma.integration.findUnique({
      where: { tenantId_platform: { tenantId, platform: "WHATSAPP" } },
    }),
  ]);
  if (!tenant) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="text-sm text-neutral-500">Datos de tu marca y suscripción</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Marca</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between border-b pb-2">
            <span className="text-neutral-500">Nombre</span>
            <span className="font-medium">{tenant.name}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-neutral-500">URL en marketplace</span>
            <span className="font-mono text-xs">mao.co/t/{tenant.slug}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-neutral-500">Plan</span>
            <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100">
              {PLAN_LABELS[tenant.plan] ?? tenant.plan}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Créditos IA disponibles</span>
            <span className="font-medium">{tenant.aiCredits}</span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageCircle className="h-4 w-4 text-emerald-600" /> Pedidos por WhatsApp
          </CardTitle>
          <CardDescription>
            Los pedidos de tu tienda pública llegan a Órdenes y el cliente pasa a
            este WhatsApp para coordinar el pago (link wa.me).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveWhatsappAction.bind(null, tenantId)} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="phone">Número de WhatsApp</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="573001234567"
                defaultValue={whatsapp?.sellerId ?? ""}
              />
              <p className="text-xs text-neutral-500">
                Con código de país, sin «+» ni espacios. Ej: 573001234567.
                Déjalo vacío para desactivar los pedidos por WhatsApp.
              </p>
            </div>
            <Button type="submit" size="sm" className="bg-violet-600 hover:bg-violet-700">
              Guardar
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Facturación</CardTitle>
          <CardDescription>
            La gestión de suscripciones (Stripe/Wompi) llega en la siguiente
            iteración del MVP.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
