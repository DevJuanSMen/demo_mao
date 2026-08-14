"use client";

import { use, useActionState, useState } from "react";
import Image from "next/image";
import { generateListingAction, saveProductAction, type GenerateState } from "../actions";
import { AI_SOURCE_LABELS } from "@/lib/ai/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Upload, Wand2, Check, ImageIcon } from "lucide-react";

export default function NewProductPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = use(params);
  const [state, generateAction, generating] = useActionState(
    generateListingAction.bind(null, tenantId),
    null as GenerateState | null
  );
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const listing = state?.listing;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Sparkles className="h-6 w-6 text-violet-600" /> AI Listing Generator
        </h1>
        <p className="text-sm text-neutral-500">
          Sube una foto, dale un nombre básico y la IA crea el listing completo:
          título SEO, descripción persuasiva, tags y precio sugerido.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Paso 1: datos básicos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">1. Lo mínimo que necesitamos</CardTitle>
            <CardDescription>El resto lo hace la IA</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={generateAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="photo">Foto del producto</Label>
                <label
                  htmlFor="photo"
                  className="flex aspect-video cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-neutral-50 text-neutral-500 transition-colors hover:border-violet-400 hover:bg-violet-50/50"
                >
                  {preview ? (
                    // Vista previa local del archivo elegido
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={preview}
                      alt="Vista previa"
                      className="h-full w-full rounded-xl object-cover"
                    />
                  ) : (
                    <>
                      <Upload className="h-6 w-6" />
                      <span className="text-sm">Haz clic para subir la foto</span>
                    </>
                  )}
                </label>
                <input
                  id="photo"
                  name="photo"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    setPreview(f ? URL.createObjectURL(f) : null);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="basicName">Nombre básico</Label>
                <Input
                  id="basicName"
                  name="basicName"
                  placeholder='Ej: "botilito deportivo 1 litro"'
                  defaultValue={state?.basicName}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="basePrice">Precio base (COP)</Label>
                <Input
                  id="basePrice"
                  name="basePrice"
                  type="number"
                  min={1000}
                  step={100}
                  placeholder="59900"
                  defaultValue={state?.basePrice}
                  required
                />
              </div>
              {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
              <Button
                type="submit"
                className="w-full bg-violet-600 hover:bg-violet-700"
                disabled={generating}
              >
                <Wand2 className="mr-2 h-4 w-4" />
                {generating ? "La IA está creando tu listing..." : "Generar listing con IA"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Paso 2: resultado editable */}
        <Card className={listing ? "border-violet-300 shadow-md shadow-violet-100" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              2. Listing generado
              {listing && (
                <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100">
                  <Sparkles className="mr-1 h-3 w-3" />
                  {AI_SOURCE_LABELS[listing.source]}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {listing
                ? "Revisa, ajusta lo que quieras y guarda"
                : "Aquí aparecerá el resultado de la IA"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!listing ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-neutral-400">
                <ImageIcon className="h-8 w-8" />
                <p className="text-sm">Esperando generación...</p>
              </div>
            ) : (
              <form
                action={saveProductAction.bind(null, tenantId)}
                onSubmit={() => setSaving(true)}
                className="space-y-4"
              >
                <input type="hidden" name="imagePath" value={state?.imagePath ?? ""} />
                {state?.imagePath && (
                  <div className="relative h-32 w-32 overflow-hidden rounded-lg border">
                    <Image
                      src={state.imagePath}
                      alt=""
                      fill
                      sizes="128px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="title">Título SEO</Label>
                  <Input id="title" name="title" defaultValue={listing.title} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    name="description"
                    rows={8}
                    defaultValue={listing.description}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (separados por coma)</Label>
                  <Input id="tags" name="tags" defaultValue={listing.tags.join(", ")} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="basePrice2">Precio (COP)</Label>
                    <Input
                      id="basePrice2"
                      name="basePrice"
                      type="number"
                      defaultValue={state?.basePrice}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="suggestedPrice">Precio IA</Label>
                    <Input
                      id="suggestedPrice"
                      name="suggestedPrice"
                      type="number"
                      defaultValue={listing.suggestedPrice}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock</Label>
                    <Input id="stock" name="stock" type="number" defaultValue={10} />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  disabled={saving}
                >
                  <Check className="mr-2 h-4 w-4" />
                  {saving ? "Guardando..." : "Guardar producto en el catálogo"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
