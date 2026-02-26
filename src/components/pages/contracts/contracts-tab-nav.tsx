"use client";

import { NavigationButton } from "@/components/ui/navigation-button";

const TABS = [
  { tab: "contratos-por-vencer", label: "Por vencer" },
  { tab: "notificaciones", label: "Notificados" },
] as const;

export function ContractsTabNav() {
  return (
    <nav
      className="sticky top-0 z-10 -mx-4 flex flex-wrap gap-1 rounded-b-md bg-background/10 px-4 py-3 shadow-sm backdrop-blur supports-backdrop-filter:bg-background/85 sm:-mx-8 sm:px-8 -mt-4"
      role="tablist"
      aria-label="Secciones de contratos"
    >
      {TABS.map(({ tab, label }, index) => (
        <NavigationButton
          key={tab}
          tab={tab}
          defaultTab={index === 0 ? TABS[0].tab : undefined}
          size="sm"
          className="rounded-md"
        >
          {label}
        </NavigationButton>
      ))}
    </nav>
  );
}
