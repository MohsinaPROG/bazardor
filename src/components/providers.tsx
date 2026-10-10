"use client";

import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3500,
          style: {
            background: "#fafcfa",
            color: "#1d271f",
            border: "1px solid #e1e8e1",
            fontFamily: "var(--font-hind), sans-serif",
          },
        }}
      />
    </>
  );
}
