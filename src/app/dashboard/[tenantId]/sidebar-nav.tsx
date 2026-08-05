"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Sparkles,
  Package,
  Boxes,
  ShoppingCart,
  Share2,
  Users,
  Radio,
  Palette,
  BarChart3,
  Settings,
} from "lucide-react";

const SECTIONS = [
  { href: "", label: "Resumen", icon: LayoutDashboard },
  { href: "/ai-hub", label: "AI Hub", icon: Sparkles },
  { href: "/products", label: "Productos", icon: Package },
  { href: "/inventory", label: "Inventario", icon: Boxes },
  { href: "/orders", label: "Órdenes", icon: ShoppingCart },
  { href: "/channels", label: "Canales", icon: Share2 },
  { href: "/affiliates", label: "Afiliados", icon: Users },
  { href: "/live-shopping", label: "Live Shopping", icon: Radio },
  { href: "/social-designer", label: "Social Designer", icon: Palette },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Configuración", icon: Settings },
];

export function SidebarNav({ tenantId }: { tenantId: string }) {
  const pathname = usePathname();
  const base = `/dashboard/${tenantId}`;

  return (
    <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
      {SECTIONS.map(({ href, label, icon: Icon }) => {
        const full = `${base}${href}`;
        const active = href === "" ? pathname === base : pathname.startsWith(full);
        return (
          <Link
            key={href}
            href={full}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
              active
                ? "bg-violet-50 font-medium text-violet-700"
                : "text-neutral-600 hover:bg-neutral-100"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
