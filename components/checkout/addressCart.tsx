"use client";

import { useState, useEffect, useRef } from "react";
import { apiClient } from "@/lib/api";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { getCountries, getCountryCallingCode } from "react-phone-number-input/input";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import type { CountryCode } from "libphonenumber-js";

// Address interface matching API structure
interface SavedAddress {
  id?: string;
  _id?: string;
  shippingAddress: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  mobileNumber: string;
  isDefault: boolean;
}

// Dynamic location interfaces
interface ApiCountry {
  id: number;
  name: string;
  iso2: string;
  iso3: string;
  numeric_code: string;
  phone_code: string;
  capital: string;
  currency: string;
  currency_name: string;
  currency_symbol: string;
  tld: string;
  native: string;
  region: string;
  subregion: string;
  timezones: any[];
  translations: any;
  latitude: string;
  longitude: string;
  emoji: string;
  emojiU: string;
}

interface State {
  id: number;
  name: string;
  iso2: string;
  country_code: string;
  country_id: number;
  country_name: string;
  latitude: string;
  longitude: string;
}

interface City {
  id: number;
  name: string;
  state_id: number;
  state_code: string;
  state_name: string;
  country_id: number;
  country_code: string;
  country_name: string;
  latitude: string;
  longitude: string;
}

interface MapboxFeature {
  id: string;
  place_name: string;
  text: string;
  address?: string;
  context?: Array<{ id: string; text: string; short_code?: string }>;
}

interface AddressCartProps {
  onAddressChange: (data: {
    address: string;
    city: string;
    zip: string;
    state: string;
    country: string;
    phoneNumber: string;
  }) => void;
  onValidationChange?: (isValid: boolean) => void;
  /** Country pre-selected from the Order Summary — shown as read-only in this form */
  preselectedCountry?: string;
}

// Module-level cache so countries are only fetched once per page session
let cachedCountries: ApiCountry[] = [];

// Dynamic Label Mapping for localized experience
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

// ── Country data from react-phone-number-input ────────────────────────
const countryCodeList = getCountries();

// Return a flagcdn.com PNG URL for any ISO 3166-1 alpha-2 code.
// Renders correctly on all platforms (Windows, Android, etc.) unlike emoji.
const getFlagUrl = (iso2: string): string =>
  `https://flagcdn.com/20x15/${iso2.toLowerCase()}.png`;

// Use Intl.DisplayNames for localised country names (available in all modern runtimes).
const _regionNames = typeof Intl !== "undefined" && Intl.DisplayNames
  ? new Intl.DisplayNames(["en"], { type: "region" })
  : null;
const getCountryName = (iso2: string): string =>
  (_regionNames?.of(iso2)) ?? iso2;

// Build COUNTRIES array — all countries supported by react-phone-number-input
const COUNTRIES_RAW = countryCodeList.map(code => ({
  code,
  flag: getFlagUrl(code),
  name: getCountryName(code),
  dialCode: `+${getCountryCallingCode(code as CountryCode)}`,
}));

// Reorder to put Australia first
const auIndex = COUNTRIES_RAW.findIndex(country => country.code === 'AU');
const COUNTRIES = auIndex !== -1 
  ? [COUNTRIES_RAW[auIndex], ...COUNTRIES_RAW.filter(country => country.code !== 'AU')]
  : COUNTRIES_RAW;

type Country = typeof COUNTRIES[number];

// Renders a country flag image with a graceful fallback (two-letter code badge)
// for territories like Ascension Island (AC) that flagcdn.com doesn't cover.
function FlagImage({ code, name }: { code: string; name: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span
        className="inline-flex items-center justify-center bg-gray-200 text-gray-600 font-bold rounded-sm shrink-0 text-[8px] leading-none"
        style={{ width: 20, height: 15 }}
        title={name}
      >
        {code.slice(0, 2)}
      </span>
    );
  }
  return (
    <img
      src={`https://flagcdn.com/20x15/${code.toLowerCase()}.png`}
      alt={name}
      width={20}
      height={15}
      className="rounded-sm shrink-0"
      onError={() => setFailed(true)}
    />
  );
}

// Phone validation using react-phone-number-input
function validatePhone(digits: string, country: Country): string | null {
  const cleaned = digits.replace(/\D/g, '');
  if (!cleaned) return null;

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
    // 1. Try original string (preserves any leading + for international format)
    let parsed = parsePhoneNumberFromString(digits.trim(), country.code as any);
    if (parsed?.isValid()) return null;

    // 2. Try cleaned digits as national number
    parsed = parsePhoneNumberFromString(cleaned, country.code as any);
    if (parsed?.isValid()) return null;

    // 3. Prepend '0' — catches users who omit the leading area-code zero
    if (!cleaned.startsWith('0')) {
      parsed = parsePhoneNumberFromString('0' + cleaned, country.code as any);
      if (parsed?.isValid()) return null;
    }

    // 4. Fallback: accept any plausible international length (7–15 digits)
    if (cleaned.length >= 7 && cleaned.length <= 15) return null;

    return `Enter a valid ${country.name} phone number (${cleaned.length} digit${cleaned.length !== 1 ? 's' : ''} entered).`;
  } catch {
    return 'Invalid phone number format.';
  }
}

const inputBase = "w-full bg-white/70 border border-[#d6b896] rounded-xl px-4 py-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400";
const inputNormal = `${inputBase} hover:border-[#a08050] focus:border-[#5A1E12] focus:ring-2 focus:ring-[#5A1E12]/10 focus:bg-white/90`;
const inputError  = `${inputBase} border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-2 focus:ring-red-300/30`;
const inputValid  = `${inputBase} border-emerald-500/70 bg-emerald-50/20 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-300/30`;

// Select-specific base — appearance-none removes OS chrome, pr-10 keeps room for chevron
const selectBase = `${inputBase} appearance-none cursor-pointer pr-10`;
const selectNormal = `${selectBase} hover:border-[#a08050] focus:border-[#5A1E12] focus:ring-2 focus:ring-[#5A1E12]/10 focus:bg-white/90`;
const selectError  = `${selectBase} border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-2 focus:ring-red-300/30`;
const selectValid  = `${selectBase} border-emerald-500/70 bg-emerald-50/20 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-300/30`;

function selectClass(touched: boolean, error: string | null, value: string) {
  if (!touched) return selectNormal;
  if (error)    return selectError;
  if (value)    return selectValid;
  return selectNormal;
}

function fieldClass(touched: boolean, error: string | null, value: string) {
  if (!touched) return inputNormal;
  if (error)    return inputError;
  if (value)    return inputValid;
  return inputNormal;
}


export default function AddressCart({ onAddressChange, onValidationChange, preselectedCountry }: AddressCartProps) {
  const authContext = useContext(AuthContext) as { user?: any } | null;
  const user = authContext?.user;
  
  // ── Dynamic Location State ────────────────────────────────────────────────
  const [countries, setCountries] = useState<ApiCountry[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  // Cart-selected country for pre-fill + mismatch warning
  const [cartSelectedCountry] = useState<string>(() =>
    typeof window !== "undefined" ? (localStorage.getItem("alpa_shipping_country") ?? "") : ""
  );
  const [countryMismatchWarning, setCountryMismatchWarning] = useState(false);

  // Selected ISO Codes (For API calls)
  const [selectedCountryCode, setSelectedCountryCode] = useState("");
  const [selectedStateCode, setSelectedStateCode] = useState("");

  // Custom dropdown open/search state
  const [countryOpen, setCountryOpen]                       = useState(false);
  const [locationCountrySearch, setLocationCountrySearch]   = useState("");
  const [countryHighlight, setCountryHighlight]             = useState(0);
  const [stateOpen, setStateOpen]                           = useState(false);
  const [stateSearch, setStateSearch]                       = useState("");
  const [stateHighlight, setStateHighlight]                 = useState(0);
  const [cityOpen, setCityOpen]                             = useState(false);
  const [citySearch, setCitySearch]                         = useState("");
  const [cityHighlight, setCityHighlight]                   = useState(0);
  const countryDropRef  = useRef<HTMLDivElement>(null);
  const stateDropRef    = useRef<HTMLDivElement>(null);
  const cityDropRef     = useRef<HTMLDivElement>(null);
  const countryListRef  = useRef<HTMLUListElement>(null);
  const stateListRef    = useRef<HTMLUListElement>(null);
  const cityListRef     = useRef<HTMLUListElement>(null);

  // Form Data (To be sent to database)
  const [formData, setFormData] = useState({
    country: "",  // Store Name, e.g., "Australia"
    address: "",
    city: "",     // Store Name, e.g., "Sydney"
    zip: "",
    state: "",    // Store Name, e.g., "New South Wales"
  });

  // Get dynamic labels based on selected country
  const labels = addressTerminology[selectedCountryCode] || addressTerminology.default;

  // Field touched state for validation
  const [fieldTouched, setFieldTouched] = useState({ country: false, city: false, zip: false, state: false });
  const [zipCodeStateError, setZipCodeStateError] = useState<string | null>(null);

  const fieldErrors = {
    country: formData.country.trim().length < 2 ? "Country is required" : null,
    city:    formData.city.trim().length < 2    ? `${labels.city} is required`    : null,
    zip:     labels.postcode === null ? null
             : !formData.zip.trim()  ? `${labels.postcode} is required`
             : !/^[\w\s-]{3,10}$/.test(formData.zip.trim()) ? `Invalid ${labels.postcode}` : null,
    state:   formData.state.trim().length < 2  ? `${labels.state} is required`   : null,
  };

  const touchField = (f: keyof typeof fieldTouched) =>
    setFieldTouched(prev => ({ ...prev, [f]: true }));

  // ── Dynamic Location API Functions ────────────────────────────────────────
  const fetchCountries = async () => {
    // Use module-level cache to avoid re-fetching on every remount
    if (cachedCountries.length > 0) {
      setCountries(cachedCountries);
      return;
    }
    try {
      const data = await apiClient.get('/location/countries') as { data: ApiCountry[] };
      cachedCountries = data.data || [];
      setCountries(cachedCountries);
    } catch (error) {
      console.error("[AddressCart] /location/countries failed:", error);
      toast.error("Failed to load countries. Please refresh the page.");
    }
  };

  const handleCountryChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const iso2 = e.target.value;
    const countryObj = countries.find(c => c.iso2 === iso2);
    const countryName = countryObj?.name || e.target.options?.[e.target.selectedIndex]?.text || "";

    // Set the selected country code and update form data
    setSelectedCountryCode(iso2);
    setFormData(prev => ({ ...prev, country: countryName, state: "", city: "" }));

    // Reset dependent dropdowns and state
    setStates([]);
    setCities([]);
    setSelectedStateCode("");
    setFieldTouched(prev => ({ ...prev, state: false, city: false }));
    setZipCodeStateError(null);
    // Clear postcode if new country doesn't use one
    const newLabels = addressTerminology[iso2] || addressTerminology.default;
    if (newLabels.postcode === null) setFormData(prev => ({ ...prev, zip: "", state: "", city: "" }));
    // Mismatch warning vs cart-selected country
    if (cartSelectedCountry && countryName !== cartSelectedCountry) {
      setCountryMismatchWarning(true);
    } else {
      setCountryMismatchWarning(false);
    }

    // Sync phone country selector
    const phoneCountry = COUNTRIES.find(c => c.code === iso2);
    if (phoneCountry) {
      setSelectedCountry(phoneCountry);
    }

    // Fetch states for the newly selected country
    if (iso2) {
      try {
        const data = await apiClient.get(`/location/countries/${iso2}/states`) as { data: State[] };
        setStates(data.data || []);
      } catch (error) {
        console.error(`[AddressCart] /location/countries/${iso2}/states failed:`, error);
        toast.error("Failed to load states/provinces. Please try again.");
      }
    }
  };

  const handleStateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const iso2 = e.target.value;
    const stateObj = states.find(s => s.iso2 === iso2);
    const stateName = stateObj?.name || e.target.options?.[e.target.selectedIndex]?.text || "";
    
    setSelectedStateCode(iso2);
    
    // Update DB model with Name, reset city
    setFormData(prev => ({ ...prev, state: stateName, city: "" }));
    setCities([]);
    
    // Reset touched state for city field
    setFieldTouched(prev => ({ ...prev, city: false }));
    setZipCodeStateError(null);

    if (!iso2 || !selectedCountryCode) return;

    try {
      const data = await apiClient.get(`/location/countries/${selectedCountryCode}/states/${iso2}/cities`) as { data: City[] };
      setCities(data.data || []);
    } catch (error) {
      console.error(`[AddressCart] /location/countries/${selectedCountryCode}/states/${iso2}/cities failed:`, error);
      toast.error("Failed to load cities. Please try again.");
    }
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const cityName = e.target.value;
    setFormData(prev => ({ ...prev, city: cityName }));
  };

  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const [phoneHighlight, setPhoneHighlight] = useState(0);
  const phoneListRef = useRef<HTMLUListElement>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [addressSuggestions, setAddressSuggestions] = useState<MapboxFeature[]>([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const addressDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Touch all fields at once — called when user tries to move to next step
  const touchAllFields = () => {
    setFieldTouched({ country: true, city: true, zip: true, state: true });
    setPhoneTouched(true);
    setPhoneError(validatePhone(phoneNumber, selectedCountry));
  };

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

  // Derived validity — all required fields must be filled
  const isFormValid = (
    !fieldErrors.country &&
    !fieldErrors.state &&
    !fieldErrors.city &&
    !fieldErrors.zip &&
    !zipCodeStateError &&
    formData.address.trim().length > 0 &&
    phoneNumber.trim().length > 0 &&
    !validatePhone(phoneNumber, selectedCountry)
  );

  // ── Initial Countries Load ──────────────────────────────────────────────────
  useEffect(() => {
    fetchCountries();
  }, []);

  // ── Sync preselectedCountry prop → update address country when it changes ──
  // Compare against formData.country (always restored from localStorage) rather
  // than selectedCountryCode, which can still be "" if selectedCountryIso2 was
  // absent from the saved data — that stale "" would cause handleCountryChange
  // to fire and wipe state/city/zip.
  useEffect(() => {
    if (!preselectedCountry || countries.length === 0 || !dataLoaded) return;
    // If the form already has this country, nothing to do
    if (formData.country === preselectedCountry) return;
    const found = countries.find(c => c.name === preselectedCountry);
    if (found) {
      handleCountryChange({ target: { value: found.iso2 } } as React.ChangeEvent<HTMLSelectElement>);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselectedCountry, countries, dataLoaded, formData.country]);

  // ── Auto-select from cart country (or Australia as fallback) on initial load ──
  // Always override with the cart-selected country so the address form
  // starts on the right country regardless of any previously saved address data.
  useEffect(() => {
    if (isInitialLoad && countries.length > 0 && dataLoaded) {
      // Prefer the preselectedCountry prop, then cart localStorage country
      const targetName = preselectedCountry || cartSelectedCountry;
      const target = targetName
        ? countries.find(c => c.name === targetName)
        : countries.find(c => c.iso2.toLowerCase() === 'au');
      const fallback = target || countries.find(c => c.iso2.toLowerCase() === 'au');
      if (fallback) {
        setSelectedCountryCode(fallback.iso2);
        // Use a functional update so we can compare against the already-restored value.
        // Only clear state/city/zip when the country is actually changing (e.g. the user
        // had a saved address for Australia but the cart is now set to United States).
        // When the country already matches the saved address we preserve everything so
        // the fields the user filled in on a previous visit don't get wiped on return.
        setFormData(prev => {
          const countryChanged = prev.country !== fallback.name;
          if (!countryChanged) {
            // Country already correct — keep all saved field values
            return prev;
          }
          // New country — reset dependent fields so stale values don't linger
          return { ...prev, country: fallback.name, state: "", city: "", zip: "" };
        });
        // Only reset cascading dropdowns when the country is actually different.
        // We derive this from formData via a closure trick: read the value that was
        // just set above via the functional updater. Since we can't easily read the
        // result of setFormData synchronously, we compare against the cartSelectedCountry
        // name stored in the closure instead.
        const savedCountry = (typeof window !== "undefined" ? localStorage.getItem("addressCartData") : null);
        const savedCountryName = (() => { try { return savedCountry ? JSON.parse(savedCountry).country : "" } catch { return ""; } })();
        if (savedCountryName && savedCountryName !== fallback.name) {
          setStates([]);
          setCities([]);
          setSelectedStateCode("");
        }
        const loadStates = async () => {
          try {
            const data = await apiClient.get(`/location/countries/${fallback.iso2}/states`) as { data: State[] };
            setStates(data.data || []);
          } catch (error) {
            console.error(`[AddressCart] initial load /location/countries/${fallback.iso2}/states failed:`, error);
          }
        };
        loadStates();
        setIsInitialLoad(false);
      }
    }
  }, [countries, isInitialLoad, cartSelectedCountry, dataLoaded]);

  // ── Auto-load states when country is restored from localStorage ──────────────
  useEffect(() => {
    if (dataLoaded && selectedCountryCode && countries.length > 0 && states.length === 0) {
      const loadStates = async () => {
        try {
          const data = await apiClient.get(`/location/countries/${selectedCountryCode}/states`) as { data: State[] };
          setStates(data.data || []);
        } catch (error) {
          console.error(`[AddressCart] restore /location/countries/${selectedCountryCode}/states failed:`, error);
        }
      };
      loadStates();
    }
  }, [dataLoaded, selectedCountryCode, countries, states.length]);

  // ── Auto-load cities when state is restored from localStorage ───────────────
  useEffect(() => {
    if (dataLoaded && selectedStateCode && selectedCountryCode && states.length > 0 && cities.length === 0) {
      const loadCities = async () => {
        try {
          const data = await apiClient.get(`/location/countries/${selectedCountryCode}/states/${selectedStateCode}/cities`) as { data: City[] };
          setCities(data.data || []);
        } catch (error) {
          console.error(`[AddressCart] restore /location/countries/${selectedCountryCode}/states/${selectedStateCode}/cities failed:`, error);
        }
      };
      loadCities();
    }
  }, [dataLoaded, selectedStateCode, selectedCountryCode, states.length, cities.length]);

  // ── Sync phone country with address country selection ─────────────────────────
  useEffect(() => {
    if (selectedCountryCode && countries.length > 0) {
      const selectedAddressCountry = countries.find(c => c.iso2 === selectedCountryCode);
      if (selectedAddressCountry) {
        // Find matching phone country by ISO2 code
        const matchingPhoneCountry = COUNTRIES.find(c => c.code === selectedCountryCode);
        if (matchingPhoneCountry) {
          setSelectedCountry(matchingPhoneCountry);
        }
      }
    }
  }, [selectedCountryCode, countries]);

  // Saved addresses state
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [loadingSavedAddresses, setLoadingSavedAddresses] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [showSavedAddresses, setShowSavedAddresses] = useState(false);
  const [saveAsDefault, setSaveAsDefault] = useState(false);

  const addressInputRef = useRef<HTMLInputElement>(null);
  const statesRef = useRef(states);
  useEffect(() => { statesRef.current = states; }, [states]);
  const selectedCountryCodeRef = useRef(selectedCountryCode);
  useEffect(() => { selectedCountryCodeRef.current = selectedCountryCode; }, [selectedCountryCode]);

  // API functions for addresses
  const fetchSavedAddresses = async () => {
    if (!user) {
      console.log('No user found, skipping address fetch');
      return;
    }
    
    try {
      setLoadingSavedAddresses(true);
      console.log('Fetching saved addresses for user:', user.id || user.email);
      
      const response = await apiClient.get<SavedAddress[] | { data?: SavedAddress[]; addresses?: SavedAddress[] }>('/users/addresses');
      console.log('Saved addresses response:', response);
      
      // Handle both array response and object with data property
      const addressData = Array.isArray(response) ? response : (response as any)?.data || (response as any)?.addresses || [];
      console.log('Processed address data:', addressData);
      
      setSavedAddresses(addressData);
    } catch (error) {
      console.error('Error fetching saved addresses:', error);
      console.error('Error details:', {
        message: (error as any)?.message,
        status: (error as any)?.status,
        response: (error as any)?.response
      });
    } finally {
      setLoadingSavedAddresses(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await apiClient.delete(`/users/addresses/${id}`);
      setSavedAddresses(prev => prev.filter(a => (a._id || a.id) !== id));
      toast.success("Address deleted", {
        position: "top-right",
        autoClose: 2500,
        style: { background: "linear-gradient(135deg, #10B981, #059669)", color: "white", borderRadius: "12px" }
      });
    } catch {
      toast.error("Failed to delete address", {
        position: "top-right",
        autoClose: 3000,
        style: { background: "#FEF2F2", color: "#991B1B", borderLeft: "4px solid #EF4444" }
      });
    }
  };

  const saveAddress = async () => {
    if (!user) return;
    
    // Validate form before saving
    const hasErrors = Object.values(fieldErrors).some(error => error !== null);
    const phoneValidationError = validatePhone(phoneNumber, selectedCountry);
    
    if (hasErrors || phoneValidationError || !formData.address.trim()) {
      toast.error("📋 Please fill all required fields correctly before saving the address.", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          background: "#FEF2F2",
          color: "#991B1B",
          borderLeft: "4px solid #EF4444"
        }
      });
      return;
    }

    // Check for duplicate addresses before saving
    const newAddressData = {
      shippingAddress: formData.address.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      country: formData.country.trim(),
      zipCode: formData.zip.trim(),
      mobileNumber: `${selectedCountry.dialCode} ${phoneNumber}`.trim(),
    };

    const isDuplicate = savedAddresses.some(existing => 
      existing.shippingAddress.toLowerCase().trim() === newAddressData.shippingAddress.toLowerCase() &&
      existing.city.toLowerCase().trim() === newAddressData.city.toLowerCase() &&
      existing.state.toLowerCase().trim() === newAddressData.state.toLowerCase() &&
      existing.country.toLowerCase().trim() === newAddressData.country.toLowerCase() &&
      existing.zipCode.trim() === newAddressData.zipCode &&
      existing.mobileNumber.trim() === newAddressData.mobileNumber
    );

    if (isDuplicate) {
      toast.warning("📍 You have already saved this address!", {
        position: "top-center",
        autoClose: 3500,
        hideProgressBar: false, 
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          background: "linear-gradient(135deg, #F59E0B, #D97706)",
          color: "white",
          borderRadius: "12px",
          boxShadow: "0 8px 20px rgba(245, 158, 11, 0.4)",
          fontWeight: "600"
        }
      });
      return;
    }

    try {
      setSavingAddress(true);
      const addressData = {
        ...newAddressData,
        isDefault: saveAsDefault
      };
      
      await apiClient.post('/users/addresses', addressData);
      await fetchSavedAddresses(); // Refresh the saved addresses list
      setSaveAsDefault(false);
      toast.success("Address saved successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          background: "linear-gradient(135deg, #10B981, #059669)",
          color: "white",
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(16, 185, 129, 0.3)"
        }
      });
    } catch (error: any) {
      console.error('Error saving address:', error);
      
      // Check if it's a duplicate error from the backend
      const errorMessage = error?.response?.data?.message || error?.message || '';
      const isDuplicateError = errorMessage.toLowerCase().includes('already') || 
                              errorMessage.toLowerCase().includes('duplicate') ||
                              errorMessage.toLowerCase().includes('exists');
      
      if (isDuplicateError) {
        toast.warning("📍 This address already exists in your saved addresses!", {
          position: "top-center",
          autoClose: 3500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          style: {
            background: "linear-gradient(135deg, #F59E0B, #D97706)",
            color: "white",
            borderRadius: "12px",
            boxShadow: "0 8px 20px rgba(245, 158, 11, 0.4)",
            fontWeight: "600"
          }
        });
      } else {
        toast.error("❌ Failed to save address. Please try again.", {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          style: {
            background: "#FEF2F2",
            color: "#991B1B",
            borderLeft: "4px solid #EF4444"
          }
        });
      }
    } finally {
      setSavingAddress(false);
    }
  };

  const selectSavedAddress = async (address: SavedAddress) => {
    // Auto-fill the form with selected address
    setFormData({
      address: address.shippingAddress,
      city: address.city,
      state: address.state,
      country: address.country,
      zip: address.zipCode
    });
    
    // Find and set the country based on the saved address
    const matchingCountry = countries.find(c => 
      c.name.toLowerCase() === address.country.toLowerCase()
    );
    
    if (matchingCountry) {
      setSelectedCountryCode(matchingCountry.iso2);
      
      // Fetch states for the country
      try {
        const statesResponse = await apiClient.get(`/location/countries/${matchingCountry.iso2}/states`) as { data: State[] };
        const countryStates = statesResponse.data || [];
        setStates(countryStates);

        // Find and set the state
        const matchingState = countryStates.find((s: State) =>
          s.name.toLowerCase() === address.state.toLowerCase()
        );

        if (matchingState) {
          setSelectedStateCode(matchingState.iso2);

          // Fetch cities for the state
          try {
            const citiesResponse = await apiClient.get(`/location/countries/${matchingCountry.iso2}/states/${matchingState.iso2}/cities`) as { data: City[] };
            setCities(citiesResponse.data || []);
          } catch (error) {
            console.error(`[AddressCart] saved address /location/countries/${matchingCountry.iso2}/states/${matchingState.iso2}/cities failed:`, error);
          }
        }
      } catch (error) {
        console.error(`[AddressCart] saved address /location/countries/${matchingCountry.iso2}/states failed:`, error);
      }
    }
    
    // Parse and set phone number with country selection
    const phoneWithCountry = address.mobileNumber;
    const matchingPhoneCountry = COUNTRIES.find(c => phoneWithCountry.startsWith(c.dialCode));
    if (matchingPhoneCountry) {
      setSelectedCountry(matchingPhoneCountry);
      const phoneWithoutCode = phoneWithCountry.replace(matchingPhoneCountry.dialCode, '').trim();
      setPhoneNumber(phoneWithoutCode);
      // Reset phone validation state
      setPhoneTouched(false);
      setPhoneError(null);
    }
    
    // Reset field touched states since we're auto-filling
    setFieldTouched({
      country: false,
      city: false, 
      zip: false,
      state: false
    });
    setZipCodeStateError(null);
    
    setShowSavedAddresses(false);
  };

  // Load saved address data from localStorage on mount
  useEffect(() => {
    const savedAddressData = localStorage.getItem("addressCartData");
    if (savedAddressData) {
      try {
        const data = JSON.parse(savedAddressData);
        setFormData({
          country: data.country || "",
          address: data.address || "",
          city:    data.city    || "",
          zip:     data.zip     || "",
          state:   data.state   || "",
        });
        
        // Restore ISO codes — use the address-specific keys (not phone country)
        if (data.selectedCountryIso2) setSelectedCountryCode(data.selectedCountryIso2);
        if (data.selectedStateIso2) setSelectedStateCode(data.selectedStateIso2);
        
        if (data.phoneNumber) setPhoneNumber(data.phoneNumber);
        if (data.selectedCountryCode) {
          const found = COUNTRIES.find(c => c.code === data.selectedCountryCode);
          if (found) setSelectedCountry(found);
        }
      } catch {}
    }
    setDataLoaded(true);
  }, []);

  // Fetch saved addresses when user is authenticated
  useEffect(() => {
    if (user && dataLoaded) {
      fetchSavedAddresses();
    }
  }, [user, dataLoaded]);

  // Auto-expand saved addresses when they are loaded
  useEffect(() => {
    if (savedAddresses.length > 0 && !loadingSavedAddresses) {
      setShowSavedAddresses(true);
    }
  }, [savedAddresses, loadingSavedAddresses]);

  // Debug: Log user state changes
  useEffect(() => {
    console.log('User state changed:', { user: !!user, userId: user?.id || user?.email });
  }, [user]);

  // Save form data to localStorage (only after initial load)
  useEffect(() => {
    if (!dataLoaded) return;
    localStorage.setItem("addressCartData", JSON.stringify({
      ...formData,
      phoneNumber,
      selectedCountryCode: selectedCountry.code,
      selectedCountryIso2: selectedCountryCode,
      selectedStateIso2: selectedStateCode,
    }));
  }, [formData, phoneNumber, selectedCountry, selectedCountryCode, selectedStateCode, dataLoaded]);

  // Fetch Mapbox address suggestions (debounced, called from address input onChange)
  const fetchAddressSuggestions = (value: string) => {
    if (addressDebounceRef.current) clearTimeout(addressDebounceRef.current);
    if (!value.trim() || value.length < 3) { setAddressSuggestions([]); setShowAddressSuggestions(false); return; }

    addressDebounceRef.current = setTimeout(async () => {
      try {
        const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
        if (!token) return;
        const country = selectedCountryCodeRef.current?.toLowerCase() || 'au';
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

  // Handle a Mapbox suggestion selection — parse feature and fill form fields
  const handleMapboxSelect = (feature: MapboxFeature) => {
    const ctx = feature.context || [];
    const getCtx = (prefix: string) => ctx.find(c => c.id.startsWith(prefix));

    const postcode   = getCtx('postcode')?.text || '';
    const place      = getCtx('place')?.text || '';
    const regionCtx  = getCtx('region');
    const stateName  = regionCtx?.text || '';
    const stateShort = regionCtx?.short_code?.replace(/^[A-Z]+-/, '') || '';
    const countryCtx = getCtx('country');
    const countryISO = countryCtx?.short_code?.toUpperCase() || '';

    const street = feature.place_name.split(',')[0].trim();

    setAddressSuggestions([]);
    setShowAddressSuggestions(false);

    setFormData(prev => ({
      ...prev,
      address: street,
      city: place,
      state: stateName || stateShort,
      zip: postcode,
      country: countries.find(c => c.iso2 === countryISO)?.name || prev.country,
    }));

    if (countryISO && countryISO !== selectedCountryCodeRef.current) {
      const newCountry = countries.find(c => c.iso2 === countryISO);
      if (newCountry) {
        handleCountryChange({ target: { value: newCountry.iso2 } } as React.ChangeEvent<HTMLSelectElement>);
      }
    }

    setTimeout(async () => {
      const stateObj = statesRef.current.find(s =>
        s.name.toLowerCase() === stateName.toLowerCase() ||
        s.iso2.toLowerCase() === stateShort.toLowerCase()
      );
      if (!stateObj) return;

      setSelectedStateCode(stateObj.iso2);
      setFormData(prev => ({ ...prev, state: stateObj.name }));

      try {
        const data = await apiClient.get(`/location/countries/${selectedCountryCodeRef.current}/states/${stateObj.iso2}/cities`) as { data: City[] };
        const newCities = data.data || [];
        setCities(newCities);
        if (place) {
          const matchingCity = newCities.find(c => c.name.toLowerCase() === place.toLowerCase());
          setFormData(prev => ({ ...prev, city: matchingCity?.name || place }));
        }
      } catch (error) {
        console.error(`[AddressCart] autocomplete /location/countries/${selectedCountryCodeRef.current}/states/${stateObj?.iso2}/cities failed:`, error);
      }
    }, 200);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target as Node)) {
        setShowCountryDropdown(false);
        setCountrySearch("");
      }
      if (countryDropRef.current && !countryDropRef.current.contains(e.target as Node)) { setCountryOpen(false); setLocationCountrySearch(""); }
      if (stateDropRef.current   && !stateDropRef.current.contains(e.target as Node))   setStateOpen(false);
      if (cityDropRef.current    && !cityDropRef.current.contains(e.target as Node))     setCityOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePhoneChange = (value: string) => {
    // Only allow digits, spaces, hyphens
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

  const handlePhoneBlur = () => {
    setPhoneTouched(true);
    setPhoneError(validatePhone(phoneNumber, selectedCountry));
  };

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.dialCode.includes(countrySearch)
  );

  // Update parent component whenever address fields change
  useEffect(() => {
    onAddressChange({
      address: formData.address,
      city: formData.city,
      zip: formData.zip,
      state: formData.state,
      country: formData.country,
      phoneNumber: `${selectedCountry.dialCode} ${phoneNumber}`.trim(),
    });
  }, [formData, phoneNumber, selectedCountry, onAddressChange]);

  // Notify parent whenever validity changes
  useEffect(() => {
    onValidationChange?.(isFormValid);
  }, [isFormValid, onValidationChange]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <section className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-[#5A1E12]">Where should we send your order?</h1>
        <p className="text-sm text-gray-500 mt-1">Fields marked <span className="text-red-500">*</span> are required.</p>
      </div>

      {/* Country — read-only, set from order summary */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-600">Country/Region</label>
        <div className={`${inputBase} bg-gray-50`}>
          <span className={formData.country ? "text-gray-700" : "text-gray-400"}>
            {formData.country || "No country selected"}
          </span>
        </div>
      </div>

      {/* Street address autocomplete — powered by Mapbox */}
      <div className="flex flex-col gap-1.5 relative">
        <label htmlFor="address" className="text-sm font-medium text-gray-600">
          Street Address <span className="text-red-500">*</span>
        </label>
        <input
          ref={addressInputRef}
          id="address"
          name="address"
          type="text"
          autoComplete="off"
          value={formData.address}
          onChange={(e) => {
            setFormData(prev => ({ ...prev, address: e.target.value }));
            fetchAddressSuggestions(e.target.value);
          }}
          onBlur={() => setTimeout(() => setShowAddressSuggestions(false), 150)}
          placeholder={
            formData.city && formData.state
              ? `Start typing street address in ${formData.country}...`
              : "e.g., 123 Collins Street, Unit 5A"
          }
          className={inputNormal}
          required
        />
        {showAddressSuggestions && addressSuggestions.length > 0 && (
          <ul className="absolute z-50 top-full mt-1 w-full bg-white border border-[#d6b896] rounded-xl shadow-lg overflow-hidden">
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
        <p className="text-xs text-gray-500">
          {selectedCountryCode
            ? "💡 Start typing for address suggestions"
            : "Include street number, name, unit/apartment number"}
        </p>
      </div>

      {/* State Dropdown - Only show if states exist */}
      {states.length > 0 && (
        <div className="flex flex-col gap-1.5" ref={stateDropRef}>
          <label className="text-sm font-medium text-gray-600">
            {labels.state} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => { setStateOpen(o => !o); setStateSearch(""); }}
              onBlur={() => touchField("state")}
              className={`${selectClass(fieldTouched.state, fieldErrors.state, formData.state)} flex items-center justify-between text-left`}
            >
              <span className={formData.state ? "text-gray-900" : "text-gray-400"}>
                {formData.state || `Select ${labels.state}`}
              </span>
              <svg className={`w-4 h-4 text-[#a08050] transition-transform ${stateOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {stateOpen && (
              <div className="absolute z-50 mt-1 w-full bg-white border border-[#d6b896] rounded-xl shadow-lg overflow-hidden">
                <div className="p-2 border-b border-[#d6b896]/50">
                <input
                    autoFocus
                    type="text"
                    value={stateSearch}
                    onChange={e => { setStateSearch(e.target.value); setStateHighlight(0); }}
                    onKeyDown={e => {
                      const filtered = states.filter(s => s.name.toLowerCase().includes(stateSearch.toLowerCase()));
                      if (e.key === "ArrowDown") { e.preventDefault(); setStateHighlight(i => Math.min(i + 1, filtered.length - 1)); stateListRef.current?.children[Math.min(stateHighlight + 1, filtered.length - 1)]?.scrollIntoView({ block: "nearest" }); }
                      else if (e.key === "ArrowUp") { e.preventDefault(); setStateHighlight(i => Math.max(i - 1, 0)); stateListRef.current?.children[Math.max(stateHighlight - 1, 0)]?.scrollIntoView({ block: "nearest" }); }
                      else if (e.key === "Enter" && filtered[stateHighlight]) { e.preventDefault(); handleStateChange({ target: { value: filtered[stateHighlight].iso2 } } as React.ChangeEvent<HTMLSelectElement>); setStateOpen(false); touchField("state"); }
                      else if (e.key === "Escape") setStateOpen(false);
                    }}
                    placeholder={`Search ${labels.state}...`}
                    className="w-full px-3 py-2 text-sm bg-[#fdf6ee] border border-[#d6b896] rounded-lg outline-none focus:border-[#5A1E12] placeholder:text-gray-400"
                  />
                </div>
                <ul ref={stateListRef} className="max-h-52 overflow-y-auto">
                  {states
                    .filter(s => s.name.toLowerCase().includes(stateSearch.toLowerCase()))
                    .map((s, idx) => (
                      <li
                        key={s.iso2}
                        onMouseEnter={() => setStateHighlight(idx)}
                        onMouseDown={() => {
                          handleStateChange({ target: { value: s.iso2 } } as React.ChangeEvent<HTMLSelectElement>);
                          setStateOpen(false);
                          touchField("state");
                        }}
                        className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                          idx === stateHighlight
                            ? "bg-[#f5e6d3] text-[#5A1E12]"
                            : selectedStateCode === s.iso2
                            ? "bg-[#5A1E12] text-white"
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
          {fieldTouched.state && fieldErrors.state && (
            <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1"><span>✕</span>{fieldErrors.state}</p>
          )}
        </div>
      )}

      {/* City/Suburb - manual text input (auto-filled by street address autocomplete) */}
      <div className={`grid gap-4 ${labels.postcode !== null ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="city" className="text-sm font-medium text-gray-600">
            {labels.city} <span className="text-red-500">*</span>
          </label>
          <input
            id="city"
            name="city"
            type="text"
            value={formData.city}
            onChange={handleCityChange}
            onBlur={() => touchField("city")}
            placeholder={`Enter your ${labels.city}`}
            className={fieldClass(fieldTouched.city, fieldErrors.city, formData.city)}
          />
          {fieldTouched.city && fieldErrors.city && (
            <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1"><span>✕</span>{fieldErrors.city}</p>
          )}
        </div>

        {labels.postcode !== null && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="zip" className="text-sm font-medium text-gray-600">
            {labels.postcode} <span className="text-red-500">*</span>
          </label>
          <input
            id="zip"
            name="zip"
            type="text"
            value={formData.zip}
            onChange={(e) => { setFormData(prev => ({ ...prev, zip: e.target.value })); setZipCodeStateError(null); }}
            onBlur={async () => {
              touchField("zip");
              if (formData.zip.trim() && formData.state.trim() && selectedCountryCode) {
                const err = await validateZipForState(formData.zip, formData.state, selectedCountryCode);
                setZipCodeStateError(err);
              }
            }}
            placeholder={selectedCountryCode === "US" ? "90210" : selectedCountryCode === "IN" ? "110001" : "2000"}
            className={fieldClass(fieldTouched.zip, fieldErrors.zip || zipCodeStateError, formData.zip)}
          />
          {((fieldTouched.zip && fieldErrors.zip) || zipCodeStateError) && (
            <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1"><span>✕</span>{fieldErrors.zip || zipCodeStateError}</p>
          )}
        </div>
        )}
      </div>

      {/* Phone — single cohesive input row */}
      <div className="flex flex-col gap-1.5" ref={countryDropdownRef}>
        <label className="text-sm font-medium text-gray-600">
          Mobile Number <span className="text-red-500">*</span>
        </label>
        <div className={`flex items-stretch bg-white/70 border rounded-xl overflow-visible transition-all ${
          phoneTouched && phoneError
            ? "border-red-400 bg-red-50/40"
            : phoneTouched && !phoneError && phoneNumber.trim()
            ? "border-emerald-500/70 bg-emerald-50/20"
            : "border-[#d6b896] hover:border-[#a08050] focus-within:border-[#5A1E12] focus-within:ring-2 focus-within:ring-[#5A1E12]/10 focus-within:bg-white/90"
        }`}>
          {/* Country picker */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => { setShowCountryDropdown(v => !v); setCountrySearch(""); }}
              className="flex items-center gap-1.5 px-3 h-full text-sm font-medium border-r border-[#d6b896] hover:bg-black/5 transition rounded-l-xl"
            >
              <FlagImage code={selectedCountry.code} name={selectedCountry.name} />
              <span className="text-gray-700 text-xs">{selectedCountry.dialCode}</span>
              <span className="text-gray-400 text-xs">▾</span>
            </button>

            {showCountryDropdown && (
              <div className="absolute top-full left-0 z-50 mt-1 w-72 bg-white border border-[#d6b896] rounded-xl overflow-hidden">
                <div className="p-2 border-b border-[#d6b896]/50">
                  <input
                    type="text"
                    autoFocus
                    value={countrySearch}
                    onChange={e => { setCountrySearch(e.target.value); setPhoneHighlight(0); }}
                    onKeyDown={e => {
                      if (e.key === "ArrowDown") { e.preventDefault(); setPhoneHighlight(i => { const next = Math.min(i + 1, filteredCountries.length - 1); phoneListRef.current?.children[next]?.scrollIntoView({ block: "nearest" }); return next; }); }
                      else if (e.key === "ArrowUp") { e.preventDefault(); setPhoneHighlight(i => { const prev = Math.max(i - 1, 0); phoneListRef.current?.children[prev]?.scrollIntoView({ block: "nearest" }); return prev; }); }
                      else if (e.key === "Enter" && filteredCountries[phoneHighlight]) { e.preventDefault(); setSelectedCountry(filteredCountries[phoneHighlight]); setShowCountryDropdown(false); setCountrySearch(""); setPhoneError(validatePhone(phoneNumber, filteredCountries[phoneHighlight])); }
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
                        onMouseDown={() => {
                          setSelectedCountry(c);
                          setShowCountryDropdown(false);
                          setCountrySearch("");
                          setPhoneError(validatePhone(phoneNumber, c));
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                          idx === phoneHighlight
                            ? "bg-[#f5e6d3] text-[#5A1E12]"
                            : c.code === selectedCountry.code
                            ? "bg-[#5A1E12] text-white"
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

          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => handlePhoneChange(e.target.value)}
            onBlur={handlePhoneBlur}
            placeholder="Enter phone number"
            className="flex-1 px-4 py-3 text-sm text-gray-900 bg-transparent outline-none placeholder:text-gray-400"
          />
        </div>

        {phoneTouched && phoneError && (
          <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1"><span>✕</span>{phoneError}</p>
        )}
        {phoneTouched && !phoneError && phoneNumber.trim() && (
          <p className="text-xs text-emerald-600 mt-0.5 flex items-center gap-1"><span>✓</span> Looks good</p>
        )}
      </div>

      {/* Save Address & Action Buttons Section - only show for authenticated users */}
      {user && (
        <div className="bg-linear-to-br from-[#5A1E12]/5 to-[#d6b896]/10 rounded-xl p-4 border border-[#d6b896]/30">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveAsDefault}
                  onChange={(e) => setSaveAsDefault(e.target.checked)}
                  className="w-4 h-4 text-[#5A1E12] border-[#d6b896] rounded focus:ring-[#5A1E12] focus:ring-2"
                />
                <span className="text-sm text-gray-700">Save as default address</span>
              </label>
            </div>
            <div className="flex items-start">
              <button
                type="button"
                onClick={saveAddress}
                disabled={savingAddress}
                className="px-6 py-3 bg-[#5A1E12] hover:bg-[#5A1E12]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                {savingAddress ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Saving Address...
                  </>
                ) : (
                  <>
                    Save Address
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Addresses Section - show for authenticated users */}
      {user && (
        <div className="bg-linear-to-br from-[#f8f4f0] to-[#faf7f4] rounded-xl border border-[#d6b896]/40 overflow-hidden shadow-lg">
          <div className="p-4 bg-linear-to-r from-[#5A1E12] to-[#4a1810] text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Saved Addresses</h3>
                {savedAddresses.length > 0 && (
                  <span className="bg-white/20 text-xs px-2 py-1 rounded-full font-medium">{savedAddresses.length}</span>
                )}
              </div>
              {savedAddresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowSavedAddresses(!showSavedAddresses)}
                  className="text-white/80 hover:text-white transition-all duration-300 text-sm flex items-center gap-1 hover:bg-white/10 px-3 py-1 rounded-lg transform hover:scale-105"
                >
                  {showSavedAddresses ? 'Hide' : 'Show'}
                  <motion.span
                    animate={{ rotate: showSavedAddresses ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="text-sm"
                  >
                    ▼
                  </motion.span>
                </button>
              )}
            </div>
              {savedAddresses.length === 0 && !loadingSavedAddresses && (
                <div className="text-center py-4">
                  <p className="text-white/60 text-sm mb-3">No saved addresses found</p>
                  <button
                    onClick={fetchSavedAddresses}
                    className="bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1.5 rounded-lg transition-all"
                  >
                    Refresh Addresses
                  </button>
                </div>
              )}
              {loadingSavedAddresses && (
                <div className="text-center py-4">
                  <div className="inline-flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                    <span className="text-white/80 text-sm">Loading...</span>
                  </div>
                </div>
              )}
            </div>
          
          <AnimatePresence>
            {savedAddresses.length > 0 && showSavedAddresses && (
              <motion.div
                initial={{ height: 0, opacity: 0, y: -10 }}
                animate={{ height: "auto", opacity: 1, y: 0 }}
                exit={{ height: 0, opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="divide-y divide-[#d6b896]/30 overflow-hidden"
              >
                {loadingSavedAddresses ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-6 text-center"
                  >
                    <div className="inline-flex items-center gap-3 text-[#5A1E12]">
                      <div className="w-5 h-5 border-2 border-[#5A1E12]/20 border-t-[#5A1E12] rounded-full animate-spin"></div>
                      <span className="text-sm">Loading saved addresses...</span>
                    </div>
                  </motion.div>
                ) : (
                  savedAddresses.map((address, index) => (
                    <motion.div
                      key={address.id || address._id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="p-3 hover:bg-[#5A1E12]/8 transition-all duration-300 cursor-pointer group"
                      onClick={() => selectSavedAddress(address)}
                      whileHover={{ backgroundColor: "rgba(90, 30, 18, 0.1)" }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[#5A1E12] font-medium text-sm">Address {index + 1}</span>
                            {address.isDefault && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="bg-linear-to-r from-[#5A1E12] to-[#4a1810] text-white text-xs px-2 py-1 rounded-full font-medium"
                              >
                                Default
                              </motion.span>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 font-medium">{address.shippingAddress}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              selectSavedAddress(address);
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-linear-to-r from-[#5A1E12] to-[#4a1810] hover:from-[#4a1810] hover:to-[#5A1E12] text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg"
                          >
                            Use This
                          </motion.button>
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              const id = address._id || address.id;
                              if (id) handleDeleteAddress(id);
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Delete address"
                            className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {user && loadingSavedAddresses && savedAddresses.length === 0 && (
        <div className="bg-linear-to-br from-[#5A1E12]/5 to-[#d6b896]/10 rounded-xl p-6 border border-[#d6b896]/30">
          <div className="flex items-center justify-center gap-3">
            <div className="w-6 h-6 border-3 border-[#5A1E12]/20 border-t-[#5A1E12] rounded-full animate-spin"></div>
            <span className="text-[#5A1E12] font-medium">Loading your saved addresses...</span>
          </div>
        </div>
      )}
    </section>
  );
}
