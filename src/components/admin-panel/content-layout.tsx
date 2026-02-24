import { Navbar } from "@/components/admin-panel/navbar";

interface ContentLayoutProps {
  title: string;
  children: React.ReactNode;
}

export function ContentLayout({ title, children }: ContentLayoutProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <nav className="shrink-0">
        <Navbar title={title} />
      </nav>
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        <div className="px-2 sm:px-8 py-4">{children}</div>
      </div>
    </div>
  );
}
