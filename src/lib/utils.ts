import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value: Date | string | null | undefined): string {
  if (value == null) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (isNaN(d.getTime())) return "—";
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

export function formatLongDate(
  value: Date | string | null | undefined
): string {
  if (value == null) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (isNaN(d.getTime())) return "—";

  const normalized = new Date(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate()
  );

  const raw = format(normalized, "EEEE d 'de' MMMM 'del' yyyy", { locale: es });
  const parts = raw.split(" ");

  const cap = (s: string) => (s ? s[0]!.toUpperCase() + s.slice(1) : s);
  if (parts.length >= 4) {
    parts[0] = cap(parts[0]);
    parts[3] = cap(parts[3]);
  }

  const out = parts.join(" ");
  return out.endsWith(".") ? out : `${out}.`;
}
