import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PLAN_LABELS } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
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
