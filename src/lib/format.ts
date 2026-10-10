const BN = "bn-BD";

/** Bengali digits + Western-style grouping, e.g. 1850 -> ১,৮৫০ */
export const toBn = (value: number) => value.toLocaleString(BN);

/** 148 -> "১৪৮ টাকা" */
export const formatPrice = (value: number) => `${toBn(Math.round(value))} টাকা`;

/** -2.9 -> "২.৯%" (sign is shown separately by changeInfo) */
export const formatPercent = (value: number) =>
  `${Math.abs(value).toLocaleString(BN, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;

/** "প্রতি কেজি" -> "কেজি" */
export const unitShort = (unit: string) => unit.replace(/^প্রতি\s*/, "");

/**
 * Change badge info.
 * Per the assignment brief: green ▲ for rise, red ▼ for fall, grey — for flat.
 */
export function changeInfo(value: number) {
  if (value > 0) {
    return {
      direction: "up" as const,
      label: `▲ ${formatPercent(value)}`,
      textClass: "text-success",
      badgeClass: "bg-success/10 text-success",
    };
  }
  if (value < 0) {
    return {
      direction: "down" as const,
      label: `▼ ${formatPercent(value)}`,
      textClass: "text-error",
      badgeClass: "bg-error/10 text-error",
    };
  }
  return {
    direction: "flat" as const,
    label: `—${formatPercent(0)}`,
    textClass: "text-base-content/60",
    badgeClass: "bg-base-300 text-base-content/70",
  };
}

/** Today's date in Bangla, Dhaka timezone: "মঙ্গলবার, ৬ অক্টোবর, ২০২৬" */
export function banglaDate(date: Date = new Date()) {
  return new Intl.DateTimeFormat(BN, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  }).format(date);
}
