import { TrendingUp, LockKeyhole } from "lucide-react";
import type { ReactNode } from "react";

type AuthShellProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="min-h-svh">
      <div className="flex min-h-svh flex-col lg:flex-row">
        {/* ================= LEFT SIDE ================= */}

        <div className="relative flex w-full flex-col justify-between overflow-hidden bg-[#ffc400] px-8 py-8 text-white sm:px-12 lg:w-1/2 lg:px-14 xl:px-20">
          {/* Decorative elements */}
          <div className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full border-40 border-white/10" />

          <div className="pointer-events-none absolute -bottom-32 -left-20 size-72 rounded-full border-50 border-white/10" />

          {/* Logo */}
          <div className="relative flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-white text-[#ffc400]">
              <TrendingUp className="size-5" />
            </div>

            <span className="text-2xl font-bold tracking-tight">FinSight</span>
          </div>

          {/* Marketing Content */}
          <div className="relative my-16 max-w-82.5">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wide">
              Your financial command center
            </p>

            <h1 className="text-3xl font-bold leading-tight xl:text-[34px]">
              Smart insights
              <br />
              for smarter
              <br />
              decisions.
            </h1>

            <ul className="mt-5 space-y-2 text-xs font-medium">
              <li className="flex items-center gap-2">
                <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white/20 text-[9px]">
                  ✓
                </span>
                Multi-currency wallets
              </li>

              <li className="flex items-center gap-2">
                <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white/20 text-[9px]">
                  ✓
                </span>
                Smart budget tracking
              </li>

              <li className="flex items-center gap-2">
                <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white/20 text-[9px]">
                  ✓
                </span>
                AI-powered analytics
              </li>

              <li className="flex items-center gap-2">
                <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white/20 text-[9px]">
                  ✓
                </span>
                Real-time alerts
              </li>
            </ul>
          </div>

          {/* Bottom */}
          <div className="relative flex items-center gap-2 text-[9px] font-medium text-white/70">
            <LockKeyhole className="size-3" />
            Secure financial management
          </div>
        </div>
        {/* ================= RIGHT SIDE ================= */}

        

        <div className="flex w-full items-center justify-center bg-[#eef0f3] px-6 py-10 sm:px-10 lg:w-1/2 xl:px-14">
          <div className="w-full max-w-[340px]">
            {/* Heading */}
            <div className="mb-5">
              <h2 className="text-[24px] font-bold tracking-tight text-[#292929]">
                Selamat Datang
              </h2>

              <p className="mt-0.5 text-[11px] font-medium text-[#444]">
                Masuk ke akun FinSight kamu
              </p>
            </div>
            {/*
              Google OAuth button intentionally hidden in Phase 1 — no
              `supabase.auth.signInWithOAuth({ provider: "google" })`
              wiring exists and the button previously had no onClick.
              To re-enable: add a client component that calls Supabase
              OAuth and restores the button + divider below.
              See https://supabase.com/docs/guides/auth/social-login/auth-google
            */}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// Kept for future OAuth wiring (Phase 2) — not rendered in Phase 1.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function GoogleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.35 12.2c0-.7-.06-1.4-.18-2.05H12v3.88h5.24a4.48 4.48 0 0 1-1.94 2.94v2.44h3.14c1.84-1.7 2.91-4.2 2.91-7.21Z"
      />

      <path
        fill="#34A853"
        d="M12 21.5c2.63 0 4.84-.87 6.45-2.36l-3.14-2.44c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.29v2.52A9.74 9.74 0 0 0 12 21.5Z"
      />

      <path
        fill="#FBBC05"
        d="M6.54 13.59A5.85 5.85 0 0 1 6.23 12c0-.55.11-1.08.31-1.59V7.89H3.29A9.5 9.5 0 0 0 2.25 12c0 1.48.35 2.88 1.04 4.11l3.25-2.52Z"
      />

      <path
        fill="#EA4335"
        d="M12 6.38c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.5 14.63 2.5 12 2.5a9.74 9.74 0 0 0-8.71 5.39l3.25 2.52C7.31 8.1 9.46 6.38 12 6.38Z"
      />
    </svg>
  );
}
