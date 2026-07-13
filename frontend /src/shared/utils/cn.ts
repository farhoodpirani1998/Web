import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges conditional class names and resolves Tailwind class conflicts.
 * Content-agnostic utility used only by the design system and its
 * consumers (Website Frontend Architecture §13).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
