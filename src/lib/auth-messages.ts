type AuthError = { message?: string; status?: number } | null | undefined;

/** Converts Better Auth errors into Bangla messages for toasts and inline errors. */
export function authErrorMessage(err: AuthError): string {
  const message = (err?.message ?? "").toLowerCase();

  if (err?.status === 401 || message.includes("invalid email or password")) {
    return "ইমেইল বা পাসওয়ার্ড সঠিক নয়।";
  }
  if (message.includes("already") || message.includes("exists")) {
    return "এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট খোলা হয়েছে।";
  }
  if (message.includes("password") && (message.includes("short") || message.includes("at least"))) {
    return "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।";
  }
  if (message.includes("fetch") || message.includes("network")) {
    return "নেটওয়ার্ক সমস্যা হয়েছে, আবার চেষ্টা করুন।";
  }
  return "কিছু একটা সমস্যা হয়েছে, আবার চেষ্টা করুন।";
}

export const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

/** Only allow same-site relative redirects. */
export function safeCallbackUrl(value: string | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}
