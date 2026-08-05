import { ComingSoon } from "@/components/dashboard/coming-soon";

export default function AiHubPage() {
  return (
    <ComingSoon
      title="AI Hub"
      phase="Fases 2-3"
      description="El centro de comando de la IA para tu marca: generación masiva, optimización de precios y copy para ads."
      features={[
        "Generación masiva de listings para todo el catálogo",
        "Optimización de precios contra la competencia (scraping + IA)",
        "AI Copywriter para Facebook Ads e Instagram Reels",
        "Adaptación automática de listings por canal de venta",
      ]}
    />
  );
}
