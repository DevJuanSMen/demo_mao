import { prisma } from "@/lib/prisma";
import { parseJsonArray } from "@/lib/constants";
import { SocialDesigner } from "./designer";

export default async function SocialDesignerPage({
  params,
}: PageProps<"/dashboard/[tenantId]/social-designer">) {
  const { tenantId } = await params;
  const [tenant, products] = await Promise.all([
    prisma.tenant.findUniqueOrThrow({ where: { id: tenantId } }),
    prisma.product.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <SocialDesigner
      tenantId={tenantId}
      brandName={tenant.name}
      products={products.map((p) => ({
        id: p.id,
        title: p.title,
        price: p.basePrice,
        image: parseJsonArray(p.images)[0] ?? null,
      }))}
    />
  );
}
