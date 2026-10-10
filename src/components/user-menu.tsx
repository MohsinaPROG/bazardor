"use client";

import Link from "next/link";
import { SignOutButton } from "./sign-out-button";

export function UserMenu({ name, email }: { name: string; email: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || "U";

  return (
    <div className="dropdown dropdown-end">
      <div
        tabIndex={0}
        role="button"
        aria-label="ব্যবহারকারীর মেনু"
        className="btn btn-ghost btn-sm h-auto gap-2 rounded-xl px-2 py-1.5 font-semibold sm:btn-md"
      >
        <span className="grid size-8 place-items-center rounded-full bg-primary text-sm text-primary-content">
          {initial}
        </span>
        <span className="hidden max-w-28 truncate sm:inline">{name}</span>
        <span aria-hidden="true">▾</span>
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content menu z-50 mt-2 w-64 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg"
      >
        <li className="px-3 pt-2 pb-1 text-xs text-base-content/60">
          <span className="truncate">{email}</span>
        </li>
        <li>
          <Link href="/profile">আমার প্রোফাইল</Link>
        </li>
        <li>
          <SignOutButton className="text-error" />
        </li>
      </ul>
    </div>
  );
}
