"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";

interface NavigationButtonProps
  extends
    VariantProps<typeof buttonVariants>,
    Omit<React.ComponentProps<typeof Link>, "href"> {
  /** Value for the `tab` query param (use URL-safe slug, e.g. "contratos-por-vencer") */
  tab: string;
  /** When no `tab` param is in the URL, this tab is shown as active (e.g. default tab) */
  defaultTab?: string;
  children: React.ReactNode;
}

/**
 * A button-styled link that sets the `tab` query param on the current path.
 * Use in navbars to switch between tab content; the server can read searchParams.tab.
 */
function NavigationButton({
  tab,
  defaultTab,
  children,
  size = "default",
  className,
  ...linkProps
}: NavigationButtonProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") ?? null;
  const isActive =
    currentTab === tab || (currentTab === null && defaultTab === tab);

  const params = new URLSearchParams(searchParams.toString());
  params.set("tab", tab);
  const href = `${pathname}?${params.toString()}`;

  return (
    <Link
      href={href}
      className={cn(
        buttonVariants({ variant: isActive ? "default" : "ghost", size }),
        "cursor-pointer",
        className
      )}
      {...linkProps}
    >
      {children}
    </Link>
  );
}

export { NavigationButton };
