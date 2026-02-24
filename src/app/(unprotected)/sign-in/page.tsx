"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const result = await authClient.signIn.email({
      email,
      password,
      callbackURL: "/dashboard",
    });
    setIsLoading(false);
    if (result.error) {
      setError(result.error.message ?? "Error al iniciar sesión");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      {/* Atmospheric background: gradient mesh + subtle grain */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.4] dark:opacity-[0.25]"
        aria-hidden
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,var(--muted),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_100%_50%,var(--accent),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_0%_80%,var(--muted),transparent_50%)]" />
      </div>
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03] dark:opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />

      {/* Asymmetric layout: form card offset, generous space */}
      <main className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:ml-[12%] lg:items-start lg:justify-center lg:px-12">
        <div
          className="w-full max-w-88 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both motion-reduce:animate-none"
          style={{
            animationDelay: "0ms",
          }}
        >
          <Card className="border-border/80 bg-card/95 shadow-lg shadow-black/5 backdrop-blur-sm dark:shadow-black/20">
            <CardHeader className="space-y-1.5 pb-2">
              <CardTitle
                className="font-serif text-2xl tracking-tight text-card-foreground sm:text-3xl"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Iniciar sesión
              </CardTitle>
              <CardDescription className="text-muted-foreground max-w-[65ch] text-sm leading-relaxed">
                Ingresa tu correo y contraseña para acceder a tu cuenta.
              </CardDescription>
            </CardHeader>
            <form onSubmit={onSubmit}>
              <CardContent className="space-y-4 pt-2">
                {error && (
                  <div
                    className="animate-in fade-in slide-in-from-top-1 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive duration-200"
                    role="alert"
                  >
                    {error}
                  </div>
                )}
                <div
                  className="animate-in fade-in slide-in-from-bottom-2 space-y-2 duration-300 fill-mode-both"
                  style={{ animationDelay: "80ms" }}
                >
                  <label
                    htmlFor="email"
                    className="text-muted-foreground flex items-center gap-2 text-sm font-medium"
                  >
                    <Mail className="size-4 shrink-0" aria-hidden />
                    Correo electrónico
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    disabled={isLoading}
                    className="min-h-[44px] transition-colors duration-200"
                  />
                </div>
                <div
                  className="animate-in fade-in slide-in-from-bottom-2 space-y-2 duration-300 fill-mode-both"
                  style={{ animationDelay: "160ms" }}
                >
                  <label
                    htmlFor="password"
                    className="text-muted-foreground flex items-center gap-2 text-sm font-medium"
                  >
                    <Lock className="size-4 shrink-0" aria-hidden />
                    Contraseña
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    disabled={isLoading}
                    className="min-h-[44px] transition-colors duration-200"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4 pt-2">
                <Button
                  type="submit"
                  className="min-h-[44px] w-full cursor-pointer transition-all duration-200 hover:opacity-95 focus-visible:ring-[3px]"
                  disabled={isLoading}
                >
                  {isLoading ? "Entrando…" : "Entrar"}
                </Button>
                <p className="text-muted-foreground text-center text-sm leading-relaxed">
                  ¿No tienes cuenta?{" "}
                  <Link
                    href="/sign-up"
                    className="text-primary cursor-pointer font-medium underline underline-offset-4 transition-colors duration-200 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    Regístrate
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
}
