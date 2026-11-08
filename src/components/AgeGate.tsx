"use client";

import { useEffect, useState, type ReactNode } from "react";

const AGE_KEY = "ember-oak-age-verified";

export function AgeGate({ children }: { children: ReactNode }) {
  const [verified, setVerified] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setVerified(localStorage.getItem(AGE_KEY) === "yes");
    setReady(true);
  }, []);

  if (!ready || !verified) {
    return (
      <div className="flex min-h-screen items-center bg-[var(--background)] px-6">
        <div className="mx-auto w-full max-w-sm">
          <p className="kicker">Da-Liquorstore</p>
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
                setReady(true);
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
