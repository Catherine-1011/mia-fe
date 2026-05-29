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
import { syncGuestCartAfterLogin } from "@/lib/guestCartUtils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://alpa-be.onrender.com";

// Separate component that uses useSearchParams
function OTPVerificationForm() {
  const { setUserDirect } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get email from URL query params (from signup page)
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
      router.replace("/signup");
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
      const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp: otpString,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid OTP");
      }

      // Store token
      if (data.token) {
        localStorage.setItem("alpa_token", data.token);
        // Sync any guest cart items into the new account
        await syncGuestCartAfterLogin(data.token);
      }
      
      if (data.user) {
        setUserDirect(data.user);
      }

      setSuccess("Account verified successfully! Redirecting...");

      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "OTP verification failed");
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
      const res = await fetch(`${API_URL}/api/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to resend OTP");
      }

      setSuccess("New OTP has been sent to your email!");

      // Restart 60-second countdown
      setCountdown(60);
      setIsResendEnabled(false);

      // Clear OTP fields
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || "Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex flex-col lg:flex-row overflow-hidden bg-[#7A2F12]">
      {/* LEFT PANEL */}
      <section className="relative min-h-screen w-full lg:w-1/2 flex flex-col justify-center px-6 md:px-12 lg:px-16 text-white bg-linear-to-r from-[#7A2F12] via-[#8E3A18] to-[#9B3F1A]">
        {/* Logo */}
        <div className="relative mt-3 mb-3 w-fit md:absolute md:top-6 md:left-6 md:mt-0 md:mb-0">
          <Link href="/">
            <Image
              src="/images/navbarLogo.png"
              alt="Logo"
              width={70}
              height={70}
              className="w-14 h-14 md:w-[70px] md:h-[70px] hover:scale-105 transition-transform"
              priority
            />
          </Link>
        </div>

        {/* Back button */}
        <div className="absolute top-6 right-6">
          <Link
            href="/signup"
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            <span>Back to Sign Up</span>
          </Link>
        </div>

        {/* Content */}
        <div className="max-w-md mx-auto w-full py-4 md:py-12">
          {/* Email Display */}
          <div className="mb-8 p-4 bg-white/10 rounded-2xl border border-white/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full">
                <Mail size={18} />
              </div>
              <div>
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
              <CheckCircle className="text-green-400" size={18} />
              <span className="text-green-100 text-sm">{success}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-3">
              <AlertCircle className="text-red-400" size={18} />
              <span className="text-red-100 text-sm">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input */}
            <div>
              <label className="block text-sm mb-3 text-white/90">
                6-Digit Verification Code
              </label>
              <div className="flex gap-2 md:gap-3 justify-center">
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
                    className="w-12 h-12 md:w-14 md:h-14 text-center text-xl md:text-2xl font-bold rounded-lg md:rounded-xl 
                      bg-white/10 border border-white/20 focus:border-white focus:bg-white/20 
                      outline-none transition-all backdrop-blur-sm"
                    disabled={loading}
                    autoFocus={index === 0}
                  />
                ))}
              </div>
            </div>

            {/* Resend OTP */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading || !isResendEnabled}
                className="inline-flex items-center gap-2 text-xs md:text-sm"
              >
                <RotateCw size={14} className={loading ? "animate-spin" : ""} />
                {countdown > 0 ? (
                  <span>Resend code in {countdown}s</span>
                ) : (
                  <span>Resend verification code</span>
                )}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-white text-[#7A2F12] font-semibold
                rounded-full py-3 md:py-3.5 flex items-center justify-center gap-2 text-sm md:text-base
                transition-all duration-300"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-[#7A2F12] border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Lock size={18} className="md:w-5 md:h-5" />
                  <span>Verify Account</span>
                </>
              )}
            </button>
          </form>

          {/* Change Email */}
          {email && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => router.push("/signup")}
                className="text-white/70 hover:text-white text-sm transition-colors"
              >
                Not {email}? Use different email
              </button>
            </div>
          )}

          {/* Additional Info */}
          <div className="mt-8 pt-6 border-t border-white/20">
            <div className="space-y-2 text-xs md:text-sm text-white/70">
              <p>Check your inbox and spam folder</p>
              <p>OTP expires in 10 minutes</p>
              <p>Secure and encrypted verification</p>
            </div>
          </div>
        </div>
      </section>

      {/* RIGHT IMAGE PANEL */}
      <section className="relative w-full lg:w-1/2 hidden lg:block">
        <div className="relative w-full h-full">
          <Image
            src="/images/top2.jpg"
            alt="Security Verification"
            fill
            className="object-cover"
            priority
            sizes="50vw"
          />
        </div>

        {/* Gradient blend */}
        <div className="absolute inset-0 bg-linear-to-r from-[#9B3F1A] via-[#9B3F1A]/40 to-transparent"></div>

        {/* Overlay Content */}
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <div className="max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-white/20 rounded-full">
                <Lock size={24} />
              </div>
              <h3 className="text-2xl font-bold">Account Verification</h3>
            </div>
            <p className="text-white/90 leading-relaxed">
              We've sent a secure one-time password to your email. This extra
              security layer ensures that your account registration is verified and secure.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

// Loading fallback component
function OTPLoadingFallback() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-linear-to-r from-[#7A2F12] via-[#8E3A18] to-[#9B3F1A]">
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
