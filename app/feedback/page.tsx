// "use client";

// import { useState } from "react";
// import {
//   Star,
//   CheckCircle,
//   MessageSquare,
//   Send,
//   ChevronRight,
//   HandHeart,
//   Zap,
//   Link2,
//   Award,
// } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";

// const RATING_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

// // ─── Cultural Pillars Data ────────────────────────────────────────────────────
// const PILLARS = [
//   {
//     icon: <HandHeart className="w-6 h-6" />,
//     accent: "#7C1D10",
//     badge: "Respect",
//     title: "Cultural Authenticity",
//     question:
//       "Did the products and sellers honor Aboriginal culture with authenticity and respect?",
//     measures: [
//       "Authentic representation",
//       "Cultural sensitivity",
//       "Traditional knowledge honored",
//     ],
//   },
//   {
//     icon: <Zap className="w-6 h-6" />,
//     accent: "#5C6D2E",
//     badge: "Empowerment",
//     title: "Community Support",
//     question:
//       "Did this purchase empower Aboriginal communities and businesses economically?",
//     measures: [
//       "Economic impact felt",
//       "Community benefit clear",
//       "Supporting local artisans",
//     ],
//   },
//   {
//     icon: <Link2 className="w-6 h-6" />,
//     accent: "#2B5E7E",
//     badge: "Connection",
//     title: "Cultural Stories",
//     question:
//       "Did you feel connected to the culture and stories behind the products?",
//     measures: [
//       "Emotional connection",
//       "Understanding the story",
//       "Cultural education value",
//     ],
//   },
//   {
//     icon: <Award className="w-6 h-6" />,
//     accent: "#7A5C1E",
//     badge: "Pride",
//     title: "Ownership Joy",
//     question:
//       "Are you proud to own and share these authentic Aboriginal products?",
//     measures: [
//       "Pride of ownership",
//       "Willingness to share / recommend",
//       "Value perception",
//     ],
//   },
// ];

// // ─── Success Screen ───────────────────────────────────────────────────────────
// function SuccessScreen({ rating }: { rating: number }) {
//   return (
//     <motion.div
//       initial={{ opacity: 0, scale: 0.92 }}
//       animate={{ opacity: 1, scale: 1 }}
//       transition={{ duration: 0.45, ease: "easeOut" }}
//       className="flex flex-col items-center justify-center text-center px-6 py-20 gap-6"
//     >
//       <motion.div
//         initial={{ scale: 0 }}
//         animate={{ scale: 1 }}
//         transition={{ delay: 0.2, type: "spring", stiffness: 220, damping: 18 }}
//         className="w-24 h-24 rounded-full bg-[#5A1E12]/10 flex items-center justify-center"
//       >
//         <CheckCircle className="w-12 h-12 text-[#5A1E12]" strokeWidth={1.5} />
//       </motion.div>

//       <div>
//         <h2 className="text-3xl font-bold text-[#3b1a08] mb-2">Thank You!</h2>
//         <p className="text-base text-[#973c00]/70 max-w-md mx-auto leading-relaxed">
//           Your feedback has been received. We read every submission and use it to
//           make our platform better for every community member and buyer.
//         </p>
//       </div>

//       <div className="flex gap-2 mt-2">
//         {[1, 2, 3, 4, 5].map((s) => (
//           <Star
//             key={s}
//             size={26}
//             className={
//               s <= rating
//                 ? "fill-[#973c00] text-[#973c00]"
//                 : "fill-[#EAD7B7] text-[#EAD7B7]"
//             }
//           />
//         ))}
//       </div>

//       <motion.a
//         href="/"
//         initial={{ opacity: 0, y: 10 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.5 }}
//         className="mt-4 inline-flex items-center gap-2 bg-[#440C03] text-white px-8 py-3 rounded-full text-sm font-semibold hover:bg-[#5A1E12] transition-colors"
//       >
//         Back to Home <ChevronRight className="w-4 h-4" />
//       </motion.a>
//     </motion.div>
//   );
// }

// // ─── Main Feedback Page ───────────────────────────────────────────────────────
// export default function FeedbackPage() {
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [rating, setRating] = useState(0);
//   const [hovered, setHovered] = useState(0);
//   const [comment, setComment] = useState("");

//   const [submitting, setSubmitting] = useState(false);
//   const [submitted, setSubmitted] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     if (!rating) { setError("Please select a star rating."); return; }
//     if (!name.trim()) { setError("Please enter your name."); return; }
//     if (!email.trim()) { setError("Please enter your email."); return; }
//     if (!comment.trim()) { setError("Please enter your feedback description."); return; }
//     if (comment.trim().length < 20) { setError("Feedback description must be at least 20 characters long."); return; }
//     setError(null);
//     setSubmitting(true);
//     try {
//       const res = await fetch("https://backend.madeinarnhemland.com.au/api/feedback", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           name: name.trim(),
//           email: email.trim(),
//           rating: String(rating),
//           comment: comment.trim(),
//         }),
//       });
//       if (res.ok) {
//         setSubmitted(true);
//       } else {
//         const data = await res.json().catch(() => ({}));
//         setError(data?.message || "Something went wrong. Please try again.");
//       }
//     } catch {
//       setError("Unable to submit feedback. Please check your connection and try again.");
//     } finally {
//       setSubmitting(false);
//     }
//   }

//   return (
//     <div className="bg-[#f3e9dd] min-h-screen">

//       {/* ── Hero ── */}
//       <div className="relative overflow-hidden bg-[url('/images/main.png')] bg-cover bg-center min-h-[40vh] md:min-h-[50vh] lg:min-h-[65vh] flex items-center justify-center">
//         <div className="absolute inset-0 bg-black/55" />
//         <div className="relative z-10 text-center px-4 py-20">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6 }}
//           >
//             <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm mb-5">
//               <MessageSquare className="w-8 h-8 text-white" strokeWidth={1.5} />
//             </div>
//             <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
//               Share Your Feedback
//             </h1>
//             <p className="text-white/80 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
//               Help us grow by telling us how we&apos;re doing. Every voice
//               matters — yours shapes the future of MIA Marketplace.
//             </p>
//           </motion.div>
//         </div>
//       </div>

//       {/* ── Cultural Pillars Section ── */}
//       <div className="bg-[#440C03] py-16 md:py-20 px-4">
//         <div className="max-w-5xl mx-auto">
//           {/* heading */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.55 }}
//             className="text-center mb-12"
//           >
//             <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
//               The Four Cultural Pillars
//             </h2>
//             <p className="text-white/60 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
//               Each pillar represents a core value of authentic Aboriginal cultural commerce
//             </p>
//           </motion.div>

//           {/* cards grid */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
//             {PILLARS.map((pillar, i) => (
//               <motion.div
//                 key={pillar.badge}
//                 initial={{ opacity: 0, y: 24 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ delay: i * 0.1, duration: 0.45 }}
//                 className="flex flex-col bg-white/08 backdrop-blur-sm border border-white/10 rounded-2xl p-6 gap-4"
//                 style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
//               >
//                 {/* icon + badge */}
//                 <div className="flex items-center gap-3">
//                   <div
//                     className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-white"
//                     style={{ backgroundColor: pillar.accent }}
//                   >
//                     {pillar.icon}
//                   </div>
//                   <span
//                     className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
//                     style={{ color: pillar.accent, backgroundColor: `${pillar.accent}22` }}
//                   >
//                     {pillar.badge}
//                   </span>
//                 </div>

//                 {/* title + question */}
//                 <div>
//                   <h3 className="text-white font-bold text-base leading-snug mb-1.5">
//                     {pillar.title}
//                   </h3>
//                   <p className="text-white/55 text-xs leading-relaxed">
//                     {pillar.question}
//                   </p>
//                 </div>

//                 {/* measures */}
//                 <div className="mt-auto pt-3 border-t border-white/10">
//                   <p className="text-white/35 text-[10px] font-semibold uppercase tracking-widest mb-2">
//                     Measures
//                   </p>
//                   <ul className="flex flex-col gap-1.5">
//                     {pillar.measures.map((m) => (
//                       <li key={m} className="flex items-start gap-1.5 text-white/65 text-xs leading-snug">
//                         <span className="mt-1 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: pillar.accent }} />
//                         {m}
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* ── Feedback Form ── */}
//       <div className="max-w-3xl mx-auto px-4 py-14 md:py-20">
//         <AnimatePresence mode="wait">

//           {/* ── Success ── */}
//           {submitted && (
//             <motion.div
//               key="success"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               className="bg-white rounded-3xl shadow-sm border border-[#973c00]/10 overflow-hidden"
//             >
//               <SuccessScreen rating={rating} />
//             </motion.div>
//           )}

//           {/* ── Form ── */}
//           {!submitted && (
//             <motion.div
//               key="form"
//               initial={{ opacity: 0, y: 24 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -16 }}
//               transition={{ duration: 0.35 }}
//               className="bg-white rounded-3xl shadow-sm border border-[#973c00]/10 overflow-hidden"
//             >
//               {/* form header */}
//               <div className="bg-[#440C03] px-6 py-5 flex items-center gap-3">
//                 <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
//                   <MessageSquare className="w-4 h-4 text-white" strokeWidth={1.5} />
//                 </div>
//                 <div>
//                   <p className="text-white font-semibold text-sm leading-tight">Your Feedback</p>
//                   <p className="text-white/50 text-xs">All fields marked * are required</p>
//                 </div>
//               </div>

//               <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col gap-7">

//                 {/* Star Rating */}
//                 <div className="flex flex-col gap-2.5">
//                   <label className="text-xs font-semibold text-[#973c00]/70 uppercase tracking-wider">
//                     Overall Rating <span className="text-[#973c00]">*</span>
//                   </label>
//                   <div className="flex items-center gap-2">
//                     {[1, 2, 3, 4, 5].map((s) => (
//                       <button
//                         key={s}
//                         type="button"
//                         onMouseEnter={() => setHovered(s)}
//                         onMouseLeave={() => setHovered(0)}
//                         onClick={() => setRating(s)}
//                         className="transition-transform duration-150 hover:scale-110 active:scale-95 focus:outline-none"
//                         aria-label={`Rate ${s} out of 5`}
//                       >
//                         <Star
//                           size={36}
//                           className={`transition-colors duration-150 ${
//                             s <= (hovered || rating)
//                               ? "fill-[#973c00] text-[#973c00]"
//                               : "fill-stone-200 text-stone-200"
//                           }`}
//                         />
//                       </button>
//                     ))}
//                     <AnimatePresence mode="wait">
//                       {(hovered || rating) > 0 && (
//                         <motion.span
//                           key={hovered || rating}
//                           initial={{ opacity: 0, x: -6 }}
//                           animate={{ opacity: 1, x: 0 }}
//                           exit={{ opacity: 0 }}
//                           className="ml-2 text-sm font-semibold text-[#5A1E12]"
//                         >
//                           {RATING_LABELS[hovered || rating]}
//                         </motion.span>
//                       )}
//                     </AnimatePresence>
//                   </div>
//                 </div>

//                 {/* Name + Email */}
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div className="flex flex-col gap-1.5">
//                     <label className="text-xs font-semibold text-[#973c00]/70 uppercase tracking-wider">
//                       Name <span className="text-[#973c00]">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       value={name}
//                       onChange={(e) => setName(e.target.value)}
//                       placeholder="Your full name"
//                       className="w-full px-4 py-3 text-sm rounded-xl border border-[#973c00]/20 bg-[#fdf7f1] text-[#3b1a08] placeholder-[#973c00]/30 outline-none focus:border-[#5A1E12] focus:ring-2 focus:ring-[#5A1E12]/10 transition-all"
//                     />
//                   </div>
//                   <div className="flex flex-col gap-1.5">
//                     <label className="text-xs font-semibold text-[#973c00]/70 uppercase tracking-wider">
//                       Email <span className="text-[#973c00]">*</span>
//                     </label>
//                     <input
//                       type="email"
//                       value={email}
//                       onChange={(e) => setEmail(e.target.value)}
//                       placeholder="your@email.com"
//                       className="w-full px-4 py-3 text-sm rounded-xl border border-[#973c00]/20 bg-[#fdf7f1] text-[#3b1a08] placeholder-[#973c00]/30 outline-none focus:border-[#5A1E12] focus:ring-2 focus:ring-[#5A1E12]/10 transition-all"
//                     />
//                   </div>
//                 </div>

//                 {/* Comment */}
//                 <div className="flex flex-col gap-1.5">
//                   <div className="flex items-center justify-between">
//                     <label className="text-xs font-semibold text-[#973c00]/70 uppercase tracking-wider">
//                       Your Feedback <span className="text-[#973c00]">*</span>
//                     </label>
//                     <span className={`text-xs font-medium ${
//                       comment.trim().length >= 20
//                         ? 'text-green-600'
//                         : comment.trim().length > 0
//                         ? 'text-amber-600'
//                         : 'text-[#973c00]/50'
//                     }`}>
//                       {comment.trim().length}/20 min
//                     </span>
//                   </div>
//                   <textarea
//                     value={comment}
//                     onChange={(e) => setComment(e.target.value)}
//                     placeholder="Tell us what went well, what could be better, or anything else on your mind… (minimum 20 characters)"
//                     rows={5}
//                     className={`w-full px-4 py-3 text-sm rounded-xl border ${
//                       comment.trim().length >= 20
//                         ? 'border-green-300 focus:border-green-500 focus:ring-green-500/10'
//                         : comment.trim().length > 0
//                         ? 'border-amber-300 focus:border-amber-500 focus:ring-amber-500/10'
//                         : 'border-[#973c00]/20 focus:border-[#5A1E12] focus:ring-[#5A1E12]/10'
//                     } bg-[#fdf7f1] text-[#3b1a08] placeholder-[#973c00]/30 outline-none focus:ring-2 transition-all resize-none leading-relaxed`}
//                   />
//                   {comment.trim().length > 0 && comment.trim().length < 20 && (
//                     <p className="text-xs text-amber-600 mt-1">
//                       {20 - comment.trim().length} more characters needed
//                     </p>
//                   )}
//                   {comment.trim().length >= 20 && (
//                     <p className="text-xs text-green-600 mt-1">
//                       ✓ Minimum requirement met
//                     </p>
//                   )}
//                 </div>

//                 {/* Error */}
//                 <AnimatePresence>
//                   {error && (
//                     <motion.p
//                       initial={{ opacity: 0, y: -6 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       exit={{ opacity: 0 }}
//                       className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
//                     >
//                       {error}
//                     </motion.p>
//                   )}
//                 </AnimatePresence>

//                 {/* Submit */}
//                 <button
//                   type="submit"
//                   disabled={submitting}
//                   className="w-full flex items-center justify-center gap-2.5 bg-[#440C03] hover:bg-[#5A1E12] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-2xl transition-colors text-sm"
//                 >
//                   {submitting ? (
//                     <>
//                       <svg
//                         className="animate-spin w-4 h-4"
//                         xmlns="http://www.w3.org/2000/svg"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                       >
//                         <circle
//                           className="opacity-25"
//                           cx="12" cy="12" r="10"
//                           stroke="currentColor" strokeWidth="4"
//                         />
//                         <path
//                           className="opacity-75"
//                           fill="currentColor"
//                           d="M4 12a8 8 0 018-8v8H4z"
//                         />
//                       </svg>
//                       Submitting…
//                     </>
//                   ) : (
//                     <>
//                       <Send className="w-4 h-4" />
//                       Submit Feedback
//                     </>
//                   )}
//                 </button>

//                 <p className="text-center text-xs text-[#973c00]/40 -mt-3">
//                   Your feedback is confidential and used solely to improve our platform.
//                 </p>

//               </form>
//             </motion.div>
//           )}

//         </AnimatePresence>
//       </div>
//     </div>
//   );
// }


"use client";

import { useState } from "react";
import {
  Star,
  CheckCircle,
  MessageSquare,
  Send,
  ChevronRight,
  ChevronDown,
  HandHeart,
  Zap,
  Link2,
  Award,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import VideoHeroSection from "@/components/common-components/VideoHeroSection";

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

// ─── Cultural Pillars Data ────────────────────────────────────────────────────
const PILLARS = [
  {
    icon: <HandHeart className="w-6 h-6" />,
    accent: "#7C1D10",
    badge: "Respect",
    title: "Cultural Authenticity",
    question:
      "Did the products and sellers honor Aboriginal culture with authenticity and respect?",
    measures: [
      "Authentic representation",
      "Cultural sensitivity",
      "Traditional knowledge honored",
    ],
  },
  {
    icon: <Zap className="w-6 h-6" />,
    accent: "#5C6D2E",
    badge: "Empowerment",
    title: "Community Support",
    question:
      "Did this purchase empower Aboriginal communities and businesses economically?",
    measures: [
      "Economic impact felt",
      "Community benefit clear",
      "Supporting local artisans",
    ],
  },
  {
    icon: <Link2 className="w-6 h-6" />,
    accent: "#2B5E7E",
    badge: "Connection",
    title: "Cultural Stories",
    question:
      "Did you feel connected to the culture and stories behind the products?",
    measures: [
      "Emotional connection",
      "Understanding the story",
      "Cultural education value",
    ],
  },
  {
    icon: <Award className="w-6 h-6" />,
    accent: "#7A5C1E",
    badge: "Pride",
    title: "Ownership Joy",
    question:
      "Are you proud to own and share these authentic Aboriginal products?",
    measures: [
      "Pride of ownership",
      "Willingness to share / recommend",
      "Value perception",
    ],
  },
];

// ─── Success Screen ───────────────────────────────────────────────────────────
function SuccessScreen({ rating }: { rating: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="flex flex-col items-center justify-center text-center px-6 py-20 gap-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 220, damping: 18 }}
        className="w-24 h-24 rounded-full bg-[#5A1E12]/10 flex items-center justify-center"
      >
        <CheckCircle className="w-12 h-12 text-[#5A1E12]" strokeWidth={1.5} />
      </motion.div>

      <div>
        <h2 className="text-3xl font-bold text-[#3b1a08] mb-2">Thank You!</h2>
        <p className="text-base text-[#973c00]/70 max-w-md mx-auto leading-relaxed">
          Your feedback has been received. We read every submission and use it to
          make our platform better for every community member and buyer.
        </p>
      </div>

      <div className="flex gap-2 mt-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            size={26}
            className={
              s <= rating
                ? "fill-[#973c00] text-[#973c00]"
                : "fill-[#EAD7B7] text-[#EAD7B7]"
            }
          />
        ))}
      </div>

      <motion.a
        href="/"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-4 inline-flex items-center gap-2 bg-[#440C03] text-white px-8 py-3 rounded-full text-sm font-semibold hover:bg-[#5A1E12] transition-colors"
      >
        Back to Home <ChevronRight className="w-4 h-4" />
      </motion.a>
    </motion.div>
  );
}

// ─── Main Feedback Page ───────────────────────────────────────────────────────
export default function FeedbackPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Scroll to feedback form function
  const scrollToForm = () => {
    const formElement = document.getElementById("feedback-form");
    if (formElement) {
      formElement.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) { setError("Please select a star rating."); return; }
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!email.trim()) { setError("Please enter your email."); return; }
    if (!comment.trim()) { setError("Please enter your feedback description."); return; }
    if (comment.trim().length < 20) { setError("Feedback description must be at least 20 characters long."); return; }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("https://backend.madeinarnhemland.com.au/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          rating: String(rating),
          comment: comment.trim(),
        }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data?.message || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Unable to submit feedback. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-[#f9f3ee] min-h-screen">

      {/* ── Hero ── */}
      <VideoHeroSection className="min-h-[40vh] md:min-h-[50vh] lg:min-h-[65vh] flex items-center justify-center">
        <div className="relative z-10 text-center px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-[#f9f3ee] backdrop-blur-sm mb-5 mx-auto">
              <MessageSquare className="w-8 h-8 text-[#440C03]" strokeWidth={1.5} />
            </div> */}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Share Your Feedback
            </h1>
            <p className="text-white/80 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
              Help us grow by telling us how we&apos;re doing. Every voice
              matters — yours shapes the future of Made in Arnhem Land Marketplace.
            </p>
          </motion.div>
        </div>
      </VideoHeroSection>

      {/* ── Share Your Experience Section ── */}
      <div className="relative bg-[#f9f3ee] py-20 md:py-24 px-4 overflow-hidden">
        {/* Background Pattern */}
        {/* <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-[#440C03]"></div>
          <div className="absolute top-40 right-20 w-24 h-24 rounded-full bg-[#973c00]"></div>
          <div className="absolute bottom-32 left-1/4 w-16 h-16 rounded-full bg-[#5C6D2E]"></div>
          <div className="absolute bottom-20 right-1/3 w-20 h-20 rounded-full bg-[#2B5E7E]"></div>
        </div> */}
        
        <div className="relative max-w-7xl mx-auto">
          {/* Top Section - Left: Heading/Button, Right: Image */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Content */}
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-center lg:text-left"
              >
                <div className="inline-flex items-center gap-2 bg-[#440C03]/5 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                  <HandHeart className="w-5 h-5 text-[#440C03]" />
                  <span className="text-sm font-semibold text-[#440C03] uppercase tracking-wider">Community Impact</span>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-bold text-[#440C03] mb-4 leading-tight">
                  Share Your Experience
                </h2>
                <div className="w-24 h-1 bg-linear-to-r from-[#973c00] to-[#440C03] mb-6 rounded-full lg:mx-0 mx-auto"></div>
                <p className="text-xl text-[#973c00] font-medium mb-8">
                  Your feedback helps strengthen communities
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="space-y-6"
              >
                <div className="prose prose-lg text-center lg:text-left">
                  <p className="text-[#3b1a08] leading-relaxed text-lg">
                    When you purchase from Made in Arnhem Land, you're not just buying a product or service — 
                    <span className="font-semibold text-[#440C03]"> you're helping to strengthen local communities.</span>
                  </p>
                  
                  <p className="text-[#3b1a08] leading-relaxed text-lg">
                    Your feedback helps everyone who contributes to Arnhem Land products and services to 
                    <span className="font-semibold text-[#973c00]"> learn, grow, and share their culture with confidence.</span>
                  </p>
                </div>
                
                {/* Scroll to form button */}
                <div className="text-center lg:text-left mt-8">
                  <motion.button
                    onClick={scrollToForm}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="group inline-flex items-center gap-2 bg-[#440C03] hover:bg-[#5A1E12] text-white px-6 py-3 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <span>Feedback Form</span>
                    <motion.div
                      animate={{ y: [0, 3, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </motion.div>
                  </motion.button>
                </div>
              </motion.div>
            </div>

            {/* Right Side - Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="/images/feedback.webp" 
                  alt="Community feedback and engagement"
                  className="w-full h-auto object-cover rounded-3xl"
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#440C03]/20 via-transparent to-transparent rounded-3xl"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Four Key Areas of Social Impact - Full Width White Section ── */}
      <div className="bg-[#f9f3ee] w-full py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="text-center mb-8">
              <h3 className="text-3xl md:text-4xl font-bold text-[#440C03] mb-4">Four Key Areas of Social Impact</h3>
              <p className="text-lg text-[#973c00]">We measure how your purchase creates positive change</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="group bg-white rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-600 hover:border-gray-600"
              >
                <div className="flex flex-col items-start text-left gap-6 h-full">
                  <div className="flex items-center gap-4 w-full">
                    <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-[#7C1D10] to-[#7C1D10]/80 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Zap className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#7C1D10] text-2xl">Empowerment</h4>
                      <p className="text-[#7C1D10]/70 text-base font-medium">Community Support</p>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 text-base mb-4 leading-relaxed">
                      Did this purchase empower Aboriginal communities and businesses economically?
                    </p>
                    <div>
                      <p className="text-sm font-semibold text-[#7C1D10] uppercase tracking-wide mb-3">Measures:</p>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li>• Economic impact felt</li>
                        <li>• Community benefit clear</li>
                        <li>• Supporting local artisans</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="group bg-white rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-600 hover:border-gray-600"
              >
                <div className="flex flex-col items-start text-left gap-6 h-full">
                  <div className="flex items-center gap-4 w-full">
                    <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-[#5C6D2E] to-[#5C6D2E]/80 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <HandHeart className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#5C6D2E] text-2xl">Respect</h4>
                      <p className="text-[#5C6D2E]/70 text-base font-medium">Cultural Authenticity</p>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 text-base mb-4 leading-relaxed">
                      Did the products and sellers honor Aboriginal culture with authenticity and respect?
                    </p>
                    <div>
                      <p className="text-sm font-semibold text-[#5C6D2E] uppercase tracking-wide mb-3">Measures:</p>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li>• Authentic representation</li>
                        <li>• Cultural sensitivity</li>
                        <li>• Traditional knowledge honored</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 }}
                className="group bg-white rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-600 hover:border-gray-600"
              >
                <div className="flex flex-col items-start text-left gap-6 h-full">
                  <div className="flex items-center gap-4 w-full">
                    <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-[#2B5E7E] to-[#2B5E7E]/80 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Link2 className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#2B5E7E] text-2xl">Connection</h4>
                      <p className="text-[#2B5E7E]/70 text-base font-medium">Cultural Stories</p>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 text-base mb-4 leading-relaxed">
                      Did you feel connected to the culture and stories behind the products?
                    </p>
                    <div>
                      <p className="text-sm font-semibold text-[#2B5E7E] uppercase tracking-wide mb-3">Measures:</p>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li>• Emotional connection</li>
                        <li>• Understanding the story</li>
                        <li>• Cultural education value</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 }}
                className="group bg-white rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-600 hover:border-gray-600"
              >
                  <div className="flex flex-col items-start text-left gap-6 h-full">
                  <div className="flex items-center gap-4 w-full">
                    <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-[#7A5C1E] to-[#7A5C1E]/80 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Award className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#7A5C1E] text-2xl">Pride</h4>
                      <p className="text-[#7A5C1E]/70 text-base font-medium">Ownership Joy</p>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 text-base mb-4 leading-relaxed">
                      Are you proud to own and share these authentic Aboriginal products?
                    </p>
                    <div>
                      <p className="text-sm font-semibold text-[#7A5C1E] uppercase tracking-wide mb-3">Measures:</p>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li>• Pride of ownership</li>
                        <li>• Willingness to share/recommend</li>
                        <li>• Value perception</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Feedback Form ── */}
      <div id="feedback-form" className="mt-6 max-w-5xl mx-auto px-4 py-8 md:py-10">
        <AnimatePresence mode="wait">

          {/* ── Success ── */}
          {submitted && (
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-3xl shadow-sm border border-[#973c00]/10 overflow-hidden"
            >
              <SuccessScreen rating={rating} />
            </motion.div>
          )}

          {/* ── Form ── */}
          {!submitted && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
              className="bg-[#f9f3ee] mb-5 rounded-3xl shadow-lg border-2 border-[#973c00]/20 overflow-hidden"
            >
              {/* form header */}
              <div className="bg-linear-to-r from-[#440C03] to-[#5A1E12] px-6 py-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
                  <MessageSquare className="w-5 h-5 text-white" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-white font-bold text-lg leading-tight">Share Your Experience</p>
                  <p className="text-white/70 text-sm">All fields marked with * are required</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 md:p-7 flex flex-col gap-6">

                {/* Star Rating */}
                <div className="flex flex-col gap-2.5">
                  <label className="text-sm font-bold text-[#440C03] uppercase tracking-wider">
                    Overall Rating <span className="text-[#973c00]">*</span>
                  </label>
                  <div className="flex items-center gap-3 px-4 py-3 bg-white/50 rounded-xl border border-[#973c00]/20">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onMouseEnter={() => setHovered(s)}
                        onMouseLeave={() => setHovered(0)}
                        onClick={() => setRating(s)}
                        className="transition-transform duration-150 hover:scale-110 active:scale-95 focus:outline-none"
                        aria-label={`Rate ${s} out of 5`}
                      >
                        <Star
                          size={36}
                          className={`transition-colors duration-150 ${
                            s <= (hovered || rating)
                              ? "fill-[#973c00] text-[#973c00]"
                              : "fill-stone-200 text-stone-200"
                          }`}
                        />
                      </button>
                    ))}
                    <AnimatePresence mode="wait">
                      {(hovered || rating) > 0 && (
                        <motion.span
                          key={hovered || rating}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          className="ml-2 text-sm font-semibold text-[#5A1E12]"
                        >
                          {RATING_LABELS[hovered || rating]}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Name + Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-[#440C03] uppercase tracking-wider">
                      Name <span className="text-[#973c00]">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 text-base rounded-xl border-2 border-[#973c00]/30 bg-white/50 text-[#440C03] placeholder-[#973c00]/50 outline-none focus:border-[#440C03] focus:ring-2 focus:ring-[#440C03]/20 transition-all font-medium"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-[#440C03] uppercase tracking-wider">
                      Email <span className="text-[#973c00]">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 text-base rounded-xl border-2 border-[#973c00]/30 bg-white/50 text-[#440C03] placeholder-[#973c00]/50 outline-none focus:border-[#440C03] focus:ring-2 focus:ring-[#440C03]/20 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Comment */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-[#440C03] uppercase tracking-wider">
                      Your Feedback <span className="text-[#973c00]">*</span>
                    </label>
                    <span className={`text-sm font-bold ${
                      comment.trim().length >= 20
                        ? 'text-[#440C03]'
                        : comment.trim().length > 0
                        ? 'text-[#973c00]'
                        : 'text-[#973c00]/50'
                    }`}>
                      {comment.trim().length}/20 min
                    </span>
                  </div>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us about your experience with our marketplace and community. What went well? What could be improved? (minimum 20 characters)"
                    rows={4}
                    className={`w-full px-4 py-3 text-base rounded-xl border-2 ${
                      comment.trim().length >= 20
                        ? 'border-[#440C03] focus:border-[#440C03] focus:ring-[#440C03]/20'
                        : comment.trim().length > 0
                        ? 'border-[#973c00] focus:border-[#973c00] focus:ring-[#973c00]/20'
                        : 'border-[#973c00]/30 focus:border-[#440C03] focus:ring-[#440C03]/20'
                    } bg-white/50 text-[#440C03] placeholder-[#973c00]/50 outline-none focus:ring-2 transition-all resize-none leading-relaxed font-medium`}
                  />
                  {comment.trim().length > 0 && comment.trim().length < 20 && (
                    <p className="text-sm text-[#973c00] mt-2 font-medium">
                      ✏️ {20 - comment.trim().length} more characters needed
                    </p>
                  )}
                  {comment.trim().length >= 20 && (
                    <p className="text-sm text-[#440C03] mt-2 font-bold">
                      ✅ Perfect! Your feedback is ready to submit
                    </p>
                  )}
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-sm text-[#440C03] bg-[#973c00]/10 border-2 border-[#973c00]/30 rounded-xl px-6 py-4 font-bold"
                    >
                      ⚠️ {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-3 bg-linear-to-r from-[#440C03] to-[#5A1E12] hover:from-[#5A1E12] hover:to-[#440C03] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all duration-300 text-base shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {submitting ? (
                    <>
                      <svg
                        className="animate-spin w-4 h-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12" cy="12" r="10"
                          stroke="currentColor" strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        />
                      </svg>
                      Submitting…
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Feedback
                    </>
                  )}
                </button>

                {/* <p className="text-center text-sm text-[#973c00]/70 -mt-2 font-medium">
                  🔒 Your feedback is completely confidential and helps improve our community marketplace.
                </p> */}

              </form>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
