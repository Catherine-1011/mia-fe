

"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  RotateCw,
  Lock,
  Mail,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useSharedEnhancedCart } from "@/hooks/useSharedEnhancedCart";
import { syncGuestCartAfterLogin } from "@/lib/guestCartUtils";

// Separate component that uses useSearchParams
function OTPVerificationForm() {
  const { setUserDirect } = useAuth();
  const { notifyLogin } = useCart();
  const { fetchCartData } = useSharedEnhancedCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const url = "https://backend.madeinarnhemland.com.au";

  // Get email from URL query params (from your router.push)
  const emailFromParams = searchParams.get("email") || "";

  // State management
  const email = emailFromParams;
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [isResendEnabled, setIsResendEnabled] = useState(false);

  // Refs for OTP input focus management
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Set countdown on component mount
  useEffect(() => {
    setCountdown(60); // Start 60-second countdown
    setIsResendEnabled(false);

    // Auto-focus first OTP input
    if (otpRefs.current[0]) {
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 100);
    }
  }, []);

  useEffect(() => {
    if (!emailFromParams) {
      router.replace("/login");
    }
  }, [emailFromParams, router]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsResendEnabled(true);
    }
  }, [countdown]);

  // Handle OTP input change
  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Clear error when user starts typing
    if (error) setError("");
  };

  // Handle backspace
  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste OTP
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();

    // Only accept 6-digit numbers
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      const newOtp = [...otp];
      digits.forEach((digit, index) => {
        if (index < 6) newOtp[index] = digit;
      });
      setOtp(newOtp);

      // Focus last input
      otpRefs.current[5]?.focus();
    }
  };

  // Handle form submission
 // Handle form submission
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!email) {
    setError("Email is required");
    return;
  }

  if (!otp.every((d) => d !== "")) {
    setError("Please enter complete OTP");
    return;
  }

  const otpString = otp.join("");

  setLoading(true);
  setError("");
  setSuccess("");

  try {
    // Generate client fingerprint (same as login page)
    const generateClientFingerprint = () => {
      const screenInfo = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const language = navigator.language;
      const platform = navigator.platform;
      const userAgent = navigator.userAgent;
      
      return btoa(`${screenInfo}|${timezone}|${language}|${platform}|${userAgent}`);
    };

    const clientFingerprint = generateClientFingerprint();

    const res = await fetch(`${url}/api/auth/verify-login-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        otp: otpString,
        clientFingerprint, // Add this
      }),
    });

    const data = await res.json();

    // Log backend response for debugging


    if (!res.ok) {
      setError(data.message || "Invalid One-time code");
      return;
    }

    //  REAL LOGIN HAPPENS HERE
    localStorage.setItem("alpa_token", data.token);

    // Store trusted device token if provided
    if (data.trustedDeviceToken) {
      localStorage.setItem("trustedDeviceToken", data.trustedDeviceToken);
    }

    setUserDirect(data.user);
    // Sync any guest cart items into the user's server cart
    await syncGuestCartAfterLogin(data.token);
    // Reload server cart into both cart stores.
    await notifyLogin(data.token);
    await fetchCartData(true);

    setSuccess("Verification successful! Redirecting...");

    setTimeout(() => {
      router.push("/");
    }, 1000);
  } catch (err) {
    setError("One-time code verification failed");
  } finally {
    setLoading(false);
  }
};

  // Handle resend OTP
  const handleResendOTP = async () => {
    if (!email) {
      setError("Email is required");
      return;
    }

    if (!isResendEnabled) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${url}/api/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to resend OTP. Please try again.");
        return;
      }

      setSuccess("New One-time code has been sent to your email!");

      // Restart 60-second countdown
      setCountdown(60);
      setIsResendEnabled(false);

      // Clear OTP fields
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } catch (err) {
      setError("Failed to resend One-time code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="macbook-auth-page macbook-otp-page relative min-h-screen w-full overflow-hidden text-white min-[1360px]:bg-[#440C03]">
      <div className="macbook-auth-back absolute top-4 left-4 md:top-8 md:left-auto md:right-8 z-50 flex items-center">
        <Link
          href="/login"
          aria-label="Back to login"
          className="inline-flex items-center justify-center gap-2 w-9 h-9 rounded-full md:w-auto md:h-auto md:rounded-xl border border-[#5A1E12]/25 bg-white/70 px-0 md:px-4 py-0 md:py-2 text-sm font-semibold text-[#5A1E12] shadow-sm backdrop-blur transition-all hover:bg-white hover:border-[#5A1E12]/40 hover:shadow-md"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          <span className="hidden md:inline">Back to Login</span>
        </Link>
      </div>

      <Image
        src="/images/top2.jpg"
        alt="Security verification"
        fill
        className="hidden object-contain object-[130%_center] lg:block"
        priority
      />

      <div className="absolute inset-0 bg-[#440C03] lg:hidden" />
      <div className="absolute inset-0 hidden lg:block bg-[linear-gradient(90deg,#440C03_0%,#440C03_44%,rgba(68,12,3,0.55)_68%,rgba(68,12,3,0)_100%)]" />

      <section className="macbook-auth-section macbook-otp-section relative z-10 flex min-h-screen w-full items-start px-5 pb-10 pt-32 sm:px-10 sm:pt-36 md:px-16 md:pt-32 lg:items-center lg:px-20 lg:pt-28">
        <div className="macbook-auth-logo absolute top-4 left-1/2 -translate-x-1/2 md:left-8 md:translate-x-0 md:top-6 z-50">
          <Link href="/">
            <Image
              src="/images/navbarLogo.png"
              alt="Logo"
              width={90}
              height={90}
              className="w-14 h-14 md:w-20 md:h-20 hover:opacity-90 transition-opacity"
              priority
            />
          </Link>
        </div>

        <div className="macbook-auth-panel macbook-otp-panel w-full max-w-md">
          <p className="macbook-auth-eyebrow uppercase text-xs tracking-widest mb-4 opacity-80">
            Account security
          </p>
          <h1 className="macbook-auth-title text-3xl sm:text-4xl font-bold mb-2">
            Verify your login
          </h1>
          <p className="macbook-auth-switch text-sm mb-8 opacity-80">
            Enter the 6-digit code sent to your email.
          </p>

          <div className="macbook-otp-email mb-6 p-4 bg-white/10 rounded-2xl border border-white/20">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20">
                <Mail size={18} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-white/70">
                  Verification code sent to
                </p>
                <p className="text-white font-semibold truncate">
                  {email || "your email"}
                </p>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-3 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center gap-3">
              <CheckCircle className="text-green-400 shrink-0" size={18} />
              <span className="text-green-100 text-sm">{success}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-3">
              <AlertCircle className="text-red-400 shrink-0" size={18} />
              <span className="text-red-100 text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="macbook-otp-form space-y-6">
            <div>
              <label className="block text-sm mb-3 text-white/90">
                6-Digit Verification Code
              </label>
              <div className="macbook-otp-grid grid grid-cols-6 gap-1.5 sm:gap-2 md:gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => {
                      otpRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="\d*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="macbook-otp-input aspect-square w-full min-w-0 rounded-lg border border-white/20 bg-white/10 text-center text-lg font-bold outline-none backdrop-blur-sm transition-all focus:border-white focus:bg-white/20 sm:text-xl md:rounded-xl md:text-2xl"
                    disabled={loading}
                    autoFocus={index === 0}
                  />
                ))}
              </div>
              <p className="text-xs md:text-sm text-white/60 mt-3 text-center">
                Enter the 6-digit code sent to{" "}
                {email ? email.split("@")[0] + "..." : "your email"}
              </p>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading || !isResendEnabled}
                className={`inline-flex items-center gap-2 text-xs md:text-sm ${
                  isResendEnabled && !loading
                    ? "text-white hover:text-white/80 transition-colors"
                    : "text-white/40 cursor-not-allowed"
                }`}
              >
                <RotateCw size={14} className={loading ? "animate-spin" : ""} />
                {countdown > 0 ? (
                  <span>Resend code in {countdown}s</span>
                ) : (
                  <span>Resend verification code</span>
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-2 bg-white text-[#7A2F12] font-semibold
                rounded-full py-3 md:py-3.5 flex items-center justify-center gap-2 text-sm md:text-base
                transition-all duration-300 ${
                  loading
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-[#7A2F12] border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Lock size={18} className="md:w-5 md:h-5" />
                  <span>Verify & Continue</span>
                </>
              )}
            </button>
          </form>

          {email && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="text-white/70 hover:text-white text-sm transition-colors"
              >
                Not {email}? Use different email
              </button>
            </div>
          )}

          <div className="macbook-otp-help mt-8 pt-6 border-t border-white/20">
            <div className="space-y-2 text-xs md:text-sm text-white/70">
              <p>Check your inbox and spam folder</p>
              <p>One-time code expires in 10 minutes</p>
              <p>Secure and encrypted verification</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

// Loading fallback component
function OTPLoadingFallback() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-[#440C03]">
      <div className="text-white text-center">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p>Loading verification page...</p>
      </div>
    </main>
  );
}

// Main page component with Suspense boundary
export default function OTPVerificationPage() {
  return (
    <Suspense fallback={<OTPLoadingFallback />}>
      <OTPVerificationForm />
    </Suspense>
  );
}
