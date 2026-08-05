import { ComingSoon } from "@/components/dashboard/coming-soon";

export default function SocialDesignerPage() {
  return (
    <ComingSoon
      title="Social Designer"
      phase="Fase 6"
      description="El estudio de diseño automatizado: de foto de producto a post listo para publicar."
      features={[
        "Remoción de fondo mágica con IA (Replicate / remove.bg)",
        "Generador de banners con plantillas de marca",
        "3 variaciones de copy para ads generadas por IA",
        "Publicación directa a Instagram y Facebook",
      ]}
    />
  );
}
