// "use client";
// import React from "react";
// import Image from "next/image";
// import Testimonials from "@/components/cards/Testimonials";

// export default function Page() {
//   return (
//     <>
//       {/* Hero Section */}
//       <section className="bg-[#ebe2d5]">
//         {/* HERO SECTION */}
//         <div className="relative min-h-[70vh] overflow-hidden bg-[url('/images/main.png')] bg-cover bg-center ">
//         <div className="absolute inset-0 bg-black/50"></div>

//         <div className="relative z-10 flex flex-col items-center justify-center text-white text-center px-4 py-60 ">
//           <h1 className="text-5xl font-bold mb-2">Contact Us</h1>
//           <p className="text-lg max-w-2xl">
//             Lorem ipsum dolor sit amet consectetur adipisicing elit.
//             Facilis excepturi sed ab aut tempora vitae.
//           </p>
//         </div>
//       </div>
//       </section>

//       {/* Map and Form section */}
//       <section className="flex items-start my-16 px-14 gap-24 max-w-screen-2xl mx-auto">
//         {/* LEFT FORM */}
//         <div className="w-3/5">
//           <form className="space-y-6">
//             {/* ROW 1: TWO INPUTS */}
//             <div className="flex gap-6">
//               <input
//                 type="text"
//                 placeholder="Enter your Name *"
//                 required
//                 className="w-1/2 bg-[#F1E4D3] px-6 py-4 rounded-full outline-none"
//               />

//               <input
//                 type="text"
//                 placeholder="Enter your Phone"
//                 className="w-1/2 bg-[#F1E4D3] px-6 py-4 rounded-full outline-none"
//               />
//             </div>

//             {/* ROW 2: EMAIL (FULL WIDTH) */}
//             <input
//               type="email"
//               placeholder="Enter your Email Address *"
//               required
//               className="w-full bg-[#F1E4D3] px-6 py-4 rounded-full outline-none"
//             />

//             {/* ROW 3: MESSAGE */}
//             <textarea
//               placeholder="Enter your Message *"
//               required
//               rows={5}
//               className="w-full bg-[#F1E4D3] px-6 py-4 rounded-3xl outline-none resize-none"
//             />

//             {/* SUBMIT BUTTON */}
//             <button
//               type="submit"
//               className="bg-[#3b0f06] text-white px-20 py-2 rounded-full font-medium"
//             >
//               Submit
//             </button>
//           </form>
//         </div>

//         {/* RIGHT IMAGE */}
//         <div className="w-2/5">
//           <div className="w-full h-105 rounded-3xl overflow-hidden">
//             <iframe
//               src="https://www.google.com/maps?q=India&z=5&output=embed"
//               className="w-full h-full border-0"
//               loading="lazy"
//               referrerPolicy="no-referrer-when-downgrade"
//             ></iframe>
//           </div>
//         </div>
//       </section>

//       {/* User Reviews / Testimonials */}
//       <section className="flex items-start py-14 gap-16 ">
//         <Testimonials />
//       </section>

//       {/* Explore Section*/}
//       <section className="pb-12 text-white max-w-screen-2xl mx-auto">
//         <div className="relative bg-[url('/images/contact-us.jpg')] bg-cover bg-center h-120 w-full rounded-3xl overflow-hidden flex flex-col justify-center items-center">
//           {/* BLACK OVERLAY */}
//           <div className="absolute inset-0 bg-black/30"></div>

//           {/* CONTENT */}
//           <Image
//             src="/images/navbarLogo.png"
//             alt="Logo"
//             height={200}
//             width={200}
//             className="relative z-10 w-20"
//           />

//           <h1 className="relative z-10 text-4xl font-bold mb-5">
//             Enter Heading Here
//           </h1>
//           <p className="  z-30 w-170 text-center  items-center justify-center mb-5">
//             Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis
//             tenetur quam voluptatibus numquam inventore officiis quibusdam,
//             nesciunt sit optio quidem Lorem, ipsum dolor. Lorem ipsum dolor
//             consectetur.!
//           </p>

//           <button className="z-30 px-14 py-2.5 rounded-4xl bg-[#d3b994] text-[#582419]">
//             Explore Marketplace
//           </button>
//         </div>
//       </section>
//     </>
//   );
// }


"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Testimonials from "@/components/cards/Testimonials";
import { MapPin, Phone, Mail, Send, ArrowRight, ChevronDown } from "lucide-react";
import ReactCountryFlag from "react-country-flag";
import { getCountries, getCountryCallingCode } from "react-phone-number-input/input";
import { isValidPhoneNumber } from "react-phone-number-input";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import type { CountryCode } from "libphonenumber-js";
import en from "react-phone-number-input/locale/en.json";
import { apiClient } from "@/lib/api";
import VideoHeroSection from "@/components/common-components/VideoHeroSection";

const FAQS = [
  {
    question: "How soon will your team respond to my enquiry?",
    answer: "We aim to respond as quickly as possible. For order-related enquiries, please include your Order ID and the email address used at checkout so our team can help you faster.",
  },
  {
    question: "Which issue type should I choose on the contact form?",
    answer: "Choose the option that best matches your enquiry. If you are unsure, select General Enquiry and add the details in your message.",
  },
  {
    question: "Can I contact you about an order without an account?",
    answer: "Yes. You can use the contact form for guest orders. Please include your Order ID, email address, and any relevant details about the product or seller.",
  },
  {
    question: "Who should sellers contact for registration or payout help?",
    answer: "Sellers can submit the form and select Seller Registration or General Enquiry. For payout questions, include your store name and the email address linked to your seller account.",
  },
  {
    question: "Can I visit or contact Made in Arnhem Land directly?",
    answer: "You can find our office address, phone number, and support email on this page. If you plan to discuss a specific order, seller application, or partnership, sending the form first helps us direct your enquiry to the right person.",
  },
];

// ─── FAQ Data ────────────────────────────────────────────────────────────────
// const FAQS = [
//   {
//     question: "How do I become a verified seller on the marketplace?",
//     answer: "Becoming a seller is easy! Click on 'Seller Onboarding' at the bottom of the page, fill out your business profile, verify your identity, and set up your storefront. Once approved, you can start listing products immediately."
//   },
//   {
//     question: "How are shipping and commissions handled?",
//     answer: "Our platform takes a small flat commission on every successful sale. Sellers have the freedom to set their own shipping rates or use our integrated logistics partners for standardized global delivery."
//   },
//   {
//     question: "What happens if a buyer requests a refund?",
//     answer: "If a buyer is unsatisfied, they can initiate a return within our 30-day buyer protection window. The dispute is first handled directly between the buyer and seller. If unresolved, our support team steps in to mediate based on marketplace policies."
//   },
//   {
//     question: "How often do sellers receive their payouts?",
//     answer: "Seller payouts are processed automatically via Stripe Connect. Once an order is delivered and the dispute window closes, funds are transferred directly to your registered bank account on a bi-weekly schedule."
//   },
//   {
//     question: "Can I manage my store inventory from a mobile device?",
//     answer: "Absolutely! Our seller dashboard is fully responsive. You can add new products, track active orders, respond to customer inquiries, and view analytics directly from your smartphone or tablet."
//   }
// ];

// ─── Country phone data from react-phone-number-input ────────────────────────
const countryCodeList = getCountries();

// Build COUNTRIES array — all countries from react-phone-number-input with CDN flag images
const COUNTRIES = countryCodeList.map((code) => ({
  code,
  name: (en as Record<string, string>)[code] || code,
  dialCode: `+${getCountryCallingCode(code as CountryCode)}`,
})).sort((a, b) => a.name.localeCompare(b.name));

const DEFAULT_PHONE_COUNTRY =
  COUNTRIES.find((country) => country.code === "AU") ?? COUNTRIES[0];

type Country = typeof COUNTRIES[number];

function validatePhone(digits: string, country: Country): string | null {
  if (!digits.trim()) return 'Phone number is required.';
  
  const cleaned = digits.replace(/\D/g, '');
  
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
    const phoneNumber = parsePhoneNumberFromString(cleaned, country.code as any);
    if (!phoneNumber) return 'Invalid phone number format.';
    
    if (!phoneNumber.isValid()) return `Invalid ${country.name} phone number.`;
    
    return null;
  } catch (error) {
    return 'Invalid phone number format.';
  }
}

const ISSUE_TYPES = [
  "Customer Order Support",
  "Seller Registration",
  "Becoming a Marketplace Partner",
  "Cultural or Community Enquiries",
  "Media / Press",
  "General Enquiry"
];

const CONTACT_MAP_URL = "https://www.google.com/maps/search/?api=1&query=70+O'Sullivan+Circuit+East+Arm+NT+0822";

export default function Page() {
  const [fields, setFields] = useState({ issueType: "", name: "", phone: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Phone country picker
  const [phoneCountry, setPhoneCountry] = useState<Country>(DEFAULT_PHONE_COUNTRY);
  const [phoneSearch, setPhoneSearch] = useState('');
  const [showPhoneDropdown, setShowPhoneDropdown] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [phoneInputError, setPhoneInputError] = useState<string | null>(null);
  const phoneDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (phoneDropdownRef.current && !phoneDropdownRef.current.contains(e.target as Node)) {
        setShowPhoneDropdown(false);
        setPhoneSearch('');
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!fields.issueType)      newErrors.issueType = 'Please select an issue type.';
    if (!fields.name.trim())    newErrors.name    = 'Full name is required.';
    if (!fields.phone.trim())   newErrors.phone   = 'Phone number is required.';
    if (!fields.email.trim())   newErrors.email   = 'Email address is required.';
    if (!fields.message.trim()) newErrors.message = 'Message is required.';
    
    // Validate phone number format when present
    if (fields.phone.trim()) {
      const phoneErr = validatePhone(fields.phone, phoneCountry);
      if (phoneErr) newErrors.phone = phoneErr;
    }
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    
    setIsSubmitting(true);
    try {
      // Send the payload to the API
      await apiClient.post("/contact", {
        issueType: fields.issueType,
        fullName: fields.name.trim(),
        email: fields.email.trim(),
        message: fields.message.trim(),
        phoneNumber: fields.phone.trim() || undefined
      }, false); // false for no auth
      
      setSubmitted(true);
      setFields({ issueType: "", name: "", phone: "", email: "", message: "" });
    } catch (error: any) {
      setErrors({ form: error.message || "Failed to submit form. Please try again later." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBase = "w-full min-w-0 px-4 sm:px-5 py-4 rounded-xl outline-none transition-all";
  const inputNormal = `${inputBase} bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#3b0f06]/20 focus:border-[#3b0f06]`;
  const inputError  = `${inputBase} bg-red-50 border border-red-400 focus:ring-2 focus:ring-red-200 focus:border-red-500`;

  return (
    <main className="bg-[#ebe2d5] min-h-screen font-sans overflow-x-hidden box-border">
      
      {/* --- HERO SECTION --- */}
      <VideoHeroSection className="h-[80vh]">
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4 max-w-full box-border">
          <span className="mb-4 max-w-[calc(100vw-2rem)] whitespace-normal px-4 py-1.5 rounded-full border border-white/20 bg-white/10 text-sm font-medium backdrop-blur-md">
             We'd love to hear from you
          </span>
          <h1 className="text-[2.25rem] sm:text-4xl md:text-6xl font-bold mb-2 md:mb-6 tracking-tight">Contact Us</h1>
          <p className="text-sm sm:text-base text-gray-200 max-w-full sm:max-w-2xl leading-relaxed">
            Have a question or need assistance? Reach out to our team and we'll get back to you.
          </p>
        </div>
      </VideoHeroSection>

      {/* We pull this section UP to overlap the hero for a modern look (-mt-20) */}
      <section className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-14 lg:-mt-20 mb-16 sm:mb-20 box-border">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 min-w-0">
          
          {/* LEFT: THE FORM (Takes up 2 cols) */}
          <div className="lg:col-span-2 w-full min-w-0 max-w-full bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-12 shadow-2xl shadow-[#3b0f06]/5 box-border">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#3b0f06] mb-2">Send us a message</h2>
            <p className="text-sm sm:text-base text-gray-500 mb-2 break-words">Fill out the form below and our team will get back to you.</p>
            <p className="text-xs text-gray-400 mb-8"><span className="text-red-500 font-bold">*</span> Required fields</p>
            
            <form className="space-y-6" noValidate onSubmit={handleSubmit}>

              {submitted && (
                <div className="flex items-start sm:items-center gap-3 px-4 sm:px-5 py-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-medium">
                  <svg className="w-5 h-5 shrink-0 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Message sent! We'll get back to you within 24 hours.
                </div>
              )}

              {errors.form && (
                <div className="flex items-start sm:items-center gap-3 px-4 sm:px-5 py-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm font-medium">
                  {errors.form}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-600 ml-1">Issue Type <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select
                    name="issueType"
                    value={fields.issueType}
                    onChange={handleChange}
                    className={`${errors.issueType ? inputError : inputNormal} appearance-none cursor-pointer`}
                  >
                    <option value="" disabled>Select an issue type</option>
                    {ISSUE_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400">
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </div>
                {errors.issueType && <p className="text-xs text-red-500 ml-1">{errors.issueType}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
                <div className="space-y-1.5 min-w-0">
                    <label className="text-sm font-semibold text-gray-600 ml-1">Full Name <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        name="name"
                        value={fields.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className={errors.name ? inputError : inputNormal}
                    />
                    {errors.name && <p className="text-xs text-red-500 ml-1">{errors.name}</p>}
                </div>
                <div className="space-y-1.5 min-w-0">
                    <label className="text-sm font-semibold text-gray-600 ml-1">Phone Number <span className="text-red-500">*</span></label>
                    <div ref={phoneDropdownRef} className="relative w-full max-w-full">
                      <div className={`flex w-full min-w-0 items-center bg-gray-50 border rounded-xl overflow-visible transition-all ${
                        errors.phone
                          ? 'border-red-400 ring-2 ring-red-200 bg-red-50'
                          : phoneTouched && !phoneInputError && fields.phone.trim()
                          ? 'border-[#3b0f06]/60'
                          : 'border-gray-200 focus-within:border-[#3b0f06] focus-within:ring-2 focus-within:ring-[#3b0f06]/20'
                      }`}>
                        {/* Country picker button */}
                        <button
                          type="button"
                          onClick={() => { setShowPhoneDropdown(v => !v); setPhoneSearch(''); }}
                          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-4 text-sm font-medium border-r border-gray-200 hover:bg-gray-100 transition rounded-l-xl shrink-0"
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
                          <span className="text-gray-700 text-xs font-semibold">{phoneCountry.dialCode}</span>
                          <span className="text-gray-400 text-xs">▾</span>
                        </button>
                        <input
                          type="tel"
                          name="phone"
                          value={fields.phone}
                          onChange={(e) => {
                            const v = e.target.value.replace(/[^\d\s\-().]/g, '');
                            setFields(prev => ({ ...prev, phone: v }));
                            if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                            if (phoneTouched) setPhoneInputError(validatePhone(v, phoneCountry));
                          }}
                          onBlur={() => { setPhoneTouched(true); setPhoneInputError(validatePhone(fields.phone, phoneCountry)); }}
                          placeholder="Enter phone number"
                          className="min-w-0 flex-1 px-3 sm:px-4 py-4 text-sm bg-transparent outline-none placeholder-gray-400 text-gray-700"
                        />
                      </div>
                      {/* Country dropdown */}
                      {showPhoneDropdown && (
                        <div className="absolute top-full left-0 right-0 sm:right-auto z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden w-full sm:w-64 max-w-full">
                          <div className="p-2 border-b border-gray-100">
                            <input
                              type="text"
                              autoFocus
                              value={phoneSearch}
                              onChange={(e) => setPhoneSearch(e.target.value)}
                              placeholder="Search country…"
                              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#3b0f06] bg-white text-gray-700"
                            />
                          </div>
                          <ul className="max-h-52 overflow-y-auto">
                            {COUNTRIES
                              .filter(c => c.name.toLowerCase().includes(phoneSearch.toLowerCase()) || c.dialCode.includes(phoneSearch))
                              .map(c => (
                                <li key={c.code}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPhoneCountry(c);
                                      setShowPhoneDropdown(false);
                                      setPhoneSearch('');
                                      if (phoneTouched) setPhoneInputError(validatePhone(fields.phone, c));
                                      if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                                    }}
                                    className={`w-full min-w-0 flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-gray-50 text-left transition ${
                                      c.code === phoneCountry.code ? 'bg-[#3b0f06]/8 font-medium text-[#3b0f06]' : 'text-gray-700'
                                    }`}
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
                                    <span className="flex-1 truncate">{c.name}</span>
                                    <span className="text-gray-400 text-xs shrink-0">{c.dialCode}</span>
                                  </button>
                                </li>
                              ))
                            }
                          </ul>
                        </div>
                      )}
                    </div>
                    {errors.phone && <p className="text-xs text-red-500 ml-1">{errors.phone}</p>}
                    {!errors.phone && phoneTouched && phoneInputError && <p className="text-xs text-red-500 ml-1">{phoneInputError}</p>}
                    {!errors.phone && phoneTouched && !phoneInputError && fields.phone.trim() && <p className="text-xs text-green-600 ml-1">✓ Looks good</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-600 ml-1">Email Address <span className="text-red-500">*</span></label>
                <input
                    type="email"
                    name="email"
                    value={fields.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className={errors.email ? inputError : inputNormal}
                />
                {errors.email && <p className="text-xs text-red-500 ml-1">Email address is required.</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-600 ml-1">Message <span className="text-red-500">*</span></label>
                <textarea
                    name="message"
                    value={fields.message}
                    onChange={handleChange}
                    placeholder="How can we help you?"
                    rows={6}
                    className={errors.message ? inputError : inputNormal + " resize-none"}
                />
                {errors.message && <p className="text-xs text-red-500 ml-1">Message is required.</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="group flex items-center justify-center gap-2 w-full md:w-auto bg-[#3b0f06] text-white px-10 py-4 rounded-xl font-semibold hover:bg-[#582419] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
                {!isSubmitting && <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>
          </div>

          {/* RIGHT: CONTACT INFO & MAP (Takes up 1 col) */}
          <div className="space-y-8 w-full min-w-0 max-w-full">
            
            {/* Contact Details Card */}
            <div className="bg-[#3b0f06] text-[#ebe2d5] rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl w-full max-w-full box-border">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-4 sm:mb-6">Contact Information</h3>
                
                <div className="space-y-6">
                    <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                        <div className="p-3 bg-white/10 rounded-lg shrink-0">
                            <MapPin className="w-6 h-6 text-[#d3b994]" />
                        </div>
                        <div className="min-w-0">
                            <p className="font-semibold text-white">Address</p>
                            <a
                              href={CONTACT_MAP_URL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-white/70 leading-relaxed mt-1 inline-block hover:text-white underline-offset-2 hover:underline break-words transition-colors"
                              aria-label="Open address in Google Maps"
                            >
                              70 O'Sullivan Circuit East Arm<br />
                              NT 0822
                            </a>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        <div className="p-3 bg-white/10 rounded-lg shrink-0">
                            <Phone className="w-6 h-6 text-[#d3b994]" />
                        </div>
                        <div className="min-w-0">
                            <p className="font-semibold text-white">Phone Number</p>
                            <a
                              href="tel:+61889446444"
                              className="text-sm text-white/70 mt-1 inline-block hover:text-white underline-offset-2 hover:underline transition-colors"
                            >
                              +61 (08) 8944 6444
                            </a>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        <div className="p-3 bg-white/10 rounded-lg shrink-0">
                            <Mail className="w-6 h-6 text-[#d3b994]" />
                        </div>
                        <div className="min-w-0">
                            <p className="font-semibold text-white">Email Address</p>
                            <a
                              href="support@madeinarnhemland.com.au"
                              className="text-sm text-white/70 mt-1 inline-block hover:text-white underline-offset-2 hover:underline break-all transition-colors"
                            >
                            support@madeinarnhemland.com.au
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Widget */}
            <div className="h-64 sm:h-80 w-full max-w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border-4 border-white">
               <iframe
                 src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3895.6913516580225!2d130.91642767464342!3d-12.47026374992954!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2cc097a791e164fb%3A0xac9093a704258e94!2s70%20O&#39;Sullivan%20Cct%2C%20East%20Arm%20NT%200822%2C%20Australia!5e0!3m2!1sen!2sin!4v1774333564171!5m2!1sen!2sin"
                 className="w-full h-full border-0 grayscale hover:grayscale-0 transition-all duration-700"
                 loading="lazy"
                 referrerPolicy="no-referrer-when-downgrade"
               ></iframe>
            </div>

          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#3b0f06] mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Find answers to some of the most common questions below.</p>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {FAQS.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div 
                key={index}
                className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all duration-300 ${isOpen ? 'border-[#3b0f06]/40 shadow-md' : 'border-gray-100 hover:border-[#3b0f06]/20'}`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-4 sm:p-6 text-left focus:outline-none"
                >
                  <h3 className={`font-bold text-sm sm:text-lg transition-colors ${isOpen ? 'text-[#3b0f06]' : 'text-gray-800'}`}>
                    {faq.question}
                  </h3>
                  <ChevronDown className={`w-5 h-5 shrink-0 text-[#3b0f06] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <div 
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p  className="px-4 sm:px-6 pb-4 sm:pb-6 text-gray-600 text-xs sm:text-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-10 flex justify-center">
          <Link href="/faqs">
            <button className="inline-flex items-center justify-center gap-2 rounded-full bg-[#3b0f06] px-7 py-3 text-sm font-bold text-white shadow-sm transition-all duration-300 hover:bg-[#5a1e12] hover:shadow-md cursor-pointer">
              View More
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </section>

      {/* --- EXPLORE SECTION --- */}
      <section className="pb-12 px-4 sm:px-6 lg:px-8 w-full overflow-hidden">
        <div className="max-w-7xl mx-auto relative bg-[url('/images/contact-us.jpg')] bg-cover bg-center min-h-80 sm:min-h-105 lg:h-125 w-full rounded-2xl sm:rounded-[2.5rem] overflow-hidden group">
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-black/30 transition-opacity duration-500"></div>

          <div className="relative z-10 flex flex-col items-center justify-center min-h-80 sm:min-h-105 lg:h-125 text-center px-4 sm:px-6 py-10 sm:py-0 max-w-full">
            <Image
              src="/images/navbarLogo.png"
              alt="Logo"
              height={120}
              width={120}
              className="w-14 sm:w-20 md:w-24 mb-4 sm:mb-6 drop-shadow-lg"
            />

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-6 transform transition-transform duration-500 group-hover:-translate-y-2">
              Ready to get started?
            </h1>
            <p className="text-sm sm:text-base text-gray-200 max-w-full sm:max-w-xl mb-6 sm:mb-8 leading-relaxed">
               Discover our marketplace and find exactly what you need with our curated collection of premium items.
            </p>

            <Link href="/shop" className="max-w-full">
              <button className="flex max-w-full items-center justify-center gap-2 px-5 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base rounded-full bg-[#d3b994] text-[#3b0f06] font-bold hover:bg-white transition-all duration-300 shadow-lg hover:shadow-orange-500/20 cursor-pointer">
                Explore Marketplace
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
