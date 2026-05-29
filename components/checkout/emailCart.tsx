"use client";

import { useState, useEffect } from "react";

interface EmailCartProps {
  onEmailChange: (email: string) => void;
  onNameChange?: (name: string) => void;
}

type TouchedFields = { email: boolean; firstName: boolean; lastName: boolean };

function validateEmail(v: string) {
  if (!v) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : "Please enter a valid email address";
}
function validateName(v: string, label: string) {
  if (!v) return null;
  return v.trim().length >= 2 ? null : `${label} must be at least 2 characters`;
}

const inputBase = "w-full bg-white/70 border border-[#d6b896] rounded-xl px-4 py-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400";
const inputNormal = `${inputBase} hover:border-[#a08050] focus:border-[#5A1E12] focus:ring-2 focus:ring-[#5A1E12]/10 focus:bg-white/90`;
const inputError  = `${inputBase} border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-2 focus:ring-red-300/30`;
const inputValid  = `${inputBase} border-emerald-500/70 bg-emerald-50/20 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-300/30`;

function fieldClass(touched: boolean, error: string | null, value: string) {
  if (!touched) return inputNormal;
  if (error)    return inputError;
  if (value)    return inputValid;
  return inputNormal;
}

const STORAGE_KEY = "emailCartData";

export default function EmailCart({ onEmailChange, onNameChange }: EmailCartProps) {
  const [formData, setFormData] = useState({ email: "", firstName: "", lastName: "" });
  const [touched, setTouched] = useState<TouchedFields>({ email: false, firstName: false, lastName: false });
  const [loaded, setLoaded] = useState(false);

  // Restore from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData(parsed);
      }
    } catch {}
    setLoaded(true);
  }, []);

  // Persist to localStorage on change (after load)
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData, loaded]);

  useEffect(() => { onEmailChange(formData.email); }, [formData.email, onEmailChange]);

  useEffect(() => {
    if (onNameChange) {
      onNameChange([formData.firstName, formData.lastName].filter(Boolean).join(" "));
    }
  }, [formData.firstName, formData.lastName, onNameChange]);

  const errors = {
    email:     validateEmail(formData.email),
    firstName: validateName(formData.firstName, "First name"),
    lastName:  validateName(formData.lastName, "Last name"),
  };

  const set = (field: keyof typeof formData, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }));
  const touch = (field: keyof TouchedFields) =>
    setTouched(prev => ({ ...prev, [field]: true }));

  return (
    <section className="flex flex-col gap-6">
      <div className="lg:mt-6">
        <h1 className="text-2xl font-bold text-[#5A1E12]">Who is placing this order?</h1>
        <p className="text-sm text-gray-500 mt-1">Fields marked <span className="text-red-500">*</span> are required.</p>
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-gray-600">
          Email  <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={(e) => set("email", e.target.value)}
          onBlur={() => touch("email")}
          placeholder="you@example.com"
          className={fieldClass(touched.email, errors.email, formData.email)}
        />
        {touched.email && errors.email && (
          <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1"><span>✕</span>{errors.email}</p>
        )}
        {touched.email && !errors.email && formData.email && (
          <p className="text-xs text-emerald-600 mt-0.5 flex items-center gap-1"><span>✓</span> Looks good</p>
        )}
      </div>

      {/* Name row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="firstName" className="text-sm font-medium text-gray-600">
            First Name  <span className="text-red-500">*</span>
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            value={formData.firstName}
            onChange={(e) => set("firstName", e.target.value)}
            onBlur={() => touch("firstName")}
            placeholder="John"
            className={fieldClass(touched.firstName, errors.firstName, formData.firstName)}
          />
          {touched.firstName && errors.firstName && (
            <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1"><span>✕</span>{errors.firstName}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="lastName" className="text-sm font-medium text-gray-600">
            Last Name  <span className="text-red-500">*</span>
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={(e) => set("lastName", e.target.value)}
            onBlur={() => touch("lastName")}
            placeholder="Doe"
            className={fieldClass(touched.lastName, errors.lastName, formData.lastName)}
          />
          {touched.lastName && errors.lastName && (
            <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1"><span>✕</span>{errors.lastName}</p>
          )}
        </div>
      </div>
    </section>
  );
}
