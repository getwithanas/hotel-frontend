import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Safely format a value as a price string (2 decimal places) */
export function fmt(v: unknown): string {
  const n = typeof v === 'number' ? v : parseFloat(String(v || '0'));
  return isNaN(n) ? '0.00' : n.toFixed(2);
}
