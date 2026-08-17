"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Eye, EyeOff, Lock, Mail, Phone } from "lucide-react";

export default function GatePage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        setError("The password you entered is incorrect.");
        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      setError("We could not verify the password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-[#fbf5eb] lg:flex-row">
      {/* LEFT — illustrated dot-art panel (desktop only) */}
      <section className="relative hidden w-[42%] min-w-[24rem] lg:block">
        <Image
          src="/images/main-bg.png"
          alt="Made in Arnhem Land"
          fill
          priority
          className="object-cover object-left"
          sizes="42vw"
        />
        {/* curved cream overlay that bites into the right edge of the illustration */}
        <div className="pointer-events-none absolute inset-y-0 right-[-2.5rem] w-24 bg-[#fbf5eb] [clip-path:ellipse(48%_58%_at_100%_50%)]" />
      </section>

      {/* mobile hero strip — same illustration, cropped short */}
      <section className="relative h-56 w-full sm:h-64 lg:hidden">
        <Image
          src="/images/main-bg.png"
          alt="Made in Arnhem Land"
          fill
          priority
          className="object-cover object-[30%_center]"
          sizes="100vw"
        />
      </section>

      {/* RIGHT — content panel */}
      <section className="relative flex flex-1 items-center justify-center px-6 py-10 sm:px-10 lg:py-8">
        {/* decorative rings, top-right and bottom-right */}
        <div className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block">
          <div className="absolute right-[-6.25rem] top-[-5.25rem] h-72 w-72 rounded-full border border-[#d7b88e]/35" />
          <div className="absolute right-[3.9rem] top-[2.15rem] h-28 w-28 rounded-full border border-[#d7b88e]/20" />
          <div className="absolute bottom-[-5.25rem] right-[-3rem] h-72 w-72 rounded-full border border-[#d7b88e]/35" />
          <div className="absolute bottom-[1.45rem] right-[4.2rem] h-28 w-28 rounded-full border border-[#d7b88e]/20" />
        </div>
        <div className="pointer-events-none absolute inset-0 overflow-hidden lg:hidden">
          <div className="absolute right-[-5rem] top-[-5rem] h-56 w-56 rounded-full border border-[#d7b88e]/30" />
          <div className="absolute bottom-[-4rem] right-[-3rem] h-44 w-44 rounded-full border border-[#d7b88e]/30" />
        </div>

        <div className="relative z-10 w-full max-w-[23.7rem] pb-16 text-center lg:mr-[0.5vw] lg:mt-[-1.7rem] lg:pb-0">
          <Image
            src="/images/navbarLogo.png"
            alt="Made in Arnhem Land"
            width={231}
            height={96}
            priority
            className="mx-auto mb-7 h-auto w-[11.5rem] sm:mb-9 sm:w-[14.4rem]"
          />

          <div className="mx-auto mb-4 flex h-[4.35rem] w-[4.35rem] items-center justify-center rounded-full border border-[#e7d4b9] bg-[#f7edde] shadow-sm">
            <Lock className="h-8 w-8 text-[#2d160e]" strokeWidth={1.45} />
          </div>

          <h1 className="font-serif text-[1.7rem] leading-tight text-black sm:text-[2rem]">
            Protected Page
          </h1>
          <p className="mt-4 text-[0.76rem] leading-5 text-[#796756]">
            This page is password protected.
            <br />
            Please enter the password to continue.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <label className="relative block">
              <span className="sr-only">Enter password</span>
              <Lock
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6a5545]"
                strokeWidth={1.6}
              />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                className="h-10 w-full rounded border border-[#a9947a] bg-white/85 pl-10 pr-11 text-[0.78rem] text-[#2d160e] outline-none transition placeholder:text-[#917f6f] focus:border-[#b95623] focus:ring-2 focus:ring-[#b95623]/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6a5545] transition hover:text-[#2d160e]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </label>

            {error ? <p className="text-sm text-[#9f2418]">{error}</p> : null}

            <button
              type="submit"
              disabled={isSubmitting || !password}
              className="h-11 w-full rounded bg-[#b95623] text-sm font-semibold text-white transition hover:bg-[#9f4319] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Verifying..." : "Enter"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs uppercase text-[#8a7767]">
            <span className="h-px flex-1 bg-[#d5bea2]" />
            Or
            <span className="h-px flex-1 bg-[#d5bea2]" />
          </div>

          <div className="space-y-2 text-[0.72rem] leading-5 text-[#6a5545]">
            <p>If you don&apos;t have access or need assistance, please contact us.</p>
            <p className="flex items-center justify-center gap-2">
              <Mail className="h-4 w-4" />
              support@madeinarnhemland.com.au
            </p>
            <p className="flex items-center justify-center gap-2">
              <Phone className="h-4 w-4" />
              08 8947 3485
            </p>
          </div>
        </div>
      </section>

      <footer className="absolute bottom-0 left-0 right-0 z-20 flex flex-col items-center justify-center gap-1 bg-[#2a160c] px-5 py-3 text-center text-[0.62rem] text-[#f3dfb8] sm:flex-row sm:justify-between sm:gap-2 sm:text-left sm:text-[0.66rem] lg:px-10">
        <span className="font-serif italic">Strong Culture. Strong People. Strong Community.</span>
        <span>&copy; 2024 Made in Arnhem Land. All rights reserved.</span>
      </footer>
    </main>
  );
}