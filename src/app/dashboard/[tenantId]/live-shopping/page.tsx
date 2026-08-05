import { ComingSoon } from "@/components/dashboard/coming-soon";

export default function LiveShoppingPage() {
  return (
    <ComingSoon
      title="Live Shopping"
      phase="Fase 8"
      description="Transmisiones en vivo con compra en un clic, el formato que está rompiendo récords de conversión en LATAM."
      features={[
        "Sala de transmisión pública con reproductor (Mux / AWS IVS)",
        "Chat en tiempo real con los espectadores",
        "Carrusel de productos destacados con compra en un clic",
        "Métricas de audiencia y conversión por transmisión",
      ]}
    />
  );
}
