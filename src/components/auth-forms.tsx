"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import { authErrorMessage, isValidEmail } from "@/lib/auth-messages";
import { SocialButtons } from "./social-buttons";

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-xs text-error">
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass =
  "input w-full rounded-lg border-base-300 bg-base-100 focus:border-primary focus:outline-primary";

function Divider() {
  return (
    <div className="flex items-center gap-3 py-1 text-xs text-base-content/60">
      <span className="h-px flex-1 bg-base-content/10" />
      অথবা
      <span className="h-px flex-1 bg-base-content/10" />
    </div>
  );
}

/* ---------------------------- Sign in ---------------------------- */

export function SignInForm({ callbackUrl, notice }: { callbackUrl: string; notice?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);
  const noticeShown = useRef(false);

  // Protected-route redirect toast (shown once, even in React strict mode)
  useEffect(() => {
    if (notice === "login_required" && !noticeShown.current) {
      noticeShown.current = true;
      toast.error("এই পৃষ্ঠা দেখতে আগে সাইন ইন করুন।");
    }
  }, [notice]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!isValidEmail(email)) next.email = "সঠিক ইমেইল দিন।";
    if (!password) next.password = "পাসওয়ার্ড দিন।";
    setErrors(next);
    if (next.email || next.password) {
      toast.error("ফর্মের তথ্য ঠিক করে আবার চেষ্টা করুন।");
      return;
    }

    setLoading(true);
    const { error } = await authClient.signIn.email({ email: email.trim(), password });
    setLoading(false);

    if (error) {
      const message = authErrorMessage(error);
      setErrors({ form: message });
      toast.error(message);
      return;
    }

    toast.success("স্বাগতম! সফলভাবে সাইন ইন হয়েছে।");
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {errors.form && (
        <div role="alert" className="alert alert-error alert-soft py-2 text-sm">
          {errors.form}
        </div>
      )}

      <Field id="email" label="ইমেইল" error={errors.email}>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={Boolean(errors.email)}
          className={inputClass}
        />
      </Field>

      <Field id="password" label="পাসওয়ার্ড" error={errors.password}>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={Boolean(errors.password)}
          className={inputClass}
        />
      </Field>

      <button type="submit" disabled={loading} className="btn btn-primary w-full font-semibold">
        {loading && <span className="loading loading-spinner loading-sm" />}
        {loading ? "সাইন ইন হচ্ছে…" : "সাইন ইন"}
      </button>

      <Divider />
      <SocialButtons callbackUrl={callbackUrl} />
    </form>
  );
}

/* ---------------------------- Sign up ---------------------------- */

export function SignUpForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next: typeof errors = {};
    if (name.trim().length < 2) next.name = "নাম কমপক্ষে ২ অক্ষরের হতে হবে।";
    if (!isValidEmail(email)) next.email = "সঠিক ইমেইল দিন।";
    if (password.length < 8) next.password = "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।";
    setErrors(next);
    if (Object.keys(next).length > 0) {
      toast.error("ফর্মের তথ্য ঠিক করে আবার চেষ্টা করুন।");
      return;
    }

    setLoading(true);
    const { error } = await authClient.signUp.email({
      name: name.trim(),
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (error) {
      const message = authErrorMessage(error);
      setErrors({ form: message });
      toast.error(message);
      return;
    }

    toast.success("অ্যাকাউন্ট তৈরি হয়েছে! এখন সাইন ইন করুন।");
    router.push("/signin");
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {errors.form && (
        <div role="alert" className="alert alert-error alert-soft py-2 text-sm">
          {errors.form}
        </div>
      )}

      <Field id="name" label="নাম" error={errors.name}>
        <input
          id="name"
          type="text"
          autoComplete="name"
          placeholder="আপনার নাম"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={Boolean(errors.name)}
          className={inputClass}
        />
      </Field>

      <Field id="email" label="ইমেইল" error={errors.email}>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={Boolean(errors.email)}
          className={inputClass}
        />
      </Field>

      <Field id="password" label="পাসওয়ার্ড" error={errors.password}>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="কমপক্ষে ৮ অক্ষর"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={Boolean(errors.password)}
          className={inputClass}
        />
      </Field>

      <button type="submit" disabled={loading} className="btn btn-primary w-full font-semibold">
        {loading && <span className="loading loading-spinner loading-sm" />}
        {loading ? "অ্যাকাউন্ট তৈরি হচ্ছে…" : "রেজিস্টার করুন"}
      </button>

      <Divider />
      <SocialButtons callbackUrl="/" />
    </form>
  );
}
