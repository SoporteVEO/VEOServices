import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toYYYYMMDD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseYYYYMMDD(s: string | null | undefined): Date | null {
  if (s == null || typeof s !== "string") return null;
  const [yearStr, monthStr, dayStr] = s.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  if (!year || !month || !day) return null;
  const parsed = new Date(year, month - 1, day);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDate(value: Date | string | null | undefined): string {
  if (value == null) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (isNaN(d.getTime())) return "—";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
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
