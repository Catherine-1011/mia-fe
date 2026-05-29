"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { getCountries, getCountryCallingCode } from "react-phone-number-input";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://alpa-be.onrender.com";

// Known digit lengths per country (national number, excluding country code)
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

function validatePhone(digits: string, country: Country): string | null {
  const clean = digits.replace(/\D/g, "");
  if (!clean) return "Mobile number is required";

  // Australia: ONLY two valid forms:
  //   - exactly 9 digits NOT starting with 0  (e.g. 412345678)
  //   - exactly 10 digits starting with 0     (e.g. 0412345678)
  if (country.code === "AU") {
    if (clean.length === 9 && !clean.startsWith("0")) return null;
    if (clean.length === 10 && clean.startsWith("0")) return null;
    if (clean.length < 9 || (clean.length === 9 && clean.startsWith("0")))
      return "Too short — enter 9 digits without leading 0, or 10 digits starting with 0";
    if (clean.length > 10)
      return "Too long — Australian numbers are at most 10 digits";
    if (clean.length === 10 && !clean.startsWith("0"))
      return "10-digit Australian numbers must start with 0";
    return "Invalid format — enter 9 digits (e.g. 412345678) or 10 starting with 0 (e.g. 0412345678)";
  }

  const [min, max] = country.digits;
  if (clean.length < min)
    return `Too short — ${country.name} numbers need ${min} digits`;
  if (clean.length > max)
    return `Too long — ${country.name} numbers need ${max} digits`;
  return null;
}

function validateEmail(email: string): string | null {
  if (!email.trim()) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email.trim()))
    return "Please enter a valid email address";
  return null;
}

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Field-level touched state
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
    phone: false,
  });

  // Phone state
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    () => COUNTRIES.find((c) => c.code === "AU") ?? COUNTRIES[0]
  );
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countrySearch, setCountrySearch] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const role = "customer";

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(e.target as Node)
      ) {
        setShowCountryDropdown(false);
        setCountrySearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Inline validation errors
  const emailError = validateEmail(formData.email);
  const phoneError = validatePhone(phoneNumber, selectedCountry);
  const passwordError =
    formData.password.length > 0 && formData.password.length < 6
      ? "Password must be at least 6 characters"
      : null;
  const confirmPwError =
    formData.confirmPassword && formData.password !== formData.confirmPassword
      ? "Passwords do not match"
      : null;

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.dialCode.includes(countrySearch),
  );

  const touchField = (f: keyof typeof touched) =>
    setTouched((prev) => ({ ...prev, [f]: true }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value.replace(/[^\d\s\-().]/g, ""));
  };

  const validateForm = () => {
    // Touch all fields to show errors
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
      phone: true,
    });

    if (!formData.name.trim()) {
      setError("Name is required");
      return false;
    }
    if (emailError) {
      setError(emailError);
      return false;
    }
    if (phoneError) {
      setError(phoneError);
      return false;
    }
    if (!formData.password) {
      setError("Password is required");
      return false;
    }
    if (passwordError) {
      setError(passwordError);
      return false;
    }
    if (!formData.confirmPassword) {
      setError("Please confirm your password");
      return false;
    }
    if (confirmPwError) {
      setError(confirmPwError);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          mobile: (() => {
            // For AU: strip leading 0 before combining with +61
            const digits = phoneNumber.replace(/\D/g, "");
            const normalized =
              selectedCountry.code === "AU" && digits.startsWith("0")
                ? digits.slice(1)
                : digits;
            return `${selectedCountry.dialCode} ${normalized}`.trim();
          })(),
          role,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");

      router.push(`/signup-otp?email=${encodeURIComponent(formData.email)}`);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper: input border class
  const inputClass = (
    touchedFlag: boolean,
    err: string | null,
    value: string,
  ) => {
    const base =
      "w-full rounded-full px-4 py-3 bg-[#873007] text-white placeholder-gray-400 border focus:outline-none focus:ring-1 transition-all text-sm";
    if (!touchedFlag)
      return `${base} border-white/10 focus:border-white/30 focus:ring-white/20`;
    if (err)
      return `${base} border-red-400 focus:border-red-400 focus:ring-red-400/20`;
    if (value)
      return `${base} border-emerald-400/70 focus:border-emerald-400 focus:ring-emerald-400/20`;
    return `${base} border-white/10 focus:border-white/30 focus:ring-white/20`;
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden text-white">
      <Image
        src="/images/top2.jpg"
        alt="Auth Visual"
        fill
        className="hidden object-contain object-[150%_center] lg:block"
        priority
      />
      <div className="absolute inset-0 bg-[#440C03] lg:hidden" />
      <div className="absolute inset-0 hidden lg:block bg-[linear-gradient(90deg,#440C03_0%,#440C03_44%,rgba(68,12,3,0.55)_68%,rgba(68,12,3,0)_100%)]" />

      <section className="relative z-10 flex min-h-screen w-full items-start px-6 md:pt-20 pt-10 pb-12 sm:px-10 md:px-16 lg:px-20">
        <div className="w-full max-w-lg md:pl-20">
        <div className="relative mb-6 md:mb-0 md:absolute md:top-6 md:left-8">
          <Link href="/">
            <Image
              src="/images/navbarLogo.png"
              alt="Logo"
              width={90}
              height={90}
              className="w-14 h-14 md:w-20 md:h-20 hover:opacity-90 transition-opacity"
            />
          </Link>
        </div>

        <div className="w-full">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Create new Account
          </h1>
          <div className="pt-3 border-t border-white/10 flex items-center gap-3">
            <p className="text-sm opacity-80">Already have an account?</p>
            <Link
              href="/login"
              className="px-5 py-1.5 border border-white/30 rounded-full text-sm font-semibold hover:bg-white hover:text-[#440C03] transition-all"
            >
              Login
            </Link>
          </div>

          <form className="space-y-4 mt-8" onSubmit={handleSubmit}>
            {/* Name */}
            <div className="space-y-1">
              <p className="text-white/90 text-sm font-medium">Name</p>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={() => touchField("name")}
                placeholder="Enter your full name"
                required
                className={inputClass(
                  touched.name,
                  !formData.name.trim() ? "required" : null,
                  formData.name,
                )}
              />
              {touched.name && !formData.name.trim() && (
                <p className="text-xs text-red-400 flex items-center gap-1 pl-2">
                  ✕ Name is required
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1">
              <p className="text-white/90 text-sm font-medium">Email</p>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => touchField("email")}
                placeholder="Enter your email address"
                type="text"
                required
                className={inputClass(
                  touched.email,
                  emailError,
                  formData.email,
                )}
              />
              {touched.email && emailError && (
                <p className="text-xs text-red-400 flex items-center gap-1 pl-2">
                  ✕ {emailError}
                </p>
              )}
              {touched.email && !emailError && formData.email && (
                <p className="text-xs text-emerald-400 flex items-center gap-1 pl-2">
                  ✓ Looks good
                </p>
              )}
            </div>

            {/* Mobile — country code + number */}
            <div className="space-y-1" ref={countryDropdownRef}>
              <p className="text-white/90 text-sm font-medium">Mobile No</p>
              <div
                className={`flex items-stretch rounded-full overflow-visible border transition-all ${
                  touched.phone && phoneError
                    ? "border-red-400"
                    : touched.phone && !phoneError && phoneNumber.trim()
                      ? "border-emerald-400/70"
                      : "border-white/10 focus-within:border-white/30"
                } bg-[#873007]`}
              >
                {/* Country picker button */}
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCountryDropdown((v) => !v);
                      setCountrySearch("");
                    }}
                    className="flex items-center gap-1.5 px-3 h-full text-sm font-medium border-r border-white/20 hover:bg-white/10 transition rounded-l-full"
                  >
                    <img
                      src={`https://flagcdn.com/w20/${selectedCountry.code.toLowerCase()}.png`}
                      srcSet={`https://flagcdn.com/w40/${selectedCountry.code.toLowerCase()}.png 2x`}
                      width={20}
                      height={14}
                      alt={selectedCountry.name}
                      className="rounded-sm object-cover"
                    />
                    <span className="text-white/80 text-xs">
                      {selectedCountry.dialCode}
                    </span>
                    <span className="text-white/50 text-xs">▾</span>
                  </button>

                  {showCountryDropdown && (
                    <div className="absolute top-full left-0 z-50 mt-1 w-64 bg-white border border-[#d6b896] rounded-xl shadow-xl overflow-hidden">
                      <div className="p-2 border-b border-[#e8d5bc]">
                        <input
                          type="text"
                          autoFocus
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          placeholder="Search country…"
                          className="w-full px-3 py-2 text-sm border border-[#d6b896] rounded-lg outline-none focus:border-[#5A1E12] bg-white text-gray-900"
                        />
                      </div>
                      <ul className="max-h-52 overflow-y-auto">
                        {filteredCountries.map((c) => (
                          <li key={c.code}>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCountry(c);
                                setShowCountryDropdown(false);
                                setCountrySearch("");
                              }}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-[#5A1E12]/5 text-left transition ${
                                c.code === selectedCountry.code
                                  ? "bg-[#5A1E12]/10 font-medium text-[#5A1E12]"
                                  : "text-gray-700"
                              }`}
                            >
                              <img
                                src={`https://flagcdn.com/w20/${c.code.toLowerCase()}.png`}
                                srcSet={`https://flagcdn.com/w40/${c.code.toLowerCase()}.png 2x`}
                                width={20}
                                height={14}
                                alt={c.name}
                                className="w-6 h-4 rounded-sm object-cover shrink-0"
                              />
                              <span className="flex-1 truncate">{c.name}</span>
                              <span className="text-gray-400 text-xs shrink-0">
                                {c.dialCode}
                              </span>
                            </button>
                          </li>
                        ))}
                        {filteredCountries.length === 0 && (
                          <li className="px-3 py-4 text-sm text-gray-400 text-center">
                            No countries found
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>

                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  onBlur={() => touchField("phone")}
                  placeholder={
                    selectedCountry.code === "AU"
                      ? "9-digit number (or 0X XXXX XXXX)"
                      : `${selectedCountry.digits[0]}-digit number`
                  }
                  className="flex-1 px-4 py-3 text-sm text-white bg-transparent outline-none placeholder:text-gray-400 rounded-r-full"
                />
              </div>
              {touched.phone && phoneError && (
                <p className="text-xs text-red-400 flex items-center gap-1 pl-2">
                  ✕ {phoneError}
                </p>
              )}
              {touched.phone && !phoneError && phoneNumber.trim() && (
                <p className="text-xs text-emerald-400 flex items-center gap-1 pl-2">
                  ✓ Looks good
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <p className="text-white/90 text-sm font-medium">Password</p>
              <div className="relative">
                <input
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => touchField("password")}
                  placeholder="Create a password (min 6 characters)"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  className={`${inputClass(touched.password, passwordError, formData.password)} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {touched.password && passwordError && (
                <p className="text-xs text-red-400 flex items-center gap-1 pl-2">
                  ✕ {passwordError}
                </p>
              )}
              {touched.password && !passwordError && formData.password && (
                <p className="text-xs text-emerald-400 flex items-center gap-1 pl-2">
                  ✓ Strong enough
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <p className="text-white/90 text-sm font-medium">
                Confirm Password
              </p>
              <div className="relative">
                <input
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={() => touchField("confirmPassword")}
                  placeholder="Confirm your password"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  className={`${inputClass(touched.confirmPassword, confirmPwError, formData.confirmPassword)} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                  tabIndex={-1}
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {touched.confirmPassword && confirmPwError && (
                <p className="text-xs text-red-400 flex items-center gap-1 pl-2">
                  ✕ {confirmPwError}
                </p>
              )}
              {touched.confirmPassword &&
                !confirmPwError &&
                formData.confirmPassword && (
                  <p className="text-xs text-emerald-400 flex items-center gap-1 pl-2">
                    ✓ Passwords match
                  </p>
                )}
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-lg">
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 text-red-400 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-red-300 text-xs font-medium">{error}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-[#7A2F12] font-semibold rounded-full py-3 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-4 w-4 mr-2"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Creating Account...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  Sign Up
                  <svg
                    className="ml-2 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </span>
              )}
            </button>
          </form>
        </div>
        </div>
      </section>
    </main>
  );
}
