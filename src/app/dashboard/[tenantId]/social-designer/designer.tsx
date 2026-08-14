"use client";

import { useActionState, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatCOP } from "@/lib/constants";
import { AI_SOURCE_LABELS } from "@/lib/ai/client";
import { SOCIAL_FORMATS, SOCIAL_TONES } from "@/lib/ai/social";
import { generateSocialAction, type SocialState } from "./actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, Wand2, Copy, Sparkles, ImageIcon } from "lucide-react";

type ProductOption = {
  id: string;
  title: string;
  price: number;
  image: string | null;
};

const TEMPLATES = [
  { id: "mao", label: "Violeta MAO" },
  { id: "minimal", label: "Minimal" },
  { id: "bold", label: "Bold" },
] as const;

const selectClass =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function SocialDesigner({
  tenantId,
  brandName,
  products,
}: {
  tenantId: string;
  brandName: string;
  products: ProductOption[];
}) {
  const [state, generateAction, generating] = useActionState(
    generateSocialAction.bind(null, tenantId),
    null as SocialState | null
  );
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [format, setFormat] = useState<keyof typeof SOCIAL_FORMATS>("INSTAGRAM_POST");
  const [template, setTemplate] = useState<(typeof TEMPLATES)[number]["id"]>("mao");
  const [selectedPost, setSelectedPost] = useState(0);

  const product = products.find((p) => p.id === productId);
  const posts = state?.result?.posts ?? [];
  const activePost = posts[selectedPost] ?? posts[0];
  const isStory = format === "INSTAGRAM_STORY";

  const copyCaption = async (caption: string, hashtags: string[]) => {
    const text = `${caption}\n\n${hashtags.map((h) => `#${h}`).join(" ")}`;
    await navigator.clipboard.writeText(text);
    toast.success("Caption copiado, listo para pegar en la red social");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Palette className="h-6 w-6 text-violet-600" /> Social Designer
        </h1>
        <p className="text-sm text-neutral-500">
          De foto de producto a post listo para publicar: la IA escribe el copy y
          tú eliges la plantilla visual.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* Configuración + copy generado */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">1. Configura tu post</CardTitle>
              <CardDescription>Producto, formato y tono del mensaje</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={generateAction} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="productId">Producto</Label>
                  <select
                    id="productId"
                    name="productId"
                    className={selectClass}
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="format">Formato</Label>
                    <select
                      id="format"
                      name="format"
                      className={selectClass}
                      value={format}
                      onChange={(e) => setFormat(e.target.value as keyof typeof SOCIAL_FORMATS)}
                    >
                      {Object.entries(SOCIAL_FORMATS).map(([id, label]) => (
                        <option key={id} value={id}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tone">Tono</Label>
                    <select id="tone" name="tone" className={selectClass} defaultValue="VENDEDOR">
                      {Object.entries(SOCIAL_TONES).map(([id, label]) => (
                        <option key={id} value={id}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
                <Button
                  type="submit"
                  className="w-full bg-violet-600 hover:bg-violet-700"
                  disabled={generating || products.length === 0}
                >
                  <Wand2 className="mr-2 h-4 w-4" />
                  {generating
                    ? "La IA está escribiendo tu copy..."
                    : "Generar 3 variaciones de copy"}
                </Button>
                {products.length === 0 && (
                  <p className="text-sm text-neutral-500">
                    Primero crea un producto en el catálogo.
                  </p>
                )}
              </form>
            </CardContent>
          </Card>

          <Card className={posts.length > 0 ? "border-violet-300 shadow-md shadow-violet-100" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                2. Copy generado
                {state?.result && (
                  <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100">
                    <Sparkles className="mr-1 h-3 w-3" />
                    {AI_SOURCE_LABELS[state.result.source]}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {posts.length > 0
                  ? "Elige una variación para verla en la plantilla"
                  : "Aquí aparecerán las 3 variaciones de la IA"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-10 text-neutral-400">
                  <ImageIcon className="h-8 w-8" />
                  <p className="text-sm">Esperando generación...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {posts.map((post, i) => (
                    // div con role=button: contiene el botón "Copiar" y un
                    // <button> no puede anidar otro <button>
                    <div
                      key={i}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedPost(i)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") setSelectedPost(i);
                      }}
                      className={cn(
                        "w-full cursor-pointer rounded-xl border p-3 text-left transition-colors",
                        i === selectedPost
                          ? "border-violet-400 bg-violet-50/60"
                          : "hover:bg-neutral-50"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="secondary" className="font-normal">
                          {post.style}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyCaption(post.caption, post.hashtags);
                          }}
                        >
                          <Copy className="mr-1 h-3.5 w-3.5" /> Copiar
                        </Button>
                      </div>
                      <p className="mt-2 whitespace-pre-line text-sm text-neutral-700">
                        {post.caption}
                      </p>
                      <p className="mt-2 text-xs text-violet-600">
                        {post.hashtags.map((h) => `#${h}`).join(" ")}
                      </p>
                      <p className="mt-1 text-xs font-medium text-neutral-500">
                        CTA: {post.cta}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Vista previa visual */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">3. Vista previa</CardTitle>
                <CardDescription>{SOCIAL_FORMATS[format]}</CardDescription>
              </div>
              <div className="flex gap-1">
                {TEMPLATES.map((t) => (
                  <Button
                    key={t.id}
                    type="button"
                    variant={template === t.id ? "default" : "outline"}
                    size="sm"
                    className={template === t.id ? "bg-violet-600 hover:bg-violet-700" : ""}
                    onClick={() => setTemplate(t.id)}
                  >
                    {t.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex justify-center">
            {!product ? (
              <p className="py-16 text-sm text-neutral-400">Sin producto seleccionado</p>
            ) : (
              <div
                className={cn(
                  "relative w-full overflow-hidden rounded-2xl border shadow-lg",
                  isStory ? "max-w-70 aspect-9/16" : "max-w-105 aspect-square"
                )}
              >
                {product.image ? (
                  // Composición libre sobre la foto: img simple, sin optimizador
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.image}
                    alt={product.title}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 text-neutral-400">
                    <ImageIcon className="h-10 w-10" />
                  </div>
                )}

                {template === "mao" && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-t from-violet-950/90 via-violet-900/30 to-transparent" />
                    <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-violet-700">
                      {brandName}
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                      <p className="text-lg font-bold leading-snug drop-shadow">
                        {product.title}
                      </p>
                      {activePost && (
                        <p className="mt-1 line-clamp-2 text-sm text-white/85">
                          {activePost.cta}
                        </p>
                      )}
                      <span className="mt-3 inline-block rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-1.5 text-sm font-bold">
                        {formatCOP(product.price)}
                      </span>
                    </div>
                  </>
                )}

                {template === "minimal" && (
                  <div className="absolute inset-x-0 bottom-0 bg-white/95 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
                      {brandName}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-base font-semibold text-neutral-900">
                      {product.title}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-lg font-bold text-neutral-900">
                        {formatCOP(product.price)}
                      </span>
                      {activePost && (
                        <span className="text-xs font-medium text-violet-600">
                          {activePost.cta}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {template === "bold" && (
                  <>
                    <div className="absolute inset-0 bg-black/45" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white">
                      <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/80">
                        {brandName}
                      </p>
                      <p className="mt-2 text-2xl font-black uppercase leading-tight drop-shadow-lg">
                        {product.title}
                      </p>
                      <span className="mt-4 bg-yellow-300 px-4 py-2 text-xl font-black text-black">
                        {formatCOP(product.price)}
                      </span>
                      {activePost && (
                        <p className="mt-4 text-sm font-semibold text-white/90">
                          {activePost.cta}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
