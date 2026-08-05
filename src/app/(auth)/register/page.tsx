"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { register } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    id: "BASIC",
    name: "Básico",
    price: "Gratis",
    features: ["Catálogo ilimitado", "Marketplace MAO", "100 créditos IA"],
  },
  {
    id: "PRO",
    name: "Pro",
    price: "$149.900/mes",
    features: ["Todo lo del Básico", "Publicación omnicanal", "IA ilimitada para listings", "500 créditos IA"],
    highlight: true,
  },
  {
    id: "ENTERPRISE",
    name: "Enterprise",
    price: "$499.900/mes",
    features: ["Todo lo del Pro", "Live Shopping", "Soporte dedicado", "1.000 créditos IA"],
  },
];

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(register, null);
  const [plan, setPlan] = useState("PRO");

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <Link href="/" className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white">
            <Sparkles className="h-5 w-5" />
          </Link>
          <h1 className="text-3xl font-bold">Registra tu marca en MAO</h1>
          <p className="mt-1 text-neutral-500">
            Onboarding automatizado: en 1 minuto tienes tu tienda omnicanal lista.
          </p>
        </div>

        <form action={formAction}>
          <input type="hidden" name="plan" value={plan} />
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>1. Datos de tu cuenta</CardTitle>
              <CardDescription>Serás el administrador de la marca</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Tu nombre</Label>
                <Input id="name" name="name" placeholder="Juan Mendoza" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brandName">Nombre de tu marca</Label>
                <Input id="brandName" name="brandName" placeholder="Mi Marca S.A.S." required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo</Label>
                <Input id="email" name="email" type="email" placeholder="tucorreo@marca.co" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" name="password" type="password" required />
              </div>
            </CardContent>
          </Card>

          <h2 className="mb-3 text-lg font-semibold">2. Elige tu plan</h2>
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            {PLANS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlan(p.id)}
                className={cn(
                  "rounded-xl border bg-white p-4 text-left transition-all",
                  plan === p.id
                    ? "border-violet-600 ring-2 ring-violet-600/30"
                    : "hover:border-neutral-300"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{p.name}</span>
                  {plan === p.id && <Check className="h-4 w-4 text-violet-600" />}
                </div>
                <p className="mt-1 text-sm font-medium text-violet-600">{p.price}</p>
                <ul className="mt-2 space-y-1 text-xs text-neutral-500">
                  {p.features.map((f) => (
                    <li key={f}>· {f}</li>
                  ))}
                </ul>
              </button>
            ))}
          </div>

          {state?.error && (
            <p className="mb-4 text-sm text-red-600">{state.error}</p>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full bg-violet-600 hover:bg-violet-700"
            disabled={pending}
          >
            {pending ? "Creando tu tienda..." : "Crear mi tienda"}
          </Button>
          <p className="mt-3 text-center text-sm text-neutral-500">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="font-medium text-violet-600 hover:underline">
              Ingresa aquí
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
