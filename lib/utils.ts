import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function validateE164(phone: string): boolean {
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phone.replace(/\s/g, ""));
}

export function formatE164(phone: string): string {
  return phone.replace(/\s/g, "");
}

export function formatDuration(start?: string, end?: string): string {
  if (!start || !end) return "--";
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  const durationSec = Math.round((endMs - startMs) / 1000);

  if (durationSec < 0) return "--";
  if (durationSec < 60) return `${durationSec}s`;

  const minutes = Math.floor(durationSec / 60);
  const seconds = durationSec % 60;
  return `${minutes}m ${seconds}s`;
}

export function formatCost(cost?: number): string {
  if (cost === undefined || cost === null) return "--";
  return `$${cost.toFixed(4)}`;
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return "--";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTime(dateStr?: string): string {
  if (!dateStr) return "--";
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function formatDateTime(dateStr?: string): string {
  if (!dateStr) return "--";
  return `${formatDate(dateStr)} ${formatTime(dateStr)}`;
}

export function parseLeadsText(text: string): { number: string; name?: string; business?: string; businessType?: string }[] {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return lines
    .map((line) => {
      const parts = line.split(",").map((p) => p.trim());
      const number = parts[0];
      const name = parts[1] || undefined;
      const business = parts[2] || undefined;
      const businessType = parts[3] || undefined;
      if (!number || !validateE164(number)) return null;
      return { number: formatE164(number), name, business, businessType };
    })
    .filter(Boolean) as { number: string; name?: string; business?: string; businessType?: string }[];
}

export function parseCsv(file: File): Promise<{
  leads: { number: string; name?: string; business?: string; businessType?: string }[];
  errors: string[];
}> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
      const leads: { number: string; name?: string; business?: string; businessType?: string }[] = [];
      const errors: string[] = [];

      lines.forEach((line, index) => {
        const parts = line.split(",").map((p) => p.trim().replace(/^"|"$/g, ""));
        const number = parts[0];
        const name = parts[1] || undefined;
        const business = parts[2] || undefined;
        const businessType = parts[3] || undefined;

        if (!number) {
          errors.push(`Row ${index + 1}: Missing phone number`);
          return;
        }

        if (!validateE164(number)) {
          errors.push(`Row ${index + 1}: Invalid E.164 format "${number}"`);
          return;
        }

        leads.push({ number: formatE164(number), name, business, businessType });
      });

      resolve({ leads, errors });
    };
    reader.readAsText(file);
  });
}
