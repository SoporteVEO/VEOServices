import type { Metadata } from "next";
import "./globals.css";

// Components
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import { ThemeProvider } from "@/components/providers/theme-provider";

export const metadata: Metadata = {
  title: "VEO Services",
  description: "VEO Services",
};

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AdminPanelLayout>{children}</AdminPanelLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
