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
        headers: {
          "Content-Type": "application/json",
        },
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
    <main className="relative h-dvh w-full overflow-hidden bg-[#f8efe2]">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/main-bg-20260817.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="
            object-cover
            object-[72%_center]
            sm:object-[66%_center]
            md:object-[61%_center]
            lg:object-center
          "
        />
      </div>

      {/* Content column: section (flex-1) + fixed-height footer together fill h-dvh exactly */}
      <div className="relative z-10 flex h-dvh flex-col">
        {/* Main content */}
        <section
          className="
            flex min-h-0 flex-1
            items-center
            justify-center
            overflow-hidden
            px-4
            py-4
            sm:px-6
            lg:ml-auto
            lg:w-1/2
            lg:justify-center
            lg:px-10
            xl:px-16
            2xl:px-20
          "
        >
          <div
            className="
              w-full
              max-w-[430px]
              rounded-[28px]
              bg-[#fbf5eb]/95
              px-5
              py-6
              text-center
              shadow-[0_18px_60px_rgba(66,39,20,0.10)]
              backdrop-blur-[3px]

              sm:px-8
              sm:py-7

              lg:max-w-[410px]
              lg:rounded-none
              lg:bg-transparent
              lg:px-0
              lg:py-0
              lg:shadow-none
              lg:backdrop-blur-none

              xl:max-w-[430px]

              [@media(max-height:820px)]:py-4
              [@media(max-height:700px)]:py-3
            "
          >
          {/* Logo */}
          <Image
            src="/images/navbarLogo.png"
            alt="Made in Arnhem Land"
            width={231}
            height={96}
            priority
            className="
              mx-auto
              mb-5
              h-auto
              w-[112px]
              sm:w-[122px]
              lg:mb-6
              lg:w-[132px]
              xl:w-[140px]

              [@media(max-height:820px)]:mb-3
              [@media(max-height:820px)]:w-[96px]
              [@media(max-height:700px)]:mb-2
              [@media(max-height:700px)]:w-[84px]
            "
          />

          {/* Lock */}
          <div
            className="
              mx-auto
              mb-4
              flex
              h-[58px]
              w-[58px]
              items-center
              justify-center
              rounded-full
              border
              border-[#d8c4aa]
              bg-[#fbf2e4]/70
              shadow-[0_4px_12px_rgba(74,48,29,0.07)]

              [@media(max-height:820px)]:mb-3
              [@media(max-height:820px)]:h-11
              [@media(max-height:820px)]:w-11
              [@media(max-height:700px)]:mb-2
              [@media(max-height:700px)]:h-9
              [@media(max-height:700px)]:w-9
            "
          >
            <Lock
              className="
                h-[25px] w-[25px] text-[#2d160e]
                [@media(max-height:820px)]:h-5
                [@media(max-height:820px)]:w-5
                [@media(max-height:700px)]:h-4
                [@media(max-height:700px)]:w-4
              "
              strokeWidth={1.45}
            />
          </div>

          {/* Heading */}
          <h1
            className="
              font-serif
              text-[30px]
              leading-[1.1]
              tracking-[-0.02em]
              text-[#17100b]
              sm:text-[32px]
              lg:text-[34px]

              [@media(max-height:820px)]:text-[24px]
              [@media(max-height:700px)]:text-[20px]
            "
          >
            Made in Arnhem Land
          </h1>

          {/* Description */}
          <p
            className="
              mx-auto
              mt-3
              max-w-[300px]
              text-[13px]
              leading-[1.65]
              text-[#766452]

              [@media(max-height:820px)]:mt-2
              [@media(max-height:820px)]:text-[12px]
              [@media(max-height:700px)]:mt-1
            "
          >
            This page is password protected.
            <br />
            Please enter the password to continue.
          </p>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="
              mt-7 space-y-3
              [@media(max-height:820px)]:mt-4
              [@media(max-height:820px)]:space-y-2
              [@media(max-height:700px)]:mt-3
            "
          >
            <label className="relative block">
              <span className="sr-only">Enter password</span>

              <Lock
                className="
                  pointer-events-none
                  absolute
                  left-4
                  top-1/2
                  h-[17px]
                  w-[17px]
                  -translate-y-1/2
                  text-[#715b49]
                "
                strokeWidth={1.5}
              />

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);

                  if (error) {
                    setError("");
                  }
                }}
                placeholder="Enter password"
                autoComplete="current-password"
                className="
                  h-[48px]
                  w-full
                  rounded-[5px]
                  border
                  border-[#ae967b]
                  bg-white/90
                  pl-11
                  pr-12
                  text-[13px]
                  text-[#2d160e]
                  outline-none
                  transition
                  placeholder:text-[#938170]

                  hover:border-[#967b60]

                  focus:border-[#b95623]
                  focus:ring-2
                  focus:ring-[#b95623]/15

                  [@media(max-height:820px)]:h-11
                  [@media(max-height:700px)]:h-10
                "
              />

              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  text-[#715b49]
                  transition-colors
                  hover:text-[#2d160e]
                "
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff className="h-[18px] w-[18px]" />
                ) : (
                  <Eye className="h-[18px] w-[18px]" />
                )}
              </button>
            </label>

            {error && (
              <p
                role="alert"
                className="
                  rounded-md
                  bg-[#9f2418]/5
                  px-3
                  py-2
                  text-left
                  text-[12px]
                  text-[#9f2418]
                "
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !password}
              className="
                flex
                h-[49px]
                w-full
                items-center
                justify-center
                rounded-[5px]
                bg-[#b95623]
                text-[14px]
                font-semibold
                text-white
                shadow-[0_5px_18px_rgba(185,86,35,0.15)]
                transition-all

                hover:bg-[#a8491d]
                hover:shadow-[0_7px_20px_rgba(185,86,35,0.20)]

                active:translate-y-px

                disabled:cursor-not-allowed
                disabled:opacity-55

                [@media(max-height:820px)]:h-11
                [@media(max-height:700px)]:h-10
              "
            >
              {isSubmitting ? "Verifying..." : "Enter"}
            </button>
          </form>

          {/* Divider */}
          <div
            className="
              my-5
              flex
              items-center
              gap-4
              text-[11px]
              uppercase
              text-[#826f5e]

              [@media(max-height:820px)]:my-3
              [@media(max-height:700px)]:my-2
            "
          >
            <span className="h-px flex-1 bg-[#cfb696]" />
            <span>Or</span>
            <span className="h-px flex-1 bg-[#cfb696]" />
          </div>

          {/* Contact */}
          <div
            className="
              space-y-2.5
              text-[12px]
              leading-5
              text-[#665444]

              [@media(max-height:820px)]:space-y-1.5
            "
          >
            <p className="mx-auto max-w-[350px]">
              If you don&apos;t have access or need assistance,
              please contact us.
            </p>

            <a
              href="mailto:support@madeinarnhemland.com.au"
              className="
                flex
                items-center
                justify-center
                gap-2.5
                transition-colors
                hover:text-[#b95623]
              "
            >
              <Mail
                className="h-[17px] w-[17px] shrink-0"
                strokeWidth={1.5}
              />

              <span className="break-all sm:break-normal">
                support@madeinarnhemland.com.au
              </span>
            </a>

            <a
              href="tel:+61889446444"
              className="
                flex
                items-center
                justify-center
                gap-2.5
                transition-colors
                hover:text-[#b95623]
              "
            >
              <Phone
                className="h-[17px] w-[17px]"
                strokeWidth={1.5}
              />

              <span>+61 (08) 8944 6444</span>
            </a>
          </div>
        </div>
        </section>

        {/* Footer */}
        <footer
          className="
            relative
            z-20
            flex
            h-12
            shrink-0
            flex-col
            items-center
            justify-center
            gap-1
            bg-[#28170e]
            px-5
            text-center
            text-[10px]
            text-[#f2dfbd]

            sm:h-14
            sm:flex-row
            sm:justify-between
            sm:gap-4
            sm:px-8
            sm:text-[11px]

            lg:px-10
          "
        >
          <span className="font-serif italic">
            Strong Culture. Strong People. Strong Community.
          </span>

          {/* <span>
            &copy; 2024 Made in Arnhem Land. All rights reserved.
          </span> */}
        </footer>
      </div>
    </main>
  );
}
