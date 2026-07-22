"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { Loader2, Tag, X, CheckCircle, ChevronRight, ChevronDown } from "lucide-react";
import ReactCountryFlag from "react-country-flag";
import { useSharedEnhancedCart } from "@/hooks/useSharedEnhancedCart";
import { sellerCouponsApi, AppliedSellerCoupon } from "@/lib/api";
import { guestCartUtils } from "@/lib/guestCartUtils";
import GuestStripePaymentForm from "@/components/checkout/GuestStripePaymentForm";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { getCountries, getCountryCallingCode } from "react-phone-number-input/input";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import type { CountryCode } from "libphonenumber-js";

interface MapboxFeature {
  id: string;
  place_name: string;
  text: string;
  address?: string;
  context?: Array<{ id: string; text: string; short_code?: string }>;
}

// ─── Dynamic location types ───────────────────────────────────────────────
interface ApiCountry {
  id: number; name: string; iso2: string; phone_code: string;
}
interface ApiState {
  id: number; name: string; iso2: string;
}
interface ApiCity {
  id: number; name: string;
}

// Module-level cache shared with addressCart
let cachedGuestCountries: ApiCountry[] = [];

// Dynamic label terminology
const addressTerminology: Record<string, { state: string; city: string; postcode: string | null }> = {
  AU: { state: "State/Territory", city: "Suburb",        postcode: "Postcode"    },
  US: { state: "State",           city: "City",          postcode: "ZIP Code"    },
  CA: { state: "Province",        city: "City",          postcode: "Postal Code" },
  GB: { state: "County",          city: "Town/City",     postcode: "Postcode"    },
  IN: { state: "State",           city: "City",          postcode: "PIN Code"    },
  NZ: { state: "Region",          city: "Suburb/City",   postcode: "Postcode"    },
  IE: { state: "County",          city: "Town/City",     postcode: "Eircode"     },
  JP: { state: "Prefecture",      city: "City/Ward",     postcode: "Postal Code" },
  BR: { state: "State",           city: "City",          postcode: "CEP"         },
  MX: { state: "State",           city: "City",          postcode: "Código Postal" },
  // No postal code
  AE: { state: "Emirate",         city: "Area/District", postcode: null },
  HK: { state: "District",        city: "Area",          postcode: null },
  QA: { state: "Municipality",    city: "Area",          postcode: null },
  KW: { state: "Governorate",     city: "Area",          postcode: null },
  BH: { state: "Governorate",     city: "City",          postcode: null },
  JM: { state: "Parish",          city: "City",          postcode: null },
  TT: { state: "Region",          city: "City",          postcode: null },
  default: { state: "State/Province", city: "City",      postcode: "Postcode"    },
};

// ─── Country data from react-phone-number-input ───────────────────────────
const countryCodeList = getCountries();

// Use Intl.DisplayNames for localised country names (available in all modern runtimes).
const _regionNames = typeof Intl !== "undefined" && Intl.DisplayNames
  ? new Intl.DisplayNames(["en"], { type: "region" })
  : null;
const getCountryName = (iso2: string): string =>
  (_regionNames?.of(iso2)) ?? iso2;

// Build COUNTRIES array — all countries supported by react-phone-number-input
const COUNTRIES_RAW = countryCodeList.map(code => ({
  code,
  name: getCountryName(code),
  dialCode: `+${getCountryCallingCode(code as CountryCode)}`,
}));

// Reorder to put Australia first
const auIndex = COUNTRIES_RAW.findIndex(country => country.code === 'AU');
const COUNTRIES = auIndex !== -1 
  ? [COUNTRIES_RAW[auIndex], ...COUNTRIES_RAW.filter(country => country.code !== 'AU')]
  : COUNTRIES_RAW;

type Country = typeof COUNTRIES[number];

function FlagImage({ code, name }: { code: string; name: string }) {
  return (
    <ReactCountryFlag
      countryCode={code}
      svg
      style={{
        width: "20px",
        height: "14px",
        borderRadius: "2px",
        objectFit: "cover",
      }}
      title={name}
    />
  );
}

// Phone validation using react-phone-number-input
function validatePhone(digits: string, country: Country): string | null {
  const cleaned = digits.replace(/\D/g, '');
  if (!cleaned) return 'Phone number is required.';

  if (country.code === 'AU') {
    if (cleaned.length === 9 && !cleaned.startsWith('0')) return null;
    if (cleaned.length === 10 && cleaned.startsWith('0')) return null;
    if (cleaned.length < 9 || (cleaned.length === 9 && cleaned.startsWith('0')))
      return "Too short — enter 9 digits without leading 0, or 10 digits starting with 0";
    if (cleaned.length > 10)
      return "Too long — Australian numbers are at most 10 digits";
    if (cleaned.length === 10 && !cleaned.startsWith('0'))
      return "10-digit Australian numbers must start with 0";
    return "Invalid format — enter 9 digits (e.g. 412345678) or 10 starting with 0 (e.g. 0412345678)";
  }

  try {
    // 1. Try with original string (preserves any leading + for international format e.g. +971501234567)
    let parsed = parsePhoneNumberFromString(digits.trim(), country.code as any);
    if (parsed?.isValid()) return null;

    // 2. Try cleaned digits as national number
    parsed = parsePhoneNumberFromString(cleaned, country.code as any);
    if (parsed?.isValid()) return null;

    // 3. Try prepending '0' — catches users who omit the leading area-code zero
    if (!cleaned.startsWith('0')) {
      parsed = parsePhoneNumberFromString('0' + cleaned, country.code as any);
      if (parsed?.isValid()) return null;
    }

    // 4. Fallback: accept any plausible international number length (7–15 digits)
    //    so the checkout is never blocked purely by library strictness on exotic formats.
    if (cleaned.length >= 7 && cleaned.length <= 15) return null;

    return `Enter a valid ${country.name} phone number (${cleaned.length} digit${cleaned.length !== 1 ? 's' : ''} entered).`;
  } catch {
    return 'Invalid phone number format.';
  }
}

// Countries that don't use postal codes (postcode field will be optional for these)

// stripePromise is created dynamically after the PaymentIntent is created so it
// can be scoped to the seller's connected account (Direct Charges) or to the
// platform account (multi-seller). It is NOT created at module level.

interface OrderSummary {
  subtotal: string;
  subtotalExGST?: string;
  shippingCost: string;
  gstPercentage: string;
  gstAmount: string;
  grandTotal: string;
  originalTotal?: string;
  couponCode?: string;
  discountAmount?: string;
}

export default function GuestCheckoutForm() {
  const router = useRouter();

  // ── Stripe redirect-return detection ─────────────────────────────────────
  // When a redirect-based method (Klarna, Zip, Link) completes, Stripe lands
  // back on this page with ?payment_intent=...&redirect_status=succeeded.
  // We must handle this BEFORE any other Stripe logic runs.
  const [isProcessingRedirect, setIsProcessingRedirect] = useState(false);
  const [redirectError,        setRedirectError]        = useState<string | null>(null);

  useEffect(() => {
    const params         = new URLSearchParams(window.location.search);
    const redirectStatus = params.get("redirect_status");
    const paymentIntentId = params.get("payment_intent");

    if (!redirectStatus || !paymentIntentId) return; // normal first load

    if (redirectStatus === "succeeded") {
      setIsProcessingRedirect(true);
      const customerEmail = sessionStorage.getItem("guestEmail");
      const storedOrderId = sessionStorage.getItem("guestOrderId");

      if (!customerEmail) {
        setRedirectError("Could not find your session. Please check your email for order confirmation.");
        setIsProcessingRedirect(false);
        return;
      }

      // Confirm with backend — do NOT call stripe.confirmPayment() again
      fetch("https://backend.madeinarnhemland.com.au/api/payments/guest/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentIntentId, customerEmail }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            sessionStorage.removeItem("guestEmail");
            sessionStorage.removeItem("guestOrderId");
            sessionStorage.removeItem(DRAFT_KEY);
            sessionStorage.setItem("guestOrderId",    data.orderId || storedOrderId || "");
            sessionStorage.setItem("guestOrderEmail", customerEmail);
            if (data.displayId) sessionStorage.setItem("guestOrderDisplayId", data.displayId);
            router.push("/guest/order-success");
            // Clear cart AFTER navigation starts so the order summary stays visible
            setTimeout(() => {
              guestCartUtils.clearGuestCart();
              localStorage.removeItem("cartProductCoupons");
            }, 100);
          } else {
            setRedirectError(data.message || "Payment confirmation failed. Please contact support.");
            setIsProcessingRedirect(false);
          }
        })
        .catch(() => {
          setRedirectError("Network error confirming payment. Please contact support.");
          setIsProcessingRedirect(false);
        });

    } else if (redirectStatus === "failed") {
      setRedirectError("Your payment was declined. Please try a different payment method.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Use the same cart hook the cart page uses ─────────────────────────────
  const {
    cartData,
    selectedShipping,
    setSelectedShipping,
    loading: cartLoading,
    calculateTotals,
  } = useSharedEnhancedCart();

  const cartItems = cartData?.cart || [];
  // Filter out COD options so guests only see real shipping methods
  const shippingMethods = (cartData?.availableShipping || []).filter(
    (s) => !/cod|cash[\s_-]*on[\s_-]*delivery/i.test(s.name)
  );
  const { subtotal, shippingCost, gstAmount, gstPercentage, grandTotal } = calculateTotals;

  // ── Form fields ───────────────────────────────────────────────────────────
  const [customerName,  setCustomerName]  = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [addressLine,   setAddressLine]   = useState("");
  const [zipCode,       setZipCode]       = useState("");

  // ── Dynamic location state ────────────────────────────────────────────────
  const [locationCountries,   setLocationCountries]   = useState<ApiCountry[]>([]);
  const [locationStates,      setLocationStates]      = useState<ApiState[]>([]);
  const [locationCities,      setLocationCities]      = useState<ApiCity[]>([]);
  // ── Cart-selected country + international rate (carried over from cart page) ─
  const [cartSelectedCountry, setCartSelectedCountry] = useState<string>(() =>
    typeof window !== "undefined" ? (localStorage.getItem("alpa_shipping_country") ?? "") : ""
  );
  const [cartIntlRate] = useState<{
    zone: string; zoneName: string; cost: number; baseRate: number;
    sellerCount: number; grandTotal: number; gstAmount: number;
    estimatedDays: string; description: string;
  } | null>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("alpa_intl_rate");
      if (stored) try { return JSON.parse(stored); } catch {}
    }
    return null;
  });
  const isInternationalOrder = !!cartSelectedCountry && cartSelectedCountry !== "Australia";
  const [countryMismatchWarning, setCountryMismatchWarning] = useState(false);

  const [selectedCountryIso,  setSelectedCountryIso]  = useState("AU");
  const [selectedStateIso,    setSelectedStateIso]    = useState("");
  const [country,             setCountry]             = useState("Australia");
  const [state,               setState]               = useState("");
  const [city,                setCity]                = useState("");
  const locationLabels = addressTerminology[selectedCountryIso] || addressTerminology.default;
  // ── Location custom dropdowns ─────────────────────────────────────────────
  const [locCountryOpen,   setLocCountryOpen]   = useState(false);
  const [locStateOpen,     setLocStateOpen]     = useState(false);
  const [locCityOpen,      setLocCityOpen]      = useState(false);
  const [locCountrySearch, setLocCountrySearch] = useState("");
  const [locStateSearch,   setLocStateSearch]   = useState("");
  const [locCitySearch,    setLocCitySearch]    = useState("");
  const [locCountryHL,     setLocCountryHL]     = useState(0);
  const [locStateHL,       setLocStateHL]       = useState(0);
  const [locCityHL,        setLocCityHL]        = useState(0);
  const locCountryRef  = useRef<HTMLDivElement>(null);
  const locStateRef    = useRef<HTMLDivElement>(null);
  const locCityRef     = useRef<HTMLDivElement>(null);
  const locCountryListRef  = useRef<HTMLUListElement>(null);
  const locStateListRef    = useRef<HTMLUListElement>(null);
  const locCityListRef     = useRef<HTMLUListElement>(null);
  // Button refs + panel refs for fixed-position dropdown panels (prevents page overflow)
  const locCountryBtnRef  = useRef<HTMLButtonElement>(null);
  const locStateBtnRef    = useRef<HTMLButtonElement>(null);
  const locCityBtnRef     = useRef<HTMLButtonElement>(null);
  const locCountryPanelRef = useRef<HTMLDivElement>(null);
  const locStatePanelRef   = useRef<HTMLDivElement>(null);
  const locCityPanelRef    = useRef<HTMLDivElement>(null);
  // ── Order summary country selector ────────────────────────────────────────
  const [summaryCountryOpen,   setSummaryCountryOpen]   = useState(false);
  const [summaryCountrySearch, setSummaryCountrySearch] = useState("");
  const summaryCountryRef = useRef<HTMLDivElement>(null);
  type DropPos = { top: number; left: number; width: number };
  const [countryDropPos, setCountryDropPos] = useState<DropPos | null>(null);
  const [stateDropPos,   setStateDropPos]   = useState<DropPos | null>(null);
  const [cityDropPos,    setCityDropPos]    = useState<DropPos | null>(null);

  // ── Phone number with country code ──────────────────────────────────────────
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]); // Default to Australia
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [phoneHighlight, setPhoneHighlight] = useState(0);
  const phoneListRef = useRef<HTMLUListElement>(null);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const [addressSuggestions, setAddressSuggestions] = useState<MapboxFeature[]>([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const addressDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Coupon ────────────────────────────────────────────────────────────────
  const [appliedCoupons, setAppliedCoupons] = useState<AppliedSellerCoupon[]>([]);

  // Pre-populate coupons applied on the cart page
  useEffect(() => {
    try {
      const perProduct = localStorage.getItem("cartProductCoupons");
      if (perProduct) {
        const parsed: Record<string, AppliedSellerCoupon> = JSON.parse(perProduct);
        const coupons = Object.values(parsed).filter(Boolean) as AppliedSellerCoupon[];
        if (coupons.length > 0) setAppliedCoupons(coupons);
      }
    } catch {}
  }, []);

  // ── Persist form draft so browser-back doesn't wipe entries ──────────────
  const DRAFT_KEY = "guestFormDraft";

  // Restore on mount
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.customerName)       setCustomerName(d.customerName);
      if (d.customerEmail)      setCustomerEmail(d.customerEmail);
      if (d.addressLine)        setAddressLine(d.addressLine);
      if (d.zipCode)            setZipCode(d.zipCode);
      if (d.country)            setCountry(d.country);
      if (d.state)              setState(d.state);
      if (d.city)               setCity(d.city);
      if (d.selectedCountryIso) setSelectedCountryIso(d.selectedCountryIso);
      if (d.selectedStateIso)   setSelectedStateIso(d.selectedStateIso);
      if (d.phoneNumber)        setPhoneNumber(d.phoneNumber);
      if (d.phoneCountryCode) {
        const found = COUNTRIES.find(c => c.code === d.phoneCountryCode);
        if (found) setSelectedCountry(found);
      }
      // Re-fetch states & cities so the dropdowns are usable again
      if (d.selectedCountryIso) {
        apiClient.get(`/location/countries/${d.selectedCountryIso}/states`)
          .then((resp: any) => {
            if (resp?.data) {
              setLocationStates(resp.data);
              if (d.selectedStateIso) {
                apiClient.get(`/location/countries/${d.selectedCountryIso}/states/${d.selectedStateIso}/cities`)
                  .then((r: any) => { if (r?.data) setLocationCities(r.data); })
                  .catch(() => {});
              }
            }
          })
          .catch(() => {});
      }
    } catch { /* ignore corrupt draft */ }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Save on every field change
  useEffect(() => {
    // Don't persist a completely blank form
    if (!customerName && !customerEmail && !addressLine && !phoneNumber) return;
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({
        customerName, customerEmail, addressLine, zipCode,
        country, state, city,
        selectedCountryIso, selectedStateIso,
        phoneNumber, phoneCountryCode: selectedCountry.code,
      }));
    } catch { /* storage quota – silently skip */ }
  }, [customerName, customerEmail, addressLine, zipCode, country, state, city,
      selectedCountryIso, selectedStateIso, phoneNumber, selectedCountry.code]);

  // ── Steps ─────────────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState<"form" | "payment">("form");

  // ── Stripe state ──────────────────────────────────────────────────────────
  const [clientSecret,          setClientSecret]          = useState<string | null>(null);
  const [paymentIntentId,       setPaymentIntentId]       = useState<string | null>(null);
  const [stripeAmount,          setStripeAmount]          = useState(0);
  const [stripeCurrency,        setStripeCurrency]        = useState("aud");
  const [confirmedOrderId,      setConfirmedOrderId]      = useState("");
  const [confirmedOrderSummary, setConfirmedOrderSummary] = useState<OrderSummary | null>(null);
  const [isCreatingIntent,      setIsCreatingIntent]      = useState(false);
  // Stripe.js promise scoped per-intent (null until create-intent returns)
  const [stripePromise, setStripePromise] = useState<ReturnType<typeof loadStripe> | null>(null);

  // ── Field errors ──────────────────────────────────────────────────────────
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [zipCodeStateError, setZipCodeStateError] = useState<string | null>(null);
  // ── Phone number handlers ───────────────────────────────────────────────────
  const handlePhoneChange = (value: string) => {
    // Only allow digits, spaces, hyphens, parentheses
    const cleaned = value.replace(/[^\d\s\-().]/g, "");
    setPhoneNumber(cleaned);
    // Re-validate immediately once the field has been touched so the error
    // clears as soon as the user types a valid number.
    if (!cleaned.trim()) {
      setPhoneError(null);
    } else if (phoneTouched) {
      setPhoneError(validatePhone(cleaned, selectedCountry));
    }
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setShowCountryDropdown(false);
    setCountrySearch("");
    if (phoneTouched && phoneNumber) {
      setPhoneError(validatePhone(phoneNumber, country));
    }
  };

  // ── Close location dropdowns on outside click ────────────────────────────────
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const t = e.target as Node;
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(t)) {
        setShowCountryDropdown(false);
        setCountrySearch("");
      }
      if (locCountryRef.current && !locCountryRef.current.contains(t) &&
          (!locCountryPanelRef.current || !locCountryPanelRef.current.contains(t))) {
        setLocCountryOpen(false); setLocCountrySearch("");
      }
      if (locStateRef.current && !locStateRef.current.contains(t) &&
          (!locStatePanelRef.current || !locStatePanelRef.current.contains(t))) {
        setLocStateOpen(false);
      }
      if (locCityRef.current && !locCityRef.current.contains(t) &&
          (!locCityPanelRef.current || !locCityPanelRef.current.contains(t))) {
        setLocCityOpen(false);
      }
      if (summaryCountryRef.current && !summaryCountryRef.current.contains(t)) {
        setSummaryCountryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Close all location dropdowns when the page scrolls (but not when scrolling inside a panel) ──
  useEffect(() => {
    const closeAll = (e: Event) => {
      const t = e.target as Node | null;
      if (
        (locCountryPanelRef.current && locCountryPanelRef.current.contains(t)) ||
        (locStatePanelRef.current   && locStatePanelRef.current.contains(t))   ||
        (locCityPanelRef.current    && locCityPanelRef.current.contains(t))
      ) return;
      setLocCountryOpen(false);
      setLocStateOpen(false);
      setLocCityOpen(false);
    };
    window.addEventListener("scroll", closeAll, { passive: true, capture: true });
    return () => window.removeEventListener("scroll", closeAll, { capture: true });
  }, []);

  // Filter countries based on search
  const filteredCountries = COUNTRIES.filter(country =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    country.code.toLowerCase().includes(countrySearch.toLowerCase())
  );

  // ── Dynamic location: fetch countries once ────────────────────────────────
  useEffect(() => {
    const load = async () => {
      if (cachedGuestCountries.length > 0) {
        setLocationCountries(cachedGuestCountries);
        return;
      }
      try {
        const data = await apiClient.get('/location/countries') as { data: ApiCountry[] };
        cachedGuestCountries = data.data || [];
        setLocationCountries(cachedGuestCountries);
      } catch { /* silently skip */ }
    };
    load();
  }, []);

  // ── Dynamic location: auto-select from cart country, or default to Australia ──
  useEffect(() => {
    if (locationCountries.length === 0) return;
    // If the user selected a non-Australia country in the cart, pre-fill it
    if (cartSelectedCountry && cartSelectedCountry !== "Australia") {
      const found = locationCountries.find(
        c => c.name.toLowerCase() === cartSelectedCountry.toLowerCase()
      );
      if (found) {
        handleLocationCountryChange(found.iso2, true /* suppressWarning */);
        return;
      }
    }
    // Default: load AU states
    if (!selectedStateIso) {
      apiClient.get(`/location/countries/AU/states`)
        .then((d: any) => setLocationStates(d.data || []))
        .catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationCountries]);

  // ── Dynamic location: handlers ────────────────────────────────────────────
  const handleLocationCountryChange = async (iso2: string, suppressWarning = false) => {
    const found = locationCountries.find(c => c.iso2 === iso2);
    const name = found?.name || iso2;
    setSelectedCountryIso(iso2);
    setCountry(name);
    setState("");
    setCity("");
    setSelectedStateIso("");
    setLocationStates([]);
    setLocationCities([]);
    setLocStateOpen(false);
    setLocCityOpen(false);
    setZipCodeStateError(null);
    // Clear postcode if the new country doesn't use postal codes
    const newLabels = addressTerminology[iso2] || addressTerminology.default;
    if (newLabels.postcode === null) { setZipCode(""); setFieldErrors(prev => ({ ...prev, zipCode: "" })); }
    // Sync phone country code
    const phoneC = COUNTRIES.find(c => c.code === iso2);
    if (phoneC) setSelectedCountry(phoneC);
    // Mismatch warning: user chose a different country than what was selected in the cart
    if (!suppressWarning && cartSelectedCountry && name !== cartSelectedCountry) {
      setCountryMismatchWarning(true);
    } else {
      setCountryMismatchWarning(false);
    }
    if (!iso2) return;
    try {
      const data = await apiClient.get(`/location/countries/${iso2}/states`) as { data: ApiState[] };
      setLocationStates(data.data || []);
    } catch { /* silently skip */ }
  };

  const handleLocationStateChange = async (iso2: string) => {
    const found = locationStates.find(s => s.iso2 === iso2);
    const name = found?.name || iso2;
    setSelectedStateIso(iso2);
    setState(name);
    setCity("");
    setLocationCities([]);
    setZipCodeStateError(null);
    if (!iso2 || !selectedCountryIso) return;
    try {
      const data = await apiClient.get(`/location/countries/${selectedCountryIso}/states/${iso2}/cities`) as { data: ApiCity[] };
      setLocationCities(data.data || []);
    } catch { /* silently skip */ }
  };
  // Fetch Mapbox address suggestions (debounced)
  const fetchAddressSuggestions = (value: string) => {
    if (addressDebounceRef.current) clearTimeout(addressDebounceRef.current);
    if (!value.trim() || value.length < 3) { setAddressSuggestions([]); setShowAddressSuggestions(false); return; }

    addressDebounceRef.current = setTimeout(async () => {
      try {
        const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
        if (!token) return;
        const country = selectedCountryIso?.toLowerCase() || 'au';
        const encoded = encodeURIComponent(value);
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?access_token=${token}&country=${country}&types=address,place&autocomplete=true&limit=5`
        );
        const data = await res.json();
        setAddressSuggestions(data.features || []);
        setShowAddressSuggestions(true);
      } catch {
        setAddressSuggestions([]);
      }
    }, 300);
  };

  // Handle Mapbox suggestion selection
  const handleMapboxSelect = (feature: MapboxFeature) => {
    const ctx = feature.context || [];
    const getCtx = (prefix: string) => ctx.find(c => c.id.startsWith(prefix));

    const postcode  = getCtx('postcode')?.text || '';
    const place     = getCtx('place')?.text || '';
    const regionCtx = getCtx('region');
    const stateName = regionCtx?.text || '';
    const countryCtx = getCtx('country');
    const countryName = countryCtx?.text || '';

    const street = feature.place_name.split(',')[0].trim();

    setAddressSuggestions([]);
    setShowAddressSuggestions(false);
    setAddressLine(street);
    setCity(place);
    setState(stateName);
    setZipCode(postcode);
    setCountry(countryName);
    setFieldErrors({});
  };

  // Final total after coupon — discount is pre-computed by backend at apply time
  const discountAmount = appliedCoupons.reduce((sum, c) => sum + (c.savings ?? 0), 0);
  const finalTotal     = Math.max(0, grandTotal - discountAmount);
  const displayTotal   = isInternationalOrder && cartIntlRate
    ? Math.max(0, subtotal + cartIntlRate.cost - discountAmount)
    : finalTotal;

  // ── Postcode ↔ State validation via api.zippopotam.us ─────────────────────
  const validateZipForState = async (zip: string, stateVal: string, countryIso: string): Promise<string | null> => {
    if (!zip.trim() || !stateVal.trim() || !countryIso) return null;
    const entered = stateVal.toLowerCase().trim();

    const isMatch = (a: string, b: string) =>
      a === b || a.includes(b) || b.includes(a);

    // api.zippopotam.us — free, no key, 60+ countries
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(
        `https://api.zippopotam.us/${countryIso.toLowerCase()}/${zip.trim()}`,
        { signal: controller.signal }
      );
      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json();
        const places: Array<{ state: string; "state abbreviation": string }> = data.places || [];
        if (places.length > 0) {
          const matched = places.some((p) => {
            const full = (p.state || "").toLowerCase().trim();
            const abbr = (p["state abbreviation"] || "").toLowerCase().trim();
            return isMatch(full, entered) || isMatch(abbr, entered);
          });
          if (!matched) {
            return `Please enter a valid postcode for ${stateVal}.`;
          }
          return null; // ✓ zippopotam confirms valid
        }
      } else if (res.status === 404) {
        return `The entered postcode was not found for the selected country.`;
      }
    } catch {
      // Network / timeout — fall through to silent pass
    }

    // Both sources unavailable — don't block the user
    return null;
  };

  // ── Form validation ───────────────────────────────────────────────────────
  const validateForm = (overrideZipError?: string | null): boolean | string => {
    const errors: Record<string, string> = {};
    if (!customerName.trim())  errors.customerName  = "Full name is required.";
    if (!customerEmail.trim()) errors.customerEmail = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail))
      errors.customerEmail = "Invalid email address.";
    
    // Enhanced phone validation
    if (!phoneNumber.trim()) {
      errors.customerPhone = "Phone number is required.";
    } else {
      const phoneValidationError = validatePhone(phoneNumber, selectedCountry);
      if (phoneValidationError) {
        errors.customerPhone = phoneValidationError;
      }
    }
    
    if (!country.trim())       errors.country       = "Country is required.";
    if (!addressLine.trim())   errors.addressLine   = "Address is required.";
    if (!state.trim())         errors.state         = `${locationLabels.state} is required.`;
    if (!city.trim())          errors.city          = `${locationLabels.city} is required.`;
    if (!zipCode.trim() && locationLabels.postcode !== null) errors.zipCode = `${locationLabels.postcode} is required.`;
    // Postcode ↔ state cross-field validation
    const zipErr = overrideZipError !== undefined ? overrideZipError : zipCodeStateError;
    if (!errors.zipCode && zipErr) errors.zipCode = zipErr;
    // Only require a domestic shipping method for Australian orders
    if (!isInternationalOrder && !selectedShipping) errors.shippingMethodId = "Please select a shipping method.";
    setFieldErrors(errors);
    
    // Return the first error message for toast display, or true if no errors
    const errorMessages = Object.values(errors);
    if (errorMessages.length > 0) {
      return errorMessages[0]; // Return first error message
    }
    return true; // No errors
  };

  // ── Step A: Create PaymentIntent ──────────────────────────────────────────
  const handleContinueToPayment = async () => {
    // Run async postcode ↔ state validation before the synchronous form check
    let asyncZipError: string | null = null;
    if (zipCode.trim() && state.trim() && selectedCountryIso) {
      asyncZipError = await validateZipForState(zipCode, state, selectedCountryIso);
      setZipCodeStateError(asyncZipError);
    }
    const validationResult = validateForm(asyncZipError);
    if (validationResult !== true) { 
      toast.error(typeof validationResult === 'string' ? validationResult : "Please fill in all required fields."); 
      return; 
    }
    if (cartItems.length === 0) { toast.error("Your cart is empty."); return; }

    setIsCreatingIntent(true);
    try {
      const gstId = cartData?.gst?.id;
      const body: Record<string, unknown> = {
        items: cartItems.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          ...(i.variantId && { variantId: i.variantId }),
        })),
        customerName:  customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: `${selectedCountry.dialCode} ${phoneNumber}`.trim(),
        shippingAddress: {
          addressLine: addressLine.trim(),
          city:   city.trim(),
          state:  state.trim(),
          country,
          zipCode: zipCode.trim(),
        },
        ...(isInternationalOrder
          ? { internationalCountry: cartSelectedCountry }
          : { shippingMethodId: selectedShipping?.id }),
        country,
        city:         city.trim(),
        state:        state.trim(),
        zipCode:      zipCode.trim(),
        mobileNumber: `${selectedCountry.dialCode} ${phoneNumber}`.trim(),
        paymentMethod: "credit/debit card",
        ...(gstId && { gstId }),
        ...(appliedCoupons.length > 0 && { couponCode: appliedCoupons[0].code, couponCodes: appliedCoupons.map(c => c.code) }),
      };

  
      const res  = await fetch("https://backend.madeinarnhemland.com.au/api/payments/guest/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

     

      if (!res.ok || !data.success) {
        const msg = data.message || data.error || "Failed to create payment. Please try again.";
        toast.error(msg);
        if (msg.toLowerCase().includes("coupon")) {
          setPhoneError(msg);
        }
        return;
      }

      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId);
      setStripeAmount(data.amount);
      setStripeCurrency(data.currency || "aud");
      setConfirmedOrderId(data.orderId);
      setConfirmedOrderSummary(data.orderSummary);
      // Create Stripe.js instance scoped to the seller's connected account for
      // Direct Charges, or to the platform account for multi-seller orders.
      setStripePromise(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
          ? loadStripe(
              process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
              data.stripeAccountId ? { stripeAccount: data.stripeAccountId } : undefined,
            )
          : null
      );
      
      // Validation: Check if backend returned proper totals
      const backendTotal = parseFloat(data.orderSummary?.grandTotal || "0");
      const frontendTotal = parseFloat(String(grandTotal) || "0");
      if (backendTotal === 0 && frontendTotal > 0) {
        toast.error(`Order total calculation error. Expected $${frontendTotal.toFixed(2)} but received $0.00. Please contact support.`);
      }
      
      setCurrentStep("payment");

      sessionStorage.setItem("guestOrderId",    data.orderId);
      sessionStorage.setItem("guestOrderEmail", customerEmail.trim());
      if (data.displayId) sessionStorage.setItem("guestOrderDisplayId", data.displayId);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to initiate payment.");
    } finally {
      setIsCreatingIntent(false);
    }
  };

  // ── Loading / empty states ────────────────────────────────────────────────
  // Redirect return: show a full-screen loader while we confirm with the backend
  if (isProcessingRedirect) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-[#5A1E12]/70">
        <Loader2 className="w-8 h-8 animate-spin text-[#5A1E12]" />
        <p className="text-lg font-medium">Confirming your payment…</p>
        <p className="text-sm">Please do not close this page.</p>
      </div>
    );
  }

  // Redirect return: payment failed or session expired
  if (redirectError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 max-w-md mx-auto text-center">
        <p className="text-[#5A1E12] text-lg font-semibold">Payment issue</p>
        <p className="text-sm text-[#5A1E12]/70">{redirectError}</p>
        <Link href="/checkout" className="px-6 py-3 bg-[#5A1E12] text-white rounded-lg font-medium hover:bg-[#441208] transition">
          Try Again
        </Link>
      </div>
    );
  }

  if (cartLoading) {
    return (
      <div className="flex items-center justify-center py-24 gap-3 text-[#5A1E12]/60">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>Loading checkout...</span>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-[#5A1E12] text-lg font-medium">Your cart is empty.</p>
        <Link href="/shop" className="px-6 py-3 bg-[#5A1E12] text-white rounded-lg font-medium hover:bg-[#441208] transition">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row flex-1 min-h-screen bg-[#ead7b7]">

      {/* ================= LEFT: FORM / PAYMENT ================= */}
      <div className="flex-1 px-3 xs:px-4 md:px-8 lg:px-12 pt-16 xs:pt-20 lg:pt-28 pb-6 xs:pb-8">

        {/* Breadcrumb + header */}
        <div className="mb-6 xs:mb-8">
          <div className="flex items-center justify-between mb-3 xs:mb-4 gap-2">
            <div className="flex items-center gap-1.5 xs:gap-2 text-sm text-[#5A1E12]/60">
              <button
                onClick={() => setCurrentStep("form")}
                className={`hover:text-[#5A1E12] transition-colors focus:outline-none ${currentStep === "form" ? "font-bold text-[#5A1E12]" : "cursor-pointer"}`}
              >
                1. Your Details
              </button>
              <ChevronRight className="w-4 h-4" />
              <button
                onClick={() => {
                  // Only allow navigating to payment if details are already filled and moving forward is safe.
                  // For a simple approach, we can just allow it, but users might skip validation.
                  // Usually breadcrumbs are clickable only for completed steps. We'll enable it for both to fulfill the request.
                  if (currentStep === "form") {
                    handleContinueToPayment();
                  } else {
                    setCurrentStep("payment");
                  }
                }}
                className={`hover:text-[#5A1E12] transition-colors focus:outline-none ${currentStep === "payment" ? "font-bold text-[#5A1E12]" : "cursor-pointer"}`}
              >
                2. Payment
              </button>
            </div>
            <Link
              href="/cart"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#5A1E12] bg-white/70 hover:bg-white border border-[#5A1E12]/20 hover:border-[#5A1E12]/50 px-3 py-2 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Cart
            </Link>
          </div>
          <h2 className="text-xl xs:text-2xl font-bold text-[#5A1E12]">
            {currentStep === "form" ? "Guest Checkout" : "Complete Payment"}
          </h2>
          <p className="text-[#5A1E12]/60 text-sm xs:text-base mt-1">
            {currentStep === "form"
              ? "Fill in your details below to proceed."
              : "Enter your card details to securely complete your order."}
          </p>
          {/* <p className="text-sm mt-2 text-[#5A1E12]/70">
            Have an account?{" "}
            <Link href="/login" className="underline font-semibold text-[#5A1E12] hover:text-[#441208]">Log in</Link>
            {" "}or{" "}
            <Link href="/signup" className="underline font-semibold text-[#5A1E12] hover:text-[#441208]">Create Account</Link>
          </p> */}
        </div>

        {/* STEP 1: FORM */}
        {currentStep === "form" && (
          <div className="space-y-4 xs:space-y-6 bg-white rounded-xl xs:rounded-2xl p-4 xs:p-6 shadow-sm">

            {/* Personal Details */}
            <div>
              <h3 className="text-sm xs:text-base font-semibold text-[#5A1E12] mb-3 xs:mb-4">Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 xs:gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#5A1E12] mb-1">Full Name <span className="text-red-500">*</span></label>
                  <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Jane Doe"
                    className={`w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-white border rounded-lg xs:rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5A1E12] text-sm xs:text-base touch-target-44 ${fieldErrors.customerName ? "border-red-400" : "border-[#5A1E12]/20"}`} />
                  {fieldErrors.customerName && <p className="mt-1 text-xs text-red-500">{fieldErrors.customerName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5A1E12] mb-1">Phone Number <span className="text-red-500">*</span></label>
                  <div className={`flex items-stretch bg-white border rounded-lg overflow-visible transition-all ${
                    fieldErrors.customerPhone || phoneError ? "border-red-400" : "border-[#5A1E12]/20 hover:border-[#5A1E12]/50 focus-within:border-[#5A1E12] focus-within:ring-1 focus-within:ring-[#5A1E12]"
                  }`}>
                    {/* Country Code Dropdown */}
                    <div className="relative shrink-0" ref={countryDropdownRef}>
                      <button
                        type="button"
                        onClick={() => { setShowCountryDropdown(v => !v); setCountrySearch(""); setPhoneHighlight(0); }}
                        className="flex items-center gap-1.5 px-3 h-full text-sm font-medium border-r border-[#5A1E12]/20 hover:bg-black/5 transition rounded-l-lg"
                      >
                        <FlagImage code={selectedCountry.code} name={selectedCountry.name} />
                        <span className="text-gray-700 text-xs">{selectedCountry.dialCode}</span>
                        <span className="text-gray-400 text-xs">▾</span>
                      </button>

                      {showCountryDropdown && (
                        <div className="absolute top-full left-0 z-50 mt-1 w-72 bg-white border border-[#d6b896] rounded-xl overflow-hidden shadow-lg">
                          <div className="p-2 border-b border-[#d6b896]/50">
                            <input
                              type="text"
                              autoFocus
                              value={countrySearch}
                              onChange={e => { setCountrySearch(e.target.value); setPhoneHighlight(0); }}
                              onKeyDown={e => {
                                if (e.key === "ArrowDown") { e.preventDefault(); setPhoneHighlight(i => { const next = Math.min(i + 1, filteredCountries.length - 1); phoneListRef.current?.children[next]?.scrollIntoView({ block: "nearest" }); return next; }); }
                                else if (e.key === "ArrowUp") { e.preventDefault(); setPhoneHighlight(i => { const prev = Math.max(i - 1, 0); phoneListRef.current?.children[prev]?.scrollIntoView({ block: "nearest" }); return prev; }); }
                                else if (e.key === "Enter" && filteredCountries[phoneHighlight]) { e.preventDefault(); handleCountrySelect(filteredCountries[phoneHighlight]); }
                                else if (e.key === "Escape") setShowCountryDropdown(false);
                              }}
                              placeholder="Search country…"
                              className="w-full px-3 py-2 text-sm bg-[#fdf6ee] border border-[#d6b896] rounded-lg outline-none focus:border-[#5A1E12] placeholder:text-gray-400"
                            />
                          </div>
                          <ul ref={phoneListRef} className="max-h-52 overflow-y-auto">
                            {filteredCountries.map((c, idx) => (
                              <li key={c.code} onMouseEnter={() => setPhoneHighlight(idx)}>
                                <button
                                  type="button"
                                  onMouseDown={() => handleCountrySelect(c)}
                                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                                    idx === phoneHighlight ? "bg-[#f5e6d3] text-[#5A1E12]"
                                    : c.code === selectedCountry.code ? "bg-[#5A1E12] text-white"
                                    : "text-gray-800 hover:bg-[#f5e6d3] hover:text-[#5A1E12]"
                                  }`}
                                >
                                  <FlagImage code={c.code} name={c.name} />
                                  <span className="flex-1 truncate">{c.name}</span>
                                  <span className={`text-xs shrink-0 ${idx === phoneHighlight || c.code === selectedCountry.code ? "opacity-80" : "text-gray-400"}`}>{c.dialCode}</span>
                                </button>
                              </li>
                            ))}
                            {filteredCountries.length === 0 && (
                              <li className="px-4 py-4 text-sm text-gray-400 text-center">No countries found</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Phone Number Input */}
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      onBlur={() => {
                        setPhoneTouched(true);
                        if (phoneNumber) {
                          setPhoneError(validatePhone(phoneNumber, selectedCountry));
                        }
                      }}
                      placeholder="400 000 000"
                      className="flex-1 px-4 py-3 text-sm text-gray-900 bg-transparent outline-none placeholder:text-gray-400"
                    />
                  </div>
                  {(fieldErrors.customerPhone || phoneError) && (
                    <p className="mt-1 text-xs text-red-500">{fieldErrors.customerPhone || phoneError}</p>
                  )}
                  {!fieldErrors.customerPhone && !phoneError && phoneTouched && phoneNumber && (
                    <p className="mt-1 text-xs text-green-600">✓ Valid phone number</p>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-[#5A1E12] mb-1">Email Address <span className="text-red-500">*</span></label>
                <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="jane@example.com"
                  className={`w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-white border rounded-lg xs:rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5A1E12] text-sm xs:text-base touch-target-44 ${fieldErrors.customerEmail ? "border-red-400" : "border-[#5A1E12]/20"}`} />
                {fieldErrors.customerEmail && <p className="mt-1 text-xs text-red-500">{fieldErrors.customerEmail}</p>}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="border-t border-[#5A1E12]/10 pt-6">
              <h3 className="text-base font-semibold text-[#5A1E12] mb-4">Shipping Address</h3>
              <div className="space-y-4">
                {/* Country — read-only, set from order summary */}
                <div>
                  <label className="block text-sm font-medium text-[#5A1E12] mb-1">Country</label>
                  <div className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border border-[#5A1E12]/20 rounded-lg xs:rounded-xl text-sm xs:text-base">
                    <span className={country ? "text-gray-700" : "text-gray-400"}>{country || "No country selected"}</span>
                  </div>
                </div>

                {/* Street Address — powered by Mapbox */}
                <div className="relative">
                  <label className="block text-sm font-medium text-[#5A1E12] mb-1">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={addressInputRef}
                    type="text"
                    autoComplete="off"
                    value={addressLine}
                    onChange={(e) => {
                      setAddressLine(e.target.value);
                      fetchAddressSuggestions(e.target.value);
                    }}
                    onBlur={() => setTimeout(() => setShowAddressSuggestions(false), 150)}
                    placeholder="Start typing your address..."
                    className={`w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-white border rounded-lg xs:rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5A1E12] text-sm xs:text-base transition-all touch-target-44 ${
                      fieldErrors.addressLine ? "border-red-400" : "border-[#5A1E12]/20"
                    }`}
                  />
                  {showAddressSuggestions && addressSuggestions.length > 0 && (
                    <ul className="absolute z-50 top-full mt-1 w-full bg-white border border-[#5A1E12]/20 rounded-xl shadow-lg overflow-hidden">
                      {addressSuggestions.map((f) => (
                        <li
                          key={f.id}
                          onMouseDown={() => handleMapboxSelect(f)}
                          className="px-4 py-2.5 text-sm cursor-pointer hover:bg-[#f5e6d3] hover:text-[#5A1E12] text-gray-800 transition-colors"
                        >
                          {f.place_name}
                        </li>
                      ))}
                    </ul>
                  )}
                  {fieldErrors.addressLine && <p className="mt-1 text-xs text-red-500">{fieldErrors.addressLine}</p>}
                  <p className="mt-1 text-xs text-[#5A1E12]/60">💡 Start typing for address suggestions</p>
                </div>

                {/* State custom dropdown (shown when states are available) */}
                {locationStates.length > 0 && (
                  <div ref={locStateRef}>
                    <label className="block text-sm font-medium text-[#5A1E12] mb-1">{locationLabels.state} <span className="text-red-500">*</span></label>
                    <div>
                      <button
                        ref={locStateBtnRef}
                        type="button"
                        onClick={() => {
                          if (!locStateOpen) {
                            const r = locStateBtnRef.current?.getBoundingClientRect();
                            if (r) setStateDropPos({ top: r.bottom + 4, left: r.left, width: r.width });
                          }
                          setLocStateOpen(o => !o); setLocStateSearch("");
                        }}
                        className={`w-full flex items-center justify-between px-3 xs:px-4 py-2.5 xs:py-3 bg-white border rounded-lg xs:rounded-xl text-sm xs:text-base text-left transition-all focus:outline-none focus:ring-1 focus:ring-[#5A1E12] touch-target-44 ${fieldErrors.state ? "border-red-400" : "border-[#5A1E12]/20 hover:border-[#5A1E12]/50"}`}
                      >
                        <span className={state ? "text-gray-900" : "text-gray-400"}>{state || `Select ${locationLabels.state}`}</span>
                        <svg className={`w-4 h-4 text-[#a08050] transition-transform ${locStateOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                      </button>
                      {locStateOpen && stateDropPos && (
                        <div
                          ref={locStatePanelRef}
                          style={{ position: "fixed", top: stateDropPos.top, left: stateDropPos.left, width: stateDropPos.width, zIndex: 9999 }}
                          className="bg-white border border-[#d6b896] rounded-xl shadow-lg overflow-hidden"
                        >
                          <div className="p-2 border-b border-[#d6b896]/50">
                            <input
                              autoFocus
                              type="text"
                              value={locStateSearch}
                              onChange={e => { setLocStateSearch(e.target.value); setLocStateHL(0); }}
                              onKeyDown={e => {
                                const filtered = locationStates.filter(s => s.name.toLowerCase().includes(locStateSearch.toLowerCase()));
                                if (e.key === "ArrowDown") { e.preventDefault(); setLocStateHL(i => { const next = Math.min(i + 1, filtered.length - 1); locStateListRef.current?.children[next]?.scrollIntoView({ block: "nearest" }); return next; }); }
                                else if (e.key === "ArrowUp") { e.preventDefault(); setLocStateHL(i => { const prev = Math.max(i - 1, 0); locStateListRef.current?.children[prev]?.scrollIntoView({ block: "nearest" }); return prev; }); }
                                else if (e.key === "Enter" && filtered[locStateHL]) { e.preventDefault(); handleLocationStateChange(filtered[locStateHL].iso2); setLocStateOpen(false); }
                                else if (e.key === "Escape") setLocStateOpen(false);
                              }}
                              placeholder={`Search ${locationLabels.state}...`}
                              className="w-full px-3 py-2 text-sm bg-[#fdf6ee] border border-[#d6b896] rounded-lg outline-none focus:border-[#5A1E12] placeholder:text-gray-400"
                            />
                          </div>
                          <ul ref={locStateListRef} className="max-h-52 overflow-y-auto">
                            {locationStates
                              .filter(s => s.name.toLowerCase().includes(locStateSearch.toLowerCase()))
                              .map((s, idx) => (
                                <li
                                  key={s.iso2}
                                  onMouseEnter={() => setLocStateHL(idx)}
                                  onMouseDown={() => { handleLocationStateChange(s.iso2); setLocStateOpen(false); }}
                                  className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                                    idx === locStateHL ? "bg-[#f5e6d3] text-[#5A1E12]"
                                    : selectedStateIso === s.iso2 ? "bg-[#5A1E12] text-white"
                                    : "text-gray-800 hover:bg-[#f5e6d3] hover:text-[#5A1E12]"
                                  }`}
                                >
                                  {s.name}
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    {fieldErrors.state && <p className="mt-1 text-xs text-red-500">{fieldErrors.state}</p>}
                  </div>
                )}

                <div className={`grid gap-3 xs:gap-4 ${locationLabels.postcode !== null ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
                  {/* City/Suburb — manual or auto-filled by street address */}
                  <div>
                    <label className="block text-sm font-medium text-[#5A1E12] mb-1">{locationLabels.city} <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder={locationLabels.city}
                      className={`w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-white border rounded-lg xs:rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5A1E12] text-sm xs:text-base touch-target-44 ${fieldErrors.city ? "border-red-400" : "border-[#5A1E12]/20"}`}
                    />
                    {fieldErrors.city && <p className="mt-1 text-xs text-red-500">{fieldErrors.city}</p>}
                  </div>
                  {locationLabels.postcode !== null && (
                  <div>
                    <label className="block text-sm font-medium text-[#5A1E12] mb-1">
                      {locationLabels.postcode} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => { setZipCode(e.target.value); setZipCodeStateError(null); setFieldErrors(prev => ({ ...prev, zipCode: "" })); }}
                      onBlur={async () => {
                        if (zipCode.trim() && state.trim() && selectedCountryIso) {
                          const err = await validateZipForState(zipCode, state, selectedCountryIso);
                          setZipCodeStateError(err);
                          if (err) setFieldErrors(prev => ({ ...prev, zipCode: err }));
                        }
                      }}
                      placeholder={selectedCountryIso === "US" ? "90210" : selectedCountryIso === "IN" ? "110001" : "2000"}
                      className={`w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-white border rounded-lg xs:rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5A1E12] text-sm xs:text-base touch-target-44 ${fieldErrors.zipCode || zipCodeStateError ? "border-red-400" : "border-[#5A1E12]/20"}`}
                    />
                    {(fieldErrors.zipCode || zipCodeStateError) && (
                      <p className="mt-1 text-xs text-red-500">{fieldErrors.zipCode || zipCodeStateError}</p>
                    )}
                  </div>
                  )}
                </div>
              </div>
            </div>


            {/* International Shipping Summary (shown instead of domestic Shipping Method) */}
            {isInternationalOrder && (
            <div className="border-t border-[#5A1E12]/10 pt-6">
              <h3 className="text-base font-semibold text-[#5A1E12] mb-4">Shipping</h3>
              {cartIntlRate ? (
                <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-[#5A1E12] bg-[#5A1E12]/5">
                  <div className="w-8 h-8 rounded-full bg-[#5A1E12]/10 flex items-center justify-center shrink-0 text-base">🌍</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-[#3b1a08]">International Shipping</p>
                    <p className="text-xs text-[#5A1E12]/60">{cartSelectedCountry}</p>
                    {cartIntlRate.estimatedDays && (
                      <p className="text-xs text-[#5A1E12]/60">{cartIntlRate.estimatedDays}</p>
                    )}
                  </div>
                  <span className="font-semibold text-sm text-[#5A1E12] shrink-0">${cartIntlRate.cost.toFixed(2)}</span>
                </div>
              ) : (
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  ⚠ International shipping rate not found. Please return to cart, select your country, and come back.
                </p>
              )}
            </div>
            )}

            {/* Shipping Method — hidden for international orders */}
            {!isInternationalOrder && (
            <div className="border-t border-[#5A1E12]/10 pt-6">
              <h3 className="text-base font-semibold text-[#5A1E12] mb-4">Shipping Method</h3>
              {fieldErrors.shippingMethodId && <p className="mb-2 text-xs text-red-500">{fieldErrors.shippingMethodId}</p>}
              {selectedShipping ? (
                <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-[#5A1E12] bg-[#5A1E12]/5">
                  <div className="w-4 h-4 rounded-full border-2 border-[#5A1E12] flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-[#5A1E12]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-[#3b1a08]">{selectedShipping.name}</p>
                    {selectedShipping.estimatedDays && (
                      <p className="text-xs text-[#5A1E12]/60">
                        Est. {selectedShipping.estimatedDays.replace(/\s*business\s*days?\s*$/i, "")} business days
                      </p>
                    )}
                  </div>
                  <span className="font-semibold text-sm text-[#5A1E12]">
                    ${shippingCost.toFixed(2)}
                  </span>
                </div>
              ) : (
                <p className="text-sm text-[#5A1E12]/60 italic">No shipping method selected. Please go back to the cart.</p>
              )}
            </div>
            )}

            {/* Coupon */}
            {appliedCoupons.length > 0 && (
              <div className="border-t border-[#5A1E12]/10 pt-6">
                <h3 className="text-base font-semibold text-[#5A1E12] mb-3">Coupons Applied</h3>
                <div className="space-y-1.5">
                  {appliedCoupons.map((c) => (
                    <div key={c.code} className="flex items-center gap-2 px-4 py-2.5 bg-green-50 border border-green-300 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                      <span className="text-sm font-medium text-green-700">{c.code} &mdash; -${c.savings.toFixed(2)} saved</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Continue button */}
            <div className="pt-2">
              <button onClick={handleContinueToPayment} disabled={isCreatingIntent}
                className="w-full py-4 bg-[#5A1E12] text-white font-bold rounded-xl hover:bg-[#3b1a08] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2">
                {isCreatingIntent ? (
                  <><Loader2 className="w-5 h-5 animate-spin" />Creating Order...</>
                ) : "Continue to Payment"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PAYMENT */}
        {currentStep === "payment" && clientSecret && paymentIntentId && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            {/* COMMENTED OUT: Backend returning $0.00 total issue 
            {confirmedOrderSummary && (
              <div className="mb-6 p-4 bg-[#5A1E12]/5 rounded-xl border border-[#5A1E12]/15">
                <p className="text-sm text-[#5A1E12]/70">Amount to pay</p>
                <p className="text-3xl font-bold text-[#5A1E12]">
                  ${parseFloat(confirmedOrderSummary.grandTotal || "0").toFixed(2)} AUD
                </p>
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-2 p-2 bg-yellow-100 rounded text-xs">
                    <strong>DEBUG:</strong> Backend total: {confirmedOrderSummary.grandTotal}, 
                    Frontend total: {grandTotal}
                  </div>
                )}
                {confirmedOrderSummary.discountAmount && parseFloat(confirmedOrderSummary.discountAmount) > 0 && (
                  <p className="text-sm text-green-600 mt-1">
                    Includes {confirmedOrderSummary.couponCode} coupon saving of ${parseFloat(confirmedOrderSummary.discountAmount).toFixed(2)}
                  </p>
                )}
              </div>
            )}
            */}
            <Elements stripe={stripePromise} options={{
              clientSecret,
              appearance: {
                theme: "stripe",
                variables: { colorPrimary: "#5A1E12", colorBackground: "#ffffff", colorText: "#3b1a08", borderRadius: "12px", fontFamily: "inherit" },
              },
            }}>
              <GuestStripePaymentForm
                paymentIntentId={paymentIntentId}
                customerEmail={customerEmail}
                amount={stripeAmount}
                currency={stripeCurrency}
                orderId={confirmedOrderId}
                onSuccess={() => {
                  sessionStorage.removeItem(DRAFT_KEY);
                  router.push("/guest/order-success");
                  // Clear cart AFTER navigation starts so the order summary stays visible
                  setTimeout(() => {
                    guestCartUtils.clearGuestCart();
                    localStorage.removeItem("cartProductCoupons");
                  }, 100);
                }}
                onError={(msg) => toast.error(msg)}
              />
            </Elements>
            <button onClick={() => setCurrentStep("form")}
              className="mt-4 w-full py-2.5 text-sm text-[#5A1E12]/70 hover:text-[#5A1E12] transition-colors">
              Back to Details
            </button>
          </div>
        )}
      </div>

      {/* ================= RIGHT: ORDER SUMMARY ================= */}
      <div className="w-full lg:w-96 xl:w-105 shrink-0 mt-6 lg:mt-0">
        <div className="bg-white lg:rounded-tl-xl shadow-sm lg:sticky lg:top-0 lg:h-screen flex flex-col">

          <div className="px-4 xs:px-6 pt-4 xs:pt-6 pb-3 xs:pb-4 border-b shrink-0">
            <h2 className="text-lg xs:text-xl font-bold">Order Summary</h2>
          </div>



          <div className="flex-1 overflow-y-auto px-4 xs:px-6 py-3 xs:py-4 no-scrollbar">
            <h3 className="font-medium mb-3 xs:mb-4 text-sm text-gray-500 uppercase tracking-wide">Items ({cartItems.length})</h3>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.productId} className="flex gap-3 xs:gap-4">
                  <div className="relative w-14 h-14 xs:w-16 xs:h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    <Image src={item.product?.featuredImage || item.product?.images?.[0] || item.product?.image || "/images/placeholder.png"} alt={item.product?.title || "Product"} fill sizes="64px" className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-sm xs:text-base">{item.product?.title || "Product"}</p>
                    {item.variant?.attributes && Object.keys(item.variant.attributes).length > 0 && (
                      <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                        {Object.entries(item.variant.attributes).map(([key, attr]) => (
                          <span key={key} className="text-xs text-gray-500 flex items-center gap-1">
                            {attr.hexColor && (
                              <span className="inline-block w-2.5 h-2.5 rounded-full border border-gray-300 shrink-0" style={{ backgroundColor: attr.hexColor }} />
                            )}
                            <span className="capitalize">{key}:</span> {attr.displayValue}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-xs xs:text-sm text-gray-500">Qty {item.quantity} x ${(item.effectivePrice ?? parseFloat(item.product?.price || '0')).toFixed(2)}</p>
                  </div>
                  <p className="font-medium text-sm">${(item.quantity * (item.effectivePrice ?? parseFloat(item.product?.price || '0'))).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="px-6 pb-6 pt-4 border-t shrink-0 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Shipping
                {selectedShipping && !isInternationalOrder && (
                  <span className="block text-xs text-gray-400 font-normal">{selectedShipping.name}</span>
                )}
                {isInternationalOrder && (
                  <span className="block text-xs text-gray-400 font-normal">{cartSelectedCountry}</span>
                )}
              </span>
              {isInternationalOrder
                ? cartIntlRate
                    ? <span>${cartIntlRate.cost.toFixed(2)}</span>
                    : <span className="text-amber-600">TBD</span>
                : <span>{shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}</span>
              }
            </div>
            {!isInternationalOrder && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">GST (incl. {gstPercentage?.toFixed(1)}%)</span>
              <span>${gstAmount.toFixed(2)}</span>
            </div>
            )}
            {appliedCoupons.map(c => (
              <div key={c.code} className="flex justify-between text-sm text-green-600 font-medium">
                <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" />Coupon {c.code}</span>
                <span>-${c.savings.toFixed(2)}</span>
              </div>
            ))}
            <hr />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>${displayTotal.toFixed(2)}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

