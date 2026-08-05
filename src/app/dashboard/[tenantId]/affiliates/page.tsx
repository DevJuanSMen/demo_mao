import { ComingSoon } from "@/components/dashboard/coming-soon";

export default function AffiliatesPage() {
  return (
    <ComingSoon
      title="Programa de Afiliados"
      phase="Fase 7"
      description="El motor de crecimiento viral: influencers y creadores venden por ti a cambio de comisión."
      features={[
        "Enlaces personalizados con tracking (?ref=CODIGO)",
        "Dashboard de comisiones pendientes y pagadas por afiliado",
        "Generador de links por producto para cada afiliado",
        "Ranking de afiliados que más venden",
      ]}
    />
  );
}
