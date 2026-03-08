import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { API_BASE_URL } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Safely format a value as a price string (2 decimal places) */
export function fmt(v: unknown): string {
  const n = typeof v === 'number' ? v : parseFloat(String(v || '0'));
  return isNaN(n) ? '0.00' : n.toFixed(2);
}

/** Resolve an image path — prepends API base URL for relative paths */
export function imgUrl(path: string | undefined | null): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
  // Relative path from backend — prepend API base URL
  return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}
