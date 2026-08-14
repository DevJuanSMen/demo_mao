"use client";

import { useState, useTransition } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  scheduleStreamAction,
  setStreamStatusAction,
  deleteStreamAction,
  type StreamFormState,
} from "./actions";
import { CalendarPlus, CircleCheck, Play, Square, Trash2 } from "lucide-react";

export function ScheduleStreamDialog({ tenantId }: { tenantId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    scheduleStreamAction.bind(null, tenantId),
    null as StreamFormState | null
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-violet-600 hover:bg-violet-700">
          <CalendarPlus className="mr-2 h-4 w-4" /> Programar transmisión
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {state?.ok ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CircleCheck className="h-6 w-6 text-emerald-600" /> ¡Transmisión programada!
              </DialogTitle>
              <DialogDescription>
                Ya aparece en tu agenda. Cuando llegue el momento, iníciala desde
                esta misma pantalla.
              </DialogDescription>
            </DialogHeader>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Listo
            </Button>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Programar transmisión</DialogTitle>
              <DialogDescription>
                Agenda un live para presentar tus productos con compra en un clic.
              </DialogDescription>
            </DialogHeader>
            <form action={formAction} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="stream-title">Título</Label>
                <Input
                  id="stream-title"
                  name="title"
                  placeholder="Lanzamiento colección tech — Live especial"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="stream-date">Fecha y hora</Label>
                <Input
                  id="stream-date"
                  name="scheduledFor"
                  type="datetime-local"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="stream-url">Link de transmisión (opcional)</Label>
                <Input
                  id="stream-url"
                  name="streamUrl"
                  type="url"
                  placeholder="https://youtube.com/live/... o Instagram Live"
                />
                <p className="text-xs text-neutral-500">
                  En producción la sala usa reproductor propio (Mux / AWS IVS).
                </p>
              </div>
              {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
              <Button
                type="submit"
                className="w-full bg-violet-600 hover:bg-violet-700"
                disabled={pending}
              >
                {pending ? "Programando..." : "Programar"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function StreamControls({
  tenantId,
  streamId,
  status,
}: {
  tenantId: string;
  streamId: string;
  status: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const run = (fn: () => Promise<unknown>, message: string) =>
    startTransition(async () => {
      await fn();
      toast.success(message);
      router.refresh();
    });

  if (status === "ENDED") return null;

  return (
    <div className="flex gap-2">
      {status === "SCHEDULED" && (
        <>
          <Button
            size="sm"
            className="bg-red-600 hover:bg-red-700"
            disabled={pending}
            onClick={() =>
              run(
                () => setStreamStatusAction(tenantId, streamId, "LIVE"),
                "¡Estás en vivo! 🔴"
              )
            }
          >
            <Play className="mr-1.5 h-3.5 w-3.5" /> Iniciar
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() =>
              run(
                () => deleteStreamAction(tenantId, streamId),
                "Transmisión eliminada"
              )
            }
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Eliminar
          </Button>
        </>
      )}
      {status === "LIVE" && (
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() =>
            run(
              () => setStreamStatusAction(tenantId, streamId, "ENDED"),
              "Transmisión finalizada"
            )
          }
        >
          <Square className="mr-1.5 h-3.5 w-3.5" /> Finalizar
        </Button>
      )}
    </div>
  );
}
