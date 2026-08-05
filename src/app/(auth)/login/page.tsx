"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white">
            <Sparkles className="h-5 w-5" />
          </Link>
          <CardTitle className="text-2xl">Bienvenido a MAO</CardTitle>
          <CardDescription>
            Ingresa al panel de tu marca
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue="demo@mao.co"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                defaultValue="demo1234"
                required
              />
            </div>
            {state?.error && (
              <p className="text-sm text-red-600">{state.error}</p>
            )}
            <Button
              type="submit"
              className="w-full bg-violet-600 hover:bg-violet-700"
              disabled={pending}
            >
              {pending ? "Ingresando..." : "Ingresar"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-neutral-500">
            ¿Tu marca aún no está en MAO?{" "}
            <Link href="/register" className="font-medium text-violet-600 hover:underline">
              Regístrala gratis
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
