"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import ReactCountryFlag from "react-country-flag";
import { getCountries, getCountryCallingCode } from "react-phone-number-input";
import { toast } from "react-toastify";
import { getFirstPasswordError } from "@/lib/passwordValidation";
import PasswordStrengthIndicator from "@/components/PasswordStrengthIndicator";

const baseURL = "https://backend.madeinarnhemland.com.au";

// ─── Country phone data ───────────────────────────────────────────────────────
const COUNTRY_DIGITS: Record<string, [number, number]> = {
  AU: [9, 10], // 9 without leading 0, or 10 starting with 0 (04XX...)
  US: [10, 10], CA: [10, 10], GB: [10, 10], IN: [10, 10],
  NZ: [8, 9], SG: [8, 8], AE: [9, 9], SA: [9, 9],
  DE: [10, 11], FR: [9, 9], JP: [10, 11], CN: [11, 11],
  BR: [10, 11], ZA: [9, 10], PK: [10, 10], NG: [10, 10],
  PH: [10, 10], MY: [9, 10], ID: [9, 12],
  KE: [9, 9], GH: [9, 9], ET: [9, 9], EG: [10, 10], TZ: [9, 9],
  TH: [9, 9], VN: [9, 10], KR: [9, 11], MX: [10, 10], AR: [10, 10],
  CO: [10, 10], CL: [9, 9], PE: [9, 9], IT: [9, 11], ES: [9, 9],
  RU: [10, 10], TR: [10, 10], IR: [10, 10], IQ: [10, 10], BD: [10, 10],
  PL: [9, 9], UA: [9, 9], NL: [9, 9], SE: [7, 9], NO: [8, 8],
  DK: [8, 8], FI: [6, 10], CH: [9, 9], AT: [4, 13], BE: [9, 9],
  PT: [9, 9], CZ: [9, 9], HU: [9, 9], RO: [9, 9], GR: [10, 10],
};

type Country = {
  code: string;
  name: string;
  dialCode: string;
  digits: [number, number];
};

// Country display names
const COUNTRY_NAMES: Record<string, string> = {
  AC: "Ascension Island", AD: "Andorra", AE: "UAE", AF: "Afghanistan",
  AG: "Antigua & Barbuda", AI: "Anguilla", AL: "Albania", AM: "Armenia",
  AO: "Angola", AQ: "Antarctica", AR: "Argentina", AS: "American Samoa",
  AT: "Austria", AU: "Australia", AW: "Aruba", AX: "Åland Islands",
  AZ: "Azerbaijan", BA: "Bosnia & Herzegovina", BB: "Barbados", BD: "Bangladesh",
  BE: "Belgium", BF: "Burkina Faso", BG: "Bulgaria", BH: "Bahrain",
  BI: "Burundi", BJ: "Benin", BL: "St. Barthélemy", BM: "Bermuda",
  BN: "Brunei", BO: "Bolivia", BQ: "Caribbean Netherlands", BR: "Brazil",
  BS: "Bahamas", BT: "Bhutan", BW: "Botswana", BY: "Belarus",
  BZ: "Belize", CA: "Canada", CC: "Cocos Islands", CD: "DR Congo",
  CF: "Central African Republic", CG: "Congo", CH: "Switzerland", CI: "Côte d'Ivoire",
  CK: "Cook Islands", CL: "Chile", CM: "Cameroon", CN: "China",
  CO: "Colombia", CR: "Costa Rica", CU: "Cuba", CV: "Cape Verde",
  CW: "Curaçao", CX: "Christmas Island", CY: "Cyprus", CZ: "Czechia",
  DE: "Germany", DJ: "Djibouti", DK: "Denmark", DM: "Dominica",
  DO: "Dominican Republic", DZ: "Algeria", EC: "Ecuador", EE: "Estonia",
  EG: "Egypt", EH: "Western Sahara", ER: "Eritrea", ES: "Spain",
  ET: "Ethiopia", FI: "Finland", FJ: "Fiji", FK: "Falkland Islands",
  FM: "Micronesia", FO: "Faroe Islands", FR: "France", GA: "Gabon",
  GB: "United Kingdom", GD: "Grenada", GE: "Georgia", GF: "French Guiana",
  GG: "Guernsey", GH: "Ghana", GI: "Gibraltar", GL: "Greenland",
  GM: "Gambia", GN: "Guinea", GP: "Guadeloupe", GQ: "Equatorial Guinea",
  GR: "Greece", GS: "South Georgia", GT: "Guatemala", GU: "Guam",
  GW: "Guinea-Bissau", GY: "Guyana", HK: "Hong Kong", HN: "Honduras",
  HR: "Croatia", HT: "Haiti", HU: "Hungary", ID: "Indonesia",
  IE: "Ireland", IL: "Israel", IM: "Isle of Man", IN: "India",
  IO: "British Indian Ocean Territory", IQ: "Iraq", IR: "Iran", IS: "Iceland",
  IT: "Italy", JE: "Jersey", JM: "Jamaica", JO: "Jordan",
  JP: "Japan", KE: "Kenya", KG: "Kyrgyzstan", KH: "Cambodia",
  KI: "Kiribati", KM: "Comoros", KN: "St. Kitts & Nevis", KP: "North Korea",
  KR: "South Korea", KW: "Kuwait", KY: "Cayman Islands", KZ: "Kazakhstan",
  LA: "Laos", LB: "Lebanon", LC: "St. Lucia", LI: "Liechtenstein",
  LK: "Sri Lanka", LR: "Liberia", LS: "Lesotho", LT: "Lithuania",
  LU: "Luxembourg", LV: "Latvia", LY: "Libya", MA: "Morocco",
  MC: "Monaco", MD: "Moldova", ME: "Montenegro", MF: "St. Martin",
  MG: "Madagascar", MH: "Marshall Islands", MK: "North Macedonia", ML: "Mali",
  MM: "Myanmar", MN: "Mongolia", MO: "Macao", MP: "Northern Mariana Islands",
  MQ: "Martinique", MR: "Mauritania", MS: "Montserrat", MT: "Malta",
  MU: "Mauritius", MV: "Maldives", MW: "Malawi", MX: "Mexico",
  MY: "Malaysia", MZ: "Mozambique", NA: "Namibia", NC: "New Caledonia",
  NE: "Niger", NF: "Norfolk Island", NG: "Nigeria", NI: "Nicaragua",
  NL: "Netherlands", NO: "Norway", NP: "Nepal", NR: "Nauru",
  NU: "Niue", NZ: "New Zealand", OM: "Oman", PA: "Panama",
  PE: "Peru", PF: "French Polynesia", PG: "Papua New Guinea", PH: "Philippines",
  PK: "Pakistan", PL: "Poland", PM: "St. Pierre & Miquelon", PR: "Puerto Rico",
  PS: "Palestine", PT: "Portugal", PW: "Palau", PY: "Paraguay",
  QA: "Qatar", RE: "Réunion", RO: "Romania", RS: "Serbia",
  RU: "Russia", RW: "Rwanda", SA: "Saudi Arabia", SB: "Solomon Islands",
  SC: "Seychelles", SD: "Sudan", SE: "Sweden", SG: "Singapore",
  SH: "St. Helena", SI: "Slovenia", SJ: "Svalbard & Jan Mayen", SK: "Slovakia",
  SL: "Sierra Leone", SM: "San Marino", SN: "Senegal", SO: "Somalia",
  SR: "Suriname", SS: "South Sudan", ST: "São Tomé & Príncipe", SV: "El Salvador",
  SX: "Sint Maarten", SY: "Syria", SZ: "Eswatini", TC: "Turks & Caicos Islands",
  TD: "Chad", TG: "Togo", TH: "Thailand", TJ: "Tajikistan",
  TK: "Tokelau", TL: "Timor-Leste", TM: "Turkmenistan", TN: "Tunisia",
  TO: "Tonga", TR: "Turkey", TT: "Trinidad & Tobago", TV: "Tuvalu",
  TW: "Taiwan", TZ: "Tanzania", UA: "Ukraine", UG: "Uganda",
  US: "United States", UY: "Uruguay", UZ: "Uzbekistan", VA: "Vatican City",
  VC: "St. Vincent & Grenadines", VE: "Venezuela", VG: "British Virgin Islands",
  VI: "US Virgin Islands", VN: "Vietnam", VU: "Vanuatu", WF: "Wallis & Futuna",
  WS: "Samoa", XK: "Kosovo", YE: "Yemen", YT: "Mayotte",
  ZA: "South Africa", ZM: "Zambia", ZW: "Zimbabwe",
};

const COUNTRIES: Country[] = getCountries()
  .map((code) => ({
    code,
    name: COUNTRY_NAMES[code] || code,
    dialCode: `+${getCountryCallingCode(code)}`,
    digits: (COUNTRY_DIGITS[code] ?? [5, 15]) as [number, number],
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

const DEFAULT_PHONE_COUNTRY =
  COUNTRIES.find((country) => country.code === "AU") ?? COUNTRIES[0];

function validatePhone(digits: string, country: Country): string | null {
  const clean = digits.replace(/\D/g, "");
  if (!clean) return null;
  const [min, max] = country.digits;
  if (clean.length < min) return `Too short`;
  if (clean.length > max) return `Too long`;
  if (max > min && clean.length === max && !clean.startsWith("0")) {
    return `Too long — add a leading 0 for local format`;
  }
  if (max > min && clean.length === min && clean.startsWith("0")) {
    return `Too short — drop the leading 0, or add another digit for local format`;
  }
  return null;
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Mode =
  | "onboarding"
  | "login"
  | "resume"
  | "resume-otp"
  | "forgot-password"
  | "reset-password";

interface FormData {
  email: string;
  phone: string;
  contactPerson: string;
  sellerId: string;
  otp: string;
  password: string;
  confirmPassword: string;
  businessName: string;
  abn: string;
  businessType: string;
  businessPhone: string;
  street: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  artistName: string;
  description: string;
  storeName: string;
  storeLogo: File | null;
  storeBio: string;
  firstName: string;
  lastName: string;
  dob: string;
  idDocument: File | null;
  documentType: string;
  bankName: string;
  accountName: string;
  bsb: string;
  accountNumber: string;
  loginEmail: string;
  loginPassword: string;
  resetOtp: string;
  newPassword: string;
}

const feeSummaryRows = [
  {
    title: "Marketplace Fees",
    description: "10% Commission",
  },
  {
    title: "Stripe Fees",
    description: "Domestic Cards, International Cards, Connect account fees, Payouts, Instant Payouts, Disputes",
  },
  {
    title: "Important Notes",
    description: "GST, Refunds, Stripe policy disclaimer",
  },
];

const feeDetailRows = [
  {
    feeCharge: "Marketplace Commission",
    amountBasis: "10% of product sale value",
    chargedBy: "Platform Marketplace",
    notes:
      "Currently applied to product sale value only. Shipping, GST treatment, refunds, and other applicable charges are handled separately.",
  },
  {
    feeCharge: "Stripe Card Processing - Domestic Cards",
    amountBasis: "Currently 1.7% + A$0.30 per successful transaction",
    chargedBy: "Stripe",
    notes:
      "Deducted by Stripe from the connected seller account, subject to Stripe's current AU pricing and account setup.",
  },
  {
    feeCharge: "Stripe Card Processing - International Cards",
    amountBasis: "Currently 3.5% + A$0.30 per successful transaction",
    chargedBy: "Stripe",
    notes:
      "Applies where an international card is used. Additional currency conversion or cross-border charges may apply.",
  },
  {
    feeCharge: "Stripe Connect Active Account Fee",
    amountBasis: "A$2 per active seller account per month",
    chargedBy: "Stripe",
    notes:
      "Applies only to seller accounts that process transactions and receive payouts during the month. No charge for inactive accounts.",
  },
  {
    feeCharge: "Stripe Connect Payout Fee",
    amountBasis: "0.25% + A$0.25 per payout",
    chargedBy: "Stripe",
    notes:
      "Charged when funds are paid out from Stripe to the seller's bank account. Not charged per product sold.",
  },
  {
    feeCharge: "Instant Payouts",
    amountBasis: "Currently 1.5% of payout volume, where eligible",
    chargedBy: "Stripe",
    notes:
      "Optional. Only applies if the seller uses Instant Payouts and is eligible under Stripe rules.",
  },
  {
    feeCharge: "Refunds",
    amountBasis: "As per Stripe rules",
    chargedBy: "Stripe / Seller Account",
    notes:
      "Stripe may not return the original processing, Connect, or currency conversion fees. Refund handling depends on transaction status and seller balance. Connected sellers remain responsible for obligations associated with their Stripe account, subject to Stripe's policies and account configuration.",
  },
  {
    feeCharge: "Disputes / Chargebacks",
    amountBasis: "As per Stripe rules",
    chargedBy: "Stripe / Seller Account",
    notes:
      "Any dispute fees, chargeback outcomes, or balance impacts are governed by Stripe's policies.",
  },
  {
    feeCharge: "Shipping Charges",
    amountBasis: "Shown at checkout",
    chargedBy: "Customer",
    notes:
      "Shipping is charged separately based on the platform's shipping setup.",
  },
  {
    feeCharge: "GST",
    amountBasis: "As applicable under Australian tax rules",
    chargedBy: "Seller / Platform as applicable",
    notes:
      "Sellers are responsible for their own tax obligations. This page is not tax advice.",
  },
];

const feeDetailFootnote =
  "Fee examples and Stripe pricing references are indicative only and may change over time. Sellers should review Stripe's latest pricing and policies directly before using the platform.";

// ─── Helper ──────────────────────────────────────────────────────────────────
/** Map backend onboardingStep to frontend step (1-6) */
const backendStepToFrontend = (backendStep: number): number => {
  if (backendStep <= 1) return 2;
  if (backendStep === 2) return 3;
  if (backendStep === 3) return 4;
  if (backendStep === 4) return 5;
  return 6;
};

function PasswordField({
  label,
  name,
  value,
  onChange,
  placeholder,
  inputCls,
  error,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  inputCls: string;
  error?: string;
}) {
  const [show, setShow] = React.useState(false);
  return (
    <div>
      <label className="block text-sm font-medium text-[#5A1E12] mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${inputCls} pr-10`}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B5E3C] hover:text-[#5A1E12] transition-colors"
          tabIndex={-1}
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

const OTP_RECOVERY_MESSAGE =
  "Your verification session has expired or could not be completed. Please go back, review your details, and submit again to receive a new code.";

export default function ArtistOnboardingForm() {
  const [mode, setMode] = useState<Mode>("onboarding");
  const [currentStep, setCurrentStep] = useState(1);
  const [token, setToken] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resumeInfo, setResumeInfo] = useState<{
    step?: number;
    stepName?: string;
  } | null>(null);
  const [resumeOtp, setResumeOtp] = useState("");
  const [abnValidated, setAbnValidated] = useState(false);
  const [abnValidating, setAbnValidating] = useState(false);
  const [abnInfo, setAbnInfo] = useState<{ entityName: string; businessName: string; gst: string } | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [isResendEnabled, setIsResendEnabled] = useState(false);
  const totalSteps = 6;

  const [formData, setFormData] = useState<FormData>({
    email: "",
    phone: "",
    contactPerson: "",
    sellerId: "",
    otp: "",
    password: "",
    confirmPassword: "",
    businessName: "",
    abn: "",
    businessType: "",
    businessPhone: "",
    street: "",
    city: "",
    state: "",
    postcode: "",
    country: "",
    artistName: "",
    description: "",
    storeName: "",
    storeLogo: null,
    storeBio: "",
    firstName: "",
    lastName: "",
    dob: "",
    idDocument: null,
    documentType: "passport",
    bankName: "",
    accountName: "",
    bsb: "",
    accountNumber: "",
    loginEmail: "",
    loginPassword: "",
    resetOtp: "",
    newPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [logoError, setLogoError] = useState(false);

  const goBackFromOtpStep = () => {
    setFormData((prev) => ({ ...prev, otp: "" }));
    setErrors({});
    setSuccessMessage("");
    setCurrentStep(4);
  };

  // ─── Stripe Connect state ─────────────────────────────────────────────────
  const [stripeStatus, setStripeStatus] = useState<{
    connected: boolean;
    stripeOnboardingComplete: boolean;
    stripeChargesEnabled: boolean;
    requirements?: string[];
  } | null>(null);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [showFeeDetails, setShowFeeDetails] = useState(false);

  // ─── Phone picker — Step 1 ────────────────────────────────────────────────
  const [phoneCountry, setPhoneCountry] =
    useState<Country>(DEFAULT_PHONE_COUNTRY);
  const [phoneSearch, setPhoneSearch] = useState("");
  const [showPhoneDropdown, setShowPhoneDropdown] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [phoneInputError, setPhoneInputError] = useState<string | null>(null);
  const phoneDropdownRef = useRef<HTMLDivElement>(null);
  const phonePickerBtnRef = useRef<HTMLButtonElement>(null);
  const phonePanelRef = useRef<HTMLDivElement>(null);
  const [phoneDropdownCoords, setPhoneDropdownCoords] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  // ─── Persist to localStorage ──────────────────────────────────────────────
  useEffect(() => {
    const savedStep = localStorage.getItem("sellerOnboardingStep");
    const savedFormData = localStorage.getItem("sellerOnboardingFormData");
    const savedToken = localStorage.getItem("sellerToken");

    if (savedToken) setToken(savedToken);
    if (savedStep) setCurrentStep(parseInt(savedStep, 10));
    if (savedFormData) {
      try {
        const parsed = JSON.parse(savedFormData);
        if (parsed.phone && /^\+\d/.test(parsed.phone)) {
          parsed.phone = parsed.phone.replace(/^\+\d+\s*/, "");
        }
        setFormData((prev) => ({
          ...prev,
          ...parsed,
          storeLogo: null,
          idDocument: null,
        }));
      } catch {}
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("sellerOnboardingStep", currentStep.toString());
  }, [currentStep]);
  useEffect(() => {
    const { storeLogo, idDocument, ...rest } = formData;
    localStorage.setItem("sellerOnboardingFormData", JSON.stringify(rest));
  }, [formData]);
  useEffect(() => {
    if (token) localStorage.setItem("sellerToken", token);
  }, [token]);

  useEffect(() => {
    if (!showFeeDetails) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowFeeDetails(false);
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showFeeDetails]);

  // ─── Close phone dropdowns on outside click ───────────────────────────────
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        phoneDropdownRef.current &&
        !phoneDropdownRef.current.contains(e.target as Node)
      ) {
        setShowPhoneDropdown(false);
        setPhoneSearch("");
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ─── Close dropdowns on scroll outside the dropdown panels ─────────────────
  useEffect(() => {
    const close = (e: Event) => {
      const target = e.target as Node;
      if (phonePanelRef.current && phonePanelRef.current.contains(target))
        return;
      setShowPhoneDropdown(false);
    };
    window.addEventListener("scroll", close, true);
    return () => window.removeEventListener("scroll", close, true);
  }, []);

  // ─── Handle return from Stripe OAuth ──────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("connected");
    if (connected === "1") {
      window.history.replaceState({}, "", window.location.pathname);
      setCurrentStep(6);
    }
  }, []);

  // Check Stripe status whenever the user lands on step 6
  useEffect(() => {
    if (currentStep === 6 && token) {
      checkStripeStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, token]);

  useEffect(() => {
    if (currentStep !== 5) return;
    setCountdown(60);
    setIsResendEnabled(false);
  }, [currentStep]);

  useEffect(() => {
    if (currentStep !== 5) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
    setIsResendEnabled(true);
  }, [countdown, currentStep]);

  // ─── Inputs ───────────────────────────────────────────────────────────────
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string,
  ) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, [fieldName]: file }));
    if (errors[fieldName]) setErrors((prev) => ({ ...prev, [fieldName]: "" }));
  };

  const setError = (key: string, msg: string) =>
    setErrors((prev) => ({ ...prev, [key]: msg }));

  // ─── RESUME ONBOARDING ────────────────────────────────────────────────────
  const handleCheckResume = async () => {
    if (!formData.loginEmail?.trim()) {
      setError("loginEmail", "Email is required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${baseURL}/api/sellers/resume`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.loginEmail }),
      });
      const data = await res.json();
      if (data.canResume && data.action === "verify_otp") {
        // Seller exists but hasn't completed Stripe — verify identity then continue
        setFormData((prev) => ({ ...prev, email: formData.loginEmail }));
        setResumeOtp("");
        setMode("resume-otp");
      } else if (data.action === "already_complete" || data.action === "login") {
        // Fully onboarded — direct them to login
        setError("loginEmail", data.message || "Your account is already set up. Please log in to your seller dashboard.");
      } else if (data.action === "start_new") {
        // OTP was never verified during signup — nothing to resume
        setError("loginEmail", data.message || "No saved application found for this email. Please start a new application.");
      } else if (!res.ok) {
        setError("loginEmail", data.message || "No account found with this email.");
      }
    } catch {
      setError("submit", "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // ─── RESUME OTP VERIFY ───────────────────────────────────────────────────
  const handleResumeVerifyOtp = async () => {
    if (!resumeOtp.trim()) {
      setError("resumeOtp", "Please enter the One-time code sent to your email");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${baseURL}/api/sellers/resume-verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.loginEmail, otp: resumeOtp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError("resumeOtp", data.message || "Invalid or expired One-time code");
        return;
      }
      setToken(data.token);
      localStorage.setItem("sellerToken", data.token);
      const backendStep = data.nextStep?.step ?? data.onboardingStatus?.currentStep ?? 3;
      const frontendStep = backendStepToFrontend(backendStep);
      setCurrentStep(frontendStep);
      setMode("onboarding");
      setErrors({});
      setResumeOtp("");
    } catch {
      setError("resumeOtp", "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─── LOGIN ────────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    const newErrors: Record<string, string> = {};
    if (!formData.loginEmail?.trim())
      newErrors.loginEmail = "Email is required";
    if (!formData.loginPassword?.trim())
      newErrors.loginPassword = "Password is required";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${baseURL}/api/sellers/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.loginEmail,
          password: formData.loginPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError("submit", data.message || "Login failed");
        return;
      }
      setToken(data.token);
      localStorage.setItem("sellerToken", data.token);
      const backendStep = data.onboardingStatus?.currentStep ?? 3;
      const frontendStep = backendStepToFrontend(backendStep);
      setCurrentStep(frontendStep);
      setMode("onboarding");
      setErrors({});
    } catch {
      setError("submit", "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // ─── FORGOT PASSWORD ──────────────────────────────────────────────────────
  const handleForgotPassword = async () => {
    if (!formData.loginEmail?.trim()) {
      setError("loginEmail", "Email is required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${baseURL}/api/sellers/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.loginEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError("submit", data.message || "Failed to send OTP");
        return;
      }
      setSuccessMessage("One-time code sent to your email");
      setMode("reset-password");
      setErrors({});
    } catch {
      setError("submit", "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // ─── RESET PASSWORD ───────────────────────────────────────────────────────
  const handleResetPassword = async () => {
    const newErrors: Record<string, string> = {};
    if (!formData.resetOtp?.trim()) newErrors.resetOtp = "OTP is required";
    if (!formData.newPassword?.trim()) {
      newErrors.newPassword = "Password is required";
    } else {
      const pwErr = getFirstPasswordError(formData.newPassword);
      if (pwErr) newErrors.newPassword = pwErr;
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${baseURL}/api/sellers/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.loginEmail,
          otp: formData.resetOtp,
          newPassword: formData.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError("submit", data.message || "Reset failed");
        return;
      }
      setToken(data.token);
      localStorage.setItem("sellerToken", data.token);
      const backendStep = data.onboardingStatus?.currentStep ?? 3;
      setCurrentStep(backendStepToFrontend(backendStep));
      setMode("onboarding");
      setErrors({});
      setSuccessMessage("");
    } catch {
      setError("submit", "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // ─── STEP 1 ───────────────────────────────────────────────────────────────
  const handleApplyStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.contactPerson?.trim())
      newErrors.contactPerson = "Contact person name is required";
    if (!formData.email?.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email format";
    if (!formData.phone?.trim()) newErrors.phone = "Phone is required";
    else {
      const phoneErr = validatePhone(formData.phone, phoneCountry);
      if (phoneErr) {
        newErrors.phone = phoneErr;
        setPhoneTouched(true);
      }
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setFormData((prev) => ({ ...prev, phone: prev.phone.replace(/\D/g, "") }));
    setErrors({});
    setCurrentStep(2);
  };

  // ─── STEP 2 ───────────────────────────────────────────────────────────────
  const handleStep2Submit = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.password?.trim()) {
      newErrors.password = "Password is required";
    } else {
      const pwErr = getFirstPasswordError(formData.password);
      if (pwErr) newErrors.password = pwErr;
    }
    if (!formData.confirmPassword?.trim())
      newErrors.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setCurrentStep(3);
  };

  // ─── Check Stripe Connect status ─────────────────────────────────────────
  const checkStripeStatus = async () => {
    if (!token) return;
    setStripeLoading(true);
    try {
      const res = await fetch(
        `${baseURL}/api/seller-onboarding/stripe/status`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) return;
      const data = await res.json();
      setStripeStatus(data);
    } catch {
      // Silently fail
    } finally {
      setStripeLoading(false);
    }
  };

  // ─── Connect Stripe account via OAuth ────────────────────────────────────
  const handleConnectStripe = async () => {
    if (!token) {
      setError("stripe", "Please log in to connect Stripe");
      return;
    }
    setStripeLoading(true);
    try {
      const abnParam = formData.abn?.replace(/\s/g, "").trim();
      const url = `${baseURL}/api/seller-onboarding/stripe/oauth-url${abnParam ? `?abn=${encodeURIComponent(abnParam)}` : ""}`;
      const res = await fetch(url, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError("stripe", d.message || "Failed to start Stripe setup");
        return;
      }
      const data = await res.json();
      if (data.alreadyConnected) {
        await checkStripeStatus();
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("stripe", "Failed to connect Stripe. Please try again.");
    } finally {
      setStripeLoading(false);
    }
  };

  // ─── STEP 4 ───────────────────────────────────────────────────────────────
  const handleStep4Submit = () => {
    setErrors({});
    setCurrentStep(4);
  };

  // ─── ABN VALIDATE ────────────────────────────────────────────────────────
  const handleValidateAbn = async () => {
    const clean = formData.abn?.replace(/\s/g, "").trim();
    if (!clean) { setError("abn", "Please enter an ABN to validate"); return; }
    if (clean.length !== 11) { setError("abn", "ABN must be 11 digits"); return; }
    setAbnValidating(true);
    setAbnValidated(false);
    setAbnInfo(null);
    setErrors((p) => ({ ...p, abn: "" }));
    try {
      const res = await fetch(`${baseURL}/api/sellers/validate-abn-public`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ abn: clean }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError("abn", data.message || "Invalid ABN. Please check and try again.");
        return;
      }
      // Valid — auto-fill state & postcode from ABR data
      const info = data.abnValidation?.data;
      setAbnValidated(true);
      setAbnInfo({
        entityName: info?.entityName || "",
        businessName: info?.businessName || "",
        gst: info?.gst || "",
      });
      if (info?.address?.state)    setFormData((p) => ({ ...p, state: info.address.state }));
      if (info?.address?.postcode) setFormData((p) => ({ ...p, postcode: info.address.postcode }));
    } catch {
      setError("abn", "Could not reach ABN lookup service. Please try again.");
    } finally {
      setAbnValidating(false);
    }
  };

  // ─── STEP 5 — submit onboarding ───────────────────────────────────────────
  const handleStep5Submit = async () => {
    const newErrors: Record<string, string> = {};
    if (!formData.storeName?.trim())
      newErrors.storeName = "Store name is required";
    if (!formData.storeBio?.trim())
      newErrors.storeBio = "Store bio is required";
    if (!formData.abn?.trim())
      newErrors.abn = "ABN is required";
    if (!formData.street?.trim())
      newErrors.street = "Street address is required";
    if (!formData.city?.trim())
      newErrors.city = "City is required";
    if (!formData.state?.trim())
      newErrors.state = "State is required";
    if (!formData.postcode?.trim())
      newErrors.postcode = "Postcode is required";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    if (!abnValidated) {
      setError("abn", "Please validate your ABN before continuing.");
      return;
    }
    try {
      const fd = new FormData();
      fd.append("email", formData.email);
      fd.append(
        "phone",
        `${phoneCountry.dialCode} ${formData.phone.replace(/\D/g, "")}`,
      );
      fd.append("contactPerson", formData.contactPerson);
      fd.append("password", formData.password);
      fd.append("artistName", formData.artistName);
      fd.append("description", formData.description);
      fd.append("storeName", formData.storeName);
      fd.append("storeDescription", formData.storeBio);
      if (formData.storeLogo) fd.append("storeLogo", formData.storeLogo);
      fd.append("businessName", formData.storeName);
      fd.append("abn", formData.abn.replace(/\s/g, ""));
      fd.append("businessType", "individual");
      fd.append(
        "businessAddress",
        JSON.stringify({
          street: formData.street,
          city: formData.city,
          state: formData.state,
          postcode: formData.postcode,
          country: formData.country || "Australia",
        }),
      );
      const res = await fetch(`${baseURL}/api/sellers/submit-onboarding`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError("submit", d.message || "Submission failed");
        return;
      }
      const data = await res.json();
      if (data.token) {
        setToken(data.token);
        localStorage.setItem("sellerToken", data.token);
      }
      setErrors({});
      setCurrentStep(5);
    } catch {
      setError("submit", "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─── STEP 5 (OTP verify) ─────────────────────────────────────────────────
  const handleStep6Submit = async () => {
    if (!formData.otp?.trim()) {
      setError("otp", "One-time code is required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${baseURL}/api/sellers/verify-and-submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp: formData.otp }),
      });
      if (!res.ok) {
        await res.json().catch(() => ({}));
        setError("otp", OTP_RECOVERY_MESSAGE);
        return;
      }
      const data = await res.json();
      if (data.token) {
        setToken(data.token);
        localStorage.setItem("sellerToken", data.token);
      }
      setErrors({});
      setCurrentStep(6);
    } catch {
      setError("submit", "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─── STEP 6 (Stripe complete) ─────────────────────────────────────────────
  const handleStep7Submit = () => {
    if (
      !stripeStatus?.stripeOnboardingComplete ||
      !stripeStatus?.stripeChargesEnabled
    ) {
      setError(
        "stripe",
        "Please complete your Stripe account setup before continuing",
      );
      return;
    }
    ["sellerOnboardingStep", "sellerOnboardingFormData", "sellerToken"].forEach(
      (k) => localStorage.removeItem(k),
    );
    toast.success(
      "🎉 You are now registered as a seller! Welcome to the platform.",
      {
        position: "top-center",
        autoClose: 5000,
      },
    );
    setRegistrationComplete(true);
  };

  const handleNext = () => {
    setErrors({});
    const handlers: Record<number, () => void> = {
      1: handleApplyStep1,
      2: handleStep2Submit,
      3: handleStep4Submit,
      4: handleStep5Submit,
      5: handleStep6Submit,
      6: handleStep7Submit,
    };
    handlers[currentStep]?.();
  };

  const handlePrevious = () => {
    if (currentStep === 5) {
      goBackFromOtpStep();
      return;
    }
    setErrors({});
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // ─── Shared input classes ─────────────────────────────────────────────────
  const inputCls = (field?: string) =>
    `w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A1E12]/40 bg-white text-[#5A1E12] placeholder-[#5A1E12]/40 transition-all ${field && errors[field] ? "border-red-400 bg-red-50" : "border-[#5A1E12]/20"}`;

  const labelCls = "block text-sm font-semibold text-[#5A1E12] mb-1.5";

  // ─── AUTH SCREEN ──────────────────────────────────────────────────────────
  if (mode !== "onboarding") {
    return (
      <div className="relative min-h-screen bg-[#EAD7B7] flex flex-col items-center justify-center px-4 py-12 sm:py-16">
        <Link
          href="/"
          className="mb-6 block w-fit md:absolute md:top-8 md:left-8 md:mb-0"
        >
          {!logoError && (
            <Image
              src="/images/navbarLogo.png"
              alt="Logo"
              width={90}
              height={90}
              className="w-14 h-14 md:w-22.5 md:h-22.5"
              onError={() => setLogoError(true)}
            />
          )}
        </Link>

        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-10 border border-[#5A1E12]/15">
            {mode === "resume" && (
              <>
                <h2 className="text-2xl font-extrabold text-[#5A1E12] mb-1">
                  Resume Onboarding
                </h2>
                <p className="text-sm text-[#5A1E12]/60 mb-6">
                  Enter your email to check your progress
                </p>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Email Address *</label>
                    <input
                      type="email"
                      name="loginEmail"
                      value={formData.loginEmail}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      className={inputCls("loginEmail")}
                    />
                    {errors.loginEmail && !errors.loginEmail.includes("already set up") && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.loginEmail}
                      </p>
                    )}
                  </div>
                  {errors.loginEmail && errors.loginEmail.includes("already set up") && (
                    <div className="bg-amber-50 border border-amber-300 rounded-xl p-4">
                      <p className="text-sm font-semibold text-amber-800 mb-1">Account Already Set Up</p>
                      <p className="text-sm text-amber-700">{errors.loginEmail}</p>
                      <button
                        onClick={() => { setMode("login"); setErrors({}); }}
                        className="mt-3 w-full py-2 bg-[#5A1E12] hover:bg-[#4a180f] text-white rounded-xl text-sm font-semibold transition-all"
                      >
                        Go to Login
                      </button>
                    </div>
                  )}
                  {errors.submit && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                      <p className="text-sm text-red-800">{errors.submit}</p>
                    </div>
                  )}
                  {!errors.loginEmail?.includes("already set up") && (
                  <button
                    onClick={handleCheckResume}
                    disabled={loading}
                    className="w-full py-3 bg-[#5A1E12] hover:bg-[#4a180f] text-white rounded-xl font-semibold transition-all disabled:opacity-60"
                  >
                    {loading ? "Checking…" : "Check Progress"}
                  </button>
                  )}
                </div>
                <div className="mt-6 text-center space-y-2">
                  <button
                    onClick={() => {
                      setMode("onboarding");
                      setErrors({});
                    }}
                    className="text-sm text-[#5A1E12] hover:underline cursor-pointer"
                  >
                    ← Start a new application
                  </button>
                </div>
              </>
            )}

            {mode === "resume-otp" && (
              <>
                <h2 className="text-2xl font-extrabold text-[#5A1E12] mb-1">
                  Verify Your Email
                </h2>
                <p className="text-sm text-[#5A1E12]/60 mb-6">
                  We sent a one-time code to{" "}
                  <span className="font-semibold text-[#5A1E12]">
                    {formData.loginEmail}
                  </span>
                </p>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>One-Time Password (OTP) *</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={resumeOtp}
                      onChange={(e) => {
                        setResumeOtp(e.target.value.replace(/\D/g, ""));
                        if (errors.resumeOtp)
                          setErrors((prev) => ({ ...prev, resumeOtp: "" }));
                      }}
                      placeholder="Enter 6-digit code"
                      className={inputCls("resumeOtp")}
                    />
                    {errors.resumeOtp && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.resumeOtp}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleResumeVerifyOtp}
                    disabled={loading}
                    className="w-full py-3 bg-[#5A1E12] hover:bg-[#4a180f] text-white rounded-xl font-semibold transition-all disabled:opacity-60"
                  >
                    {loading ? "Verifying…" : "Continue My Application"}
                  </button>
                  <button
                    onClick={() => {
                      setLoading(true);
                      fetch(`${baseURL}/api/sellers/resume`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email: formData.loginEmail }),
                      }).finally(() => setLoading(false));
                    }}
                    disabled={loading}
                    className="w-full py-2 pl-4 text-sm text-[#5A1E12] hover:underline disabled:opacity-50"
                  >
                    Resend code
                  </button>
                </div>
                <div className="mt-4 text-center">
                  <button
                    onClick={() => {
                      setMode("resume");
                      setResumeOtp("");
                      setErrors({});
                    }}
                    className="text-sm text-[#5A1E12] hover:underline cursor-pointer"
                  >
                    ← Use a different email
                  </button>
                </div>
              </>
            )}

            {mode === "login" && (
              <>
                <h2 className="text-2xl font-extrabold text-[#5A1E12] mb-1">
                  Welcome Back
                </h2>
                {resumeInfo && (
                  <div className="mb-4 bg-[#5A1E12]/5 border border-[#5A1E12]/20 rounded-xl p-3">
                    <p className="text-sm text-[#5A1E12]">
                      You left off at <strong>Step {resumeInfo.step}</strong>
                      : {resumeInfo.stepName}
                    </p>
                  </div>
                )}
                <p className="text-sm text-[#5A1E12]/60 mb-6">
                  Log in to continue your application
                </p>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Email Address *</label>
                    <input
                      type="email"
                      name="loginEmail"
                      value={formData.loginEmail}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      className={inputCls("loginEmail")}
                    />
                    {errors.loginEmail && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.loginEmail}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={labelCls}>Password *</label>
                    <input
                      type="password"
                      name="loginPassword"
                      value={formData.loginPassword}
                      onChange={handleInputChange}
                      placeholder="Your password"
                      className={inputCls("loginPassword")}
                    />
                    {errors.loginPassword && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.loginPassword}
                      </p>
                    )}
                  </div>
                  {errors.submit && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                      <p className="text-sm text-red-800">{errors.submit}</p>
                    </div>
                  )}
                  <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full py-3 bg-[#5A1E12] hover:bg-[#4a180f] text-white rounded-xl font-semibold transition-all disabled:opacity-60"
                  >
                    {loading ? "Logging in…" : "Continue Application"}
                  </button>
                </div>
                <div className="mt-6 flex flex-col items-center gap-2 text-sm">
                  <button
                    onClick={() => {
                      setMode("forgot-password");
                      setErrors({});
                    }}
                    className="text-[#5A1E12] hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                  <button
                    onClick={() => {
                      setMode("onboarding");
                      setCurrentStep(1);
                      setErrors({});
                    }}
                    className="text-[#5A1E12]/60 hover:underline"
                  >
                    ← Start a new application
                  </button>
                </div>
              </>
            )}

            {mode === "forgot-password" && (
              <>
                <h2 className="text-2xl font-extrabold text-[#5A1E12] mb-1">
                  Reset Password
                </h2>
                <p className="text-sm text-[#5A1E12]/60 mb-6">
                  We'll send a one-time code to your email
                </p>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Email Address *</label>
                    <input
                      type="email"
                      name="loginEmail"
                      value={formData.loginEmail}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      className={inputCls("loginEmail")}
                    />
                    {errors.loginEmail && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.loginEmail}
                      </p>
                    )}
                  </div>
                  {errors.submit && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                      <p className="text-sm text-red-800">{errors.submit}</p>
                    </div>
                  )}
                  {successMessage && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                      <p className="text-sm text-green-800">{successMessage}</p>
                    </div>
                  )}
                  <button
                    onClick={handleForgotPassword}
                    disabled={loading}
                    className="w-full py-3 bg-[#5A1E12] hover:bg-[#4a180f] text-white rounded-xl font-semibold transition-all disabled:opacity-60"
                  >
                    {loading ? "Sending OTP…" : "Send Reset OTP"}
                  </button>
                </div>
                <div className="mt-6 text-center">
                  <button
                    onClick={() => {
                      setMode("login");
                      setErrors({});
                    }}
                    className="text-sm text-[#5A1E12] hover:underline"
                  >
                    ← Back to login
                  </button>
                </div>
              </>
            )}

            {mode === "reset-password" && (
              <>
                <h2 className="text-2xl font-extrabold text-[#5A1E12] mb-1">
                  Set New Password
                </h2>
                <p className="text-sm text-[#5A1E12]/60 mb-6">
                  Enter the OTP sent to <strong>{formData.loginEmail}</strong>
                </p>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>OTP Code *</label>
                    <input
                      type="text"
                      name="resetOtp"
                      value={formData.resetOtp}
                      onChange={handleInputChange}
                      placeholder="Enter OTP"
                      className={inputCls("resetOtp")}
                    />
                    {errors.resetOtp && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.resetOtp}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={labelCls}>New Password *</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      placeholder="Create a strong password"
                      className={inputCls("newPassword")}
                    />
                    {errors.newPassword && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.newPassword}
                      </p>
                    )}
                    <PasswordStrengthIndicator password={formData.newPassword} variant="light" />
                  </div>
                  {errors.submit && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                      <p className="text-sm text-red-800">{errors.submit}</p>
                    </div>
                  )}
                  {successMessage && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                      <p className="text-sm text-green-800">{successMessage}</p>
                    </div>
                  )}
                  <button
                    onClick={handleResetPassword}
                    disabled={loading}
                    className="w-full py-3 bg-[#5A1E12] hover:bg-[#4a180f] text-white rounded-xl font-semibold transition-all disabled:opacity-60"
                  >
                    {loading ? "Resetting…" : "Reset & Continue"}
                  </button>
                  <button
                    onClick={handleForgotPassword}
                    disabled={loading}
                    className="w-full py-2 text-sm text-[#5A1E12] hover:underline"
                  >
                    Resend One-time code
                  </button>
                </div>
                <div className="mt-4 text-center">
                  <button
                    onClick={() => {
                      setMode("login");
                      setErrors({});
                    }}
                    className="text-sm text-[#5A1E12]/70 hover:underline"
                  >
                    ← Back to login
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── REGISTRATION COMPLETE SCREEN ─────────────────────────────────────────
  if (registrationComplete) {
    return (
      <div className="relative min-h-screen bg-[#EAD7B7] flex flex-col items-center justify-center px-4 py-12">
        <Link
          href="/"
          className="mb-8 block w-fit md:absolute md:top-8 md:left-8 md:mb-0"
        >
          {!logoError && (
            <Image
              src="/images/navbarLogo.png"
              alt="Logo"
              width={90}
              height={90}
              className="w-14 h-14 md:w-22.5 md:h-22.5"
              onError={() => setLogoError(true)}
            />
          )}
        </Link>
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-2xl shadow-2xl p-10 border border-[#5A1E12]/15 text-center">
            <div className="flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mx-auto mb-6">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-extrabold text-[#5A1E12] mb-2">
              You&apos;re officially a Seller!
            </h2>
            <p className="text-[#5A1E12]/70 text-sm mb-2">
              Congratulations,{" "}
              <strong>{formData.contactPerson || "Seller"}</strong>! Your seller
              account has been successfully registered on the platform.
            </p>
            <p className="text-[#5A1E12]/60 text-xs mb-8">
              Your store <strong>{formData.storeName}</strong> is now live. You
              can start listing products and managing orders from your seller
              dashboard.
            </p>
            <Link
              href="/"
              className="block w-full py-3 bg-[#5A1E12] hover:bg-[#4a180f] text-white rounded-xl font-semibold transition-all"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleResendOTP = async () => {
    const email = formData.email?.trim();

    if (!email) {
      setError("submit", "Email is missing");
      return;
    }

    if (!isResendEnabled) return;

    setLoading(true);
    setErrors((prev) => ({ ...prev, submit: "", otp: "" }));
    try {
      const res = await fetch(`${baseURL}/api/sellers/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(
          "submit",
          res.status === 404 || /pending registration/i.test(d.message || "")
            ? OTP_RECOVERY_MESSAGE
            : d.message || "Failed to resend OTP",
        );
        return;
      }
      setFormData((prev) => ({ ...prev, otp: "" }));
      setErrors({});
      setSuccessMessage("One-time code resent to your email");
      setCountdown(60);
      setIsResendEnabled(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch {
      setError("submit", "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // ─── MAIN ONBOARDING FORM ─────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen bg-[#EAD7B7] py-8 sm:py-12 px-4">
{/* Logo — centered on mobile, top-left on desktop */}
<div className="absolute top-4 left-1/2 -translate-x-1/2 md:top-8 md:left-8 md:translate-x-0 z-50">
  <Link href="/" className="block w-fit" aria-label="Go to homepage">
    {!logoError && (
      <Image
        src="/images/navbarLogo.png"
        alt="Logo"
        width={90}
        height={90}
        className="w-14 h-14 md:w-22.5 md:h-22.5"
        onError={() => setLogoError(true)}
      />
    )}
  </Link>
</div>

{/* Back to Home — icon-only circle on mobile, full button on desktop */}
<div className="absolute top-4 left-4 md:top-8 md:left-auto md:right-8 z-50 flex h-9 md:h-22.5 items-center">
  <Link
    href="/"
    aria-label="Back to home"
    className="inline-flex items-center justify-center gap-2 w-9 h-9 rounded-full md:w-auto md:h-auto md:rounded-xl border border-[#5A1E12]/25 bg-white/70 px-0 md:px-4 py-0 md:py-2 text-sm font-semibold text-[#5A1E12] shadow-sm backdrop-blur transition-all hover:bg-white hover:border-[#5A1E12]/40 hover:shadow-md"
  >
    <ArrowLeft className="h-4 w-4 shrink-0" />
    <span className="hidden md:inline">Back to Home</span>
  </Link>
</div>

<div>
  <div className="mb-8 flex flex-col items-center justify-center text-center pt-16 md:pt-0">
    <h2 className="text-3xl font-extrabold text-[#5A1E12] mb-2 tracking-tight">
      Start your journey as a Seller
    </h2>
    <p className="text-[#5A1E12]/70 mb-1">
      Complete all steps to sign-up & start selling
    </p>
    {hydrated && currentStep === 1 && (
      <button
        onClick={() => {
          setFormData((prev) => ({ ...prev, loginEmail: "" }));
          setErrors({});
          setMode("resume");
        }}
        className="mt-3 text-sm text-[#5A1E12] font-semibold underline underline-offset-2 hover:text-[#4a180f] transition-colors"
      >
        Already started? Resume your application
      </button>
    )}
  </div>

        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-[#5A1E12]">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-sm text-[#5A1E12]/60">
                {Math.round((currentStep / totalSteps) * 100)}% Complete
              </span>
            </div>
            <div className="w-full h-2 bg-[#5A1E12]/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#5A1E12] transition-all duration-500"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-10 border border-[#5A1E12]/15">
            {/* ── Accuracy Notice — only shown on steps 1–5 ── */}
            {currentStep !== 6 && (
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-xl px-4 py-3 mb-6">
                <span className="text-amber-500 text-lg mt-0.5">ⓘ</span>
                <p className="md:text-sm text-xs text-amber-800 leading-relaxed">
                  <span className="font-semibold">
                    Please ensure all details are accurate.
                  </span>{" "}
                  The information you provide including your business summary,
                  store profile, and contact details may be visible to buyers
                  and other users on the platform. Incorrect or misleading
                  information may result in delays to your application or
                  account suspension.
                </p>
              </div>
            )}

            {/* Step 1 */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <h3 className="text-xl font-semibold text-[#5A1E12] mb-4">
                  Account Verification
                </h3>
                <div>
                  <label className={labelCls}>Contact Person Name *</label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    placeholder="Full Name"
                    className={inputCls("contactPerson")}
                  />
                  {errors.contactPerson && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.contactPerson}
                    </p>
                  )}
                </div>
                <div>
                  <label className={labelCls}>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    className={inputCls("email")}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                  )}
                </div>
                <div>
                  <label className={labelCls}>Phone Number *</label>
                  <div ref={phoneDropdownRef} className="relative">
                    <div
                      className={`flex bg-white items-center border rounded-xl overflow-visible transition-all ${
                        errors.phone
                          ? "border-red-400 ring-2 ring-red-200"
                          : phoneTouched &&
                              !phoneInputError &&
                              formData.phone.trim()
                            ? "border-[#5A1E12]/60"
                            : "border-[#5A1E12]/20 focus-within:border-[#5A1E12] focus-within:ring-2 focus-within:ring-[#5A1E12]/20"
                      }`}
                    >
                      <button
                        type="button"
                        ref={phonePickerBtnRef}
                        onClick={() => {
                          if (phonePickerBtnRef.current) {
                            const r =
                              phonePickerBtnRef.current.getBoundingClientRect();
                            setPhoneDropdownCoords({
                              top: r.bottom + 4,
                              left: r.left,
                              width: Math.max(r.width, 280),
                            });
                          }
                          setShowPhoneDropdown((v) => !v);
                          setPhoneSearch("");
                        }}
                        className="flex items-center gap-1.5 px-3 h-full text-sm font-medium border-r border-[#5A1E12]/20 hover:bg-[#5A1E12]/5 transition rounded-l-xl shrink-0 py-2.5"
                      >
                        <ReactCountryFlag
                          countryCode={phoneCountry.code}
                          svg
                          style={{
                            width: "20px",
                            height: "14px",
                            borderRadius: "2px",
                            objectFit: "cover",
                          }}
                          title={phoneCountry.name}
                        />
                        <span className="text-[#5A1E12] text-xs font-semibold">
                          {phoneCountry.dialCode}
                        </span>
                        <span className="text-[#5A1E12]/40 text-xs">▾</span>
                      </button>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={(e) => {
                          const v = e.target.value.replace(/[^\d\s\-().]/g, "");
                          setFormData((prev) => ({ ...prev, phone: v }));
                          if (errors.phone)
                            setErrors((prev) => ({ ...prev, phone: "" }));
                          if (phoneTouched)
                            setPhoneInputError(validatePhone(v, phoneCountry));
                        }}
                        onBlur={() => {
                          setPhoneTouched(true);
                          setPhoneInputError(
                            validatePhone(formData.phone, phoneCountry),
                          );
                        }}
                        placeholder={
                          phoneCountry.digits[0] === phoneCountry.digits[1]
                            ? `${phoneCountry.digits[0]}-digit number`
                            : `${phoneCountry.digits[0]}–${phoneCountry.digits[1]}-digit number`
                        }
                        className="flex-1 px-4 py-2.5 text-sm text-[#5A1E12] bg-transparent outline-none placeholder-[#5A1E12]/40"
                      />
                    </div>
                    {showPhoneDropdown && (
                      <div
                        ref={phonePanelRef}
                        style={{
                          position: "fixed",
                          top: phoneDropdownCoords.top,
                          left: phoneDropdownCoords.left,
                          minWidth: "280px",
                          zIndex: 99999,
                        }}
                        className="bg-white border border-[#5A1E12]/20 rounded-xl shadow-2xl overflow-hidden"
                      >
                        <div className="p-2 border-b border-[#5A1E12]/10">
                          <input
                            type="text"
                            autoFocus
                            value={phoneSearch}
                            onChange={(e) => setPhoneSearch(e.target.value)}
                            placeholder="Search country…"
                            className="w-full px-3 py-2 text-sm border border-[#5A1E12]/20 rounded-lg outline-none focus:border-[#5A1E12] bg-white text-[#5A1E12]"
                          />
                        </div>
                        <ul className="max-h-60 overflow-y-auto">
                          {COUNTRIES.filter(
                            (c) =>
                              c.name
                                .toLowerCase()
                                .includes(phoneSearch.toLowerCase()) ||
                              c.dialCode.includes(phoneSearch),
                          ).map((c) => (
                            <li key={c.code}>
                              <button
                                type="button"
                                onClick={() => {
                                  setPhoneCountry(c);
                                  setShowPhoneDropdown(false);
                                  setPhoneSearch("");
                                  if (phoneTouched)
                                    setPhoneInputError(
                                      validatePhone(formData.phone, c),
                                    );
                                  if (errors.phone)
                                    setErrors((prev) => ({
                                      ...prev,
                                      phone: "",
                                    }));
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-[#5A1E12]/5 text-left transition ${c.code === phoneCountry.code ? "bg-[#5A1E12]/10 font-medium text-[#5A1E12]" : "text-gray-700"}`}
                              >
                                <ReactCountryFlag
                                  countryCode={c.code}
                                  svg
                                  style={{
                                    width: "20px",
                                    height: "14px",
                                    borderRadius: "2px",
                                    objectFit: "cover",
                                  }}
                                  title={c.name}
                                />
                                <span className="flex-1 truncate">
                                  {c.name}
                                </span>
                                <span className="text-[#5A1E12]/50 text-xs shrink-0">
                                  {c.dialCode}
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                  )}
                  {!errors.phone && phoneTouched && phoneInputError && (
                    <p className="mt-1 text-xs text-red-500">
                      {phoneInputError}
                    </p>
                  )}
                  {!errors.phone &&
                    phoneTouched &&
                    !phoneInputError &&
                    formData.phone.trim() && (
                      <p className="mt-1 text-xs text-[#5A1E12]">
                        ✓ Looks good
                      </p>
                    )}
                </div>
                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-sm text-red-800">{errors.submit}</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 2 */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <h3 className="text-xl font-semibold text-[#5A1E12] mb-4">
                  Set Your Password
                </h3>
                <PasswordField
                  label="Password *"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Set your password"
                  inputCls={inputCls("password")}
                  error={errors.password}
                />

                <PasswordStrengthIndicator password={formData.password} variant="light" />

                <PasswordField
                  label="Confirm Password *"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Re-enter your password"
                  inputCls={inputCls("confirmPassword")}
                  error={errors.confirmPassword}
                />
                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-sm text-red-800">{errors.submit}</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3 */}
            {currentStep === 3 && (
              <div className="space-y-5">
                <h3 className="text-xl font-semibold text-[#5A1E12] mb-4">
                  Business/Artists Information
                </h3>
                <div>
                  <label className={labelCls}>
                    Business Summary{" "}
                    <span className="text-[#5A1E12]/60 font-normal">
                      (Optional)
                    </span>
                  </label>
                  <input
                    type="text"
                    name="artistName"
                    value={formData.artistName}
                    onChange={handleInputChange}
                    placeholder="e.g. Electronics Store, Traditional Antique"
                    className={inputCls("artistName")}
                  />
                  {errors.artistName && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.artistName}
                    </p>
                  )}
                </div>
                <div>
                  <label className={labelCls}>
                    Description{" "}
                    <span className="text-[#5A1E12]/60 font-normal">
                      (Optional)
                    </span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={6}
                    placeholder="Tell us about your Business/Artists…"
                    className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A1E12]/40 bg-white text-[#5A1E12] placeholder-[#5A1E12]/40 resize-none transition-all ${errors.description ? "border-red-400" : "border-[#5A1E12]/20"}`}
                  />
                  {errors.description && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.description}
                    </p>
                  )}
                </div>
                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-sm text-red-800">{errors.submit}</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 4 */}
            {currentStep === 4 && (
              <div className="space-y-5">
                <h3 className="text-xl font-semibold text-[#5A1E12] mb-4">
                  Store Profile
                </h3>
                <div>
                  <label className={labelCls}>Store Name *</label>
                  <input
                    type="text"
                    name="storeName"
                    value={formData.storeName}
                    onChange={handleInputChange}
                    placeholder="Store Name"
                    className={inputCls("storeName")}
                  />
                  {errors.storeName && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.storeName}
                    </p>
                  )}
                </div>
                <div>
                  <label className={labelCls}>Store Logo <span className="text-[#5A1E12]/40 font-normal">(optional)</span></label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "storeLogo")}
                    className="block w-full text-sm text-[#5A1E12]/60 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#5A1E12]/10 file:text-[#5A1E12] hover:file:bg-[#5A1E12]/20 cursor-pointer"
                  />
                  {formData.storeLogo && (
                    <div className="w-20 h-20 bg-[#EAD7B7]/40 rounded-lg overflow-hidden mt-2 border border-[#5A1E12]/20">
                      <img
                        src={URL.createObjectURL(formData.storeLogo)}
                        alt="Logo preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {errors.storeLogo && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.storeLogo}
                    </p>
                  )}
                </div>
                <div>
                  <label className={labelCls}>Store Bio *</label>
                  <textarea
                    name="storeBio"
                    value={formData.storeBio}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Tell customers about your art…"
                    className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A1E12]/40 bg-white text-[#5A1E12] placeholder-[#5A1E12]/40 resize-none transition-all ${errors.storeBio ? "border-red-400" : "border-[#5A1E12]/20"}`}
                  />
                  {errors.storeBio && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.storeBio}
                    </p>
                  )}
                </div>

                {/* ABN */}
                <div>
                  <label className={labelCls}>Australian Business Number (ABN) *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="abn"
                      value={formData.abn}
                      onChange={(e) => {
                        handleInputChange(e);
                        setAbnValidated(false);
                        setAbnInfo(null);
                        setErrors((p) => ({ ...p, abn: "" }));
                      }}
                      placeholder="e.g. 51 824 753 556"
                      maxLength={14}
                      className={`${inputCls("abn")} flex-1`}
                    />
                    {abnValidated ? (
                      <div className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-green-100 text-green-700 border border-green-300 whitespace-nowrap">
                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Validated
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleValidateAbn}
                        disabled={abnValidating || !formData.abn?.trim()}
                        className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#5A1E12] text-white disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {abnValidating ? "Checking…" : "Validate"}
                      </button>
                    )}
                  </div>
                  {errors.abn && (
                    <p className="mt-1 text-xs text-red-600">{errors.abn}</p>
                  )}
                  {abnValidated && abnInfo && (
                    <div className="mt-2 p-3 rounded-lg bg-green-50 border border-green-200 flex items-start gap-2">
                      <svg className="w-4 h-4 text-green-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <div className="text-xs text-green-800 space-y-0.5">
                        <p className="font-semibold">ABN Verified</p>
                        {(abnInfo.businessName || abnInfo.entityName) && (
                          <p>{abnInfo.businessName || abnInfo.entityName}</p>
                        )}
                        {abnInfo.gst && <p>GST Registered: {abnInfo.gst}</p>}
                      </div>
                    </div>
                  )}
                  {!abnValidated && (
                    <p className="mt-1 text-xs text-[#5A1E12]/50">
                      Your ABN will be verified with the Australian Business Register and shown on tax invoices.
                    </p>
                  )}
                </div>

                {/* Business Address */}
                <div>
                  <p className="block text-sm font-semibold text-[#5A1E12] mb-2">Business Address *</p>
                  <div className="space-y-3">
                    <div>
                      <input
                        type="text"
                        name="street"
                        value={formData.street}
                        onChange={handleInputChange}
                        placeholder="Street address"
                        className={inputCls("street")}
                      />
                      {errors.street && <p className="mt-1 text-xs text-red-600">{errors.street}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="City / Suburb"
                          className={inputCls("city")}
                        />
                        {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city}</p>}
                      </div>
                      <div>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          placeholder="State (e.g. NT)"
                          className={inputCls("state")}
                        />
                        {errors.state && <p className="mt-1 text-xs text-red-600">{errors.state}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input
                          type="text"
                          name="postcode"
                          value={formData.postcode}
                          onChange={handleInputChange}
                          placeholder="Postcode"
                          maxLength={4}
                          className={inputCls("postcode")}
                        />
                        {errors.postcode && <p className="mt-1 text-xs text-red-600">{errors.postcode}</p>}
                      </div>
                      <div>
                        <input
                          type="text"
                          name="country"
                          value={formData.country || "Australia"}
                          onChange={handleInputChange}
                          placeholder="Country"
                          className={inputCls("country")}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-sm text-red-800">{errors.submit}</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 5 — One-time code Verification */}
            {currentStep === 5 && (
              <div className="space-y-5">
                <h3 className="text-xl font-semibold text-[#5A1E12] mb-4">
                  Verify Your Application
                </h3>
                <div className="bg-[#5A1E12]/5 border border-[#5A1E12]/20 rounded-xl p-4">
                  <p className="text-sm text-[#5A1E12]">
                    A one-time code has been sent to{" "}
                    <strong>{formData.email}</strong>. Enter it below to
                    complete your application.
                  </p>
                  <p className="text-xs text-[#5A1E12]/60 mt-1.5">
                    This code is valid for <strong>10 minutes</strong>.
                  </p>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className={labelCls}>One-time code *</label>
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={loading || !isResendEnabled}
                      aria-disabled={loading || !isResendEnabled}
                      className="text-sm font-semibold text-[#5A1E12] underline disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 enabled:hover:text-[#5A1E12]/70"
                    >
                      {loading ? "Sending…" : "Resend code"}
                    </button>
                    {countdown > 0 && (
                      <p className="text-xs text-[#5A1E12]/70">
                        Resend code in {countdown}s
                      </p>
                    )}
                  </div>
                  <input
                    type="text"
                    name="otp"
                    value={formData.otp}
                    onChange={handleInputChange}
                    placeholder="Enter one-time code"
                    className={inputCls("otp")}
                  />
                  {errors.otp && (
                    <p className="mt-1 text-xs text-red-600">{errors.otp}</p>
                  )}
                  {errors.otp === OTP_RECOVERY_MESSAGE && (
                    <button
                      type="button"
                      onClick={goBackFromOtpStep}
                      className="mt-2 text-sm font-semibold text-[#5A1E12] underline hover:text-[#5A1E12]/70"
                    >
                      Go back and resend code
                    </button>
                  )}
                </div>
                {successMessage && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                    <p className="text-sm text-green-800">{successMessage}</p>
                  </div>
                )}
                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-sm text-red-800">{errors.submit}</p>
                    {errors.submit === OTP_RECOVERY_MESSAGE && (
                      <button
                        type="button"
                        onClick={goBackFromOtpStep}
                        className="mt-2 text-sm font-semibold text-[#5A1E12] underline hover:text-[#5A1E12]/70"
                      >
                        Go back and resend code
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 6 — Connect Stripe Account */}
            {currentStep === 6 && (
              <div className="space-y-6">

                {/* Fee summary card — full width, at top */}
                <div className="border border-[#5A1E12]/20 rounded-xl p-5">
                  <p className="text-base font-bold text-[#5A1E12] mb-3">Before you connect: quick summary</p>
                  <p className="text-sm font-semibold text-[#5A1E12] mb-2">What it costs</p>
                  <div className="rounded-xl border border-[#5A1E12]/20 overflow-hidden">
                    <table className="w-full table-fixed text-sm border-collapse">
                      <thead>
                        <tr>
                          <th className="w-[34%] text-left px-3 py-2.5 font-semibold text-[#5A1E12] border-b border-r border-[#5A1E12]/20 bg-[#f5ede8]">
                            Fee Type
                          </th>
                          <th className="text-left px-3 py-2.5 font-semibold text-[#5A1E12] border-b border-[#5A1E12]/20 bg-[#f5ede8]">
                            Description
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {feeSummaryRows.map((row, index) => (
                          <tr key={index} className="align-top">
                            <td className="px-3 py-3 text-[#5A1E12]/80 border-r border-[#5A1E12]/20 wrap-break-word">
                              {row.title}
                            </td>
                            <td className="px-3 py-3 text-[#5A1E12]/80 wrap-break-word leading-relaxed">
                              {row.description}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 rounded-xl border border-[#5A1E12]/15 bg-[#FCF7F1] px-4 py-3">
                    <p className="text-sm text-[#5A1E12]/80 leading-relaxed">
                      To see more details{" "}
                      <button
                        type="button"
                        onClick={() => setShowFeeDetails(true)}
                        className="font-semibold text-[#5A1E12] underline underline-offset-2 hover:text-[#4a180f] transition-colors"
                      >
                        Click here
                      </button>
                      .
                    </p>
                  </div>
                  <p className="mt-3 text-xs text-[#5A1E12]/60 italic leading-relaxed">
                    Commission on product price only (excl. GST &amp; shipping).<br />
                    Stripe fees charged by Stripe.{" "}
                    <a
                      href="https://madeinarnhemland.com.au/fees-and-commission"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="not-italic font-semibold text-[#5A1E12] underline underline-offset-2 hover:text-[#4a180f] transition-colors"
                    >
                      See full fees →
                    </a>
                  </p>
                </div>

                {showFeeDetails &&
                  createPortal(
                    <div
                      className="fixed left-0 top-0 z-9999 flex h-dvh w-dvw items-start justify-center overflow-y-auto bg-black/50 p-3 py-4 sm:items-center sm:p-6"
                      onClick={(event) => {
                        if (event.target === event.currentTarget) {
                          setShowFeeDetails(false);
                        }
                      }}
                    >
                      <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="fee-details-title"
                        className="relative flex max-h-[calc(100dvh-2rem)] w-[calc(100vw-1.5rem)] max-w-6xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl sm:max-h-[calc(100dvh-3rem)] sm:w-full sm:rounded-2xl"
                      >
                        <div className="flex items-start justify-between gap-4 border-b border-[#5A1E12]/15 px-4 py-3 sm:px-6 sm:py-4">
                          <h4
                            id="fee-details-title"
                            className="text-base font-bold text-[#5A1E12] sm:text-lg"
                          >
                            Fees and charges details
                          </h4>
                          <button
                            type="button"
                            onClick={() => setShowFeeDetails(false)}
                            className="shrink-0 rounded-full border border-[#5A1E12]/20 px-3 py-1 text-sm font-semibold text-[#5A1E12] transition-colors hover:bg-[#f5ede8]"
                          >
                            Close
                          </button>
                        </div>
                        <div className="overflow-y-auto p-4 sm:p-6">
                          <div className="max-w-full overflow-x-auto rounded-xl border border-[#5A1E12]/20">
                            <table className="w-full min-w-180 border-collapse text-xs sm:min-w-225 sm:text-sm lg:min-w-275">
                              <thead>
                                <tr className="bg-[#5A1E12]">
                                  <th className="border border-[#5A1E12]/30 px-3 py-3 text-left font-bold text-white sm:px-4">
                                    Fee / Charge
                                  </th>
                                  <th className="border border-[#5A1E12]/30 px-3 py-3 text-left font-bold text-white sm:px-4">
                                    Amount / Basis
                                  </th>
                                  <th className="border border-[#5A1E12]/30 px-3 py-3 text-left font-bold text-white sm:px-4">
                                    Charged By
                                  </th>
                                  <th className="border border-[#5A1E12]/30 px-3 py-3 text-left font-bold text-white sm:px-4">
                                    Notes
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {feeDetailRows.map((row, index) => (
                                  <tr key={index} className={`align-top ${index % 2 === 0 ? "bg-white" : "bg-[#EAD7B7]/20"}`}>
                                    <td className="border border-[#5A1E12]/15 px-3 py-3 text-[#2C1810] sm:px-4 sm:py-4">
                                      {row.feeCharge}
                                    </td>
                                    <td className="border border-[#5A1E12]/15 px-3 py-3 text-[#2C1810] sm:px-4 sm:py-4">
                                      {row.amountBasis}
                                    </td>
                                    <td className="border border-[#5A1E12]/15 px-3 py-3 text-[#2C1810] sm:px-4 sm:py-4">
                                      {row.chargedBy}
                                    </td>
                                    <td className="border border-[#5A1E12]/15 px-3 py-3 text-[#2C1810] sm:px-4 sm:py-4">
                                      {row.notes}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <p className="mt-4 text-sm text-[#5A1E12]/80">
                            {feeDetailFootnote}
                          </p>
                        </div>
                      </div>
                    </div>,
                    document.body,
                  )}

                {/* Set up payout account */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#5A1E12]">Set up your payout account</h3>
                    <p className="text-sm text-[#5A1E12]/70 leading-relaxed mt-1.5">
                      To receive payments from your sales, create a Stripe account. Stripe securely handles your identity verification and debit card details. Click below to complete the setup.
                    </p>
                  </div>


                  {stripeLoading && (
                    <div className="flex items-center gap-2 p-3 bg-[#5A1E12]/5 border border-[#5A1E12]/20 rounded-xl">
                      <div className="w-4 h-4 border-2 border-[#5A1E12] border-t-transparent rounded-full animate-spin shrink-0" />
                      <p className="text-sm text-[#5A1E12]">Checking your Stripe status…</p>
                    </div>
                  )}

                  {!stripeLoading && stripeStatus?.stripeOnboardingComplete && stripeStatus?.stripeChargesEnabled && (
                    <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-300 rounded-xl">
                      <span className="text-green-600 text-base mt-0.5">✓</span>
                      <div>
                        <p className="text-sm font-semibold text-green-800">Stripe account connected</p>
                        <p className="text-xs text-green-700 mt-0.5">Your payout account is active and ready.</p>
                      </div>
                    </div>
                  )}
{/* Stripe */}
                  {!stripeLoading && stripeStatus?.connected && (!stripeStatus?.stripeOnboardingComplete || !stripeStatus?.stripeChargesEnabled) && (
                    <div className="space-y-3">
                      <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-300 rounded-xl">
                        <span className="text-amber-600 text-base mt-0.5">⚠</span>
                        <div>
                          <p className="text-sm font-semibold text-amber-800">Stripe setup incomplete</p>
                          <p className="text-xs text-amber-700 mt-0.5">Additional information required before you can receive payouts.</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleConnectStripe}
                        disabled={stripeLoading}
                        className="px-8 py-3 bg-[#5A1E12] hover:bg-[#4a180f] text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
                      >
                        Continue Stripe Setup
                      </button>
                    </div>
                  )}

                  {!stripeLoading && !stripeStatus?.connected && (
                    <button
                      type="button"
                      onClick={handleConnectStripe}
                      disabled={stripeLoading}
                      className="px-8 py-3 bg-[#5A1E12] hover:bg-[#4a180f] text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
                    >
                      Create Stripe Account
                    </button>
                  )}

                  {errors.stripe && (
                    <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{errors.stripe}</p>
                  )}
                  {errors.submit && (
                    <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{errors.submit}</p>
                  )}
                </div>

                {/* What happens next */}
                <div className="border-t border-[#5A1E12]/15 pt-5">
                  <h4 className="text-base font-bold text-[#5A1E12] mb-1.5">What happens next</h4>
                  <p className="text-sm text-[#5A1E12]/70 leading-relaxed">
                    Once verification is complete, your seller account gets activated and you can start listing products. We&apos;ll email you to confirm.
                  </p>
                </div>

                {/* Good to know */}
                <div className="border-t border-[#5A1E12]/15 pt-5">
                  <h4 className="text-base font-bold text-[#5A1E12] mb-4">Good to know</h4>
                  <div className="border border-[#5A1E12]/20 rounded-xl p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {[
                        {
                          text: (<>You&apos;ll need an Australian Visa<br />or Mastercard debit card.</>),
                          icon: (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                              <rect x="2" y="5" width="20" height="14" rx="2" />
                              <line x1="2" y1="10" x2="22" y2="10" />
                            </svg>
                          ),
                        },
                        {
                          text: (<>Payouts reach your card<br />in around 30 minutes.</>),
                          icon: (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                          ),
                        },
                        {
                          text: (<>Your first payout is held<br />7–14 days by Stripe.</>),
                          icon: (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                              <rect x="3" y="4" width="18" height="18" rx="2" />
                              <line x1="16" y1="2" x2="16" y2="6" />
                              <line x1="8" y1="2" x2="8" y2="6" />
                              <line x1="3" y1="10" x2="21" y2="10" />
                              <polyline points="9 16 11 18 15 14" />
                            </svg>
                          ),
                        },
                        {
                          text: (<>KYC takes ~5–10 min —<br />save the email &amp; password you use.</>),
                          icon: (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                              <polyline points="9 12 11 14 15 10" />
                            </svg>
                          ),
                        },
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="shrink-0 w-10 h-10 rounded-xl bg-[#EAD7B7]/80 border border-[#5A1E12]/15 flex items-center justify-center text-[#5A1E12]">
                            {item.icon}
                          </div>
                          <p className="text-sm text-[#5A1E12]/80 leading-snug pt-1.5">{item.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-[#5A1E12]/15">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 1 || currentStep === 6}
                className={`px-4 py-2.5 text-sm sm:px-6 sm:py-3 sm:text-base rounded-xl font-semibold transition-all shadow-sm border ${currentStep === 1 || currentStep === 6 ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed" : "border-[#5A1E12]/30 bg-[#EAD7B7] text-[#5A1E12] hover:bg-[#5A1E12]/10"}`}
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={loading || (currentStep === 6 && stripeLoading)}
                className={`px-5 py-2.5 text-sm sm:px-8 sm:py-3 sm:text-base text-white rounded-xl font-semibold shadow transition-all ${
                  loading || (currentStep === 6 && stripeLoading)
                    ? "bg-[#5A1E12]/40 cursor-not-allowed"
                    : "bg-[#5A1E12] hover:bg-[#4a180f]"
                }`}
              >
                {currentStep === 5
                  ? loading
                    ? "Verifying…"
                    : "Verify and Submit"
                  : currentStep === 6
                    ? loading
                      ? "Finishing…"
                      : "Complete Setup"
                    : loading
                      ? "Processing…"
                      : "Next Step"}
              </button>
            </div>
          </div>

          {/* Step Dots */}
          <div className="mt-6 flex justify-center space-x-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index + 1)}
                title={`Step ${index + 1}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer hover:scale-150 ${index + 1 === currentStep ? "bg-[#5A1E12] w-8" : index + 1 < currentStep ? "bg-[#5A1E12]/50 w-2" : "bg-[#5A1E12]/20 w-2"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
