"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { publishAllAction, processSyncQueueAction, toggleIntegrationAction } from "./actions";
import { UploadCloud, RefreshCw, Plug, PlugZap } from "lucide-react";

export function ChannelActions({
  tenantId,
  pendingCount,
}: {
  tenantId: string;
  pendingCount: number;
}) {
  const [publishing, startPublish] = useTransition();
  const [processing, startProcess] = useTransition();
  const router = useRouter();

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        disabled={processing || pendingCount === 0}
        onClick={() =>
          startProcess(async () => {
            await processSyncQueueAction(tenantId);
            router.refresh();
          })
        }
      >
        <RefreshCw className={`mr-2 h-4 w-4 ${processing ? "animate-spin" : ""}`} />
        {processing ? "Sincronizando..." : `Procesar cola (${pendingCount})`}
      </Button>
      <Button
        className="bg-violet-600 hover:bg-violet-700"
        disabled={publishing}
        onClick={() =>
          startPublish(async () => {
            await publishAllAction(tenantId);
            router.refresh();
          })
        }
      >
        <UploadCloud className="mr-2 h-4 w-4" />
        {publishing ? "Publicando..." : "Publicar todo el catálogo"}
      </Button>
    </div>
  );
}

export function ConnectToggle({
  tenantId,
  platform,
  connected,
}: {
  tenantId: string;
  platform: string;
  connected: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      variant={connected ? "outline" : "default"}
      size="sm"
      className={connected ? "" : "bg-violet-600 hover:bg-violet-700"}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await toggleIntegrationAction(tenantId, platform);
          router.refresh();
        })
      }
    >
      {connected ? (
        <>
          <Plug className="mr-2 h-4 w-4" /> Desconectar
        </>
      ) : (
        <>
          <PlugZap className="mr-2 h-4 w-4" /> Conectar
        </>
      )}
    </Button>
  );
}
