"use client";
import { useState, useEffect } from "react";

interface PaymentCartProps {
  onPaymentMethodChange: (method: string) => void;
}

const inputBase = "w-full bg-white/70 border border-[#d6b896] rounded-xl px-4 py-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400";
const inputNormal = `${inputBase} hover:border-[#a08050] focus:border-[#5A1E12] focus:ring-2 focus:ring-[#5A1E12]/10 focus:bg-white/90`;
const inputError  = `${inputBase} border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-2 focus:ring-red-300/30`;
const inputValid  = `${inputBase} border-emerald-500/70 bg-emerald-50/20 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-300/30`;

const STORAGE_KEY = "paymentCartData";

function fieldClass(touched: boolean, error: string | null, value: string) {
  if (!touched) return inputNormal;
  if (error)    return inputError;
  if (value)    return inputValid;
  return inputNormal;
}

function validateCardName(v: string)   { return v.trim().length < 3 ? "Name must be at least 3 characters" : null; }
function validateCardNumber(v: string) {
  const digits = v.replace(/\s/g, "");
  if (!digits) return "Card number is required";
  if (!/^\d+$/.test(digits)) return "Card number must contain only digits";
  if (digits.length !== 16)  return "Card number must be 16 digits";
  return null;
}
function validateExpiry(v: string) {
  if (!v) return "Expiry date is required";
  if (!/^\d{2}\/\d{2}$/.test(v)) return "Use MM/YY format";
  const [mm, yy] = v.split("/").map(Number);
  if (mm < 1 || mm > 12) return "Invalid month";
  const now = new Date();
  const expDate = new Date(2000 + yy, mm - 1, 1);
  if (expDate < new Date(now.getFullYear(), now.getMonth(), 1)) return "Card has expired";
  return null;
}
function validateCvv(v: string) {
  if (!v) return "CVV is required";
  if (!/^\d{3,4}$/.test(v)) return "CVV must be 3 or 4 digits";
  return null;
}
function validateGiftCode(v: string) {
  return v.trim().length < 4 ? "Please enter a valid gift card code" : null;
}

const PAYMENT_OPTIONS = [
  { value: "card",   label: "Credit / Debit Card",  icon: "💳" },
  { value: "gift",   label: "Gift Card",             icon: "🎁" },
];

export default function PaymentCart({ onPaymentMethodChange }: PaymentCartProps) {
  const [paymentMethod, setPaymentMethod] = useState("card");

  // Card fields
  const [cardName,   setCardName]   = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry,     setExpiry]     = useState("");
  const [cvv,        setCvv]        = useState("");
  const [giftCode,   setGiftCode]   = useState("");
  const [loaded,     setLoaded]     = useState(false);

  // Restore from localStorage on mount (CVV excluded for security)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const d = JSON.parse(saved);
        if (d.paymentMethod) setPaymentMethod(d.paymentMethod);
        if (d.cardName)      setCardName(d.cardName);
        if (d.cardNumber)    setCardNumber(d.cardNumber);
        if (d.expiry)        setExpiry(d.expiry);
        if (d.giftCode)      setGiftCode(d.giftCode);
      }
    } catch {}
    setLoaded(true);
  }, []);

  // Persist to localStorage on change (CVV excluded for security)
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ paymentMethod, cardName, cardNumber, expiry, giftCode }));
  }, [paymentMethod, cardName, cardNumber, expiry, giftCode, loaded]);

  // Touched
  const [t, setT] = useState({ cardName: false, cardNumber: false, expiry: false, cvv: false, giftCode: false });
  const touch = (f: keyof typeof t) => setT(prev => ({ ...prev, [f]: true }));

  const errors = {
    cardName:   validateCardName(cardName),
    cardNumber: validateCardNumber(cardNumber),
    expiry:     validateExpiry(expiry),
    cvv:        validateCvv(cvv),
    giftCode:   validateGiftCode(giftCode),
  };

  useEffect(() => { onPaymentMethodChange(paymentMethod); }, [paymentMethod, onPaymentMethodChange]);

  // Format card number as XXXX XXXX XXXX XXXX
  const handleCardNumber = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 16);
    const formatted = digits.replace(/(.{4})/g, "$1 ").trim();
    setCardNumber(formatted);
  };

  // Auto-insert slash in expiry MM/YY
  const handleExpiry = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) {
      setExpiry(`${digits.slice(0, 2)}/${digits.slice(2)}`);
    } else {
      setExpiry(digits);
    }
  };

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#5A1E12]">How would you like to pay?</h1>
        <p className="text-sm text-gray-500 mt-1">Your payment info is secure and encrypted.</p>
      </div>

      {/* Payment method selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {PAYMENT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setPaymentMethod(opt.value)}
            className={`flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 text-sm font-medium transition-all ${
              paymentMethod === opt.value
                ? "border-[#5A1E12] bg-[#5A1E12] text-white shadow-md"
                : "border-[#d6b896] bg-white/60 hover:bg-white/80 hover:border-[#a08050] text-gray-600"
            }`}
          >
            <span className="text-2xl">{opt.icon}</span>
            <span className="text-center text-xs leading-tight">{opt.label}</span>
          </button>
        ))}
      </div>

      {/* Card Details */}
      {paymentMethod === "card" && (
        <div className="flex flex-col gap-4">
          {/* Name on card */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="cardName" className="text-sm font-medium text-gray-600">
              Name on Card <span className="text-red-500">*</span>
            </label>
            <input
              id="cardName"
              type="text"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              onBlur={() => touch("cardName")}
              placeholder="John Doe"
              className={fieldClass(t.cardName, errors.cardName, cardName)}
            />
            {t.cardName && errors.cardName && (
              <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1"><span>✕</span>{errors.cardName}</p>
            )}
          </div>

          {/* Card number */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="cardNumber" className="text-sm font-medium text-gray-600">
              Card Number <span className="text-red-500">*</span>
            </label>
            <input
              id="cardNumber"
              type="text"
              inputMode="numeric"
              value={cardNumber}
              onChange={(e) => handleCardNumber(e.target.value)}
              onBlur={() => touch("cardNumber")}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              className={fieldClass(t.cardNumber, errors.cardNumber, cardNumber)}
            />
            {t.cardNumber && errors.cardNumber && (
              <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1"><span>✕</span>{errors.cardNumber}</p>
            )}
            {t.cardNumber && !errors.cardNumber && (
              <p className="text-xs text-emerald-600 mt-0.5 flex items-center gap-1"><span>✓</span> Looks good</p>
            )}
          </div>

          {/* Expiry + CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="expiry" className="text-sm font-medium text-gray-600">
                Expiry <span className="text-red-500">*</span>
              </label>
              <input
                id="expiry"
                type="text"
                inputMode="numeric"
                value={expiry}
                onChange={(e) => handleExpiry(e.target.value)}
                onBlur={() => touch("expiry")}
                placeholder="MM / YY"
                maxLength={5}
                className={fieldClass(t.expiry, errors.expiry, expiry)}
              />
              {t.expiry && errors.expiry && (
                <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1"><span>✕</span>{errors.expiry}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="cvv" className="text-sm font-medium text-gray-600">
                CVV <span className="text-red-500">*</span>
              </label>
              <input
                id="cvv"
                type="password"
                inputMode="numeric"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                onBlur={() => touch("cvv")}
                placeholder="•••"
                maxLength={4}
                className={fieldClass(t.cvv, errors.cvv, cvv)}
              />
              {t.cvv && errors.cvv && (
                <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1"><span>✕</span>{errors.cvv}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Gift Card */}
      {paymentMethod === "gift" && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="giftCode" className="text-sm font-medium text-gray-600">
            Gift Card Code <span className="text-red-500">*</span>
          </label>
          <input
            id="giftCode"
            type="text"
            value={giftCode}
            onChange={(e) => setGiftCode(e.target.value.toUpperCase())}
            onBlur={() => touch("giftCode")}
            placeholder="XXXX-XXXX-XXXX"
            className={fieldClass(t.giftCode, errors.giftCode, giftCode)}
          />
          {t.giftCode && errors.giftCode && (
            <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1"><span>✕</span>{errors.giftCode}</p>
          )}
          {t.giftCode && !errors.giftCode && (
            <p className="text-xs text-emerald-600 mt-0.5 flex items-center gap-1"><span>✓</span> Code accepted</p>
          )}
        </div>
      )}

    </section>
  );
}
