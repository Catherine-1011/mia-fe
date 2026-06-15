"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";

const baseURL = "https://backend.madeinarnhemland.com.au";

// ─── Country phone data ───────────────────────────────────────────────────────
type Country = {
  code: string;
  flag: string;
  name: string;
  dialCode: string;
  digits: [number, number];
};

const COUNTRIES: Country[] = [
  // Oceania
  { code: "AU", flag: "🇦🇺", name: "Australia", dialCode: "+61", digits: [9, 10] },
  { code: "NZ", flag: "🇳🇿", name: "New Zealand", dialCode: "+64", digits: [8, 9] },
  { code: "FJ", flag: "🇫🇯", name: "Fiji", dialCode: "+679", digits: [7, 7] },
  { code: "PG", flag: "🇵🇬", name: "Papua New Guinea", dialCode: "+675", digits: [7, 8] },
  { code: "WS", flag: "🇼🇸", name: "Samoa", dialCode: "+685", digits: [5, 7] },
  { code: "TO", flag: "🇹🇴", name: "Tonga", dialCode: "+676", digits: [5, 7] },
  { code: "VU", flag: "🇻🇺", name: "Vanuatu", dialCode: "+678", digits: [5, 7] },
  { code: "SB", flag: "🇸🇧", name: "Solomon Islands", dialCode: "+677", digits: [5, 7] },
  { code: "KI", flag: "🇰🇮", name: "Kiribati", dialCode: "+686", digits: [5, 8] },
  { code: "TV", flag: "🇹🇻", name: "Tuvalu", dialCode: "+688", digits: [5, 6] },
  { code: "NR", flag: "🇳🇷", name: "Nauru", dialCode: "+674", digits: [4, 7] },
  { code: "CK", flag: "🇨🇰", name: "Cook Islands", dialCode: "+682", digits: [5, 5] },
  // Asia
  { code: "CN", flag: "🇨🇳", name: "China", dialCode: "+86", digits: [11, 11] },
  { code: "IN", flag: "🇮🇳", name: "India", dialCode: "+91", digits: [10, 10] },
  { code: "JP", flag: "🇯🇵", name: "Japan", dialCode: "+81", digits: [10, 11] },
  { code: "KR", flag: "🇰🇷", name: "South Korea", dialCode: "+82", digits: [9, 10] },
  { code: "SG", flag: "🇸🇬", name: "Singapore", dialCode: "+65", digits: [8, 8] },
  { code: "MY", flag: "🇲🇾", name: "Malaysia", dialCode: "+60", digits: [9, 10] },
  { code: "TH", flag: "🇹🇭", name: "Thailand", dialCode: "+66", digits: [9, 9] },
  { code: "VN", flag: "🇻🇳", name: "Vietnam", dialCode: "+84", digits: [9, 10] },
  { code: "PH", flag: "🇵🇭", name: "Philippines", dialCode: "+63", digits: [10, 10] },
  { code: "ID", flag: "🇮🇩", name: "Indonesia", dialCode: "+62", digits: [9, 12] },
  { code: "PK", flag: "🇵🇰", name: "Pakistan", dialCode: "+92", digits: [10, 10] },
  { code: "BD", flag: "🇧🇩", name: "Bangladesh", dialCode: "+880", digits: [10, 10] },
  { code: "LK", flag: "🇱🇰", name: "Sri Lanka", dialCode: "+94", digits: [9, 9] },
  { code: "NP", flag: "🇳🇵", name: "Nepal", dialCode: "+977", digits: [10, 10] },
  { code: "MM", flag: "🇲🇲", name: "Myanmar", dialCode: "+95", digits: [8, 10] },
  { code: "KH", flag: "🇰🇭", name: "Cambodia", dialCode: "+855", digits: [8, 9] },
  { code: "LA", flag: "🇱🇦", name: "Laos", dialCode: "+856", digits: [9, 10] },
  { code: "MN", flag: "🇲🇳", name: "Mongolia", dialCode: "+976", digits: [8, 8] },
  { code: "BT", flag: "🇧🇹", name: "Bhutan", dialCode: "+975", digits: [7, 8] },
  { code: "MV", flag: "🇲🇻", name: "Maldives", dialCode: "+960", digits: [7, 7] },
  { code: "TL", flag: "🇹🇱", name: "Timor-Leste", dialCode: "+670", digits: [7, 8] },
  { code: "BN", flag: "🇧🇳", name: "Brunei", dialCode: "+673", digits: [7, 7] },
  { code: "KP", flag: "🇰🇵", name: "North Korea", dialCode: "+850", digits: [8, 13] },
  { code: "TW", flag: "🇹🇼", name: "Taiwan", dialCode: "+886", digits: [9, 9] },
  { code: "HK", flag: "🇭🇰", name: "Hong Kong", dialCode: "+852", digits: [8, 8] },
  { code: "MO", flag: "🇲🇴", name: "Macao", dialCode: "+853", digits: [8, 8] },
  // Middle East
  { code: "AE", flag: "🇦🇪", name: "UAE", dialCode: "+971", digits: [9, 9] },
  { code: "SA", flag: "🇸🇦", name: "Saudi Arabia", dialCode: "+966", digits: [9, 9] },
  { code: "TR", flag: "🇹🇷", name: "Turkey", dialCode: "+90", digits: [10, 10] },
  { code: "IL", flag: "🇮🇱", name: "Israel", dialCode: "+972", digits: [9, 9] },
  { code: "IQ", flag: "🇮🇶", name: "Iraq", dialCode: "+964", digits: [10, 10] },
  { code: "IR", flag: "🇮🇷", name: "Iran", dialCode: "+98", digits: [10, 10] },
  { code: "KW", flag: "🇰🇼", name: "Kuwait", dialCode: "+965", digits: [8, 8] },
  { code: "QA", flag: "🇶🇦", name: "Qatar", dialCode: "+974", digits: [8, 8] },
  { code: "BH", flag: "🇧🇭", name: "Bahrain", dialCode: "+973", digits: [8, 8] },
  { code: "OM", flag: "🇴🇲", name: "Oman", dialCode: "+968", digits: [8, 8] },
  { code: "JO", flag: "🇯🇴", name: "Jordan", dialCode: "+962", digits: [9, 9] },
  { code: "LB", flag: "🇱🇧", name: "Lebanon", dialCode: "+961", digits: [7, 8] },
  { code: "SY", flag: "🇸🇾", name: "Syria", dialCode: "+963", digits: [9, 9] },
  { code: "YE", flag: "🇾🇪", name: "Yemen", dialCode: "+967", digits: [9, 9] },
  { code: "PS", flag: "🇵🇸", name: "Palestine", dialCode: "+970", digits: [9, 9] },
  { code: "AF", flag: "🇦🇫", name: "Afghanistan", dialCode: "+93", digits: [9, 9] },
  // Central Asia
  { code: "KZ", flag: "🇰🇿", name: "Kazakhstan", dialCode: "+7", digits: [10, 10] },
  { code: "UZ", flag: "🇺🇿", name: "Uzbekistan", dialCode: "+998", digits: [9, 9] },
  { code: "TM", flag: "🇹🇲", name: "Turkmenistan", dialCode: "+993", digits: [8, 8] },
  { code: "TJ", flag: "🇹🇯", name: "Tajikistan", dialCode: "+992", digits: [9, 9] },
  { code: "KG", flag: "🇰🇬", name: "Kyrgyzstan", dialCode: "+996", digits: [9, 9] },
  // Caucasus
  { code: "GE", flag: "🇬🇪", name: "Georgia", dialCode: "+995", digits: [9, 9] },
  { code: "AM", flag: "🇦🇲", name: "Armenia", dialCode: "+374", digits: [8, 8] },
  { code: "AZ", flag: "🇦🇿", name: "Azerbaijan", dialCode: "+994", digits: [9, 9] },
  // Europe
  { code: "GB", flag: "🇬🇧", name: "United Kingdom", dialCode: "+44", digits: [10, 10] },
  { code: "DE", flag: "🇩🇪", name: "Germany", dialCode: "+49", digits: [10, 11] },
  { code: "FR", flag: "🇫🇷", name: "France", dialCode: "+33", digits: [9, 9] },
  { code: "IT", flag: "🇮🇹", name: "Italy", dialCode: "+39", digits: [9, 11] },
  { code: "ES", flag: "🇪🇸", name: "Spain", dialCode: "+34", digits: [9, 9] },
  { code: "PT", flag: "🇵🇹", name: "Portugal", dialCode: "+351", digits: [9, 9] },
  { code: "NL", flag: "🇳🇱", name: "Netherlands", dialCode: "+31", digits: [9, 9] },
  { code: "BE", flag: "🇧🇪", name: "Belgium", dialCode: "+32", digits: [8, 9] },
  { code: "CH", flag: "🇨🇭", name: "Switzerland", dialCode: "+41", digits: [9, 9] },
  { code: "AT", flag: "🇦🇹", name: "Austria", dialCode: "+43", digits: [10, 13] },
  { code: "SE", flag: "🇸🇪", name: "Sweden", dialCode: "+46", digits: [7, 9] },
  { code: "NO", flag: "🇳🇴", name: "Norway", dialCode: "+47", digits: [8, 8] },
  { code: "DK", flag: "🇩🇰", name: "Denmark", dialCode: "+45", digits: [8, 8] },
  { code: "FI", flag: "🇫🇮", name: "Finland", dialCode: "+358", digits: [9, 10] },
  { code: "PL", flag: "🇵🇱", name: "Poland", dialCode: "+48", digits: [9, 9] },
  { code: "CZ", flag: "🇨🇿", name: "Czech Republic", dialCode: "+420", digits: [9, 9] },
  { code: "SK", flag: "🇸🇰", name: "Slovakia", dialCode: "+421", digits: [9, 9] },
  { code: "HU", flag: "🇭🇺", name: "Hungary", dialCode: "+36", digits: [9, 9] },
  { code: "RO", flag: "🇷🇴", name: "Romania", dialCode: "+40", digits: [9, 9] },
  { code: "BG", flag: "🇧🇬", name: "Bulgaria", dialCode: "+359", digits: [9, 9] },
  { code: "HR", flag: "🇭🇷", name: "Croatia", dialCode: "+385", digits: [8, 9] },
  { code: "RS", flag: "🇷🇸", name: "Serbia", dialCode: "+381", digits: [8, 9] },
  { code: "GR", flag: "🇬🇷", name: "Greece", dialCode: "+30", digits: [10, 10] },
  { code: "UA", flag: "🇺🇦", name: "Ukraine", dialCode: "+380", digits: [9, 9] },
  { code: "RU", flag: "🇷🇺", name: "Russia", dialCode: "+7", digits: [10, 10] },
  { code: "IE", flag: "🇮🇪", name: "Ireland", dialCode: "+353", digits: [9, 9] },
  { code: "IS", flag: "🇮🇸", name: "Iceland", dialCode: "+354", digits: [7, 7] },
  { code: "LU", flag: "🇱🇺", name: "Luxembourg", dialCode: "+352", digits: [9, 11] },
  { code: "EE", flag: "🇪🇪", name: "Estonia", dialCode: "+372", digits: [7, 8] },
  { code: "LV", flag: "🇱🇻", name: "Latvia", dialCode: "+371", digits: [8, 8] },
  { code: "LT", flag: "🇱🇹", name: "Lithuania", dialCode: "+370", digits: [8, 8] },
  { code: "SI", flag: "🇸🇮", name: "Slovenia", dialCode: "+386", digits: [8, 8] },
  { code: "MK", flag: "🇲🇰", name: "North Macedonia", dialCode: "+389", digits: [8, 8] },
  { code: "BA", flag: "🇧🇦", name: "Bosnia & Herzegovina", dialCode: "+387", digits: [8, 8] },
  { code: "AL", flag: "🇦🇱", name: "Albania", dialCode: "+355", digits: [9, 9] },
  { code: "ME", flag: "🇲🇪", name: "Montenegro", dialCode: "+382", digits: [8, 8] },
  { code: "MD", flag: "🇲🇩", name: "Moldova", dialCode: "+373", digits: [8, 8] },
  { code: "BY", flag: "🇧🇾", name: "Belarus", dialCode: "+375", digits: [9, 9] },
  { code: "MT", flag: "🇲🇹", name: "Malta", dialCode: "+356", digits: [8, 8] },
  { code: "CY", flag: "🇨🇾", name: "Cyprus", dialCode: "+357", digits: [8, 8] },
  { code: "MC", flag: "🇲🇨", name: "Monaco", dialCode: "+377", digits: [8, 9] },
  { code: "AD", flag: "🇦🇩", name: "Andorra", dialCode: "+376", digits: [6, 9] },
  { code: "LI", flag: "🇱🇮", name: "Liechtenstein", dialCode: "+423", digits: [7, 9] },
  { code: "SM", flag: "🇸🇲", name: "San Marino", dialCode: "+378", digits: [6, 10] },
  { code: "XK", flag: "🇽🇰", name: "Kosovo", dialCode: "+383", digits: [8, 8] },
  // Americas
  { code: "US", flag: "🇺🇸", name: "United States", dialCode: "+1", digits: [10, 10] },
  { code: "CA", flag: "🇨🇦", name: "Canada", dialCode: "+1", digits: [10, 10] },
  { code: "MX", flag: "🇲🇽", name: "Mexico", dialCode: "+52", digits: [10, 10] },
  { code: "BR", flag: "🇧🇷", name: "Brazil", dialCode: "+55", digits: [10, 11] },
  { code: "AR", flag: "🇦🇷", name: "Argentina", dialCode: "+54", digits: [10, 10] },
  { code: "CL", flag: "🇨🇱", name: "Chile", dialCode: "+56", digits: [9, 9] },
  { code: "CO", flag: "🇨🇴", name: "Colombia", dialCode: "+57", digits: [10, 10] },
  { code: "PE", flag: "🇵🇪", name: "Peru", dialCode: "+51", digits: [9, 9] },
  { code: "VE", flag: "🇻🇪", name: "Venezuela", dialCode: "+58", digits: [10, 10] },
  { code: "EC", flag: "🇪🇨", name: "Ecuador", dialCode: "+593", digits: [9, 9] },
  { code: "BO", flag: "🇧🇴", name: "Bolivia", dialCode: "+591", digits: [8, 9] },
  { code: "PY", flag: "🇵🇾", name: "Paraguay", dialCode: "+595", digits: [9, 9] },
  { code: "UY", flag: "🇺🇾", name: "Uruguay", dialCode: "+598", digits: [8, 9] },
  { code: "GY", flag: "🇬🇾", name: "Guyana", dialCode: "+592", digits: [7, 7] },
  { code: "SR", flag: "🇸🇷", name: "Suriname", dialCode: "+597", digits: [6, 7] },
  { code: "GT", flag: "🇬🇹", name: "Guatemala", dialCode: "+502", digits: [8, 8] },
  { code: "HN", flag: "🇭🇳", name: "Honduras", dialCode: "+504", digits: [8, 8] },
  { code: "SV", flag: "🇸🇻", name: "El Salvador", dialCode: "+503", digits: [8, 8] },
  { code: "NI", flag: "🇳🇮", name: "Nicaragua", dialCode: "+505", digits: [8, 8] },
  { code: "CR", flag: "🇨🇷", name: "Costa Rica", dialCode: "+506", digits: [8, 8] },
  { code: "PA", flag: "🇵🇦", name: "Panama", dialCode: "+507", digits: [7, 8] },
  { code: "CU", flag: "🇨🇺", name: "Cuba", dialCode: "+53", digits: [8, 8] },
  { code: "DO", flag: "🇩🇴", name: "Dominican Republic", dialCode: "+1", digits: [10, 10] },
  { code: "JM", flag: "🇯🇲", name: "Jamaica", dialCode: "+1", digits: [10, 10] },
  { code: "TT", flag: "🇹🇹", name: "Trinidad & Tobago", dialCode: "+1", digits: [10, 10] },
  { code: "BB", flag: "🇧🇧", name: "Barbados", dialCode: "+1", digits: [10, 10] },
  { code: "HT", flag: "🇭🇹", name: "Haiti", dialCode: "+509", digits: [8, 8] },
  { code: "BS", flag: "🇧🇸", name: "Bahamas", dialCode: "+1", digits: [10, 10] },
  { code: "BZ", flag: "🇧🇿", name: "Belize", dialCode: "+501", digits: [7, 7] },
  { code: "AG", flag: "🇦🇬", name: "Antigua & Barbuda", dialCode: "+1", digits: [10, 10] },
  { code: "DM", flag: "🇩🇲", name: "Dominica", dialCode: "+1", digits: [10, 10] },
  { code: "GD", flag: "🇬🇩", name: "Grenada", dialCode: "+1", digits: [10, 10] },
  { code: "KN", flag: "🇰🇳", name: "Saint Kitts & Nevis", dialCode: "+1", digits: [10, 10] },
  { code: "LC", flag: "🇱🇨", name: "Saint Lucia", dialCode: "+1", digits: [10, 10] },
  { code: "VC", flag: "🇻🇨", name: "Saint Vincent", dialCode: "+1", digits: [10, 10] },
  // Africa
  { code: "NG", flag: "🇳🇬", name: "Nigeria", dialCode: "+234", digits: [10, 10] },
  { code: "ZA", flag: "🇿🇦", name: "South Africa", dialCode: "+27", digits: [9, 9] },
  { code: "EG", flag: "🇪🇬", name: "Egypt", dialCode: "+20", digits: [10, 10] },
  { code: "KE", flag: "🇰🇪", name: "Kenya", dialCode: "+254", digits: [9, 9] },
  { code: "GH", flag: "🇬🇭", name: "Ghana", dialCode: "+233", digits: [9, 9] },
  { code: "ET", flag: "🇪🇹", name: "Ethiopia", dialCode: "+251", digits: [9, 9] },
  { code: "TZ", flag: "🇹🇿", name: "Tanzania", dialCode: "+255", digits: [9, 9] },
  { code: "UG", flag: "🇺🇬", name: "Uganda", dialCode: "+256", digits: [9, 9] },
  { code: "ZW", flag: "🇿🇼", name: "Zimbabwe", dialCode: "+263", digits: [9, 9] },
  { code: "ZM", flag: "🇿🇲", name: "Zambia", dialCode: "+260", digits: [9, 9] },
  { code: "MZ", flag: "🇲🇿", name: "Mozambique", dialCode: "+258", digits: [9, 9] },
  { code: "MG", flag: "🇲🇬", name: "Madagascar", dialCode: "+261", digits: [9, 9] },
  { code: "MA", flag: "🇲🇦", name: "Morocco", dialCode: "+212", digits: [9, 9] },
  { code: "DZ", flag: "🇩🇿", name: "Algeria", dialCode: "+213", digits: [9, 9] },
  { code: "TN", flag: "🇹🇳", name: "Tunisia", dialCode: "+216", digits: [8, 8] },
  { code: "LY", flag: "🇱🇾", name: "Libya", dialCode: "+218", digits: [9, 9] },
  { code: "SD", flag: "🇸🇩", name: "Sudan", dialCode: "+249", digits: [9, 9] },
  { code: "SS", flag: "🇸🇸", name: "South Sudan", dialCode: "+211", digits: [9, 9] },
  { code: "SN", flag: "🇸🇳", name: "Senegal", dialCode: "+221", digits: [9, 9] },
  { code: "CI", flag: "🇨🇮", name: "Côte d'Ivoire", dialCode: "+225", digits: [10, 10] },
  { code: "CM", flag: "🇨🇲", name: "Cameroon", dialCode: "+237", digits: [9, 9] },
  { code: "CD", flag: "🇨🇩", name: "DR Congo", dialCode: "+243", digits: [9, 9] },
  { code: "CG", flag: "🇨🇬", name: "Congo", dialCode: "+242", digits: [9, 9] },
  { code: "AO", flag: "🇦🇴", name: "Angola", dialCode: "+244", digits: [9, 9] },
  { code: "MW", flag: "🇲🇼", name: "Malawi", dialCode: "+265", digits: [9, 9] },
  { code: "BW", flag: "🇧🇼", name: "Botswana", dialCode: "+267", digits: [8, 8] },
  { code: "NA", flag: "🇳🇦", name: "Namibia", dialCode: "+264", digits: [9, 9] },
  { code: "LS", flag: "🇱🇸", name: "Lesotho", dialCode: "+266", digits: [8, 8] },
  { code: "SZ", flag: "🇸🇿", name: "Eswatini", dialCode: "+268", digits: [8, 8] },
  { code: "RW", flag: "🇷🇼", name: "Rwanda", dialCode: "+250", digits: [9, 9] },
  { code: "BI", flag: "🇧🇮", name: "Burundi", dialCode: "+257", digits: [8, 8] },
  { code: "SO", flag: "🇸🇴", name: "Somalia", dialCode: "+252", digits: [7, 8] },
  { code: "DJ", flag: "🇩🇯", name: "Djibouti", dialCode: "+253", digits: [8, 8] },
  { code: "ER", flag: "🇪🇷", name: "Eritrea", dialCode: "+291", digits: [7, 7] },
  { code: "ML", flag: "🇲🇱", name: "Mali", dialCode: "+223", digits: [8, 8] },
  { code: "BF", flag: "🇧🇫", name: "Burkina Faso", dialCode: "+226", digits: [8, 8] },
  { code: "NE", flag: "🇳🇪", name: "Niger", dialCode: "+227", digits: [8, 8] },
  { code: "TD", flag: "🇹🇩", name: "Chad", dialCode: "+235", digits: [8, 8] },
  { code: "GN", flag: "🇬🇳", name: "Guinea", dialCode: "+224", digits: [9, 9] },
  { code: "GW", flag: "🇬🇼", name: "Guinea-Bissau", dialCode: "+245", digits: [9, 9] },
  { code: "SL", flag: "🇸🇱", name: "Sierra Leone", dialCode: "+232", digits: [8, 8] },
  { code: "LR", flag: "🇱🇷", name: "Liberia", dialCode: "+231", digits: [8, 8] },
  { code: "GM", flag: "🇬🇲", name: "Gambia", dialCode: "+220", digits: [7, 7] },
  { code: "CV", flag: "🇨🇻", name: "Cape Verde", dialCode: "+238", digits: [7, 7] },
  { code: "ST", flag: "🇸🇹", name: "São Tomé & Príncipe", dialCode: "+239", digits: [7, 7] },
  { code: "GQ", flag: "🇬🇶", name: "Equatorial Guinea", dialCode: "+240", digits: [9, 9] },
  { code: "GA", flag: "🇬🇦", name: "Gabon", dialCode: "+241", digits: [9, 9] },
  { code: "CF", flag: "🇨🇫", name: "Central African Rep.", dialCode: "+236", digits: [8, 8] },
  { code: "MU", flag: "🇲🇺", name: "Mauritius", dialCode: "+230", digits: [8, 8] },
  { code: "SC", flag: "🇸🇨", name: "Seychelles", dialCode: "+248", digits: [7, 7] },
  { code: "KM", flag: "🇰🇲", name: "Comoros", dialCode: "+269", digits: [7, 7] },
  { code: "MR", flag: "🇲🇷", name: "Mauritania", dialCode: "+222", digits: [8, 8] },
  { code: "TG", flag: "🇹🇬", name: "Togo", dialCode: "+228", digits: [8, 8] },
  { code: "BJ", flag: "🇧🇯", name: "Benin", dialCode: "+229", digits: [8, 8] },
];

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
type Mode = "onboarding" | "login" | "resume" | "forgot-password" | "reset-password";

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

// ─── Helper ──────────────────────────────────────────────────────────────────
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
      <label className="block text-sm font-medium text-[#5A1E12] mb-1">{label}</label>
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

export default function ArtistOnboardingForm() {
  const [mode, setMode] = useState<Mode>("onboarding");
  const [currentStep, setCurrentStep] = useState(1);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [abnVerified, setAbnVerified] = useState(false);
  const [resumeInfo, setResumeInfo] = useState<{ step?: number; stepName?: string } | null>(null);
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

  // ─── Stripe Connect state ─────────────────────────────────────────────────
  const [stripeStatus, setStripeStatus] = useState<{
    connected: boolean;
    stripeOnboardingComplete: boolean;
    stripeChargesEnabled: boolean;
    requirements?: string[];
  } | null>(null);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  // ─── Phone picker — Step 1 ────────────────────────────────────────────────
  const [phoneCountry, setPhoneCountry] = useState<Country>(COUNTRIES[0]);
  const [phoneSearch, setPhoneSearch] = useState("");
  const [showPhoneDropdown, setShowPhoneDropdown] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [phoneInputError, setPhoneInputError] = useState<string | null>(null);
  const phoneDropdownRef = useRef<HTMLDivElement>(null);
  const phonePickerBtnRef = useRef<HTMLButtonElement>(null);
  const phonePanelRef = useRef<HTMLDivElement>(null);
  const [phoneDropdownCoords, setPhoneDropdownCoords] = useState({ top: 0, left: 0, width: 0 });

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
        setFormData((prev) => ({ ...prev, ...parsed, storeLogo: null, idDocument: null }));
      } catch {}
    }
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

  // ─── Close phone dropdowns on outside click ───────────────────────────────
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (phoneDropdownRef.current && !phoneDropdownRef.current.contains(e.target as Node)) {
        setShowPhoneDropdown(false);
        setPhoneSearch("");
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const close = (e: Event) => {
      const target = e.target as Node;
      if (phonePanelRef.current && phonePanelRef.current.contains(target)) return;
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

  useEffect(() => {
    if (currentStep === 6 && token) {
      checkStripeStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, token]);

  // ─── Inputs ───────────────────────────────────────────────────────────────
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, [fieldName]: file }));
    if (errors[fieldName]) setErrors((prev) => ({ ...prev, [fieldName]: "" }));
  };

  const setError = (key: string, msg: string) => setErrors((prev) => ({ ...prev, [key]: msg }));

  // ─── RESUME ONBOARDING ────────────────────────────────────────────────────
  const handleCheckResume = async () => {
    if (!formData.loginEmail?.trim()) { setError("loginEmail", "Email is required"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${baseURL}/api/sellers/resume`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.loginEmail }),
      });
      const data = await res.json();
      if (data.action === "verify_otp") {
        setFormData((prev) => ({ ...prev, email: formData.loginEmail }));
        setMode("onboarding");
        setCurrentStep(1);
      } else if (data.action === "login_required") {
        setResumeInfo({ step: data.currentStep, stepName: data.stepName });
        setMode("login");
      } else if (!res.ok) {
        setError("loginEmail", data.message || "No account found");
      }
    } catch { setError("submit", "An error occurred."); }
    finally { setLoading(false); }
  };

  // ─── LOGIN ────────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    const newErrors: Record<string, string> = {};
    if (!formData.loginEmail?.trim()) newErrors.loginEmail = "Email is required";
    if (!formData.loginPassword?.trim()) newErrors.loginPassword = "Password is required";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setLoading(true);
    try {
      const res = await fetch(`${baseURL}/api/sellers/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.loginEmail, password: formData.loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError("submit", data.message || "Login failed"); return; }
      setToken(data.token);
      localStorage.setItem("sellerToken", data.token);
      const backendStep = data.onboardingStatus?.currentStep ?? 3;
      const frontendStep = backendStepToFrontend(backendStep);
      setCurrentStep(frontendStep);
      setMode("onboarding");
      setErrors({});
    } catch { setError("submit", "An error occurred."); }
    finally { setLoading(false); }
  };

  // ─── FORGOT PASSWORD ──────────────────────────────────────────────────────
  const handleForgotPassword = async () => {
    if (!formData.loginEmail?.trim()) { setError("loginEmail", "Email is required"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${baseURL}/api/sellers/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.loginEmail }),
      });
      const data = await res.json();
      if (!res.ok) { setError("submit", data.message || "Failed to send OTP"); return; }
      setSuccessMessage("OTP sent to your email");
      setMode("reset-password");
      setErrors({});
    } catch { setError("submit", "An error occurred."); }
    finally { setLoading(false); }
  };

  // ─── RESET PASSWORD ───────────────────────────────────────────────────────
  const handleResetPassword = async () => {
    const newErrors: Record<string, string> = {};
    if (!formData.resetOtp?.trim()) newErrors.resetOtp = "OTP is required";
    if (!formData.newPassword || formData.newPassword.length < 6)
      newErrors.newPassword = "Password must be at least 6 characters";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setLoading(true);
    try {
      const res = await fetch(`${baseURL}/api/sellers/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.loginEmail, otp: formData.resetOtp, newPassword: formData.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError("submit", data.message || "Reset failed"); return; }
      setToken(data.token);
      localStorage.setItem("sellerToken", data.token);
      const backendStep = data.onboardingStatus?.currentStep ?? 3;
      setCurrentStep(backendStepToFrontend(backendStep));
      setMode("onboarding");
      setErrors({});
      setSuccessMessage("");
    } catch { setError("submit", "An error occurred."); }
    finally { setLoading(false); }
  };

  // ─── STEP 1 ───────────────────────────────────────────────────────────────
  const handleApplyStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.contactPerson?.trim()) newErrors.contactPerson = "Contact person name is required";
    if (!formData.email?.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.phone?.trim()) newErrors.phone = "Phone is required";
    else {
      const phoneErr = validatePhone(formData.phone, phoneCountry);
      if (phoneErr) { newErrors.phone = phoneErr; setPhoneTouched(true); }
    }
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setFormData((prev) => ({ ...prev, phone: prev.phone.replace(/\D/g, "") }));
    setErrors({});
    setCurrentStep(2);
  };

  // ─── STEP 2 ───────────────────────────────────────────────────────────────
  const handleStep2Submit = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.password?.trim()) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (!formData.confirmPassword?.trim()) newErrors.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setErrors({});
    setCurrentStep(3);
  };

  // ─── Check Stripe Connect status ─────────────────────────────────────────
  const checkStripeStatus = async () => {
    if (!token) return;
    setStripeLoading(true);
    try {
      const res = await fetch(`${baseURL}/api/seller-onboarding/stripe/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setStripeStatus(data);
    } catch {}
    finally { setStripeLoading(false); }
  };

  // ─── Connect Stripe account via OAuth ────────────────────────────────────
  const handleConnectStripe = async () => {
    if (!token) { setError("stripe", "Please log in to connect Stripe"); return; }
    setStripeLoading(true);
    try {
      const res = await fetch(`${baseURL}/api/seller-onboarding/stripe/oauth-url`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError("stripe", d.message || "Failed to start Stripe setup");
        return;
      }
      const data = await res.json();
      if (data.alreadyConnected) { await checkStripeStatus(); return; }
      window.location.href = data.url;
    } catch { setError("stripe", "Failed to connect Stripe. Please try again."); }
    finally { setStripeLoading(false); }
  };

  // ─── STEP 4 ───────────────────────────────────────────────────────────────
  const handleStep4Submit = () => { setErrors({}); setCurrentStep(4); };

  // ─── STEP 5 — submit onboarding ───────────────────────────────────────────
  const handleStep5Submit = async () => {
    const newErrors: Record<string, string> = {};
    if (!formData.storeName?.trim()) newErrors.storeName = "Store name is required";
    if (!formData.storeBio?.trim()) newErrors.storeBio = "Store bio is required";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("email", formData.email);
      fd.append("phone", `${phoneCountry.dialCode} ${formData.phone.replace(/\D/g, "")}`);
      fd.append("contactPerson", formData.contactPerson);
      fd.append("password", formData.password);
      fd.append("artistName", formData.artistName);
      fd.append("description", formData.description);
      fd.append("storeName", formData.storeName);
      fd.append("storeDescription", formData.storeBio);
      if (formData.storeLogo) fd.append("storeLogo", formData.storeLogo);
      fd.append("businessName", formData.storeName);
      fd.append("abn", "N/A");
      fd.append("businessType", "individual");
      fd.append("businessAddress", JSON.stringify({ street: "", city: "", state: "", postcode: "", country: "" }));
      const res = await fetch(`${baseURL}/api/sellers/submit-onboarding`, { method: "POST", body: fd });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError("submit", d.message || "Submission failed");
        return;
      }
      const data = await res.json();
      if (data.token) { setToken(data.token); localStorage.setItem("sellerToken", data.token); }
      setErrors({});
      setCurrentStep(5);
    } catch { setError("submit", "An error occurred. Please try again."); }
    finally { setLoading(false); }
  };

  // ─── STEP 5 (OTP verify) ─────────────────────────────────────────────────
  const handleStep6Submit = async () => {
    if (!formData.otp?.trim()) { setError("otp", "One-time code is required"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${baseURL}/api/sellers/verify-and-submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp: formData.otp }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError("otp", d.message || "Invalid or expired one-time code");
        return;
      }
      const data = await res.json();
      if (data.token) { setToken(data.token); localStorage.setItem("sellerToken", data.token); }
      setErrors({});
      setCurrentStep(6);
    } catch { setError("submit", "An error occurred. Please try again."); }
    finally { setLoading(false); }
  };

  // ─── STEP 6 (Stripe complete) ─────────────────────────────────────────────
  const handleStep7Submit = () => {
    if (!stripeStatus?.stripeOnboardingComplete || !stripeStatus?.stripeChargesEnabled) {
      setError("stripe", "Please complete your Stripe account setup before continuing");
      return;
    }
    ["sellerOnboardingStep", "sellerOnboardingFormData", "sellerToken"].forEach((k) =>
      localStorage.removeItem(k)
    );
    toast.success("🎉 You are now registered as a seller! Welcome to the platform.", {
      position: "top-center",
      autoClose: 5000,
    });
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

  const handlePrevious = () => { setErrors({}); setCurrentStep((prev) => Math.max(prev - 1, 1)); };

  // ─── Shared input classes ─────────────────────────────────────────────────
  const inputCls = (field?: string) =>
    `w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A1E12]/40 bg-white text-[#5A1E12] placeholder-[#5A1E12]/40 transition-all ${field && errors[field] ? "border-red-400 bg-red-50" : "border-[#5A1E12]/20"}`;

  const labelCls = "block text-sm font-semibold text-[#5A1E12] mb-1.5";

  // ─── AUTH SCREEN ──────────────────────────────────────────────────────────
  if (mode !== "onboarding") {
    return (
      <div className="relative min-h-screen bg-[#EAD7B7] flex flex-col items-center justify-center px-4 py-12 sm:py-16">
        <Link href="/" className="mb-6 block w-fit md:absolute md:top-8 md:left-8 md:mb-0">
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
                <h2 className="text-2xl font-extrabold text-[#5A1E12] mb-1">Resume Onboarding</h2>
                <p className="text-sm text-[#5A1E12]/60 mb-6">Enter your email to check your progress</p>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Email Address *</label>
                    <input type="email" name="loginEmail" value={formData.loginEmail} onChange={handleInputChange} placeholder="your@email.com" className={inputCls("loginEmail")} />
                    {errors.loginEmail && <p className="mt-1 text-xs text-red-600">{errors.loginEmail}</p>}
                  </div>
                  {errors.submit && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                      <p className="text-sm text-red-800">{errors.submit}</p>
                    </div>
                  )}
                  <button onClick={handleCheckResume} disabled={loading} className="w-full py-3 bg-[#5A1E12] hover:bg-[#4a180f] text-white rounded-xl font-semibold transition-all disabled:opacity-60">
                    {loading ? "Checking…" : "Check Progress"}
                  </button>
                </div>
                <div className="mt-6 text-center space-y-2">
                  <button onClick={() => { setMode("onboarding"); setErrors({}); }} className="text-sm text-[#5A1E12] hover:underline cursor-pointer">
                    ← Start a new application
                  </button>
                </div>
              </>
            )}

            {mode === "login" && (
              <>
                <h2 className="text-2xl font-extrabold text-[#5A1E12] mb-1">Welcome Back</h2>
                {resumeInfo && (
                  <div className="mb-4 bg-[#5A1E12]/5 border border-[#5A1E12]/20 rounded-xl p-3">
                    <p className="text-sm text-[#5A1E12]">
                      📍 You left off at <strong>Step {resumeInfo.step}</strong>: {resumeInfo.stepName}
                    </p>
                  </div>
                )}
                <p className="text-sm text-[#5A1E12]/60 mb-6">Log in to continue your application</p>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Email Address *</label>
                    <input type="email" name="loginEmail" value={formData.loginEmail} onChange={handleInputChange} placeholder="your@email.com" className={inputCls("loginEmail")} />
                    {errors.loginEmail && <p className="mt-1 text-xs text-red-600">{errors.loginEmail}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>Password *</label>
                    <input type="password" name="loginPassword" value={formData.loginPassword} onChange={handleInputChange} placeholder="Your password" className={inputCls("loginPassword")} />
                    {errors.loginPassword && <p className="mt-1 text-xs text-red-600">{errors.loginPassword}</p>}
                  </div>
                  {errors.submit && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                      <p className="text-sm text-red-800">{errors.submit}</p>
                    </div>
                  )}
                  <button onClick={handleLogin} disabled={loading} className="w-full py-3 bg-[#5A1E12] hover:bg-[#4a180f] text-white rounded-xl font-semibold transition-all disabled:opacity-60">
                    {loading ? "Logging in…" : "Continue Application"}
                  </button>
                </div>
                <div className="mt-6 flex flex-col items-center gap-2 text-sm">
                  <button onClick={() => { setMode("forgot-password"); setErrors({}); }} className="text-[#5A1E12] hover:underline font-medium">
                    Forgot password?
                  </button>
                  <button onClick={() => { setMode("onboarding"); setCurrentStep(1); setErrors({}); }} className="text-[#5A1E12]/60 hover:underline">
                    ← Start a new application
                  </button>
                </div>
              </>
            )}

            {mode === "forgot-password" && (
              <>
                <h2 className="text-2xl font-extrabold text-[#5A1E12] mb-1">Reset Password</h2>
                <p className="text-sm text-[#5A1E12]/60 mb-6">We'll send a one-time code to your email</p>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Email Address *</label>
                    <input type="email" name="loginEmail" value={formData.loginEmail} onChange={handleInputChange} placeholder="your@email.com" className={inputCls("loginEmail")} />
                    {errors.loginEmail && <p className="mt-1 text-xs text-red-600">{errors.loginEmail}</p>}
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
                  <button onClick={handleForgotPassword} disabled={loading} className="w-full py-3 bg-[#5A1E12] hover:bg-[#4a180f] text-white rounded-xl font-semibold transition-all disabled:opacity-60">
                    {loading ? "Sending OTP…" : "Send Reset OTP"}
                  </button>
                </div>
                <div className="mt-6 text-center">
                  <button onClick={() => { setMode("login"); setErrors({}); }} className="text-sm text-[#5A1E12] hover:underline">
                    ← Back to login
                  </button>
                </div>
              </>
            )}

            {mode === "reset-password" && (
              <>
                <h2 className="text-2xl font-extrabold text-[#5A1E12] mb-1">Set New Password</h2>
                <p className="text-sm text-[#5A1E12]/60 mb-6">
                  Enter the OTP sent to <strong>{formData.loginEmail}</strong>
                </p>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>OTP Code *</label>
                    <input type="text" name="resetOtp" value={formData.resetOtp} onChange={handleInputChange} placeholder="Enter OTP" className={inputCls("resetOtp")} />
                    {errors.resetOtp && <p className="mt-1 text-xs text-red-600">{errors.resetOtp}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>New Password *</label>
                    <input type="password" name="newPassword" value={formData.newPassword} onChange={handleInputChange} placeholder="Min. 6 characters" className={inputCls("newPassword")} />
                    {errors.newPassword && <p className="mt-1 text-xs text-red-600">{errors.newPassword}</p>}
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
                  <button onClick={handleResetPassword} disabled={loading} className="w-full py-3 bg-[#5A1E12] hover:bg-[#4a180f] text-white rounded-xl font-semibold transition-all disabled:opacity-60">
                    {loading ? "Resetting…" : "Reset & Continue"}
                  </button>
                  <button onClick={handleForgotPassword} disabled={loading} className="w-full py-2 text-sm text-[#5A1E12] hover:underline">
                    Resend OTP
                  </button>
                </div>
                <div className="mt-4 text-center">
                  <button onClick={() => { setMode("login"); setErrors({}); }} className="text-sm text-[#5A1E12]/70 hover:underline">
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
        <Link href="/" className="mb-8 block w-fit md:absolute md:top-8 md:left-8 md:mb-0">
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
              <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-extrabold text-[#5A1E12] mb-2">You&apos;re officially a Seller!</h2>
            <p className="text-[#5A1E12]/70 text-sm mb-2">
              Congratulations, <strong>{formData.contactPerson || "Seller"}</strong>! Your seller account has been successfully registered on the platform.
            </p>
            <p className="text-[#5A1E12]/60 text-xs mb-8">
              Your store <strong>{formData.storeName}</strong> is now live. You can start listing products and managing orders from your seller dashboard.
            </p>
            <Link href="/" className="block w-full py-3 bg-[#5A1E12] hover:bg-[#4a180f] text-white rounded-xl font-semibold transition-all">
              Go to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleResendOTP = async () => {
    if (!formData.sellerId) { setError("submit", "Seller ID is missing"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${baseURL}/api/sellers/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId: formData.sellerId }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError("submit", d.message || "Failed to resend OTP");
        return;
      }
      setErrors({});
      setSuccessMessage("One-time code resent to your email");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch { setError("submit", "An error occurred."); }
    finally { setLoading(false); }
  };

  // ─── MAIN ONBOARDING FORM ─────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen bg-[#EAD7B7] py-8 sm:py-12 px-4">
      <Link href="/" className="mx-auto mb-4 block w-fit md:absolute md:top-8 md:left-8 md:mx-0 md:mb-0">
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

      <div>
        <div className="mb-8 flex flex-col items-center justify-center text-center">
          <h2 className="text-3xl font-extrabold text-[#5A1E12] mb-2 tracking-tight">Start your journey as a Seller</h2>
          <p className="text-[#5A1E12]/70 mb-1">Complete all steps to sign-up & start your selling</p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-[#5A1E12]">Step {currentStep} of {totalSteps}</span>
              <span className="text-sm text-[#5A1E12]/60">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
            </div>
            <div className="w-full h-2 bg-[#5A1E12]/20 rounded-full overflow-hidden">
              <div className="h-full bg-[#5A1E12] transition-all duration-500" style={{ width: `${(currentStep / totalSteps) * 100}%` }} />
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-10 border border-[#5A1E12]/15">

            {/* ── Accuracy / Stripe notice — conditional on step ── */}
            {/* {currentStep === 6 ? (
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-xl px-4 py-3 mb-6">
                <span className="text-amber-500 text-lg mt-0.5">ⓘ</span>
                <p className="md:text-sm text-xs text-amber-800 leading-relaxed">
                  <span className="font-semibold">Before proceeding, </span>{" "}
                  please note that the Stripe KYC process may take around 5–10 minutes to complete and will create your seller Stripe account. Please remember the email ID and password used during the setup.
                  <br />
                  To view platform fees and commission details,{" "}
                  <a
                    href="https://madeinarnhemland.com.au/fees-and-commission"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-semibold hover:text-amber-900 transition-colors break-all"
                  >
                    fee &amp; commission
                  </a>
                </p>
              </div>
            ) : (
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-xl px-4 py-3 mb-6">
                <span className="text-amber-500 text-lg mt-0.5">ⓘ</span>
                <p className="md:text-sm text-xs text-amber-800 leading-relaxed">
                  <span className="font-semibold">Please ensure all details are accurate.</span>{" "}
                  The information you provide including your business summary, store profile, and contact details may be visible to buyers and other users on the platform. Incorrect or misleading information may result in delays to your application or account suspension.
                </p>
              </div>
            )} */}

            {/* ── Step 1 ── */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <h3 className="text-xl font-semibold text-[#5A1E12] mb-4">Account Verification</h3>
                <div>
                  <label className={labelCls}>Contact Person Name *</label>
                  <input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleInputChange} placeholder="Full Name" className={inputCls("contactPerson")} />
                  {errors.contactPerson && <p className="mt-1 text-xs text-red-600">{errors.contactPerson}</p>}
                </div>
                <div>
                  <label className={labelCls}>Email Address *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="your@email.com" className={inputCls("email")} />
                  {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                </div>
                <div>
                  <label className={labelCls}>Phone Number *</label>
                  <div ref={phoneDropdownRef} className="relative">
                    <div className={`flex bg-white items-center border rounded-xl overflow-visible transition-all ${errors.phone ? "border-red-400 ring-2 ring-red-200" : phoneTouched && !phoneInputError && formData.phone.trim() ? "border-[#5A1E12]/60" : "border-[#5A1E12]/20 focus-within:border-[#5A1E12] focus-within:ring-2 focus-within:ring-[#5A1E12]/20"}`}>
                      <button
                        type="button"
                        ref={phonePickerBtnRef}
                        onClick={() => {
                          if (phonePickerBtnRef.current) {
                            const r = phonePickerBtnRef.current.getBoundingClientRect();
                            setPhoneDropdownCoords({ top: r.bottom + 4, left: r.left, width: Math.max(r.width, 280) });
                          }
                          setShowPhoneDropdown((v) => !v);
                          setPhoneSearch("");
                        }}
                        className="flex items-center gap-1.5 px-3 h-full text-sm font-medium border-r border-[#5A1E12]/20 hover:bg-[#5A1E12]/5 transition rounded-l-xl shrink-0 py-2.5"
                      >
                        <img src={`https://flagcdn.com/20x15/${phoneCountry.code.toLowerCase()}.png`} alt={phoneCountry.name} width={20} height={15} className="rounded-sm object-cover shrink-0" />
                        <span className="text-[#5A1E12] text-xs font-semibold">{phoneCountry.dialCode}</span>
                        <span className="text-[#5A1E12]/40 text-xs">▾</span>
                      </button>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={(e) => {
                          const v = e.target.value.replace(/[^\d\s\-().]/g, "");
                          setFormData((prev) => ({ ...prev, phone: v }));
                          if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
                          if (phoneTouched) setPhoneInputError(validatePhone(v, phoneCountry));
                        }}
                        onBlur={() => {
                          setPhoneTouched(true);
                          setPhoneInputError(validatePhone(formData.phone, phoneCountry));
                        }}
                        placeholder={phoneCountry.digits[0] === phoneCountry.digits[1] ? `${phoneCountry.digits[0]}-digit number` : `${phoneCountry.digits[0]}–${phoneCountry.digits[1]}-digit number`}
                        className="flex-1 px-4 py-2.5 text-sm text-[#5A1E12] bg-transparent outline-none placeholder-[#5A1E12]/40"
                      />
                    </div>
                    {showPhoneDropdown && (
                      <div
                        ref={phonePanelRef}
                        style={{ position: "fixed", top: phoneDropdownCoords.top, left: phoneDropdownCoords.left, minWidth: "280px", zIndex: 99999 }}
                        className="bg-white border border-[#5A1E12]/20 rounded-xl shadow-2xl overflow-hidden"
                      >
                        <div className="p-2 border-b border-[#5A1E12]/10">
                          <input type="text" autoFocus value={phoneSearch} onChange={(e) => setPhoneSearch(e.target.value)} placeholder="Search country…" className="w-full px-3 py-2 text-sm border border-[#5A1E12]/20 rounded-lg outline-none focus:border-[#5A1E12] bg-white text-[#5A1E12]" />
                        </div>
                        <ul className="max-h-60 overflow-y-auto">
                          {COUNTRIES.filter((c) => c.name.toLowerCase().includes(phoneSearch.toLowerCase()) || c.dialCode.includes(phoneSearch)).map((c) => (
                            <li key={c.code}>
                              <button
                                type="button"
                                onClick={() => {
                                  setPhoneCountry(c);
                                  setShowPhoneDropdown(false);
                                  setPhoneSearch("");
                                  if (phoneTouched) setPhoneInputError(validatePhone(formData.phone, c));
                                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-[#5A1E12]/5 text-left transition ${c.code === phoneCountry.code ? "bg-[#5A1E12]/10 font-medium text-[#5A1E12]" : "text-gray-700"}`}
                              >
                                <img src={`https://flagcdn.com/20x15/${c.code.toLowerCase()}.png`} alt={c.name} width={20} height={15} className="rounded-sm object-cover shrink-0" />
                                <span className="flex-1 truncate">{c.name}</span>
                                <span className="text-[#5A1E12]/50 text-xs shrink-0">{c.dialCode}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                  {!errors.phone && phoneTouched && phoneInputError && <p className="mt-1 text-xs text-red-500">{phoneInputError}</p>}
                  {!errors.phone && phoneTouched && !phoneInputError && formData.phone.trim() && <p className="mt-1 text-xs text-[#5A1E12]">✓ Looks good</p>}
                </div>
                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-sm text-red-800">{errors.submit}</p>
                  </div>
                )}
              </div>
            )}

            {/* ── Step 2 ── */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <h3 className="text-xl font-semibold text-[#5A1E12] mb-4">Set Your Password</h3>
                <PasswordField label="Password *" name="password" value={formData.password} onChange={handleInputChange} placeholder="Set your password (min. 6 characters)" inputCls={inputCls("password")} error={errors.password} />
                <PasswordField label="Confirm Password *" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder="Re-enter your password" inputCls={inputCls("confirmPassword")} error={errors.confirmPassword} />
                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-sm text-red-800">{errors.submit}</p>
                  </div>
                )}
              </div>
            )}

            {/* ── Step 3 ── */}
            {currentStep === 3 && (
              <div className="space-y-5">
                <h3 className="text-xl font-semibold text-[#5A1E12] mb-4">Business/Artists Information</h3>
                <div>
                  <label className={labelCls}>Business Summary <span className="text-[#5A1E12]/60 font-normal">(Optional)</span></label>
                  <input type="text" name="artistName" value={formData.artistName} onChange={handleInputChange} placeholder="e.g. Electronics Store, Traditional Antique" className={inputCls("artistName")} />
                  {errors.artistName && <p className="mt-1 text-xs text-red-600">{errors.artistName}</p>}
                </div>
                <div>
                  <label className={labelCls}>Description <span className="text-[#5A1E12]/60 font-normal">(Optional)</span></label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows={6} placeholder="Tell us about your Business/Artists…" className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A1E12]/40 bg-white text-[#5A1E12] placeholder-[#5A1E12]/40 resize-none transition-all ${errors.description ? "border-red-400" : "border-[#5A1E12]/20"}`} />
                  {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
                </div>
                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-sm text-red-800">{errors.submit}</p>
                  </div>
                )}
              </div>
            )}

            {/* ── Step 4 ── */}
            {currentStep === 4 && (
              <div className="space-y-5">
                <h3 className="text-xl font-semibold text-[#5A1E12] mb-4">Store Profile</h3>
                <div>
                  <label className={labelCls}>Store Name *</label>
                  <input type="text" name="storeName" value={formData.storeName} onChange={handleInputChange} placeholder="Store Name" className={inputCls("storeName")} />
                  {errors.storeName && <p className="mt-1 text-xs text-red-600">{errors.storeName}</p>}
                </div>
                <div>
                  <label className={labelCls}>Store Logo *</label>
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "storeLogo")} className="block w-full text-sm text-[#5A1E12]/60 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#5A1E12]/10 file:text-[#5A1E12] hover:file:bg-[#5A1E12]/20 cursor-pointer" />
                  {formData.storeLogo && (
                    <div className="w-20 h-20 bg-[#EAD7B7]/40 rounded-lg overflow-hidden mt-2 border border-[#5A1E12]/20">
                      <img src={URL.createObjectURL(formData.storeLogo)} alt="Logo preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  {errors.storeLogo && <p className="mt-1 text-xs text-red-600">{errors.storeLogo}</p>}
                </div>
                <div>
                  <label className={labelCls}>Store Bio *</label>
                  <textarea name="storeBio" value={formData.storeBio} onChange={handleInputChange} rows={6} placeholder="Tell customers about your art…" className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A1E12]/40 bg-white text-[#5A1E12] placeholder-[#5A1E12]/40 resize-none transition-all ${errors.storeBio ? "border-red-400" : "border-[#5A1E12]/20"}`} />
                  {errors.storeBio && <p className="mt-1 text-xs text-red-600">{errors.storeBio}</p>}
                </div>
                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-sm text-red-800">{errors.submit}</p>
                  </div>
                )}
              </div>
            )}

            {/* ── Step 5 — OTP Verification ── */}
            {currentStep === 5 && (
              <div className="space-y-5">
                <h3 className="text-xl font-semibold text-[#5A1E12] mb-4">Verify Your Application</h3>
                <div className="bg-[#5A1E12]/5 border border-[#5A1E12]/20 rounded-xl p-4">
                  <p className="text-sm text-[#5A1E12]">
                    A one-time code has been sent to <strong>{formData.email}</strong>. Enter it below to complete your application.
                  </p>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className={labelCls}>One-time code *</label>
                    <button type="button" onClick={handleResendOTP} disabled={loading} className="text-sm font-semibold text-[#5A1E12] hover:text-[#5A1E12]/70 underline disabled:opacity-50">
                      {loading ? "Sending…" : "Resend code"}
                    </button>
                  </div>
                  <input type="text" name="otp" value={formData.otp} onChange={handleInputChange} placeholder="Enter one-time code" className={inputCls("otp")} />
                  {errors.otp && <p className="mt-1 text-xs text-red-600">{errors.otp}</p>}
                </div>
                {successMessage && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                    <p className="text-sm text-green-800">{successMessage}</p>
                  </div>
                )}
                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-sm text-red-800">{errors.submit}</p>
                  </div>
                )}
              </div>
            )}

            {/* ── Step 6 — Connect Stripe Account ── */}
            {currentStep === 6 && (
              <div className="space-y-6">

                {/* 1 — Fee summary card (top, full width) */}
                <div className="border border-[#5A1E12]/20 rounded-xl p-5">
                  <p className="text-base font-bold text-[#5A1E12] mb-3">Before you connect: quick summary</p>
                  <p className="text-sm font-semibold text-[#5A1E12] mb-2">What it costs</p>
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr>
                        <th className="text-left px-3 py-2.5 font-semibold text-[#5A1E12] border border-[#5A1E12]/20 bg-[#f5ede8]">Fee</th>
                        <th className="text-left px-3 py-2.5 font-semibold text-[#5A1E12] border border-[#5A1E12]/20 bg-[#f5ede8]">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="px-3 py-3 text-[#5A1E12]/80 border border-[#5A1E12]/20">Our commission (our only fee)</td>
                        <td className="px-3 py-3 font-bold text-[#5A1E12] border border-[#5A1E12]/20">10% per sale</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-3 text-[#5A1E12]/80 border border-[#5A1E12]/20">Stripe card processing</td>
                        <td className="px-3 py-3 font-bold text-[#5A1E12] border border-[#5A1E12]/20">1.7% + A$0.30</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-3 text-[#5A1E12]/80 border border-[#5A1E12]/20">Stripe instant payout</td>
                        <td className="px-3 py-3 font-bold text-[#5A1E12] border border-[#5A1E12]/20">1.5% per payout</td>
                      </tr>
                    </tbody>
                  </table>
                  <p className="mt-3 text-xs text-[#5A1E12]/60 italic leading-relaxed">
                    Commission on product price only (excl. GST &amp; shipping).<br />
                    Stripe fees charged by Stripe.{" "}
                    <a href="/fees-and-commission" className="not-italic font-semibold text-[#5A1E12] underline underline-offset-2 hover:text-[#4a180f] transition-colors">See full fees →</a>
                  </p>
                </div>

                {/* 2 — Set up payout account */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#5A1E12]">Set up your payout account</h3>
                    <p className="text-sm text-[#5A1E12]/70 leading-relaxed mt-1.5">
                      Connect a Stripe account to receive payments. Stripe securely handles your identity verification and debit card details.
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

                  {!stripeLoading && stripeStatus?.connected && (!stripeStatus?.stripeOnboardingComplete || !stripeStatus?.stripeChargesEnabled) && (
                    <div className="space-y-3">
                      <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-300 rounded-xl">
                        <span className="text-amber-600 text-base mt-0.5">⚠</span>
                        <div>
                          <p className="text-sm font-semibold text-amber-800">Stripe setup incomplete</p>
                          <p className="text-xs text-amber-700 mt-0.5">Additional information required before you can receive payouts.</p>
                        </div>
                      </div>
                      <button type="button" onClick={handleConnectStripe} disabled={stripeLoading} className="px-8 py-3 bg-[#5A1E12] hover:bg-[#4a180f] text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-60">
                        Continue Stripe Setup
                      </button>
                    </div>
                  )}

                  {!stripeLoading && !stripeStatus?.connected && (
                    <button type="button" onClick={handleConnectStripe} disabled={stripeLoading} className="px-8 py-3 bg-[#5A1E12] hover:bg-[#4a180f] text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-60">
                      Connect with Stripe
                    </button>
                  )}

                  {errors.stripe && <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{errors.stripe}</p>}
                  {errors.submit && <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{errors.submit}</p>}
                </div>

                {/* 3 — What happens next */}
                <div className="border-t border-[#5A1E12]/15 pt-5">
                  <h4 className="text-base font-bold text-[#5A1E12] mb-1.5">What happens next</h4>
                  <p className="text-sm text-[#5A1E12]/70 leading-relaxed">
                    Once verification is complete, your seller account gets activated and you can start listing products. We'll email you to confirm.
                  </p>
                </div>

                {/* 4 — Good to know */}
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
                disabled={currentStep === 1 || currentStep === 5 || currentStep === 6}
                className={`px-4 py-2.5 text-sm sm:px-6 sm:py-3 sm:text-base rounded-xl font-semibold transition-all shadow-sm border ${currentStep === 1 || currentStep === 5 || currentStep === 6 ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed" : "border-[#5A1E12]/30 bg-[#EAD7B7] text-[#5A1E12] hover:bg-[#5A1E12]/10"}`}
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={loading || (currentStep === 6 && stripeLoading)}
                className={`px-5 py-2.5 text-sm sm:px-8 sm:py-3 sm:text-base text-white rounded-xl font-semibold shadow transition-all ${loading || (currentStep === 6 && stripeLoading) ? "bg-[#5A1E12]/40 cursor-not-allowed" : "bg-[#5A1E12] hover:bg-[#4a180f]"}`}
              >
                {currentStep === 5
                  ? loading ? "Verifying…" : "Verify and Submit"
                  : currentStep === 6
                  ? loading ? "Finishing…" : "Complete Setup"
                  : loading ? "Processing…" : "Next Step"}
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