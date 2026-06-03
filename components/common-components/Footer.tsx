// "use client";
// import { useState } from "react";
// import {
//   FaLinkedinIn,
//   FaFacebookF,
//   FaInstagram,
//   FaYoutube,
//   FaEnvelope,
//   FaHeart,
// } from "react-icons/fa";
// import { FaXTwitter } from "react-icons/fa6";
// import { X, Loader2, CheckCircle2 } from "lucide-react";
// import Image from "next/image";
// import Link from "next/link";

// const API = "https://backend.madeinarnhemland.com.au/api";

// export default function Footer() {
//   const [email, setEmail] = useState("");
//   const [subState, setSubState] = useState<"idle" | "loading" | "success" | "error">("idle");
//   const [subMsg, setSubMsg] = useState("");

//   // Unsubscribe modal
//   const [showUnsub, setShowUnsub] = useState(false);
//   const [unsubEmail, setUnsubEmail] = useState("");
//   const [unsubState, setUnsubState] = useState<"idle" | "loading" | "success" | "error">("idle");
//   const [unsubMsg, setUnsubMsg] = useState("");

//   const handleSubscribe = async () => {
//     const trimmed = email.trim();
//     if (!trimmed) { setSubMsg("Please enter your email."); setSubState("error"); return; }
//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) { setSubMsg("Please enter a valid email."); setSubState("error"); return; }

//     setSubState("loading");
//     setSubMsg("");
//     try {
//       const res = await fetch(`${API}/newsletter`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email: trimmed }),
//       });
//       const data = await res.json();
//       if (!res.ok) { setSubMsg(data.message || "Subscription failed. Please try again."); setSubState("error"); return; }
//       setSubMsg(data.message || "You're subscribed! Welcome aboard.");
//       setSubState("success");
//       setEmail("");
//     } catch {
//       setSubMsg("Something went wrong. Please try again.");
//       setSubState("error");
//     }
//   };

//   const handleUnsubscribe = async () => {
//     const trimmed = unsubEmail.trim();
//     if (!trimmed) { setUnsubMsg("Please enter your email."); setUnsubState("error"); return; }
//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) { setUnsubMsg("Please enter a valid email."); setUnsubState("error"); return; }

//     setUnsubState("loading");
//     setUnsubMsg("");
//     try {
//       const res = await fetch(`${API}/newsletter/unsubscribe`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email: trimmed }),
//       });
//       const data = await res.json();
//       if (!res.ok) { setUnsubMsg(data.message || "Failed to unsubscribe. Please try again."); setUnsubState("error"); return; }
//       setUnsubMsg(data.message || "You've been unsubscribed successfully.");
//       setUnsubState("success");
//       setUnsubEmail("");
//     } catch {
//       setUnsubMsg("Something went wrong. Please try again.");
//       setUnsubState("error");
//     }
//   };

//   return (
//     <footer className="bg-[#440C03]  bg-cover text-white px-4 sm:px-8 md:px-12 lg:px-20 pt-12 lg:pb-10 md:py-16"> 
//       {/* Top Main Section */}
//       <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 mb-12">
//         {/* Left Section - Navigation Links */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 flex-1">
//           {/* Column 1 - Shop */}
//           <div className="flex flex-col">
//             <h2 className="mb-4 text-lg font-semibold">Shop</h2>
//             <Link href="/shop" className="mb-2 hover:text-[#A48068] transition-colors">
//               All Products
//             </Link>
//             <Link href="/#featured-products" className="mb-2 hover:text-[#A48068] transition-colors">
//               Featured Makers
//             </Link>
//             <Link href="/shop?category=art-crafts" className="mb-2 hover:text-[#A48068] transition-colors">
//               Art & Crafts
//             </Link>
//             <Link href="/shop?category=bush-foods" className="mb-2 hover:text-[#A48068] transition-colors">
//               Bush Foods
//             </Link>
//             <Link href="/shop?category=apparel" className="mb-2 hover:text-[#A48068] transition-colors">
//               Apparel
//             </Link>
//             <Link href="/shop?category=handmade-crafts" className="mb-2 hover:text-[#A48068] transition-colors">
//               Handmade Crafts
//             </Link>
//             <Link href="/shop?category=accessories" className="mb-2 hover:text-[#A48068] transition-colors">
//               Accessories
//             </Link>
//           </div>

//           {/* Column 2 - Sellers */}
//           <div className="flex flex-col">
//             <h2 className="mb-4 text-lg font-semibold">Sellers</h2>
//             {/* <Link href="/sellerOnboarding" className="mb-2 hover:text-[#A48068] transition-colors">
//               Sell with MIA
//             </Link> */}
//             <Link href="/sellerOnboarding" className="mb-2 hover:text-[#A48068] transition-colors">
//               Seller Registration
//             </Link>
//             <Link href="/login" className="mb-2 hover:text-[#A48068] transition-colors">
//               Seller Login
//             </Link>
//             <Link href="/seller-rules" className="mb-2 hover:text-[#A48068] transition-colors">
//               Seller Guidelines
//             </Link>
//             <Link href="/contact-us" className="mb-2 hover:text-[#A48068] transition-colors">
//               Supplier Support
//             </Link>
//           </div>

//           {/* Column 3 - Support */}
//           <div className="flex flex-col">
//             <h2 className="mb-4 text-lg font-semibold">Support</h2>
//             <Link href="/contact-us" className="mb-2 hover:text-[#A48068] transition-colors">
//               Contact Us
//             </Link>
//             <Link href="/feedback" className="mb-2 hover:text-[#A48068] transition-colors">
//               Share Feedback
//             </Link>
//             <Link href="/contact-us#faq" className="mb-2 hover:text-[#A48068] transition-colors">
//               FAQs
//             </Link>
//             <Link href="/guest/track-order" className="mb-2 hover:text-[#A48068] transition-colors">
//               Track Order / Track Status
//             </Link>
//             <Link href="/shipping-policy" className="mb-2 hover:text-[#A48068] transition-colors">
//               Shipping & Returns
//             </Link>
//             <Link href="/guest/refund" className="mb-2 hover:text-[#A48068] transition-colors">
//               Refund Policy
//             </Link>
//             <Link href="/privacy" className="mb-2 hover:text-[#A48068] transition-colors">
//               Privacy Policy
//             </Link>
//             <Link href="/term-and-conditions" className="mb-2 hover:text-[#A48068] transition-colors">
//               Terms & Conditions
//             </Link>
//             <Link href="/certification" className="mb-2 hover:text-[#A48068] transition-colors">
//               100% Made in Arnhem Land
//             </Link>
//           </div>
//         </div>

//         {/* Right Section - Newsletter */}
//         <div className="lg:w-96">
//           <h2 className="mb-4 text-lg font-semibold">Stay Connected</h2>

//           <p className="mb-6 text-sm md:text-base">
//             Subscribe to our newsletter for exclusive updates on new artworks, artist stories, and special offers.
//           </p>

//           <div className="bg-[#A48068] px-4 py-3 flex items-center gap-3 rounded-full w-full">
//             <input
//               type="email"
//               placeholder="Enter Email here"
//               value={email}
//               onChange={(e) => { setEmail(e.target.value); if (subState !== "idle") { setSubState("idle"); setSubMsg(""); } }}
//               onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
//               disabled={subState === "loading"}
//               className="bg-transparent outline-none text-white placeholder-white/80 flex-1 text-sm md:text-base disabled:opacity-60"
//             />
//             {email && subState !== "loading" && (
//               <button
//                 type="button"
//                 onClick={() => { setEmail(""); setSubState("idle"); setSubMsg(""); }}
//                 aria-label="Clear email"
//                 className="text-white/70 hover:text-white transition-colors shrink-0"
//               >
//                 <X className="w-4 h-4" />
//               </button>
//             )}
//             <button
//               type="button"
//               onClick={handleSubscribe}
//               disabled={subState === "loading"}
//               aria-label="Subscribe to newsletter"
//               className="hover:scale-110 transition-transform disabled:opacity-60 shrink-0"
//             >
//               {subState === "loading"
//                 ? <Loader2 className="w-5 h-5 text-black animate-spin" />
//                 : subState === "success"
//                 ? <CheckCircle2 className="w-5 h-5 text-black" />
//                 : <FaEnvelope className="w-5 h-5 text-black" />}
//             </button>
//           </div>

//           {subMsg && (
//             <p className={`text-sm mt-2 px-1 ${subState === "error" ? "text-red-300" : "text-green-300"}`}>
//               {subMsg}
//             </p>
//           )}

//           <p className="mt-3 text-white/50 text-xs">
//             Changed your mind?{" "}
//             <button
//               type="button"
//               onClick={() => { setShowUnsub(true); setUnsubState("idle"); setUnsubMsg(""); setUnsubEmail(""); }}
//               className="underline hover:text-white/80 transition-colors"
//             >
//               Unsubscribe
//             </button>
//           </p>
          
//           <p className="text-white/80 text-sm md:text-base bg-white/10 backdrop-blur-sm px-4 py-3 rounded-lg flex items-start gap-2 mt-8">
//             <FaHeart className="w-4 h-4 text-red-400 shrink-0 mt-1" />
//             We operate with deep respect for the First Nation culture and traditions. All products and experiences are shared with community consent.
//           </p>
//         </div>
//       </div>

//       {/* Address and Copyright Section */}
//       <div className="mt-12 flex flex-col md:flex-row justify-between items-center gap-4 mb-8 text-sm md:text-base text-center md:text-left">
//         <p className="text-white/80">
//           70 O’Sullivan Circuit, East Arm NT 0822
//         </p>

//       </div>

//       <hr className="border-[#A5816B] mb-6" />

//       {/* Logo and Social Icons */}
//       <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
//         {/* Logo */}
//         <Link href="/" className="hover:opacity-80 transition-opacity">
//           <Image
//             src="/images/navbarLogo.png"
//             height={80}
//             width={80}
//             alt="Arnhem Land Marketplace Logo"
//             className="w-16 sm:w-20 h-auto"
//           />
//         </Link>

//         {/* Social Icons */}
//         <div className="flex items-center gap-4 md:gap-6">
//           <Link 
//             href="https://www.instagram.com/arnhemland_1972/" 
//             target="_blank" 
//             rel="noopener noreferrer"
//             aria-label="Follow us on Instagram"
//             className="hover:scale-110 transition-transform"
//           >
//             <FaInstagram className="w-5 h-5 md:w-6 md:h-6 text-white hover:text-[#A48068]" />
//           </Link>

//           <Link 
//             href="https://www.facebook.com/ALPA1972" 
//             target="_blank" 
//             rel="noopener noreferrer"
//             aria-label="Follow us on Facebook"
//             className="hover:scale-110 transition-transform"
//           >
//             <FaFacebookF className="w-5 h-5 md:w-6 md:h-6 text-white hover:text-[#A48068]" />
//           </Link>

//           <Link 
//             href="https://www.linkedin.com/company/the-arnhem-land-progress-aboriginal-corporation" 
//             target="_blank" 
//             rel="noopener noreferrer"
//             aria-label="Follow us on LinkedIn"
//             className="hover:scale-110 transition-transform"
//           >
//             <FaLinkedinIn className="w-5 h-5 md:w-6 md:h-6 text-white hover:text-[#A48068]" />
//           </Link>

//           <Link 
//             href="https://www.youtube.com/channel/UCdTcDZefhjM_aybwAyrqKaQ" 
//             target="_blank" 
//             rel="noopener noreferrer"
//             aria-label="Subscribe on YouTube"
//             className="hover:scale-110 transition-transform"
//           >
//             <FaYoutube className="w-5 h-5 md:w-6 md:h-6 text-white hover:text-[#A48068]" />
//           </Link>

//           <Link 
//             href="https://x.com" 
//             target="_blank" 
//             rel="noopener noreferrer"
//             aria-label="Follow us on X (Twitter)"
//             className="hover:scale-110 transition-transform"
//           >
//             <FaXTwitter className="w-5 h-5 md:w-6 md:h-6 text-white hover:text-[#A48068]" />
//           </Link>
//         </div>
//       </div>
      
//       {/* Copyright */}
//       <div>
//         <p className="text-white/80 text-center">
//           © 2026 Made in Arnhem Land. All rights reserved. Honouring the culture and heritage of Arnhem Land
//         </p>
//       </div>

//       {/* ── Unsubscribe Modal ─────────────────────────────────────────────── */}
//       {showUnsub && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-gray-800">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-bold text-[#440C03]">Unsubscribe from Newsletter</h3>
//               <button
//                 type="button"
//                 onClick={() => setShowUnsub(false)}
//                 className="text-gray-400 hover:text-gray-700 transition-colors"
//                 aria-label="Close"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             {unsubState === "success" ? (
//               <div className="flex flex-col items-center gap-3 py-4">
//                 <CheckCircle2 className="w-10 h-10 text-green-500" />
//                 <p className="text-center text-sm text-gray-600">{unsubMsg}</p>
//                 <button
//                   type="button"
//                   onClick={() => setShowUnsub(false)}
//                   className="mt-2 px-6 py-2 bg-[#440C03] text-white rounded-full text-sm font-semibold hover:bg-[#5a1e12] transition-colors"
//                 >
//                   Close
//                 </button>
//               </div>
//             ) : (
//               <>
//                 <p className="text-sm text-gray-500 mb-4">Enter the email address you subscribed with and we'll remove you from our list.</p>
//                 <input
//                   type="email"
//                   placeholder="your@email.com"
//                   value={unsubEmail}
//                   onChange={(e) => { setUnsubEmail(e.target.value); if (unsubState !== "idle") { setUnsubState("idle"); setUnsubMsg(""); } }}
//                   onKeyDown={(e) => e.key === "Enter" && handleUnsubscribe()}
//                   disabled={unsubState === "loading"}
//                   className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#440C03] focus:ring-2 focus:ring-[#440C03]/10 transition-all disabled:opacity-60"
//                 />
//                 {unsubMsg && (
//                   <p className={`text-xs mt-2 ${unsubState === "error" ? "text-red-500" : "text-green-600"}`}>
//                     {unsubMsg}
//                   </p>
//                 )}
//                 <button
//                   type="button"
//                   onClick={handleUnsubscribe}
//                   disabled={unsubState === "loading"}
//                   className="mt-4 w-full py-3 bg-[#440C03] text-white rounded-xl font-semibold text-sm hover:bg-[#5a1e12] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
//                 >
//                   {unsubState === "loading" && <Loader2 className="w-4 h-4 animate-spin" />}
//                   {unsubState === "loading" ? "Unsubscribing..." : "Confirm Unsubscribe"}
//                 </button>
//               </>
//             )}
//           </div>
//         </div>
//       )}
//     </footer>
//   );
// }

"use client";
import { useState } from "react";
import {
  FaLinkedinIn,
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaEnvelope,
  FaHeart,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { X, Loader2, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const API = "https://backend.madeinarnhemland.com.au/api";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subState, setSubState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [subMsg, setSubMsg] = useState("");

  // Unsubscribe modal
  const [showUnsub, setShowUnsub] = useState(false);
  const [unsubEmail, setUnsubEmail] = useState("");
  const [unsubState, setUnsubState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [unsubMsg, setUnsubMsg] = useState("");

  const handleSubscribe = async () => {
    const trimmed = email.trim();
    if (!trimmed) { setSubMsg("Please enter your email."); setSubState("error"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) { setSubMsg("Please enter a valid email."); setSubState("error"); return; }

    setSubState("loading");
    setSubMsg("");
    try {
      const res = await fetch(`${API}/newsletter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) { setSubMsg(data.message || "Subscription failed. Please try again."); setSubState("error"); return; }
      setSubMsg(data.message || "You're subscribed! Welcome aboard.");
      setSubState("success");
      setEmail("");
    } catch {
      setSubMsg("Something went wrong. Please try again.");
      setSubState("error");
    }
  };

  const handleUnsubscribe = async () => {
    const trimmed = unsubEmail.trim();
    if (!trimmed) { setUnsubMsg("Please enter your email."); setUnsubState("error"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) { setUnsubMsg("Please enter a valid email."); setUnsubState("error"); return; }

    setUnsubState("loading");
    setUnsubMsg("");
    try {
      const res = await fetch(`${API}/newsletter/unsubscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) { setUnsubMsg(data.message || "Failed to unsubscribe. Please try again."); setUnsubState("error"); return; }
      setUnsubMsg(data.message || "You've been unsubscribed successfully.");
      setUnsubState("success");
      setUnsubEmail("");
    } catch {
      setUnsubMsg("Something went wrong. Please try again.");
      setUnsubState("error");
    }
  };

  return (
    <footer className="bg-[#440C03] bg-cover text-white px-4 sm:px-8 md:px-12 lg:px-20 pt-10 pb-8 md:pt-12 md:pb-10 lg:pb-8"> 
      {/* Top Main Section */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 mb-4">
        {/* Left Section - Navigation Links */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-8 flex-1 text-xs md:text-sm">
          {/* Column 1 - Shop */}
          <div className="flex flex-col">
            <h2 className="mb-4 text-base md:text-lg font-semibold">Shop</h2>
            <Link href="/shop" className="mb-2 text-white/80 hover:text-[#A48068] transition-colors">
              All Products
            </Link>
            <Link href="/#featured-products" className="mb-2 text-white/80 hover:text-[#A48068] transition-colors">
              Shop featured Products
            </Link>
            <Link href="/shop?category=art-crafts" className="mb-2 text-white/80 hover:text-[#A48068] transition-colors">
              Art & Crafts
            </Link>
            <Link href="/shop?category=bush-foods" className="mb-2 text-white/80 hover:text-[#A48068] transition-colors">
              Bush Foods
            </Link>
            <Link href="/shop?category=apparel" className="mb-2 text-white/80 hover:text-[#A48068] transition-colors">
              Apparel
            </Link>
            <Link href="/shop?category=handmade-crafts" className="mb-2 text-white/80 hover:text-[#A48068] transition-colors">
              Handmade Crafts
            </Link>
            <Link href="/shop?category=accessories" className="mb-2 text-white/80 hover:text-[#A48068] transition-colors">
              Accessories
            </Link>
          </div>

          {/* Column 2 - Sellers */}
          <div className="flex flex-col">
            <h2 className="mb-4 text-base md:text-lg font-semibold">Sell with us</h2>
            {/* <Link href="/sellerOnboarding" className="mb-2 text-white/80 hover:text-[#A48068] transition-colors">
              Sell with MIA
            </Link> */}
            <Link href="/sellerOnboarding" className="mb-2 text-white/80 hover:text-[#A48068] transition-colors">
              Seller Registration
            </Link>
            <Link href="/seller-login" className="mb-2 text-white/80 hover:text-[#A48068] transition-colors">
              Seller Login
            </Link>
            <Link href="/seller-rules" className="mb-2 text-white/80 hover:text-[#A48068] transition-colors">
              Seller Guidelines
            </Link>
           <Link href="/certification" className="mb-2 text-white/80 hover:text-[#A48068] transition-colors">
              100% Made in Arnhem Land
            </Link>
             <Link href="/fees-and-commission" className="mb-2 text-white/80 hover:text-[#A48068] transition-colors">
             Fees & Commission
            </Link>
            <Link href="/contact-us" className="mb-2 text-white/80 hover:text-[#A48068] transition-colors">
              Seller Support
            </Link>
          </div>

          {/* Column 3 - About */}
          <div className="flex flex-col">
            <h2 className="mb-4 text-base md:text-lg font-semibold">About</h2>
            <Link href="/about-us" className="mb-2 text-white/80 hover:text-[#A48068] transition-colors">
              About Us
            </Link>
            <Link href="/blog" className="mb-2 text-white/80 hover:text-[#A48068] transition-colors">
              Blog & Stories
            </Link>
            <Link href="/certification" className="mb-2 text-white/80 hover:text-[#A48068] transition-colors">
              Community Impact
            </Link>
            <Link href="/contact-us" className="mb-2 text-white/80 hover:text-[#A48068] transition-colors">
              Media / Press
            </Link>
          </div>

          {/* Column 4 - Support */}
          <div className="flex flex-col">
            <h2 className="mb-4 text-base md:text-lg font-semibold">Support</h2>
            <Link href="/contact-us" className="mb-2 text-white/80 hover:text-[#A48068] transition-colors">
              Contact Us
            </Link>
           
            <Link href="/contact-us#faq" className="mb-2 text-white/80 hover:text-[#A48068] transition-colors">
              FAQs
            </Link>
            <Link href="/guest/track-order" className="mb-2 text-white/80 hover:text-[#A48068] transition-colors">
              Track Order / Track Status
            </Link>
            <Link href="/feedback" className="mb-2 text-white/80 hover:text-[#A48068] transition-colors">
              Share Feedback
            </Link>
             <Link href="/accessibility" className="mb-2 text-white/80 hover:text-[#A48068] transition-colors">
              Accessibility
            </Link>
          </div>

          {/* Column 4 - Policies */}
          <div className="flex flex-col">
            <h2 className="mb-4 text-base md:text-lg font-semibold">Policies</h2>
            <Link href="/shipping-policy" className="mb-2 text-white/80 hover:text-[#A48068] transition-colors">
              Shipping & Returns
            </Link>
            <Link href="/guest/refund" className="mb-2 text-white/80 hover:text-[#A48068] transition-colors">
              Refund Policy
            </Link>
            <Link href="/privacy" className="mb-2 text-white/80 hover:text-[#A48068] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/term-and-conditions" className="mb-2 text-white/80 hover:text-[#A48068] transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/cookie-policy" className="mb-2 text-white/80 hover:text-[#A48068] transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>

        {/* Right Section - Newsletter */}
        <div className="lg:w-80">
          <h2 className="mb-4 text-base md:text-lg font-semibold">Stay Connected</h2>

          <p className="mb-4 text-xs md:text-sm">
            Subscribe to our newsletter for exclusive updates on new artworks, artist stories, and special offers.
          </p>

          <div className="bg-[#A48068] px-4 py-3 flex items-center gap-3 rounded-full w-full">
            <input
              type="email"
              placeholder="Enter Email here"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (subState !== "idle") { setSubState("idle"); setSubMsg(""); } }}
              onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
              disabled={subState === "loading"}
              className="bg-transparent outline-none text-white placeholder-white/80 flex-1 text-sm md:text-base disabled:opacity-60"
            />
            {email && subState !== "loading" && (
              <button
                type="button"
                onClick={() => { setEmail(""); setSubState("idle"); setSubMsg(""); }}
                aria-label="Clear email"
                className="text-white/70 hover:text-white transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={handleSubscribe}
              disabled={subState === "loading"}
              aria-label="Subscribe to newsletter"
              className="hover:scale-110 transition-transform disabled:opacity-60 shrink-0"
            >
              {subState === "loading"
                ? <Loader2 className="w-5 h-5 text-black animate-spin" />
                : subState === "success"
                ? <CheckCircle2 className="w-5 h-5 text-black" />
                : <FaEnvelope className="w-5 h-5 text-black" />}
            </button>
          </div>

          {subMsg && (
            <p className={`text-sm mt-2 px-1 ${subState === "error" ? "text-red-300" : "text-green-300"}`}>
              {subMsg}
            </p>
          )}

          <p className="mt-2 text-white/50 text-xs">
            Changed your mind?{" "}
            <button
              type="button"
              onClick={() => { setShowUnsub(true); setUnsubState("idle"); setUnsubMsg(""); setUnsubEmail(""); }}
              className="underline hover:text-white/80 transition-colors"
            >
              Unsubscribe
            </button>
          </p>
        </div>
      </div>

      {/* Respect statement + address */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mt-6 mb-3">
        <p className="text-white/80 text-xs shrink-0 md:order-1">
          70 O&apos;Sullivan Circuit,<br />East Arm NT 0822
        </p>
        <p className="text-white/80 text-xs bg-white/10 backdrop-blur-sm px-4 py-3 rounded-lg flex items-start gap-2 md:max-w-md md:order-2">
          <FaHeart className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
          We operate with deep respect for the First Nation culture and traditions. All products and experiences are shared with community consent.
        </p>
      </div>

      <hr className="border-[#A5816B] mb-3" />

      {/* Footer Bottom (Logo, Copyright, Social) */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 lg:gap-4 mt-3">
        {/* Logo */}
        <div className="flex-1 flex justify-center md:justify-start">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Image
              src="/images/navbarLogo.png"
              height={60}
              width={60}
              alt="Arnhem Land Marketplace Logo"
              className="w-12 sm:w-14 h-auto"
            />
          </Link>
        </div>

        {/* Copyright */}
        <div className="flex-1 text-center">
          <p className="text-white/80 text-xs md:text-sm">
            © 2026 Made in Arnhem Land. All rights reserved.<br className="hidden md:block"/> Honouring the culture and heritage of Arnhem Land
          </p>
          <p className="text-white/50 text-xs mt-1">
            ABN: 52 755 439 387 &nbsp;|&nbsp; ICN: 7137
          </p>
        </div>

        {/* Social Icons + Payment Methods */}
        <div className="flex-1 flex flex-col items-center md:items-end gap-3">
          {/* Payment icons */}
          <div className="flex items-center gap-2">
            {/* Visa */}
            <span className="bg-white rounded px-2 py-1 flex items-center justify-center h-7 w-12">
              <svg viewBox="0 0 48 16" className="h-4 w-auto" aria-label="Visa">
                <text x="0" y="13" fontFamily="Arial" fontWeight="bold" fontSize="14" fill="#1A1F71">VISA</text>
              </svg>
            </span>
            {/* Mastercard */}
            <span className="bg-white rounded px-1.5 py-1 flex items-center justify-center h-7 w-12" aria-label="Mastercard">
              <svg viewBox="0 0 38 24" className="h-5 w-auto">
                <circle cx="13" cy="12" r="10" fill="#EB001B" />
                <circle cx="25" cy="12" r="10" fill="#F79E1B" />
                <path d="M19 4.8a10 10 0 0 1 0 14.4A10 10 0 0 1 19 4.8z" fill="#FF5F00" />
              </svg>
            </span>
            {/* Stripe */}
            <span className="bg-[#635BFF] rounded px-2 py-1 flex items-center justify-center h-7 w-14" aria-label="Stripe">
              <svg viewBox="0 0 40 16" className="h-3.5 w-auto">
                <text x="0" y="12" fontFamily="Arial" fontWeight="bold" fontSize="12" fill="white">stripe</text>
              </svg>
            </span>
          </div>
          {/* Social icons */}
          <div className="flex items-center gap-4 md:gap-5">
          <Link 
            href="https://www.instagram.com/arnhemland_1972/" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="Follow us on Instagram"
            className="hover:scale-110 transition-transform"
          >
            <FaInstagram className="w-4 h-4 md:w-5 md:h-5 text-white hover:text-[#A48068]" />
          </Link>

          <Link 
            href="https://www.facebook.com/ALPA1972" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="Follow us on Facebook"
            className="hover:scale-110 transition-transform"
          >
            <FaFacebookF className="w-4 h-4 md:w-5 md:h-5 text-white hover:text-[#A48068]" />
          </Link>

          <Link 
            href="https://www.linkedin.com/company/the-arnhem-land-progress-aboriginal-corporation" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="Follow us on LinkedIn"
            className="hover:scale-110 transition-transform"
          >
            <FaLinkedinIn className="w-4 h-4 md:w-5 md:h-5 text-white hover:text-[#A48068]" />
          </Link>

          <Link 
            href="https://www.youtube.com/channel/UCdTcDZefhjM_aybwAyrqKaQ" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="Subscribe on YouTube"
            className="hover:scale-110 transition-transform"
          >
            <FaYoutube className="w-4 h-4 md:w-5 md:h-5 text-white hover:text-[#A48068]" />
          </Link>

          {/* <Link 
            href="https://x.com" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="Follow us on X (Twitter)"
            className="hover:scale-110 transition-transform"
          >
            <FaXTwitter className="w-4 h-4 md:w-5 md:h-5 text-white hover:text-[#A48068]" />
          </Link> */}
          </div>{/* end social icons */}
        </div>{/* end social + payment wrapper */}
      </div>

      {/* ── Unsubscribe Modal ─────────────────────────────────────────────── */}
      {showUnsub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#440C03]">Unsubscribe from Newsletter</h3>
              <button
                type="button"
                onClick={() => setShowUnsub(false)}
                className="text-gray-400 hover:text-gray-700 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {unsubState === "success" ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
                <p className="text-center text-sm text-gray-600">{unsubMsg}</p>
                <button
                  type="button"
                  onClick={() => setShowUnsub(false)}
                  className="mt-2 px-6 py-2 bg-[#440C03] text-white rounded-full text-sm font-semibold hover:bg-[#5a1e12] transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-4">Enter the email address you subscribed with and we'll remove you from our list.</p>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={unsubEmail}
                  onChange={(e) => { setUnsubEmail(e.target.value); if (unsubState !== "idle") { setUnsubState("idle"); setUnsubMsg(""); } }}
                  onKeyDown={(e) => e.key === "Enter" && handleUnsubscribe()}
                  disabled={unsubState === "loading"}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#440C03] focus:ring-2 focus:ring-[#440C03]/10 transition-all disabled:opacity-60"
                />
                {unsubMsg && (
                  <p className={`text-xs mt-2 ${unsubState === "error" ? "text-red-500" : "text-green-600"}`}>
                    {unsubMsg}
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleUnsubscribe}
                  disabled={unsubState === "loading"}
                  className="mt-4 w-full py-3 bg-[#440C03] text-white rounded-xl font-semibold text-sm hover:bg-[#5a1e12] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {unsubState === "loading" && <Loader2 className="w-4 h-4 animate-spin" />}
                  {unsubState === "loading" ? "Unsubscribing..." : "Confirm Unsubscribe"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </footer>
  );
}
