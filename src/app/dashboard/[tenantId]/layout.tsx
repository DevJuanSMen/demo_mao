import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { logout } from "@/app/(auth)/actions";
import { PLAN_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SidebarNav } from "./sidebar-nav";
import { Sparkles, LogOut, Store } from "lucide-react";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const membership = user.tenants.find((t) => t.tenantId === tenantId);
  if (!membership) redirect("/dashboard");
  const tenant = membership.tenant;

  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r bg-white">
        <div className="flex items-center gap-2 border-b px-4 py-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white">
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{tenant.name}</p>
            <p className="text-xs text-neutral-500">
              Plan {PLAN_LABELS[tenant.plan] ?? tenant.plan}
            </p>
          </div>
        </div>

        <SidebarNav tenantId={tenantId} />

        <div className="border-t p-3">
          {user.tenants.length > 1 && (
            <div className="mb-2">
              <p className="mb-1 px-1 text-xs font-medium text-neutral-400">
                Cambiar de marca
              </p>
              {user.tenants
                .filter((t) => t.tenantId !== tenantId)
                .map((t) => (
                  <Link
                    key={t.tenantId}
                    href={`/dashboard/${t.tenantId}`}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100"
                  >
                    <Store className="h-3.5 w-3.5" /> {t.tenant.name}
                  </Link>
                ))}
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-neutral-500">{user.email}</p>
            </div>
            <form action={logout}>
              <Button variant="ghost" size="icon" type="submit" title="Cerrar sesión">
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </aside>

      {/* Contenido */}
      <div className="ml-60 flex-1">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-white/80 px-6 py-3 backdrop-blur">
          <p className="text-sm text-neutral-500">
            Panel de <span className="font-medium text-neutral-900">{tenant.name}</span>
          </p>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-violet-300 text-violet-700">
              <Sparkles className="mr-1 h-3 w-3" /> {tenant.aiCredits} créditos IA
            </Badge>
            <Button variant="outline" size="sm" asChild>
              <Link href="/" target="_blank">
                Ver marketplace
              </Link>
            </Button>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
