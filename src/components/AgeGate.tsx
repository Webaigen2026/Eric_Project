"use client";

import { useEffect, useState, type ReactNode } from "react";

const AGE_KEY = "ember-oak-age-verified";

export function AgeGate({ children }: { children: ReactNode }) {
  const [verified, setVerified] = useState<boolean | null>(null);

  useEffect(() => {
    setVerified(localStorage.getItem(AGE_KEY) === "yes");
  }, []);

  if (verified === null) {
    return <div className="min-h-screen bg-[var(--background)]" />;
  }

  if (!verified) {
    return (
      <div className="flex min-h-screen items-center bg-[var(--background)] px-6">
        <div className="mx-auto w-full max-w-sm">
          <p className="kicker">Da liquor-store</p>
          <h1 className="page-title mt-2">Are you 21 or older?</h1>
          <p className="lede">
            You must be of legal drinking age to enter this site.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                localStorage.setItem(AGE_KEY, "yes");
                setVerified(true);
              }}
              className="btn btn-primary"
            >
              Yes, enter
            </button>
            <button
              type="button"
              onClick={() => {
                window.location.href = "https://www.responsibility.org/";
              }}
              className="btn btn-quiet"
            >
              No, exit
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
