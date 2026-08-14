"use client";

import { useRouter } from "next/navigation";
import { TableRow } from "@/components/ui/table";

// Fila de la tabla de órdenes que navega al detalle al hacer clic.
export function OrderRow({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <TableRow
      className="cursor-pointer transition-colors hover:bg-violet-50/50"
      onClick={() => router.push(href)}
    >
      {children}
    </TableRow>
  );
}
