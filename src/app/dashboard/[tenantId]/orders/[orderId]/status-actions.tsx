"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ORDER_NEXT_STATUS, ORDER_STATUS_LABELS } from "@/lib/constants";
import { updateOrderStatusAction } from "./actions";
import { ArrowRight, Ban } from "lucide-react";

export function OrderStatusActions({
  tenantId,
  orderId,
  status,
}: {
  tenantId: string;
  orderId: string;
  status: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const next = ORDER_NEXT_STATUS[status];
  const canCancel = status !== "DELIVERED" && status !== "CANCELLED";

  const setStatus = (newStatus: string) =>
    startTransition(async () => {
      await updateOrderStatusAction(tenantId, orderId, newStatus);
      toast.success(
        `Orden marcada como ${ORDER_STATUS_LABELS[newStatus].toLowerCase()}`
      );
      router.refresh();
    });

  if (!next && !canCancel) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {next && (
        <Button
          size="sm"
          className="bg-violet-600 hover:bg-violet-700"
          disabled={pending}
          onClick={() => setStatus(next)}
        >
          <ArrowRight className="mr-2 h-4 w-4" />
          Marcar como {ORDER_STATUS_LABELS[next].toLowerCase()}
        </Button>
      )}
      {canCancel && (
        <Button
          size="sm"
          variant="outline"
          className="text-red-600 hover:bg-red-50 hover:text-red-700"
          disabled={pending}
          onClick={() => setStatus("CANCELLED")}
        >
          <Ban className="mr-2 h-4 w-4" /> Cancelar orden
        </Button>
      )}
    </div>
  );
}
