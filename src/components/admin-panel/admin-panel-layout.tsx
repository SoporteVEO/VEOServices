"use client";

import { Footer } from "@/components/admin-panel/footer";
import { Sidebar } from "@/components/admin-panel/sidebar";
import { useSidebar } from "@/hooks/use-sidebar";
import { useStore } from "@/hooks/use-store";
import { cn } from "@/lib/utils";

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sidebar = useStore(useSidebar, (x) => x);
  if (!sidebar) return null;
  const { getOpenState, settings } = sidebar;
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <div
        className={cn(
          "flex h-screen flex-col flex-1 min-w-0 bg-background transition-[margin-left] ease-in-out duration-300",
          !settings.disabled && (!getOpenState() ? "lg:ml-[90px]" : "lg:ml-72")
        )}
      >
        <main className="flex-1 flex min-h-0 flex-col overflow-hidden">
          {children}
        </main>
        <footer className="shrink-0 shadow-t shadow-2xl">
          <Footer />
        </footer>
      </div>
    </div>
  );
}
