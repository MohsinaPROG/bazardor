"use client";

import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";

export function SocialButtons({ callbackUrl }: { callbackUrl: string }) {
  async function signInWith(provider: "google" | "github") {
    const { error } = await authClient.signIn.social({ provider, callbackURL: callbackUrl });
    if (error) {
      toast.error(
        provider === "google"
          ? "Google দিয়ে লগইন এখন চালু নেই।"
          : "GitHub দিয়ে লগইন এখন চালু নেই।",
      );
    }
  }

  const buttonClass =
    "btn btn-outline btn-sm flex-1 font-semibold border-base-300 bg-base-100 text-base-content hover:bg-base-300 hover:border-base-300 hover:text-base-content sm:btn-md";

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <button type="button" className={buttonClass} onClick={() => signInWith("google")}>
        <span aria-hidden="true" className="font-bold text-[#4285f4]">G</span>
        Google দিয়ে চালিয়ে যান
      </button>
      <button type="button" className={buttonClass} onClick={() => signInWith("github")}>
        <span aria-hidden="true" className="font-bold">⌥</span>
        GitHub দিয়ে চালিয়ে যান
      </button>
    </div>
  );
}
