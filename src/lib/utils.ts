import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumberWithDots(value: number | string): string {
  if (value === undefined || value === null || value === '') return '';
  const numStr = value.toString().replace(/\D/g, '');
  if (!numStr) return '';
  const number = parseInt(numStr, 10);
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function parseNumberFromDots(value: string): number {
  if (!value) return 0;
  const numStr = value.replace(/\D/g, '');
  return parseInt(numStr, 10) || 0;
}
