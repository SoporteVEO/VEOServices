import type { Metadata } from "next";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
