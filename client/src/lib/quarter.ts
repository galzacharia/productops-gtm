export const QUARTERS = [1, 2, 3, 4] as const;

/** Build the quarterly label, e.g. (prefix "Product", q 3, year 2026) -> "Product_Q326". */
export function quarterLabel(prefix: string, quarter: number, year: number): string {
  const yy = String(year % 100).padStart(2, "0");
  return `${prefix}_Q${quarter}${yy}`;
}

export function currentQuarter(date = new Date()): { quarter: number; year: number } {
  return { quarter: Math.floor(date.getMonth() / 3) + 1, year: date.getFullYear() };
}

/** A small window of selectable years around "now" for the picker. */
export function yearOptions(currentYear: number): number[] {
  return [currentYear - 1, currentYear, currentYear + 1];
}
