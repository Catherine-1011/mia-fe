// "use client";

// import { useState, useEffect, useRef, useMemo, useCallback } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import Link from "next/link";
// import Image from "next/image";
// import { usePathname, useRouter } from "next/navigation";
// import { ShoppingCart, Menu, X, User, LogOut, Package, Settings, Search, Heart, Store } from "lucide-react";
// import MiniCart from "../cards/MiniCart";
// import OptimisticMiniCart from "../cards/OptimisticMiniCart";
// import { useAuth } from "../../context/AuthContext";
// import { useCart } from "@/context/CartContext";
// import { useSharedEnhancedCart } from "@/hooks/useSharedEnhancedCart";
// import { useProducts, Product } from "@/hooks/useProducts";
// import { useDashboardSSO } from "@/hooks/useDashboardSSO";

// const NAV_LINKS = [
//   { label: "Home", href: "/" },
//   { label: "About us", href: "/about-us" },
//   { label: "Shop", href: "/shop" },
//   { label: "Blogs", href: "/blog" },
//   { label: "Contact Us", href: "/contact-us" },
//   // { label: "Privacy", href: "/privacy" },
//   // { label: "Disclaimer", href: "/disclaimer" },
// ];

// export default function Header() {
//   const pathname = usePathname();
//   const [cartOpen, setCartOpen] = useState(false);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [scrolled, setScrolled] = useState(false);
//   const [scrolledPast5, setScrolledPast5] = useState(false);
//   const [userMenuOpen, setUserMenuOpen] = useState(false);
//   const [guestMenuOpen, setGuestMenuOpen] = useState(false);
//   const [stickyUserMenuOpen, setStickyUserMenuOpen] = useState(false);
//   const [stickyGuestMenuOpen, setStickyGuestMenuOpen] = useState(false);
//   const stickyUserMenuRef = useRef<HTMLDivElement>(null);
//   const stickyGuestMenuRef = useRef<HTMLDivElement>(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
//   const [mounted, setMounted] = useState(false);
//   const cartRef = useRef<HTMLDivElement>(null);
//   const cartButtonRef = useRef<HTMLButtonElement>(null);
//   const userMenuRef = useRef<HTMLDivElement>(null);
//   const guestMenuRef = useRef<HTMLDivElement>(null);
//   const mobileMenuRef = useRef<HTMLDivElement>(null);
//   const searchInputRef = useRef<HTMLInputElement>(null);

//   const { user, logout, fetchUser } = useAuth();
//   const { cartItems, fetchCartFromBackend } = useCart();
//   const { cartData, subscribeToUpdates } = useSharedEnhancedCart();
//   const { data: products = [] } = useProducts();
//   const router = useRouter();
//   const { redirectToDashboard, isRedirecting: isDashboardRedirecting } = useDashboardSSO();

//   const [logoutModalOpen, setLogoutModalOpen] = useState(false);
//   const [isLoggingOut, setIsLoggingOut] = useState(false);
//   const [persistedCartCount, setPersistedCartCount] = useState(0);

//   // Seed badge count from localStorage immediately on mount (shows during
//   // loading and persists through logout + page reload)
//   useEffect(() => {
//     const stored = parseInt(localStorage.getItem("alpa_cart_count") || "0", 10);
//     if (!isNaN(stored)) setPersistedCartCount(stored);
//   }, []);

//   // Local state for real-time cart updates
//   const [cartUpdateTrigger, setCartUpdateTrigger] = useState(0);

//   // Subscribe to cart updates for real-time header count
//   useEffect(() => {
//     const unsubscribe = subscribeToUpdates(() => {
//       setCartUpdateTrigger(prev => prev + 1);
//     });
//     return unsubscribe;
//   }, [subscribeToUpdates]);

//   // Listen for custom open-cart event
//   useEffect(() => {
//     const handleOpenCart = () => setCartOpen(true);
//     window.addEventListener("open-cart", handleOpenCart);
//     return () => window.removeEventListener("open-cart", handleOpenCart);
//   }, []);

//   // Get cart items and calculate total count (memoized)
//   const cartItemCount = useMemo(() => {
//     // Priority 1: Use shared enhanced cart data (most up-to-date)
//     if (cartData && cartData.cart) {
//       return cartData.cart.reduce((total, item) => total + (item.quantity || 0), 0);
//     }
//     // Priority 2: Fallback to context cart items
//     if (cartItems.length > 0) {
//       return cartItems.reduce((total, item) => total + (item.qty || 0), 0);
//     }
//     // Priority 3: Persisted count from localStorage (instant on mount / post-logout)
//     return persistedCartCount;
//   }, [cartData, cartItems, cartData?.cart, persistedCartCount]);

//   // Persist cart count to localStorage whenever it changes
//   useEffect(() => {
//     localStorage.setItem("alpa_cart_count", cartItemCount.toString());
//     setPersistedCartCount(cartItemCount);
//   }, [cartItemCount]);

//   // Search functionality with segregated results (Products, Categories, Artists)
//   const segregatedSearchResults = useMemo(() => {
//     if (searchTerm.trim().length > 1) {
//       const searchLower = searchTerm.toLowerCase();

//       // Filter products
//       const matchedProducts = products.filter((product) =>
//         (product.title && product.title.toLowerCase().includes(searchLower)) ||
//         (product.description && product.description.toLowerCase().includes(searchLower)) ||
//         (product.brand && product.brand.toLowerCase().includes(searchLower))
//       ).slice(0, 5);

//       // Filter unique categories
//       const categories = Array.from(
//         new Set(
//           products
//             .filter(p => p.category && p.category.toLowerCase().includes(searchLower))
//             .map(p => p.category)
//             .filter((cat): cat is string => Boolean(cat))
//         )
//       ).slice(0, 5);

//       // Filter unique artists
//       const artists = Array.from(
//         new Set(
//           products
//             .filter(p => p.artistName && p.artistName.toLowerCase().includes(searchLower))
//             .map(p => p.artistName)
//             .filter((name): name is string => Boolean(name))
//         )
//       ).slice(0, 5);

//       return {
//         products: matchedProducts,
//         categories,
//         artists,
//       };
//     }
//     return { products: [], categories: [], artists: [] };
//   }, [searchTerm, products]);

//   // Close search modal and clear term
//   const closeSearch = useCallback(() => {
//     setIsSearchModalOpen(false);
//     setSearchTerm("");
//   }, []);

//   // Handle search navigation (memoized to prevent re-renders)
//   const handleSearchSelect = useCallback((product: Product) => {
//     closeSearch();
//     if (product.title) {
//       router.push(`/shop?search=${encodeURIComponent(product.title)}`);
//     }
//   }, [router, closeSearch]);

//   // Handle category filter
//   const handleCategorySelect = useCallback((category: string) => {
//     closeSearch();
//     router.push(`/shop?category=${encodeURIComponent(category)}`);
//   }, [router, closeSearch]);

//   // Handle artist filter
//   const handleArtistSelect = useCallback((artist: string) => {
//     closeSearch();
//     router.push(`/shop?artist=${encodeURIComponent(artist)}`);
//   }, [router, closeSearch]);

//   const handleSearchSubmit = useCallback((e: React.FormEvent) => {
//     e.preventDefault();
//     if (searchTerm.trim()) {
//       const term = searchTerm.trim();
//       closeSearch();
//       router.push(`/shop?search=${encodeURIComponent(term)}`);
//     }
//   }, [searchTerm, router, closeSearch]);

//   // Initialize user and cart
//   useEffect(() => {
//     fetchUser();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // Sync cart when user state changes
//   useEffect(() => {
//     if (user?.id) {
//       fetchCartFromBackend();
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [user?.id]);

//   // Close cart when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       const target = event.target as Node;

//       // Close cart if clicked outside
//       if (
//         cartOpen &&
//         cartRef.current &&
//         !cartRef.current.contains(target) &&
//         cartButtonRef.current &&
//         !cartButtonRef.current.contains(target)
//       ) {
//         setCartOpen(false);
//       }

//       // Close user menu if clicked outside
//       if (
//         userMenuOpen &&
//         userMenuRef.current &&
//         !userMenuRef.current.contains(target)
//       ) {
//         setUserMenuOpen(false);
//       }

//       // Close guest menu if clicked outside
//       if (
//         guestMenuOpen &&
//         guestMenuRef.current &&
//         !guestMenuRef.current.contains(target)
//       ) {
//         setGuestMenuOpen(false);
//       }

//       // Close sticky user menu if clicked outside
//       if (
//         stickyUserMenuOpen &&
//         stickyUserMenuRef.current &&
//         !stickyUserMenuRef.current.contains(target)
//       ) {
//         setStickyUserMenuOpen(false);
//       }

//       // Close sticky guest menu if clicked outside
//       if (
//         stickyGuestMenuOpen &&
//         stickyGuestMenuRef.current &&
//         !stickyGuestMenuRef.current.contains(target)
//       ) {
//         setStickyGuestMenuOpen(false);
//       }

//       // Close mobile menu if clicked outside
//       if (
//         mobileMenuOpen &&
//         mobileMenuRef.current &&
//         !mobileMenuRef.current.contains(target) &&
//         !(target as Element).closest('button[aria-label*="menu"]')
//       ) {
//         setMobileMenuOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);

//     if (cartOpen || mobileMenuOpen || isSearchModalOpen) {
//       document.body.style.overflow = "hidden";
//     } else {
//       document.body.style.overflow = "unset";
//     }

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//       document.body.style.overflow = "unset";
//     };
//   }, [cartOpen, userMenuOpen, guestMenuOpen, stickyUserMenuOpen, stickyGuestMenuOpen, mobileMenuOpen, isSearchModalOpen]);

//   // Scroll effect for header (desktop only)
//   useEffect(() => {
//     const handleScroll = () => {
//       const threshold = window.innerHeight * 0.05;
//       setScrolled(window.scrollY > 20);
//       setScrolledPast5(window.scrollY > threshold);
//     };
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   // Close cart when pressing Escape key
//   useEffect(() => {
//     const handleEscape = (event: KeyboardEvent) => {
//       if (event.key === "Escape") {
//         setCartOpen(false);
//         setUserMenuOpen(false);
//         setGuestMenuOpen(false);
//         setStickyUserMenuOpen(false);
//         setStickyGuestMenuOpen(false);
//         setMobileMenuOpen(false);
//         closeSearch();
//       }
//     };

//     document.addEventListener("keydown", handleEscape);

//     return () => {
//       document.removeEventListener("keydown", handleEscape);
//     };
//   }, []);

//   const isActive = useCallback((href: string) => {
//     if (href === "/") return pathname === "/";
//     return pathname === href || pathname.startsWith(`${href}/`);
//   }, [pathname]);

//   const toggleCart = useCallback(() => {
//     setCartOpen(!cartOpen);
//   }, [cartOpen]);

//   const handleLogout = useCallback(() => {
//     setUserMenuOpen(false);
//     setStickyUserMenuOpen(false);
//     setMobileMenuOpen(false);
//     setLogoutModalOpen(true);
//   }, []);

//   const confirmLogout = useCallback(async () => {
//     setIsLoggingOut(true);
//     await logout();
//     // logout() redirects via window.location.href so the spinner stays
//     // visible until the page fully unloads
//   }, [logout]);

//   const handleNavigation = useCallback((href: string) => {
//     setUserMenuOpen(false);
//     setGuestMenuOpen(false);
//     setMobileMenuOpen(false);
//     router.push(href);
//   }, [router]);

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   return (
//     <>
//       {/* ── Logout Confirmation / Loading Modal ── */}
//       <AnimatePresence>
//         {logoutModalOpen && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.2 }}
//             className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-sm"
//           >
//             <motion.div
//               initial={{ scale: 0.9, opacity: 0, y: 16 }}
//               animate={{ scale: 1, opacity: 1, y: 0 }}
//               exit={{ scale: 0.9, opacity: 0, y: 16 }}
//               transition={{ duration: 0.22, ease: "easeOut" }}
//               className="bg-white rounded-3xl shadow-2xl w-[90vw] max-w-sm overflow-hidden"
//             >
//               {isLoggingOut ? (
//                 /* ── Loading state ── */
//                 <div className="flex flex-col items-center justify-center px-8 py-12 gap-5">
//                   <div className="w-16 h-16 rounded-full bg-[#5A1E12]/10 flex items-center justify-center">
//                     <svg className="w-8 h-8 text-[#5A1E12] animate-spin" fill="none" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
//                     </svg>
//                   </div>
//                   <div className="text-center">
//                     <p className="font-bold text-gray-800 text-lg">Logging you out…</p>
//                     <p className="text-sm text-gray-400 mt-1">Please wait a moment</p>
//                   </div>
//                 </div>
//               ) : (
//                 /* ── Confirm state ── */
//                 <>
//                   <div className="bg-[#5A1E12] px-6 pt-6 pb-5 text-center">
//                     <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
//                       <LogOut className="w-6 h-6 text-white" />
//                     </div>
//                     <p className="text-white font-bold text-lg leading-snug">
//                       Hi {user?.name?.split(" ")[0] || "there"} 👋
//                     </p>
//                     <p className="text-white/70 text-sm mt-1">Are you sure you want to logout?</p>
//                   </div>
//                   <div className="p-5 flex flex-col gap-2.5">
//                     <button
//                       onClick={confirmLogout}
//                       className="w-full py-3 rounded-2xl bg-[#5A1E12] hover:bg-[#4a180f] text-white font-semibold text-sm transition-colors"
//                     >
//                       Yes, Logout
//                     </button>
//                     <button
//                       onClick={() => setLogoutModalOpen(false)}
//                       className="w-full py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm transition-colors"
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 </>
//               )}
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//       {/* {cartOpen && (
//         <div
//           className="fixed inset-0 bg-black/20 z-40 animate-fadeIn"
//           onClick={() => setCartOpen(false)}
//         />
//       )} */}

//       {/* Mobile/Tablet Menu Overlay */}
//       {mobileMenuOpen && (
//         <div
//           className="fixed inset-0 bg-black/30 z-40 lg:hidden animate-fadeIn"
//           onClick={() => setMobileMenuOpen(false)}
//         />
//       )}

//       {/* Mini Cart Panel - Rendered outside header with portal-like positioning */}
//       <div
//         ref={cartRef}
//         className={`
//           fixed top-0 right-0 h-screen w-full sm:w-96
//           transform transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
//           z-70
//           ${
//             cartOpen
//               ? "translate-x-0 opacity-100"
//               : "translate-x-full opacity-0 pointer-events-none"
//           }
//         `}
//       >
//         <MiniCart onClose={() => setCartOpen(false)} />
//       </div>

//       <div className="">
//         {/* MOBILE/TABLET: Top bar — Logo left, Cart + Hamburger right */}
//         <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#EAD7B7]/98 backdrop-blur-lg shadow-[0_4px_24px_rgba(90,30,18,0.10)] border-b border-[#5A1E12]/10 px-4 py-3 flex items-center justify-between">
//           {/* Logo */}
//           <Link href="/" className="font-bold transition-transform hover:scale-105 active:scale-95">
//             <Image src="/images/navbarLogo.png" width={500} height={500} alt="Logo" className="w-10" priority />
//           </Link>

//           {/* Right: Cart + Hamburger */}
//           <div className="flex items-center gap-2">
//             {/* Cart */}
//             <button
//               onClick={toggleCart}
//               className="relative p-2 rounded-full hover:bg-[#5A1E12]/10 active:scale-95 transition-all duration-200"
//               aria-label={`Shopping cart with ${cartItemCount} items`}
//             >
//               <ShoppingCart className="h-6 w-6 text-[#5A1E12]" />
//               {mounted && cartItemCount > 0 && (
//                 <span className="absolute -top-1 -right-1 h-5 w-5 text-[10px] flex items-center justify-center bg-[#5A1E12] text-white rounded-full font-bold shadow-sm">
//                   {cartItemCount > 9 ? "9+" : cartItemCount}
//                 </span>
//               )}
//             </button>

//             {/* Hamburger */}
//             <button
//               onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//               className="p-2 rounded-full hover:bg-[#5A1E12]/10 active:scale-95 transition-all duration-200 text-[#5A1E12]"
//               aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
//               aria-expanded={mobileMenuOpen}
//             >
//               {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
//             </button>
//           </div>
//         </div>

//         {/* DESKTOP: Full Header (hidden on mobile/tablet) */}
//         <header
//           className={`w-full hidden lg:flex rounded-full px-8 lg:px-12 py-2
//             items-center transition-all duration-500 z-30 relative
//             border border-[#5A1E12]/10
//             ${scrolled ? "bg-[#EAD7B7]/98 backdrop-blur-lg shadow-[0_8px_32px_rgba(90,30,18,0.14)]" : "bg-[#EAD7B7] shadow-[0_8px_32px_rgba(90,30,18,0.10)]"}
//             ${scrolledPast5 ? "opacity-0 pointer-events-none invisible" : "opacity-100 visible"}
//           `}
//         >
//           {/* Logo */}
//           <Link
//             href="/"
//             className="font-bold transition-transform hover:scale-105 active:scale-95 shrink-0"
//           >
//             <Image
//               src="/images/navbarLogo.png"
//               width={500}
//               height={500}
//               alt="Logo"
//               className="w-10 md:w-16"
//               priority
//             />
//           </Link>

//           {/* Spacer */}
//           <div className="flex-1"></div>

//           {/* Desktop Navigation - Centered */}
//           <nav className="flex gap-4 lg:gap-6 absolute left-1/2 transform -translate-x-1/2">
//             {NAV_LINKS.map(({ label, href }) => (
//               <Link
//                 key={href}
//                 href={href}
//                 className={`group relative px-2 py-1 text-sm lg:text-base transition-all duration-300
//                   ${
//                     isActive(href)
//                       ? "text-[#5A1E12] font-medium"
//                       : "text-gray-700 hover:text-[#5A1E12] font-medium"
//                   }
//                 `}
//               >
//                 {label}
//                 {/* Animated underline from left to right */}
//                 <span
//                   className={`
//                     pointer-events-none
//                     absolute left-0 bottom-0 h-0.5 w-full bg-[#5A1E12] rounded-full
//                     transition-transform duration-300 origin-left
//                     ${
//                       isActive(href)
//                         ? "scale-x-100"
//                         : "scale-x-0 group-hover:scale-x-100"
//                     }
//                   `}
//                 />
//               </Link>
//             ))}
//           </nav>

//           {/* Right Side Actions */}
//           <div className="flex items-center gap-2 justify-end relative">
//             {/* Search Button — opens modal */}
//             <button
//               onClick={() => setIsSearchModalOpen(true)}
//               className="p-2 rounded-full hover:bg-[#5A1E12]/10 active:scale-95 text-[#5A1E12] transition-all duration-200"
//               aria-label="Open search"
//             >
//               <Search className="h-5 w-5" />
//             </button>

//             {/* Cart Button */}
//             <button
//               ref={cartButtonRef}
//               onClick={toggleCart}
//               className="relative p-2 rounded-full hover:bg-[#5A1E12]/10 active:scale-95 transition-all duration-200 group"
//               aria-label={`Shopping cart with ${cartItemCount} items`}
//               aria-expanded={cartOpen}
//             >
//               <ShoppingCart
//                 className={`h-6 w-6 text-[#5A1E12] transition-transform duration-300 ${
//                   cartOpen ? "rotate-12 scale-110" : "group-hover:scale-110"
//                 }`}
//               />

//               {mounted && cartItemCount > 0 && (
//                 <>
//                   {!cartOpen && (
//                     <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#5A1E12] rounded-full animate-ping opacity-75" />
//                   )}
//                   <span
//                     className={`absolute -top-1 -right-1 h-5 w-5 text-xs flex items-center justify-center bg-[#5A1E12] text-white rounded-full font-bold shadow-sm transition-transform duration-300 ${
//                       cartOpen ? "scale-125" : ""
//                     }`}
//                   >
//                     {cartItemCount > 9 ? "9+" : cartItemCount}
//                   </span>
//                 </>
//               )}
//             </button>

//             {/* User Authentication */}
//             {!user ? (
//               <div className="flex items-center gap-3">
//               {/* Guest Menu Dropdown */}
//                 <div className="relative" ref={guestMenuRef}>
//                   <button
//                     onClick={() => setGuestMenuOpen(!guestMenuOpen)}
//                     className={`p-2 rounded-full transition-all duration-200 ${guestMenuOpen ? "bg-[#5A1E12] text-white shadow-[0_4px_12px_rgba(90,30,18,0.3)]" : "hover:bg-[#5A1E12]/10 text-[#5A1E12]"}`}
//                     aria-label="Account options"
//                     aria-expanded={guestMenuOpen}
//                   >
//                     <User className="h-6 w-6" />
//                   </button>

//                   {guestMenuOpen && (
//                     <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden z-50 border border-gray-100 origin-top-right">
//                       {/* Header */}
//                       <div className="px-4 py-3 bg-[#5A1E12]/5 border-b border-gray-100">
//                         <p className="text-xs font-semibold text-[#5A1E12] uppercase tracking-widest">User Options</p>
//                       </div>
//                       <div className="p-1.5 flex flex-col gap-0.5">
//                         <button
//                           onClick={() => handleNavigation("/login")}
//                           className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 text-sm font-medium group"
//                         >
//                           <span className="w-7 h-7 rounded-lg bg-gray-100 group-hover:bg-[#5A1E12]/10 flex items-center justify-center transition-colors">
//                             <User className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#5A1E12]" />
//                           </span>
//                           Login
//                         </button>
//                         <button
//                           onClick={() => handleNavigation("/signup")}
//                           className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 text-sm font-medium group"
//                         >
//                           <span className="w-7 h-7 rounded-lg bg-gray-100 group-hover:bg-[#5A1E12]/10 flex items-center justify-center transition-colors">
//                             <Settings className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#5A1E12]" />
//                           </span>
//                           Create account
//                         </button>
//                         <button
//                           onClick={() => handleNavigation("/login")}
//                           className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 text-sm font-medium group"
//                         >
//                           <span className="w-7 h-7 rounded-lg bg-gray-100 group-hover:bg-[#5A1E12]/10 flex items-center justify-center transition-colors">
//                             <User className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#5A1E12]" />
//                           </span>
//                           Login as seller
//                         </button>
//                         <div className="pt-1 mt-0.5 border-t border-gray-100">
//                           <button
//                             onClick={() => handleNavigation("/sellerOnboarding")}
//                             className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#5A1E12] hover:bg-[#4a180f] transition-colors text-white text-sm font-medium"
//                           >
//                             <span className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
//                               <Package className="w-3.5 h-3.5 text-white" />
//                             </span>
//                             Register as Seller
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             ) : (
//               <div className="relative" ref={userMenuRef}>
//                 <button
//                   onClick={() => setUserMenuOpen(!userMenuOpen)}
//                   className="flex items-center gap-2 group"
//                   aria-label="User menu"
//                   aria-expanded={userMenuOpen}
//                 >
//                   <div className="relative">
//                     <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#5A1E12] flex items-center justify-center ring-2 ring-transparent group-hover:ring-[#5A1E12]/40 group-hover:ring-offset-1 shadow-[0_4px_12px_rgba(90,30,18,0.25)] transition-all duration-200">
//                       <User className="w-4 h-4 text-white" />
//                     </div>
//                   </div>
//                   <svg
//                     className={`w-4 h-4 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M19 9l-7 7-7-7"
//                     />
//                   </svg>
//                 </button>

//                 {userMenuOpen && (
//                   <div className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden z-50 border border-gray-100">
//                     {/* User Info Header */}
//                     <div className="flex items-center gap-3 px-4 py-3.5 bg-[#5A1E12] ">
//                       <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
//                         <User className="w-4 h-4 text-white" />
//                       </div>
//                       <div className="min-w-0">
//                         <p className="font-semibold text-white text-sm truncate">Hi, {user.name?.split(" ")[0] || "User"}</p>
//                         <p className="text-xs text-white/60 truncate">{user.email}</p>
//                       </div>
//                     </div>

//                     {/* Menu Items */}
//                     <div className="p-1.5 flex flex-col gap-0.5">
//                       <button
//                         onClick={() => { setUserMenuOpen(false); redirectToDashboard(user.role?.toLowerCase() === "seller" ? "/sellerdashboard/profile" : "/customerdashboard/profile"); }}
//                         disabled={isDashboardRedirecting}
//                         className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 text-sm font-medium group disabled:opacity-60"
//                       >
//                         <span className="w-7 h-7 rounded-lg bg-[#EAD7B7] group-hover:bg-[#5A1E12]/10 flex items-center justify-center transition-colors">
//                           <User className="w-3.5 h-3.5 text-[#5A1E12]" />
//                         </span>
//                         My Profile
//                       </button>

//                       {user.role?.toLowerCase() === "seller" ? (
//                         <>
//                           <button
//                             onClick={() => { setUserMenuOpen(false); redirectToDashboard("/sellerdashboard"); }}
//                             disabled={isDashboardRedirecting}
//                             className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 text-sm font-medium group disabled:opacity-60"
//                           >
//                             <span className="w-7 h-7 rounded-lg bg-[#EAD7B7] group-hover:bg-[#5A1E12]/10 flex items-center justify-center transition-colors">
//                               <Settings className="w-3.5 h-3.5 text-[#5A1E12]" />
//                             </span>
//                             Dashboard
//                           </button>
//                           <button
//                             onClick={() => { setUserMenuOpen(false); redirectToDashboard("/sellerdashboard/orders"); }}
//                             disabled={isDashboardRedirecting}
//                             className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 text-sm font-medium group disabled:opacity-60"
//                           >
//                             <span className="w-7 h-7 rounded-lg bg-[#EAD7B7] group-hover:bg-[#5A1E12]/10 flex items-center justify-center transition-colors">
//                               <Package className="w-3.5 h-3.5 text-[#5A1E12]" />
//                             </span>
//                             {isDashboardRedirecting ? "Redirecting…" : "My Orders"}
//                           </button>
//                           <button
//                             onClick={() => { setUserMenuOpen(false); redirectToDashboard("/sellerdashboard/products"); }}
//                             disabled={isDashboardRedirecting}
//                             className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 text-sm font-medium group disabled:opacity-60"
//                           >
//                             <span className="w-7 h-7 rounded-lg bg-[#EAD7B7] group-hover:bg-[#5A1E12]/10 flex items-center justify-center transition-colors">
//                               <Store className="w-3.5 h-3.5 text-[#5A1E12]" />
//                             </span>
//                             My Products
//                           </button>
//                         </>
//                       ) : (
//                         <>
//                           <button
//                             onClick={() => { setUserMenuOpen(false); redirectToDashboard("/customerdashboard/orders"); }}
//                             disabled={isDashboardRedirecting}
//                             className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 text-sm font-medium group disabled:opacity-60"
//                           >
//                             <span className="w-7 h-7 rounded-lg bg-[#EAD7B7] group-hover:bg-[#5A1E12]/10 flex items-center justify-center transition-colors">
//                               <Package className="w-3.5 h-3.5 text-[#5A1E12]" />
//                             </span>
//                             {isDashboardRedirecting ? "Redirecting…" : "My Orders"}
//                           </button>
//                           <button
//                             onClick={() => { setUserMenuOpen(false); redirectToDashboard("/customerdashboard/wishlists"); }}
//                             disabled={isDashboardRedirecting}
//                             className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 text-sm font-medium group disabled:opacity-60"
//                           >
//                             <span className="w-7 h-7 rounded-lg bg-[#EAD7B7] group-hover:bg-[#5A1E12]/10 flex items-center justify-center transition-colors">
//                               <Heart className="w-3.5 h-3.5 text-[#5A1E12]" />
//                             </span>
//                             My Wishlist
//                           </button>
//                         </>
//                       )}

//                       {user.role === "admin" && (
//                         <button
//                           onClick={() => handleNavigation("/admin")}
//                           className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 text-sm font-medium group"
//                         >
//                           <span className="w-7 h-7 rounded-lg bg-[#EAD7B7] group-hover:bg-[#5A1E12]/10 flex items-center justify-center transition-colors">
//                             <Settings className="w-3.5 h-3.5 text-[#5A1E12]" />
//                           </span>
//                           Admin Dashboard
//                         </button>
//                       )}

//                       <div className="pt-1 mt-0.5 border-t border-gray-100">
//                         <button
//                           onClick={handleLogout}
//                           className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors text-red-500 text-sm font-medium group"
//                         >
//                           <span className="w-7 h-7 rounded-lg bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors">
//                             <LogOut className="w-3.5 h-3.5 text-red-500" />
//                           </span>
//                           Logout
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </header>

//         {/* Mobile/Tablet Menu Drawer */}
//         <div
//           ref={mobileMenuRef}
//           className={`
//             fixed top-0 right-0 h-screen w-[320px] max-w-[90vw] z-55
//             flex flex-col bg-white lg:hidden
//             transform transition-transform duration-300 ease-out
//             ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}
//           `}
//         >
//           {/* ── TOP: User / Brand header ── */}
//           <div className="shrink-0 bg-[#5A1E12] px-5 pt-4 pb-5">
//             <div className="flex items-start justify-between">
//               {user ? (
//                 <div className="flex items-center gap-3">
//                   <div className="w-12 h-12 rounded-full bg-[#5A1E12] flex items-center justify-center border-2 border-white/40 shrink-0">
//                     <User className="w-6 h-6 text-white" />
//                   </div>
//                   <div className="min-w-0">
//                     <p className="font-semibold text-white text-base leading-tight">Hi, {user.name?.split(" ")[0] || "User"}</p>
//                     <p className="text-xs text-white/60 truncate mt-0.5">{user.email}</p>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="flex items-center gap-3">
//                   <Image src="/images/navbarLogo.png" width={500} height={500} alt="Logo" className="w-9" />
//                   <p className="font-bold text-white text-lg">Alpa</p>
//                 </div>
//               )}
//               <button
//                 onClick={() => setMobileMenuOpen(false)}
//                 className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0 mt-0.5"
//                 aria-label="Close menu"
//               >
//                 <X className="h-5 w-5" />
//               </button>
//             </div>

//             {/* Search bar — lives inside the header band */}
//             <form
//               onSubmit={(e) => { e.preventDefault(); if (searchTerm.trim()) { setMobileMenuOpen(false); setSearchTerm(""); router.push(`/shop?search=${encodeURIComponent(searchTerm.trim())}`); } }}
//               className="mt-4 relative"
//             >
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
//               <input
//                 type="text"
//                 placeholder="Search products..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-9 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-white/40 outline-none focus:bg-white/20 focus:border-white/40 transition-all"
//               />
//             </form>
//           </div>

//           {/* ── SCROLLABLE BODY ── */}
//           <div className="flex-1 overflow-y-auto">

//             {/* Search results (only when typing) */}
//             {searchTerm.trim().length > 1 && (
//               <div className="mx-4 mt-3 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
//                 {(segregatedSearchResults.products.length > 0 || segregatedSearchResults.categories.length > 0 || segregatedSearchResults.artists.length > 0) ? (
//                   <div>
//                     {segregatedSearchResults.products.length > 0 && (
//                       <div>
//                         <div className="flex items-center gap-2 px-4 pt-3 pb-1">
//                           <span className="text-[10px] font-bold text-[#5A1E12] uppercase tracking-widest">Products</span>
//                           <div className="flex-1 h-px bg-[#5A1E12]/10" />
//                         </div>
//                         {segregatedSearchResults.products.slice(0, 4).map((product) => (
//                           <button key={product.id} onClick={() => { setMobileMenuOpen(false); handleSearchSelect(product); }} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#5A1E12]/5 transition-colors">
//                             <div className="w-9 h-9 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200">
//                               {product.images?.[0] ? <Image src={product.images[0]!} alt={product.title || 'Product'} width={36} height={36} className="w-full h-full object-cover" /> : <Search className="w-4 h-4 text-gray-300 m-2" />}
//                             </div>
//                             <div className="flex-1 min-w-0 text-left">
//                               <p className="text-sm font-medium text-gray-800 truncate">{product.title}</p>
//                               <p className="text-xs text-[#5A1E12] font-semibold">${product.price}</p>
//                             </div>
//                             <svg className="w-3.5 h-3.5 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
//                           </button>
//                         ))}
//                       </div>
//                     )}
//                     {segregatedSearchResults.categories.length > 0 && (
//                       <div className="px-4 pb-3">
//                         <div className="flex items-center gap-2 pt-2 pb-1.5">
//                           <span className="text-[10px] font-bold text-[#5A1E12] uppercase tracking-widest">Categories</span>
//                           <div className="flex-1 h-px bg-[#5A1E12]/10" />
//                         </div>
//                         <div className="flex flex-wrap gap-1.5">
//                           {segregatedSearchResults.categories.map((cat) => (
//                             <button key={cat} onClick={() => { setMobileMenuOpen(false); handleCategorySelect(cat); }} className="text-xs px-3 py-1.5 rounded-full border border-[#5A1E12]/20 text-[#5A1E12] hover:bg-[#5A1E12] hover:text-white transition-all cursor-pointer">{cat}</button>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                     {segregatedSearchResults.artists.length > 0 && (
//                       <div>
//                         <div className="flex items-center gap-2 px-4 pt-2 pb-1">
//                           <span className="text-[10px] font-bold text-[#5A1E12] uppercase tracking-widest">Artists</span>
//                           <div className="flex-1 h-px bg-[#5A1E12]/10" />
//                         </div>
//                         {segregatedSearchResults.artists.map((artist) => (
//                           <button key={artist} onClick={() => { setMobileMenuOpen(false); handleArtistSelect(artist); }} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#5A1E12]/5 transition-colors group">
//                             <div className="w-8 h-8 rounded-full bg-[#EAD7B7]/60 flex items-center justify-center shrink-0">
//                               <User className="w-3.5 h-3.5 text-[#5A1E12]" />
//                             </div>
//                             <span className="text-sm font-medium text-gray-700 group-hover:text-[#5A1E12] transition-colors truncate flex-1 text-left">{artist}</span>
//                             <svg className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#5A1E12] transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
//                           </button>
//                         ))}
//                       </div>
//                     )}
//                     <button onClick={() => { setMobileMenuOpen(false); setSearchTerm(""); router.push(`/shop?search=${encodeURIComponent(searchTerm)}`); }} className="w-full flex items-center justify-between px-4 py-2.5 bg-[#5A1E12] text-white text-sm font-medium">
//                       <span>View all results</span>
//                       <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">{segregatedSearchResults.products.length + segregatedSearchResults.categories.length + segregatedSearchResults.artists.length}</span>
//                     </button>
//                   </div>
//                 ) : (
//                   <div className="py-6 flex flex-col items-center gap-1">
//                     <Search className="w-5 h-5 text-gray-300" />
//                     <p className="text-sm text-gray-500">No results for &quot;{searchTerm}&quot;</p>
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* ── NAVIGATION ── */}
//             <div className="px-4 pt-5">
//               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Navigation</p>
//               <nav className="flex flex-col gap-1">
//                 {NAV_LINKS.map(({ label, href }) => (
//                   <Link
//                     key={href}
//                     href={href}
//                     onClick={() => setMobileMenuOpen(false)}
//                     className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
//                       isActive(href)
//                         ? "bg-[#5A1E12] text-white shadow-sm"
//                         : "text-gray-700 hover:bg-gray-100"
//                     }`}
//                   >
//                     <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive(href) ? "bg-white" : "bg-[#5A1E12]/40"}`} />
//                     {label}
//                   </Link>
//                 ))}
//               </nav>
//             </div>

//             {/* ── ACCOUNT ── */}
//             <div className="px-4 pt-5 pb-6">
//               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Account</p>
//               {!user ? (
//                 <div className="flex flex-col gap-2">
//                   <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-[#5A1E12]/30 text-[#5A1E12] text-sm font-medium hover:bg-[#5A1E12]/5 transition-colors">
//                     <User className="w-4 h-4" />
//                     Login
//                   </Link>
//                   <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#5A1E12] text-white text-sm font-medium hover:bg-[#4a180f] transition-colors">
//                     Create Account
//                   </Link>
//                   <Link href="/sellerOnboarding" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#5A1E12] text-white text-sm font-medium hover:bg-[#4a180f] transition-colors">
//                     Register as Seller
//                   </Link>
//                 </div>
//               ) : (
//                 <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
//                   <button onClick={() => { setMobileMenuOpen(false); redirectToDashboard(user.role?.toLowerCase() === "seller" ? "/sellerdashboard/profile" : "/customerdashboard/profile"); }} disabled={isDashboardRedirecting} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white transition-colors text-sm text-gray-700 border-b border-gray-100 disabled:opacity-60">
//                     <div className="w-8 h-8 rounded-full bg-[#EAD7B7] flex items-center justify-center shrink-0">
//                       <User className="w-4 h-4 text-[#5A1E12]" />
//                     </div>
//                     <span className="font-medium">My Profile</span>
//                     <svg className="w-3.5 h-3.5 text-gray-300 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
//                   </button>
//                   {user.role?.toLowerCase() === "seller" ? (
//                     <>
//                       <button onClick={() => { setMobileMenuOpen(false); redirectToDashboard("/sellerdashboard"); }} disabled={isDashboardRedirecting} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white transition-colors text-sm text-gray-700 border-b border-gray-100 disabled:opacity-60">
//                         <div className="w-8 h-8 rounded-full bg-[#EAD7B7] flex items-center justify-center shrink-0">
//                           <Settings className="w-4 h-4 text-[#5A1E12]" />
//                         </div>
//                         <span className="font-medium">Dashboard</span>
//                         <svg className="w-3.5 h-3.5 text-gray-300 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
//                       </button>
//                       <button onClick={() => { setMobileMenuOpen(false); redirectToDashboard("/sellerdashboard/orders"); }} disabled={isDashboardRedirecting} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white transition-colors text-sm text-gray-700 border-b border-gray-100 disabled:opacity-60">
//                         <div className="w-8 h-8 rounded-full bg-[#EAD7B7] flex items-center justify-center shrink-0">
//                           <Package className="w-4 h-4 text-[#5A1E12]" />
//                         </div>
//                         <span className="font-medium">{isDashboardRedirecting ? "Redirecting…" : "My Orders"}</span>
//                         <svg className="w-3.5 h-3.5 text-gray-300 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
//                       </button>
//                       <button onClick={() => { setMobileMenuOpen(false); redirectToDashboard("/sellerdashboard/products"); }} disabled={isDashboardRedirecting} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white transition-colors text-sm text-gray-700 border-b border-gray-100 disabled:opacity-60">
//                         <div className="w-8 h-8 rounded-full bg-[#EAD7B7] flex items-center justify-center shrink-0">
//                           <Store className="w-4 h-4 text-[#5A1E12]" />
//                         </div>
//                         <span className="font-medium">My Products</span>
//                         <svg className="w-3.5 h-3.5 text-gray-300 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
//                       </button>
//                     </>
//                   ) : (
//                     <>
//                       <button onClick={() => { setMobileMenuOpen(false); redirectToDashboard("/customerdashboard/orders"); }} disabled={isDashboardRedirecting} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white transition-colors text-sm text-gray-700 border-b border-gray-100 disabled:opacity-60">
//                         <div className="w-8 h-8 rounded-full bg-[#EAD7B7] flex items-center justify-center shrink-0">
//                           <Package className="w-4 h-4 text-[#5A1E12]" />
//                         </div>
//                         <span className="font-medium">{isDashboardRedirecting ? "Redirecting…" : "My Orders"}</span>
//                         <svg className="w-3.5 h-3.5 text-gray-300 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
//                       </button>
//                       <button onClick={() => { setMobileMenuOpen(false); redirectToDashboard("/customerdashboard/wishlists"); }} disabled={isDashboardRedirecting} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white transition-colors text-sm text-gray-700 border-b border-gray-100 disabled:opacity-60">
//                         <div className="w-8 h-8 rounded-full bg-[#EAD7B7] flex items-center justify-center shrink-0">
//                           <Heart className="w-4 h-4 text-[#5A1E12]" />
//                         </div>
//                         <span className="font-medium">My Wishlist</span>
//                         <svg className="w-3.5 h-3.5 text-gray-300 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
//                       </button>
//                     </>
//                   )}
//                   {user.role === "admin" && (
//                     <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-white transition-colors text-sm text-gray-700 border-b border-gray-100">
//                       <div className="w-8 h-8 rounded-full bg-[#EAD7B7] flex items-center justify-center shrink-0">
//                         <Settings className="w-4 h-4 text-[#5A1E12]" />
//                       </div>
//                       <span className="font-medium">Admin Dashboard</span>
//                       <svg className="w-3.5 h-3.5 text-gray-300 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
//                     </Link>
//                   )}
//                   <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-sm text-red-500">
//                     <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0">
//                       <LogOut className="w-4 h-4 text-red-500" />
//                     </div>
//                     <span className="font-medium">Logout</span>
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* SECONDARY STICKY HEADER - rendered outside NavbarWrapper's div to avoid visibility/z-index cascade */}
//       <header
//         className={`
//           hidden lg:flex fixed top-0 left-0 right-0 z-60
//           px-8 lg:px-16 py-3 items-center
//           bg-[#EAD7B7]/98 backdrop-blur-lg shadow-[0_4px_24px_rgba(90,30,18,0.12)] border-b border-[#5A1E12]/10
//           transition-all duration-500
//           ${scrolledPast5 ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"}
//         `}
//       >
//         {/* Logo */}
//         <Link href="/" className="font-bold transition-transform hover:scale-105 active:scale-95 shrink-0">
//           <Image src="/images/navbarLogo.png" width={500} height={500} alt="Logo" className="w-10 md:w-14" priority />
//         </Link>

//         <div className="flex-1" />

//         {/* Nav Links */}
//         <nav className="flex gap-4 lg:gap-6 absolute left-1/2 transform -translate-x-1/2">
//           {NAV_LINKS.map(({ label, href }) => (
//             <Link
//               key={href}
//               href={href}
//               className={`group relative px-2 py-1 text-sm lg:text-base transition-all duration-300
//                 ${isActive(href) ? "text-[#5A1E12] font-medium" : "text-gray-700 hover:text-[#5A1E12] font-medium"}
//               `}
//             >
//               {label}
//               <span
//                 className={`pointer-events-none absolute left-0 bottom-0 h-0.5 w-full bg-[#5A1E12] rounded-full
//                   transition-transform duration-300 origin-left
//                   ${isActive(href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}
//                 `}
//               />
//             </Link>
//           ))}
//         </nav>

//         {/* Right actions */}
//         <div className="flex items-center gap-2 justify-end relative">
//           {/* Search Button — opens modal */}
//           <button
//             onClick={() => setIsSearchModalOpen(true)}
//             className="p-2 rounded-full hover:bg-[#5A1E12]/10 active:scale-95 text-[#5A1E12] transition-all duration-200"
//             aria-label="Open search"
//           >
//             <Search className="h-5 w-5" />
//           </button>

//           {/* Cart */}
//           <button
//             ref={cartButtonRef}
//             onClick={toggleCart}
//             className="relative p-2 rounded-full hover:bg-[#5A1E12]/10 active:scale-95 transition-all duration-200 group"
//             aria-label={`Shopping cart with ${cartItemCount} items`}
//           >
//             <ShoppingCart className={`h-5 w-5 text-[#5A1E12] transition-transform duration-300 ${cartOpen ? "rotate-12 scale-110" : "group-hover:scale-110"}`} />
//             {mounted && cartItemCount > 0 && (
//               <>
//                 {!cartOpen && <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#5A1E12] rounded-full animate-ping opacity-75" />}
//                 <span className={`absolute -top-1 -right-1 h-4 w-4 text-[10px] flex items-center justify-center bg-[#5A1E12] text-white rounded-full font-bold shadow-sm transition-transform duration-300 ${cartOpen ? "scale-125" : ""}`}>
//                   {cartItemCount > 9 ? "9+" : cartItemCount}
//                 </span>
//               </>
//             )}
//           </button>

//           {/* Auth */}
//           {!user ? (
//             <div className="flex items-center gap-3">
//               <div className="relative" ref={stickyGuestMenuRef}>
//                 <button
//                   onClick={() => setStickyGuestMenuOpen(!stickyGuestMenuOpen)}
//                   className={`p-2 rounded-full transition-all duration-200 ${stickyGuestMenuOpen ? "bg-[#5A1E12] text-white shadow-[0_4px_12px_rgba(90,30,18,0.3)]" : "hover:bg-[#5A1E12]/10 text-[#5A1E12]"}`}
//                   aria-label="Account options"
//                 >
//                   <User className="h-5 w-5" />
//                 </button>
//                 {stickyGuestMenuOpen && (
//                   <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden z-50 border border-gray-100 origin-top-right">
//                     <div className="px-4 py-3 bg-[#5A1E12]/5 border-b border-gray-100">
//                       <p className="text-xs font-semibold text-[#5A1E12] uppercase tracking-widest">User Options</p>
//                     </div>
//                     <div className="p-1.5 flex flex-col gap-0.5">
//                       <button onClick={() => { setStickyGuestMenuOpen(false); router.push("/login"); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 text-sm font-medium group">
//                         <span className="w-7 h-7 rounded-lg bg-gray-100 group-hover:bg-[#5A1E12]/10 flex items-center justify-center transition-colors">
//                           <User className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#5A1E12]" />
//                         </span>
//                         Login
//                       </button>
//                       <button onClick={() => { setStickyGuestMenuOpen(false); router.push("/signup"); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 text-sm font-medium group">
//                         <span className="w-7 h-7 rounded-lg bg-gray-100 group-hover:bg-[#5A1E12]/10 flex items-center justify-center transition-colors">
//                           <Settings className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#5A1E12]" />
//                         </span>
//                         Create account
//                       </button>
//                       <div className="pt-1 mt-0.5 border-t border-gray-100">
//                         <button onClick={() => { setStickyGuestMenuOpen(false); router.push("/sellerOnboarding"); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#5A1E12] hover:bg-[#4a180f] transition-colors text-white text-sm font-medium">
//                           <span className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
//                             <Package className="w-3.5 h-3.5 text-white" />
//                           </span>
//                           Register as Seller
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           ) : (
//             <div className="relative" ref={stickyUserMenuRef}>
//               <button
//                 onClick={() => setStickyUserMenuOpen(!stickyUserMenuOpen)}
//                 className="flex items-center gap-2 group"
//                 aria-label="User menu"
//               >
//                 <div className="relative">
//                   <div className="w-8 h-8 rounded-full bg-[#5A1E12] flex items-center justify-center ring-2 ring-transparent group-hover:ring-[#5A1E12]/40 group-hover:ring-offset-1 shadow-[0_4px_12px_rgba(90,30,18,0.25)] transition-all duration-200">
//                     <User className="w-4 h-4 text-white" />
//                   </div>
//                 </div>
//                 <svg className={`w-4 h-4 transition-transform ${stickyUserMenuOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                 </svg>
//               </button>
//               {stickyUserMenuOpen && (
//                 <div className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden z-50 border border-gray-100">
//                   <div className="flex items-center gap-3 px-4 py-3.5 bg-[#5A1E12]">
//                     <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
//                       <User className="w-4 h-4 text-white" />
//                     </div>
//                     <div className="min-w-0">
//                       <p className="font-semibold text-white text-sm truncate">Hi, {user.name?.split(" ")[0] || "User"}</p>
//                       <p className="text-xs text-white/60 truncate">{user.email}</p>
//                     </div>
//                   </div>
//                   <div className="p-1.5 flex flex-col gap-0.5">
//                     <button onClick={() => { setStickyUserMenuOpen(false); redirectToDashboard(user.role?.toLowerCase() === "seller" ? "/sellerdashboard/profile" : "/customerdashboard/profile"); }} disabled={isDashboardRedirecting} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 text-sm font-medium group disabled:opacity-60">
//                       <span className="w-7 h-7 rounded-lg bg-[#EAD7B7] group-hover:bg-[#5A1E12]/10 flex items-center justify-center transition-colors"><User className="w-3.5 h-3.5 text-[#5A1E12]" /></span>
//                       My Profile
//                     </button>
//                     {user.role?.toLowerCase() === "seller" ? (
//                       <>
//                         <button onClick={() => { setStickyUserMenuOpen(false); redirectToDashboard("/sellerdashboard"); }} disabled={isDashboardRedirecting} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 text-sm font-medium group disabled:opacity-60">
//                           <span className="w-7 h-7 rounded-lg bg-[#EAD7B7] group-hover:bg-[#5A1E12]/10 flex items-center justify-center transition-colors"><Settings className="w-3.5 h-3.5 text-[#5A1E12]" /></span>
//                           Dashboard
//                         </button>
//                         <button onClick={() => { setStickyUserMenuOpen(false); redirectToDashboard("/sellerdashboard/orders"); }} disabled={isDashboardRedirecting} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 text-sm font-medium group disabled:opacity-60">
//                           <span className="w-7 h-7 rounded-lg bg-[#EAD7B7] group-hover:bg-[#5A1E12]/10 flex items-center justify-center transition-colors"><Package className="w-3.5 h-3.5 text-[#5A1E12]" /></span>
//                           {isDashboardRedirecting ? "Redirecting…" : "My Orders"}
//                         </button>
//                         <button onClick={() => { setStickyUserMenuOpen(false); redirectToDashboard("/sellerdashboard/products"); }} disabled={isDashboardRedirecting} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 text-sm font-medium group disabled:opacity-60">
//                           <span className="w-7 h-7 rounded-lg bg-[#EAD7B7] group-hover:bg-[#5A1E12]/10 flex items-center justify-center transition-colors"><Store className="w-3.5 h-3.5 text-[#5A1E12]" /></span>
//                           My Products
//                         </button>
//                       </>
//                     ) : (
//                       <>
//                         <button onClick={() => { setStickyUserMenuOpen(false); redirectToDashboard("/customerdashboard/orders"); }} disabled={isDashboardRedirecting} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 text-sm font-medium group disabled:opacity-60">
//                           <span className="w-7 h-7 rounded-lg bg-[#EAD7B7] group-hover:bg-[#5A1E12]/10 flex items-center justify-center transition-colors"><Package className="w-3.5 h-3.5 text-[#5A1E12]" /></span>
//                           {isDashboardRedirecting ? "Redirecting…" : "My Orders"}
//                         </button>
//                         <button onClick={() => { setStickyUserMenuOpen(false); redirectToDashboard("/customerdashboard/wishlists"); }} disabled={isDashboardRedirecting} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 text-sm font-medium group disabled:opacity-60">
//                           <span className="w-7 h-7 rounded-lg bg-[#EAD7B7] group-hover:bg-[#5A1E12]/10 flex items-center justify-center transition-colors"><Heart className="w-3.5 h-3.5 text-[#5A1E12]" /></span>
//                           My Wishlist
//                         </button>
//                       </>
//                     )}
//                     {user.role === "admin" && (
//                       <button onClick={() => { setStickyUserMenuOpen(false); router.push("/admin"); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 text-sm font-medium group">
//                         <span className="w-7 h-7 rounded-lg bg-[#EAD7B7] group-hover:bg-[#5A1E12]/10 flex items-center justify-center transition-colors"><Settings className="w-3.5 h-3.5 text-[#5A1E12]" /></span>
//                         Admin Dashboard
//                       </button>
//                     )}
//                     <div className="pt-1 mt-0.5 border-t border-gray-100">
//                       <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors text-red-500 text-sm font-medium group">
//                         <span className="w-7 h-7 rounded-lg bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors"><LogOut className="w-3.5 h-3.5 text-red-500" /></span>
//                         Logout
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </header>

//       {/* ── SEARCH MODAL ────────────────────────────────────────────── */}
//       <AnimatePresence>
//         {isSearchModalOpen && (
//           <>
//             {/* Backdrop */}
//             <motion.div
//               key="search-backdrop"
//               className="fixed inset-0 z-200 bg-black/40 backdrop-blur-[2px]"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               transition={{ duration: 0.2 }}
//               onClick={closeSearch}
//             />

//             {/* Modal panel */}
//             <motion.div
//               key="search-panel"
//               className="fixed inset-x-4 top-[12vh] z-201 w-full max-w-2xl mx-auto left-1/2 -translate-x-1/2"
//               initial={{ opacity: 0, y: -20, scale: 0.97 }}
//               animate={{ opacity: 1, y: 0, scale: 1 }}
//               exit={{ opacity: 0, y: -16, scale: 0.97 }}
//               transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
//             >
//             <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">

//               {/* Input row */}
//               <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
//                 <Search className="w-5 h-5 text-[#5A1E12] shrink-0" />
//                 <form onSubmit={handleSearchSubmit} className="flex-1">
//                   <input
//                     ref={searchInputRef}
//                     type="text"
//                     placeholder="Search products, categories, artists…"
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="w-full text-base text-gray-800 placeholder-gray-400 outline-none bg-transparent"
//                     autoFocus
//                   />
//                 </form>
//                 {searchTerm && (
//                   <button
//                     onClick={() => setSearchTerm("")}
//                     className="p-1 rounded-full hover:bg-gray-100 text-gray-400 transition-colors shrink-0"
//                     aria-label="Clear search"
//                   >
//                     <X className="w-4 h-4" />
//                   </button>
//                 )}
//                 <button
//                   onClick={closeSearch}
//                   className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors shrink-0"
//                   aria-label="Close search"
//                 >
//                   <X className="w-4 h-4" />
//                 </button>
//               </div>

//               {/* Results */}
//               {searchTerm.trim().length > 1 ? (
//                 <div className="max-h-[55vh] overflow-y-auto">
//                   {(segregatedSearchResults.products.length > 0 || segregatedSearchResults.categories.length > 0 || segregatedSearchResults.artists.length > 0) ? (
//                     <div>
//                       {/* Products */}
//                       {segregatedSearchResults.products.length > 0 && (
//                         <div>
//                           <div className="flex items-center gap-2 px-5 pt-4 pb-2">
//                             <span className="text-[10px] font-bold text-[#5A1E12] uppercase tracking-widest">Products</span>
//                             <div className="flex-1 h-px bg-[#5A1E12]/10" />
//                           </div>
//                           <div className="px-3 pb-1">
//                             {segregatedSearchResults.products.map((product) => (
//                               <button
//                                 key={product.id}
//                                 onClick={() => handleSearchSelect(product)}
//                                 className="w-full text-left px-3 py-3 rounded-xl hover:bg-[#5A1E12]/5 transition-colors group flex items-center gap-3"
//                               >
//                                 <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden shrink-0 border border-gray-200">
//                                   {product.featuredImage || product.images?.[0] ? (
//                                     <Image
//                                       src={product.featuredImage || (product.images?.[0] || '')}
//                                       alt={product.title || 'Product'}
//                                       width={48}
//                                       height={48}
//                                       className="w-full h-full object-cover"
//                                     />
//                                   ) : (
//                                     <div className="w-full h-full flex items-center justify-center">
//                                       <Search className="w-4 h-4 text-gray-300" />
//                                     </div>
//                                   )}
//                                 </div>
//                                 <div className="flex-1 min-w-0">
//                                   <div className="font-medium text-gray-800 text-sm group-hover:text-[#5A1E12] transition-colors">{product.title}</div>
//                                   <div className="text-xs text-[#5A1E12] font-semibold mt-0.5">${product.price}</div>
//                                 </div>
//                                 <svg className="w-4 h-4 text-gray-300 group-hover:text-[#5A1E12] transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
//                               </button>
//                             ))}
//                           </div>
//                         </div>
//                       )}

//                       {/* Categories */}
//                       {segregatedSearchResults.categories.length > 0 && (
//                         <div>
//                           <div className="flex items-center gap-2 px-5 pt-3 pb-2">
//                             <span className="text-[10px] font-bold text-[#5A1E12] uppercase tracking-widest">Categories</span>
//                             <div className="flex-1 h-px bg-[#5A1E12]/10" />
//                           </div>
//                           <div className="px-5 pb-2 flex flex-wrap gap-2">
//                             {segregatedSearchResults.categories.map((category) => (
//                               <button
//                                 key={category}
//                                 onClick={() => handleCategorySelect(category)}
//                                 className="text-xs font-medium px-3 py-1.5 rounded-full border border-[#5A1E12]/20 text-[#5A1E12] hover:bg-[#5A1E12] hover:text-white transition-all"
//                               >
//                                 {category}
//                               </button>
//                             ))}
//                           </div>
//                         </div>
//                       )}

//                       {/* Artists */}
//                       {segregatedSearchResults.artists.length > 0 && (
//                         <div>
//                           <div className="flex items-center gap-2 px-5 pt-3 pb-2">
//                             <span className="text-[10px] font-bold text-[#5A1E12] uppercase tracking-widest">Artists</span>
//                             <div className="flex-1 h-px bg-[#5A1E12]/10" />
//                           </div>
//                           <div className="px-3 pb-2">
//                             {segregatedSearchResults.artists.map((artist) => (
//                               <button
//                                 key={artist}
//                                 onClick={() => handleArtistSelect(artist)}
//                                 className="w-full text-left px-3 py-3 rounded-xl hover:bg-[#5A1E12]/5 transition-colors group flex items-center gap-3"
//                               >
//                                 <div className="w-9 h-9 rounded-full bg-[#EAD7B7]/50 flex items-center justify-center shrink-0">
//                                   <User className="w-4 h-4 text-[#5A1E12]" />
//                                 </div>
//                                 <span className="text-sm text-gray-700 group-hover:text-[#5A1E12] font-medium transition-colors flex-1 text-left">{artist}</span>
//                                 <svg className="w-4 h-4 text-gray-300 group-hover:text-[#5A1E12] transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
//                               </button>
//                             ))}
//                           </div>
//                         </div>
//                       )}

//                       {/* View all CTA */}
//                       <div className="p-4 pt-2">
//                         <button
//                           onClick={() => { closeSearch(); router.push(`/shop?search=${encodeURIComponent(searchTerm)}`); }}
//                           className="w-full flex items-center justify-between px-5 py-3 bg-[#5A1E12] hover:bg-[#4a180f] text-white rounded-xl transition-colors text-sm font-semibold"
//                         >
//                           <span>View all results for &ldquo;{searchTerm}&rdquo;</span>
//                           <span className="bg-white/20 text-white text-xs px-2.5 py-1 rounded-full font-bold">
//                             {segregatedSearchResults.products.length + segregatedSearchResults.categories.length + segregatedSearchResults.artists.length}
//                           </span>
//                         </button>
//                       </div>
//                     </div>
//                   ) : (
//                     <div className="py-14 flex flex-col items-center gap-3">
//                       <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
//                         <Search className="w-6 h-6 text-gray-400" />
//                       </div>
//                       <p className="text-base font-medium text-gray-700">No results found</p>
//                       <p className="text-sm text-gray-400">Try a different keyword</p>
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 /* Empty state — hints when nothing typed yet */
//                 <div className="py-12 flex flex-col items-center gap-2 text-center px-6">
//                   <div className="w-12 h-12 rounded-full bg-[#EAD7B7]/40 flex items-center justify-center mb-1">
//                     <Search className="w-5 h-5 text-[#5A1E12]" />
//                   </div>
//                   <p className="text-sm font-medium text-gray-600">Search products, categories or artists</p>
//                   <p className="text-xs text-gray-400">Type at least 2 characters to see results</p>
//                 </div>
//               )}
//             </div>
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>
//     </>
//   );
// }

"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  ShoppingCart,
  Menu,
  X,
  User,
  LogOut,
  Package,
  Settings,
  Search,
  Heart,
  Store,
} from "lucide-react";
import MiniCart from "../cards/MiniCart";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useSharedEnhancedCart } from "@/hooks/useSharedEnhancedCart";
import { useProducts, Product } from "@/hooks/useProducts";
import { useDashboardSSO } from "@/hooks/useDashboardSSO";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about-us" },
  { label: "Shop", href: "/shop" },
  { label: "Blogs", href: "/blog" },
  { label: "Contact Us", href: "/contact-us" },
];

export default function Header() {
  const pathname = usePathname();
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Single boolean: true once user scrolls past 5vh threshold
  const [isSticky, setIsSticky] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [guestMenuOpen, setGuestMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const cartRef = useRef<HTMLDivElement>(null);
  const cartButtonRef = useRef<HTMLButtonElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const guestMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  const { user, logout, fetchUser } = useAuth();
  const { cartItems, fetchCartFromBackend } = useCart();
  const { cartData, subscribeToUpdates } = useSharedEnhancedCart();
  const { data: products = [] } = useProducts();
  const router = useRouter();
  const { redirectToDashboard, isRedirecting: isDashboardRedirecting } =
    useDashboardSSO();

  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [persistedCartCount, setPersistedCartCount] = useState(0);
  const [cartUpdateTrigger, setCartUpdateTrigger] = useState(0);

  // Seed badge count from localStorage on mount
  useEffect(() => {
    const stored = parseInt(localStorage.getItem("alpa_cart_count") || "0", 10);
    if (!isNaN(stored)) setPersistedCartCount(stored);
  }, []);

  // Subscribe to cart updates
  useEffect(() => {
    const unsubscribe = subscribeToUpdates(() => {
      setCartUpdateTrigger((prev) => prev + 1);
    });
    return unsubscribe;
  }, [subscribeToUpdates]);

  // Listen for custom open-cart event
  useEffect(() => {
    const handleOpenCart = () => setCartOpen(true);
    window.addEventListener("open-cart", handleOpenCart);
    return () => window.removeEventListener("open-cart", handleOpenCart);
  }, []);

  // Cart item count
  const cartItemCount = useMemo(() => {
    if (cartData && cartData.cart) {
      return cartData.cart.reduce(
        (total, item) => total + (item.quantity || 0),
        0,
      );
    }
    if (cartItems.length > 0) {
      return cartItems.reduce((total, item) => total + (item.qty || 0), 0);
    }
    return persistedCartCount;
  }, [cartData, cartItems, cartData?.cart, persistedCartCount]);

  // Persist cart count
  useEffect(() => {
    localStorage.setItem("alpa_cart_count", cartItemCount.toString());
    setPersistedCartCount(cartItemCount);
  }, [cartItemCount]);

  // Search results
  const segregatedSearchResults = useMemo(() => {
    if (searchTerm.trim().length > 1) {
      const searchLower = searchTerm.toLowerCase();
      const matchedProducts = products
        .filter(
          (product) =>
            (product.title &&
              product.title.toLowerCase().includes(searchLower)) ||
            (product.description &&
              product.description.toLowerCase().includes(searchLower)) ||
            (product.brand &&
              product.brand.toLowerCase().includes(searchLower)),
        )
        .slice(0, 5);
      const categories = Array.from(
        new Set(
          products
            .filter(
              (p) =>
                p.category && p.category.toLowerCase().includes(searchLower),
            )
            .map((p) => p.category)
            .filter((cat): cat is string => Boolean(cat)),
        ),
      ).slice(0, 5);
      const artists = Array.from(
        new Set(
          products
            .filter(
              (p) =>
                p.artistName &&
                p.artistName.toLowerCase().includes(searchLower),
            )
            .map((p) => p.artistName)
            .filter((name): name is string => Boolean(name)),
        ),
      ).slice(0, 5);
      return { products: matchedProducts, categories, artists };
    }
    return { products: [], categories: [], artists: [] };
  }, [searchTerm, products]);

  const defaultSearchSuggestions = useMemo(() => {
    const categoryCount = new Map<string, number>();
    const artistCount = new Map<string, number>();

    products.forEach((product) => {
      const category = product.category?.trim();
      if (category) {
        categoryCount.set(category, (categoryCount.get(category) || 0) + 1);
      }

      const artist = product.artistName?.trim();
      if (artist) {
        artistCount.set(artist, (artistCount.get(artist) || 0) + 1);
      }
    });

    const toTopList = (countMap: Map<string, number>) =>
      Array.from(countMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name]) => name);

    return {
      categories: toTopList(categoryCount),
      artists: toTopList(artistCount),
    };
  }, [products]);

  const closeSearch = useCallback(() => {
    setIsSearchModalOpen(false);
    setSearchTerm("");
  }, []);

  const closeMobileSearch = useCallback(() => {
    setMobileSearchOpen(false);
    setSearchTerm("");
  }, []);

  const handleSearchSelect = useCallback(
    (product: Product) => {
      closeSearch();
      if (product.title) {
        router.push(`/shop?search=${encodeURIComponent(product.title)}`);
      }
    },
    [router, closeSearch],
  );

  const handleCategorySelect = useCallback(
    (category: string) => {
      closeSearch();
      router.push(`/shop?category=${encodeURIComponent(category)}`);
    },
    [router, closeSearch],
  );

  const handleArtistSelect = useCallback(
    (artist: string) => {
      closeSearch();
      router.push(`/shop?artist=${encodeURIComponent(artist)}`);
    },
    [router, closeSearch],
  );

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchTerm.trim()) {
        const term = searchTerm.trim();
        closeSearch();
        router.push(`/shop?search=${encodeURIComponent(term)}`);
      }
    },
    [searchTerm, router, closeSearch],
  );

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchCartFromBackend();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Click-outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        cartOpen &&
        cartRef.current &&
        !cartRef.current.contains(target) &&
        cartButtonRef.current &&
        !cartButtonRef.current.contains(target)
      ) {
        setCartOpen(false);
      }
      if (
        userMenuOpen &&
        userMenuRef.current &&
        !userMenuRef.current.contains(target)
      ) {
        setUserMenuOpen(false);
      }
      if (
        guestMenuOpen &&
        guestMenuRef.current &&
        !guestMenuRef.current.contains(target)
      ) {
        setGuestMenuOpen(false);
      }
      if (
        mobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(target) &&
        !(target as Element).closest('button[aria-label*="menu"]')
      ) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    if (cartOpen || mobileMenuOpen || isSearchModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [
    cartOpen,
    userMenuOpen,
    guestMenuOpen,
    mobileMenuOpen,
    isSearchModalOpen,
  ]);

  // ── SINGLE SCROLL HANDLER ──────────────────────────────────────────────────
  // Drives the pill → sticky morph via one boolean.
  useEffect(() => {
    const handleScroll = () => {
      const threshold = window.innerHeight * 0.05;
      setIsSticky(window.scrollY > threshold);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Body scroll management for mobile cart
  useEffect(() => {
    if (cartOpen) {
      // Prevent body scroll when cart is open on mobile
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      // Restore body scroll when cart is closed
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [cartOpen]);

  // Escape key handler
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setCartOpen(false);
        setUserMenuOpen(false);
        setGuestMenuOpen(false);
        setMobileMenuOpen(false);
        closeSearch();
        closeMobileSearch();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [closeSearch, closeMobileSearch]);

  const isActive = useCallback(
    (href: string) => {
      if (href === "/") return pathname === "/";
      return pathname === href || pathname.startsWith(`${href}/`);
    },
    [pathname],
  );

  const toggleCart = useCallback(() => setCartOpen((prev) => !prev), []);

  const handleLogout = useCallback(() => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    setLogoutModalOpen(true);
  }, []);

  const confirmLogout = useCallback(async () => {
    setIsLoggingOut(true);
    await logout();
  }, [logout]);

  const handleNavigation = useCallback(
    (href: string) => {
      setUserMenuOpen(false);
      setGuestMenuOpen(false);
      setMobileMenuOpen(false);
      router.push(href);
    },
    [router],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Shared user menu items — used in both pill and sticky states
  const UserMenuDropdown = ({ onClose }: { onClose: () => void }) => (
    <div className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden z-50 border border-gray-100">
      <div className="flex items-center gap-3 px-4 py-3.5 bg-[#5A1E12]">
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <User className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-white text-sm truncate">
            Hi, {user?.name?.split(" ")[0] || "User"}
          </p>
          <p className="text-xs text-white/60 truncate">{user?.email}</p>
        </div>
      </div>
      <div className="p-1.5 flex flex-col gap-0.5">
        <button
          onClick={() => {
            onClose();
            redirectToDashboard(
              user?.role?.toLowerCase() === "seller"
                ? "/sellerdashboard/profile"
                : "/customerdashboard/profile",
            );
          }}
          disabled={isDashboardRedirecting}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 text-sm font-medium group disabled:opacity-60"
        >
          <span className="w-7 h-7 rounded-lg bg-[#EAD7B7] group-hover:bg-[#5A1E12]/10 flex items-center justify-center transition-colors">
            <User className="w-3.5 h-3.5 text-[#5A1E12]" />
          </span>
          My Profile
        </button>
        {user?.role?.toLowerCase() === "seller" ? (
          <>
            <button
              onClick={() => {
                onClose();
                redirectToDashboard("/sellerdashboard");
              }}
              disabled={isDashboardRedirecting}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 text-sm font-medium group disabled:opacity-60"
            >
              <span className="w-7 h-7 rounded-lg bg-[#EAD7B7] group-hover:bg-[#5A1E12]/10 flex items-center justify-center transition-colors">
                <Settings className="w-3.5 h-3.5 text-[#5A1E12]" />
              </span>
              Dashboard
            </button>
            <button
              onClick={() => {
                onClose();
                redirectToDashboard("/sellerdashboard/orders");
              }}
              disabled={isDashboardRedirecting}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 text-sm font-medium group disabled:opacity-60"
            >
              <span className="w-7 h-7 rounded-lg bg-[#EAD7B7] group-hover:bg-[#5A1E12]/10 flex items-center justify-center transition-colors">
                <Package className="w-3.5 h-3.5 text-[#5A1E12]" />
              </span>
              {isDashboardRedirecting ? "Redirecting…" : "My Orders"}
            </button>
            <button
              onClick={() => {
                onClose();
                redirectToDashboard("/sellerdashboard/products");
              }}
              disabled={isDashboardRedirecting}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 text-sm font-medium group disabled:opacity-60"
            >
              <span className="w-7 h-7 rounded-lg bg-[#EAD7B7] group-hover:bg-[#5A1E12]/10 flex items-center justify-center transition-colors">
                <Store className="w-3.5 h-3.5 text-[#5A1E12]" />
              </span>
              My Products
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => {
                onClose();
                redirectToDashboard("/customerdashboard/orders");
              }}
              disabled={isDashboardRedirecting}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 text-sm font-medium group disabled:opacity-60"
            >
              <span className="w-7 h-7 rounded-lg bg-[#EAD7B7] group-hover:bg-[#5A1E12]/10 flex items-center justify-center transition-colors">
                <Package className="w-3.5 h-3.5 text-[#5A1E12]" />
              </span>
              {isDashboardRedirecting ? "Redirecting…" : "My Orders"}
            </button>
            <button
              onClick={() => {
                onClose();
                redirectToDashboard("/customerdashboard/wishlists");
              }}
              disabled={isDashboardRedirecting}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 text-sm font-medium group disabled:opacity-60"
            >
              <span className="w-7 h-7 rounded-lg bg-[#EAD7B7] group-hover:bg-[#5A1E12]/10 flex items-center justify-center transition-colors">
                <Heart className="w-3.5 h-3.5 text-[#5A1E12]" />
              </span>
              My Wishlist
            </button>
          </>
        )}
        {user?.role === "admin" && (
          <button
            onClick={() => {
              onClose();
              handleNavigation("/admin");
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 text-sm font-medium group"
          >
            <span className="w-7 h-7 rounded-lg bg-[#EAD7B7] group-hover:bg-[#5A1E12]/10 flex items-center justify-center transition-colors">
              <Settings className="w-3.5 h-3.5 text-[#5A1E12]" />
            </span>
            Admin Dashboard
          </button>
        )}
        <div className="pt-1 mt-0.5 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors text-red-500 text-sm font-medium group"
          >
            <span className="w-7 h-7 rounded-lg bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors">
              <LogOut className="w-3.5 h-3.5 text-red-500" />
            </span>
            Logout
          </button>
        </div>
      </div>
    </div>
  );

  const GuestMenuDropdown = ({ onClose }: { onClose: () => void }) => (
    <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden z-50 border border-gray-100 origin-top-right">
      <div className="px-4 py-3 bg-[#5A1E12]/5 border-b border-gray-100">
        <p className="text-xs font-semibold text-[#5A1E12] uppercase tracking-widest">
          User Options
        </p>
      </div>
      <div className="p-1.5 flex flex-col gap-0.5">
        <button
          onClick={() => {
            onClose();
            handleNavigation("/login");
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 text-sm font-medium group"
        >
          <span className="w-7 h-7 rounded-lg bg-gray-100 group-hover:bg-[#5A1E12]/10 flex items-center justify-center transition-colors">
            <User className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#5A1E12]" />
          </span>
          Login
        </button>
        <button
          onClick={() => {
            onClose();
            handleNavigation("/signup");
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 text-sm font-medium group"
        >
          <span className="w-7 h-7 rounded-lg bg-gray-100 group-hover:bg-[#5A1E12]/10 flex items-center justify-center transition-colors">
            <Settings className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#5A1E12]" />
          </span>
          Create account
        </button>
        <button
          onClick={() => {
            onClose();
            handleNavigation("/seller-login");
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 text-sm font-medium group"
        >
          <span className="w-7 h-7 rounded-lg bg-gray-100 group-hover:bg-[#5A1E12]/10 flex items-center justify-center transition-colors">
            <User className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#5A1E12]" />
          </span>
          Login as seller
        </button>
        <div className="pt-1 mt-0.5 border-t border-gray-100">
          <button
            onClick={() => {
              onClose();
              handleNavigation("/sellerOnboarding");
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#5A1E12] hover:bg-[#4a180f] transition-colors text-white text-sm font-medium"
          >
            <span className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
              <Package className="w-3.5 h-3.5 text-white" />
            </span>
            Register as Seller
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Logout Modal ── */}
      <AnimatePresence>
        {logoutModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 16 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="bg-white rounded-3xl shadow-2xl w-[90vw] max-w-sm overflow-hidden"
            >
              {isLoggingOut ? (
                <div className="flex flex-col items-center justify-center px-8 py-12 gap-5">
                  <div className="w-16 h-16 rounded-full bg-[#5A1E12]/10 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-[#5A1E12] animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-800 text-lg">
                      Logging you out…
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Please wait a moment
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-[#5A1E12] px-6 pt-6 pb-5 text-center">
                    <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                      <LogOut className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-white font-bold text-lg leading-snug">
                      Hi {user?.name?.split(" ")[0] || "there"} 👋
                    </p>
                    <p className="text-white/70 text-sm mt-1">
                      Are you sure you want to logout?
                    </p>
                  </div>
                  <div className="p-5 flex flex-col gap-2.5">
                    <button
                      onClick={confirmLogout}
                      className="w-full py-3 rounded-2xl bg-[#5A1E12] hover:bg-[#4a180f] text-white font-semibold text-sm transition-colors"
                    >
                      Yes, Logout
                    </button>
                    <button
                      onClick={() => setLogoutModalOpen(false)}
                      className="w-full py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Cart Backdrop */}
      {cartOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-60 lg:hidden"
          onClick={() => setCartOpen(false)}
        />
      )}

      {/* Mini Cart Panel */}
      <div
        ref={cartRef}
        className={`
          fixed top-0 right-0 h-screen w-full sm:w-96 z-70
          transform transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
          ${cartOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"}
        `}
      >
        <MiniCart onClose={() => setCartOpen(false)} />
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          MOBILE / TABLET TOP BAR  (shown only on < lg)
      ───────────────────────────────────────────────────────────────────── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#EAD7B7]/98 backdrop-blur-lg shadow-[0_4px_24px_rgba(90,30,18,0.10)] border-b border-[#5A1E12]/10 px-4 py-3 flex items-center gap-2">
        {mobileSearchOpen ? (
          /* ── Search mode ── */
          <>
            <button
              onClick={closeMobileSearch}
              className="p-2 rounded-full hover:bg-[#5A1E12]/10 active:scale-95 transition-all duration-200 text-[#5A1E12] shrink-0"
              aria-label="Close search"
            >
              <X className="h-5 w-5" />
            </button>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchTerm.trim()) {
                  closeMobileSearch();
                  router.push(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
                }
              }}
              className="flex-1 relative"
            >
              <input
                ref={mobileSearchInputRef}
                type="text"
                placeholder="Search products, artists…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/70 rounded-xl px-3 py-2 pr-8 text-sm text-gray-800 placeholder-gray-400 outline-none focus:bg-white transition-all border border-[#5A1E12]/20 focus:border-[#5A1E12]/40"
                autoFocus
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => { setSearchTerm(""); mobileSearchInputRef.current?.focus(); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full bg-gray-300/70 hover:bg-gray-400/70 text-gray-600 transition-colors"
                  aria-label="Clear"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </form>
          </>
        ) : (
          /* ── Normal mode ── */
          <>
            <Link
              href="/"
              className="font-bold transition-transform hover:scale-105 active:scale-95 shrink-0"
            >
              <Image
                src="/images/navbarLogo.png"
                width={500}
                height={500}
                alt="Logo"
                className="w-11"
                priority
              />
            </Link>
            <div className="flex-1" />
            <div className="flex items-center gap-1">
              <button
                onClick={() => { setMobileSearchOpen(true); setMobileMenuOpen(false); }}
                className="p-2 rounded-full hover:bg-[#5A1E12]/10 active:scale-95 transition-all duration-200 text-[#5A1E12]"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>
              <button
                onClick={toggleCart}
                className="relative p-2 rounded-full hover:bg-[#5A1E12]/10 active:scale-95 transition-all duration-200"
                aria-label={`Shopping cart with ${cartItemCount} items`}
              >
                <ShoppingCart className="h-6 w-6 text-[#5A1E12]" />
                {mounted && cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 text-[10px] flex items-center justify-center bg-[#5A1E12] text-white rounded-full font-bold shadow-sm">
                    {cartItemCount > 9 ? "9+" : cartItemCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-full hover:bg-[#5A1E12]/10 active:scale-95 transition-all duration-200 text-[#5A1E12]"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          MOBILE SEARCH DROPDOWN  (shown only on < lg when mobileSearchOpen)
      ───────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileSearchOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="mobile-search-backdrop"
              className="fixed inset-0 bg-black/20 z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={closeMobileSearch}
            />
            {/* Dropdown panel */}
            <motion.div
              key="mobile-search-panel"
              className="fixed left-3 right-3 top-17 z-45 lg:hidden"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-h-[72vh] overflow-y-auto">
                {searchTerm.trim().length > 1 ? (
                  /* ── Live search results ── */
                  segregatedSearchResults.products.length === 0 &&
                  segregatedSearchResults.categories.length === 0 &&
                  segregatedSearchResults.artists.length === 0 ? (
                    <div className="py-8 flex flex-col items-center gap-2">
                      <Search className="w-6 h-6 text-gray-300" />
                      <p className="text-sm text-gray-500">No results for &ldquo;{searchTerm}&rdquo;</p>
                    </div>
                  ) : (
                    <div>
                      {segregatedSearchResults.products.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                            <span className="text-[10px] font-bold text-[#5A1E12] uppercase tracking-widest">Products</span>
                            <div className="flex-1 h-px bg-[#5A1E12]/10" />
                          </div>
                          {segregatedSearchResults.products.slice(0, 3).map((product) => (
                            <button
                              key={product.id}
                              onClick={() => { closeMobileSearch(); handleSearchSelect(product); }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#5A1E12]/5 transition-colors"
                            >
                              <div className="w-9 h-9 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                                {product.images?.[0] ? (
                                  <Image src={product.images[0]!} alt={product.title || ""} width={36} height={36} className="w-full h-full object-cover" />
                                ) : (
                                  <Search className="w-4 h-4 text-gray-300 m-2" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0 text-left">
                                <p className="text-sm font-medium text-gray-800 truncate">{product.title}</p>
                                <p className="text-xs text-[#5A1E12] font-semibold">${product.price}</p>
                              </div>
                              <svg className="w-3.5 h-3.5 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          ))}
                        </div>
                      )}
                      {segregatedSearchResults.categories.length > 0 && (
                        <div className="px-4 pb-3">
                          <div className="flex items-center gap-2 pt-2 pb-1.5">
                            <span className="text-[10px] font-bold text-[#5A1E12] uppercase tracking-widest">Categories</span>
                            <div className="flex-1 h-px bg-[#5A1E12]/10" />
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {segregatedSearchResults.categories.slice(0, 4).map((cat) => (
                              <button
                                key={cat}
                                onClick={() => { closeMobileSearch(); handleCategorySelect(cat); }}
                                className="text-xs px-3 py-1.5 rounded-full border border-[#5A1E12]/20 text-[#5A1E12] hover:bg-[#5A1E12] hover:text-white transition-all"
                              >
                                {cat}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      {segregatedSearchResults.artists.length > 0 && (
                        <div className="pb-1">
                          <div className="flex items-center gap-2 px-4 pt-2 pb-1">
                            <span className="text-[10px] font-bold text-[#5A1E12] uppercase tracking-widest">Artists</span>
                            <div className="flex-1 h-px bg-[#5A1E12]/10" />
                          </div>
                          {segregatedSearchResults.artists.slice(0, 3).map((artist) => (
                            <button
                              key={artist}
                              onClick={() => { closeMobileSearch(); handleArtistSelect(artist); }}
                              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#5A1E12]/5 transition-colors group"
                            >
                              <div className="w-8 h-8 rounded-full bg-[#EAD7B7]/60 flex items-center justify-center shrink-0">
                                <User className="w-3.5 h-3.5 text-[#5A1E12]" />
                              </div>
                              <span className="text-sm font-medium text-gray-700 group-hover:text-[#5A1E12] transition-colors truncate flex-1 text-left">{artist}</span>
                              <svg className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#5A1E12] transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => { closeMobileSearch(); router.push(`/shop?search=${encodeURIComponent(searchTerm)}`); }}
                        className="w-full flex items-center justify-between px-4 py-3 bg-[#5A1E12] text-white text-sm font-medium"
                      >
                        <span>View all results</span>
                        <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">
                          {segregatedSearchResults.products.length + segregatedSearchResults.categories.length + segregatedSearchResults.artists.length}
                        </span>
                      </button>
                    </div>
                  )
                ) : (
                  /* ── Default suggestions ── */
                  <div>
                    {defaultSearchSuggestions.categories.length > 0 && (
                      <div className="px-4 pt-4 pb-3">
                        <div className="flex items-center gap-2 pb-2">
                          <span className="text-[10px] font-bold text-[#5A1E12] uppercase tracking-widest">Top Categories</span>
                          <div className="flex-1 h-px bg-[#5A1E12]/10" />
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {defaultSearchSuggestions.categories.slice(0, 6).map((category) => (
                            <button
                              key={category}
                              onClick={() => { closeMobileSearch(); handleCategorySelect(category); }}
                              className="text-xs px-3 py-1.5 rounded-full border border-[#5A1E12]/20 text-[#5A1E12] hover:bg-[#5A1E12] hover:text-white transition-all"
                            >
                              {category}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {defaultSearchSuggestions.artists.length > 0 && (
                      <div className="pb-2">
                        <div className="flex items-center gap-2 px-4 pt-1 pb-1.5">
                          <span className="text-[10px] font-bold text-[#5A1E12] uppercase tracking-widest">Top Artists</span>
                          <div className="flex-1 h-px bg-[#5A1E12]/10" />
                        </div>
                        {defaultSearchSuggestions.artists.slice(0, 5).map((artist) => (
                          <button
                            key={artist}
                            onClick={() => { closeMobileSearch(); handleArtistSelect(artist); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#5A1E12]/5 transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-full bg-[#EAD7B7]/60 flex items-center justify-center shrink-0">
                              <User className="w-3.5 h-3.5 text-[#5A1E12]" />
                            </div>
                            <span className="text-sm font-medium text-gray-700 group-hover:text-[#5A1E12] transition-colors truncate flex-1 text-left">{artist}</span>
                            <svg className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#5A1E12] transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────────────
          DESKTOP MORPHING HEADER
          — One element. CSS transitions morph pill → sticky bar smoothly.
          — isSticky drives: margin, padding, border-radius, box-shadow, top
      ───────────────────────────────────────────────────────────────────── */}
      {/* Wrapper: handles layout-only transitions (top, horizontal padding) */}
      <div
        className="hidden lg:block fixed z-60 left-0 right-0"
        style={{
          top: isSticky ? '0px' : '24px',
          paddingLeft: isSticky ? '0px' : '48px',
          paddingRight: isSticky ? '0px' : '48px',
          transition: 'top 350ms cubic-bezier(0.4,0,0.2,1), padding-left 350ms cubic-bezier(0.4,0,0.2,1), padding-right 350ms cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* Inner header: overflow-visible so dropdowns are not clipped.
            A background pseudo-layer handles the animated border-radius visuals. */}
        <header
          className="relative flex items-center overflow-visible"
          style={{
            paddingLeft: isSticky ? '48px' : '32px',
            paddingRight: isSticky ? '48px' : '32px',
            paddingTop: '8px',
            paddingBottom: '8px',
            transition: 'padding-left 350ms cubic-bezier(0.4,0,0.2,1), padding-right 350ms cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          {/* Background layer: animates border-radius/shadow/border without clipping children */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[#EAD7B7]/98 backdrop-blur-lg border pointer-events-none"
            style={{
              borderRadius: isSticky ? '0px' : '40px',
              borderColor: isSticky ? 'transparent' : 'rgba(90, 30, 18, 0.10)',
              boxShadow: isSticky
                ? '0 4px 24px rgba(90,30,18,0.13), inset 0 -1px 0 rgba(90,30,18,0.10)'
                : '0 8px 32px rgba(90,30,18,0.10)',
              transition: 'border-radius 350ms cubic-bezier(0.4,0,0.2,1), box-shadow 350ms cubic-bezier(0.4,0,0.2,1), border-color 350ms cubic-bezier(0.4,0,0.2,1)',
              willChange: 'border-radius',
              transform: 'translateZ(0)',
            }}
           />
        {/* Logo */}
        <Link href="/" className="relative z-10 font-bold transition-transform hover:scale-105 active:scale-95 shrink-0">
          <Image src="/images/navbarLogo.png" width={500} height={500} alt="Logo" className="w-11 md:w-16" priority />
        </Link>

        {/* Spacer */}
        <div className="relative z-10 flex-1" />

        {/* Centered nav */}
        <nav className="absolute z-10 flex gap-4 lg:gap-6 left-1/2 -translate-x-1/2">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={`group relative px-2 py-1 text-sm lg:text-base font-medium transition-all duration-300
                ${isActive(href) ? "text-[#5A1E12]" : "text-gray-700 hover:text-[#5A1E12]"}
              `}
            >
              {label}
              <span
                className={`pointer-events-none absolute left-0 bottom-0 h-0.5 w-full bg-[#5A1E12] rounded-full
                  transition-transform duration-300 origin-left
                  ${isActive(href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}
                `}
              />
            </Link>
          ))}
        </nav>

        {/* Right side actions */}
        <div className="relative z-10 flex items-center gap-2 justify-end">
          {/* Search */}
          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="p-2 rounded-full hover:bg-[#5A1E12]/10 active:scale-95 text-[#5A1E12] transition-all duration-200"
            aria-label="Open search"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Cart */}
          <button
            ref={cartButtonRef}
            onClick={toggleCart}
            className="relative p-2 rounded-full hover:bg-[#5A1E12]/10 active:scale-95 transition-all duration-200 group"
            aria-label={`Shopping cart with ${cartItemCount} items`}
            aria-expanded={cartOpen}
          >
            <ShoppingCart className={`h-5 w-5 text-[#5A1E12] transition-transform duration-300 ${cartOpen ? "rotate-12 scale-110" : "group-hover:scale-110"}`} />
            {mounted && cartItemCount > 0 && (
              <>
                {!cartOpen && <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#5A1E12] rounded-full animate-ping opacity-75" />}
                <span className={`absolute -top-1 -right-1 h-4 w-4 text-[10px] flex items-center justify-center bg-[#5A1E12] text-white rounded-full font-bold shadow-sm transition-transform duration-300 ${cartOpen ? "scale-125" : ""}`}>
                  {cartItemCount > 9 ? "9+" : cartItemCount}
                </span>
              </>
            )}
          </button>

          {/* Auth */}
          {!user ? (
            <div className="relative" ref={guestMenuRef}>
              <button
                onClick={() => setGuestMenuOpen(!guestMenuOpen)}
                className={`p-2 rounded-full transition-all duration-200 ${guestMenuOpen ? "bg-[#5A1E12] text-white shadow-[0_4px_12px_rgba(90,30,18,0.3)]" : "hover:bg-[#5A1E12]/10 text-[#5A1E12]"}`}
                aria-label="Account options"
                aria-expanded={guestMenuOpen}
              >
                <User className="h-5 w-5" />
              </button>
              {guestMenuOpen && <GuestMenuDropdown onClose={() => setGuestMenuOpen(false)} />}
            </div>
          ) : (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 group"
                aria-label="User menu"
                aria-expanded={userMenuOpen}
              >
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#5A1E12] flex items-center justify-center ring-2 ring-transparent group-hover:ring-[#5A1E12]/40 group-hover:ring-offset-1 shadow-[0_4px_12px_rgba(90,30,18,0.25)] transition-all duration-200">
                  <User className="w-4 h-4 text-white" />
                </div>
                <svg className={`w-4 h-4 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {userMenuOpen && <UserMenuDropdown onClose={() => setUserMenuOpen(false)} />}
            </div>
          )}
        </div>
        </header>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          MOBILE DRAWER  (unchanged)
      ───────────────────────────────────────────────────────────────────── */}
      <div
        ref={mobileMenuRef}
        className={`
          fixed top-0 right-0 h-screen w-[320px] max-w-[90vw] z-55
          flex flex-col bg-white lg:hidden
          transform transition-transform duration-300 ease-out
          ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Header band */}
        <div className="shrink-0 bg-[#5A1E12] px-5 pt-4 pb-5">
          <div className="flex items-start justify-between">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#5A1E12] flex items-center justify-center border-2 border-white/40 shrink-0">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-white text-base leading-tight">
                    Hi, {user.name?.split(" ")[0] || "User"}
                  </p>
                  <p className="text-xs text-white/60 truncate mt-0.5">
                    {user.email}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Image
                  src="/images/navbarLogo.png"
                  width={500}
                  height={500}
                  alt="Logo"
                  className="w-9"
                />
                <p className="font-bold text-white text-lg">Alpa</p>
              </div>
            )}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0 mt-0.5"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* Mobile search results — hidden (search is in header bar) */}
          {false && searchTerm.trim().length > 1 && (
            <div className="mx-4 mt-3 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              {segregatedSearchResults.products.length > 0 ||
              segregatedSearchResults.categories.length > 0 ||
              segregatedSearchResults.artists.length > 0 ? (
                <div>
                  {segregatedSearchResults.products.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                        <span className="text-[10px] font-bold text-[#5A1E12] uppercase tracking-widest">
                          Products
                        </span>
                        <div className="flex-1 h-px bg-[#5A1E12]/10" />
                      </div>
                      {segregatedSearchResults.products
                        .slice(0, 4)
                        .map((product) => (
                          <button
                            key={product.id}
                            onClick={() => {
                              setMobileMenuOpen(false);
                              handleSearchSelect(product);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#5A1E12]/5 transition-colors"
                          >
                            <div className="w-9 h-9 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                              {product.images?.[0] ? (
                                <Image
                                  src={product.images[0]!}
                                  alt={product.title || "Product"}
                                  width={36}
                                  height={36}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Search className="w-4 h-4 text-gray-300 m-2" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <p className="text-sm font-medium text-gray-800 truncate">
                                {product.title}
                              </p>
                              <p className="text-xs text-[#5A1E12] font-semibold">
                                ${product.price}
                              </p>
                            </div>
                            <svg
                              className="w-3.5 h-3.5 text-gray-300 shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </button>
                        ))}
                    </div>
                  )}
                  {segregatedSearchResults.categories.length > 0 && (
                    <div className="px-4 pb-3">
                      <div className="flex items-center gap-2 pt-2 pb-1.5">
                        <span className="text-[10px] font-bold text-[#5A1E12] uppercase tracking-widest">
                          Categories
                        </span>
                        <div className="flex-1 h-px bg-[#5A1E12]/10" />
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {segregatedSearchResults.categories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => {
                              setMobileMenuOpen(false);
                              handleCategorySelect(cat);
                            }}
                            className="text-xs px-3 py-1.5 rounded-full border border-[#5A1E12]/20 text-[#5A1E12] hover:bg-[#5A1E12] hover:text-white transition-all cursor-pointer"
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {segregatedSearchResults.artists.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 px-4 pt-2 pb-1">
                        <span className="text-[10px] font-bold text-[#5A1E12] uppercase tracking-widest">
                          Artists
                        </span>
                        <div className="flex-1 h-px bg-[#5A1E12]/10" />
                      </div>
                      {segregatedSearchResults.artists.map((artist) => (
                        <button
                          key={artist}
                          onClick={() => {
                            setMobileMenuOpen(false);
                            handleArtistSelect(artist);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#5A1E12]/5 transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-full bg-[#EAD7B7]/60 flex items-center justify-center shrink-0">
                            <User className="w-3.5 h-3.5 text-[#5A1E12]" />
                          </div>
                          <span className="text-sm font-medium text-gray-700 group-hover:text-[#5A1E12] transition-colors truncate flex-1 text-left">
                            {artist}
                          </span>
                          <svg
                            className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#5A1E12] transition-colors shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setSearchTerm("");
                      router.push(
                        `/shop?search=${encodeURIComponent(searchTerm)}`,
                      );
                    }}
                    className="w-full flex items-center justify-between px-4 py-2.5 bg-[#5A1E12] text-white text-sm font-medium"
                  >
                    <span>View all results</span>
                    <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">
                      {segregatedSearchResults.products.length +
                        segregatedSearchResults.categories.length +
                        segregatedSearchResults.artists.length}
                    </span>
                  </button>
                </div>
              ) : (
                <div className="py-6 flex flex-col items-center gap-1">
                  <Search className="w-5 h-5 text-gray-300" />
                  <p className="text-sm text-gray-500">
                    No results for &quot;{searchTerm}&quot;
                  </p>
                </div>
              )}
            </div>
          )}

          {false && searchTerm.trim().length <= 1 &&
            (defaultSearchSuggestions.categories.length > 0 ||
              defaultSearchSuggestions.artists.length > 0) && (
              <div className="mx-4 mt-3 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                {defaultSearchSuggestions.categories.length > 0 && (
                  <div className="px-4 pt-3 pb-2">
                    <div className="flex items-center gap-2 pb-1.5">
                      <span className="text-[10px] font-bold text-[#5A1E12] uppercase tracking-widest">
                        Top Categories
                      </span>
                      <div className="flex-1 h-px bg-[#5A1E12]/10" />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {defaultSearchSuggestions.categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => {
                            setMobileMenuOpen(false);
                            handleCategorySelect(category);
                          }}
                          className="text-xs px-3 py-1.5 rounded-full border border-[#5A1E12]/20 text-[#5A1E12] hover:bg-[#5A1E12] hover:text-white transition-all"
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {defaultSearchSuggestions.artists.length > 0 && (
                  <div className="pb-2">
                    <div className="flex items-center gap-2 px-4 pt-2 pb-1">
                      <span className="text-[10px] font-bold text-[#5A1E12] uppercase tracking-widest">
                        Top Artists
                      </span>
                      <div className="flex-1 h-px bg-[#5A1E12]/10" />
                    </div>
                    {defaultSearchSuggestions.artists.map((artist) => (
                      <button
                        key={artist}
                        onClick={() => {
                          setMobileMenuOpen(false);
                          handleArtistSelect(artist);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#5A1E12]/5 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-full bg-[#EAD7B7]/60 flex items-center justify-center shrink-0">
                          <User className="w-3.5 h-3.5 text-[#5A1E12]" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-[#5A1E12] transition-colors truncate flex-1 text-left">
                          {artist}
                        </span>
                        <svg
                          className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#5A1E12] transition-colors shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

          {/* Navigation */}
          <div className="px-4 pt-5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">
              Navigation
            </p>
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive(href)
                      ? "bg-[#5A1E12] text-white shadow-sm"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive(href) ? "bg-white" : "bg-[#5A1E12]/40"}`}
                  />
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Account */}
          <div className="px-4 pt-5 pb-6">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">
              Account
            </p>
            {!user ? (
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-[#5A1E12]/30 text-[#5A1E12] text-sm font-medium hover:bg-[#5A1E12]/5 transition-colors"
                >
                  <User className="w-4 h-4" />
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#5A1E12] text-white text-sm font-medium hover:bg-[#4a180f] transition-colors"
                >
                  Create Account
                </Link>
                <Link
                  href="/sellerOnboarding"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#5A1E12] text-white text-sm font-medium hover:bg-[#4a180f] transition-colors"
                >
                  Register as Seller
                </Link>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    redirectToDashboard(
                      user.role?.toLowerCase() === "seller"
                        ? "/sellerdashboard/profile"
                        : "/customerdashboard/profile",
                    );
                  }}
                  disabled={isDashboardRedirecting}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white transition-colors text-sm text-gray-700 border-b border-gray-100 disabled:opacity-60"
                >
                  <div className="w-8 h-8 rounded-full bg-[#EAD7B7] flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-[#5A1E12]" />
                  </div>
                  <span className="font-medium">My Profile</span>
                  <svg
                    className="w-3.5 h-3.5 text-gray-300 ml-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
                {user.role?.toLowerCase() === "seller" ? (
                  <>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        redirectToDashboard("/sellerdashboard");
                      }}
                      disabled={isDashboardRedirecting}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white transition-colors text-sm text-gray-700 border-b border-gray-100 disabled:opacity-60"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#EAD7B7] flex items-center justify-center shrink-0">
                        <Settings className="w-4 h-4 text-[#5A1E12]" />
                      </div>
                      <span className="font-medium">Dashboard</span>
                      <svg
                        className="w-3.5 h-3.5 text-gray-300 ml-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        redirectToDashboard("/sellerdashboard/orders");
                      }}
                      disabled={isDashboardRedirecting}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white transition-colors text-sm text-gray-700 border-b border-gray-100 disabled:opacity-60"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#EAD7B7] flex items-center justify-center shrink-0">
                        <Package className="w-4 h-4 text-[#5A1E12]" />
                      </div>
                      <span className="font-medium">
                        {isDashboardRedirecting ? "Redirecting…" : "My Orders"}
                      </span>
                      <svg
                        className="w-3.5 h-3.5 text-gray-300 ml-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        redirectToDashboard("/sellerdashboard/products");
                      }}
                      disabled={isDashboardRedirecting}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white transition-colors text-sm text-gray-700 border-b border-gray-100 disabled:opacity-60"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#EAD7B7] flex items-center justify-center shrink-0">
                        <Store className="w-4 h-4 text-[#5A1E12]" />
                      </div>
                      <span className="font-medium">My Products</span>
                      <svg
                        className="w-3.5 h-3.5 text-gray-300 ml-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        redirectToDashboard("/customerdashboard/orders");
                      }}
                      disabled={isDashboardRedirecting}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white transition-colors text-sm text-gray-700 border-b border-gray-100 disabled:opacity-60"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#EAD7B7] flex items-center justify-center shrink-0">
                        <Package className="w-4 h-4 text-[#5A1E12]" />
                      </div>
                      <span className="font-medium">
                        {isDashboardRedirecting ? "Redirecting…" : "My Orders"}
                      </span>
                      <svg
                        className="w-3.5 h-3.5 text-gray-300 ml-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        redirectToDashboard("/customerdashboard/wishlists");
                      }}
                      disabled={isDashboardRedirecting}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white transition-colors text-sm text-gray-700 border-b border-gray-100 disabled:opacity-60"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#EAD7B7] flex items-center justify-center shrink-0">
                        <Heart className="w-4 h-4 text-[#5A1E12]" />
                      </div>
                      <span className="font-medium">My Wishlist</span>
                      <svg
                        className="w-3.5 h-3.5 text-gray-300 ml-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </>
                )}
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-white transition-colors text-sm text-gray-700 border-b border-gray-100"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#EAD7B7] flex items-center justify-center shrink-0">
                      <Settings className="w-4 h-4 text-[#5A1E12]" />
                    </div>
                    <span className="font-medium">Admin Dashboard</span>
                    <svg
                      className="w-3.5 h-3.5 text-gray-300 ml-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-sm text-red-500"
                >
                  <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                    <LogOut className="w-4 h-4 text-red-500" />
                  </div>
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          SEARCH MODAL
      ───────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isSearchModalOpen && (
          <>
            <motion.div
              key="search-backdrop"
              className="fixed inset-0 z-200 bg-black/35 backdrop-blur-[]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeSearch}
            />
            <motion.div
              key="search-panel"
              className="fixed inset-x-4 top-[12vh] z-201 w-full max-w-2xl mx-auto left-1/2 -translate-x-1/2"
              initial={{ opacity: 0, y: -20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.97 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
                {/* Input row */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                  <Search className="w-5 h-5 text-[#5A1E12] shrink-0" />
                  <form onSubmit={handleSearchSubmit} className="flex-1">
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search products, categories, artists…"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full text-base text-gray-800 placeholder-gray-400 outline-none bg-transparent"
                      autoFocus
                    />
                  </form>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="p-1 rounded-full hover:bg-gray-100 text-gray-400 transition-colors shrink-0"
                      aria-label="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={closeSearch}
                    className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors shrink-0"
                    aria-label="Close search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Results */}
                {searchTerm.trim().length > 1 ? (
                  <div className="max-h-[55vh] overflow-y-auto">
                    {segregatedSearchResults.products.length > 0 ||
                    segregatedSearchResults.categories.length > 0 ||
                    segregatedSearchResults.artists.length > 0 ? (
                      <div>
                        {segregatedSearchResults.products.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 px-5 pt-4 pb-2">
                              <span className="text-[10px] font-bold text-[#5A1E12] uppercase tracking-widest">
                                Products
                              </span>
                              <div className="flex-1 h-px bg-[#5A1E12]/10" />
                            </div>
                            <div className="px-3 pb-1">
                              {segregatedSearchResults.products.map(
                                (product) => (
                                  <button
                                    key={product.id}
                                    onClick={() => handleSearchSelect(product)}
                                    className="w-full text-left px-3 py-3 rounded-xl hover:bg-[#5A1E12]/5 transition-colors group flex items-center gap-3"
                                  >
                                    <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden shrink-0 border border-gray-200">
                                      {product.featuredImage ||
                                      product.images?.[0] ? (
                                        <Image
                                          src={
                                            product.featuredImage ||
                                            product.images?.[0] ||
                                            ""
                                          }
                                          alt={product.title || "Product"}
                                          width={48}
                                          height={48}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                          <Search className="w-4 h-4 text-gray-300" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-gray-800 text-sm group-hover:text-[#5A1E12] transition-colors">
                                        {product.title}
                                      </div>
                                      <div className="text-xs text-[#5A1E12] font-semibold mt-0.5">
                                        ${product.price}
                                      </div>
                                    </div>
                                    <svg
                                      className="w-4 h-4 text-gray-300 group-hover:text-[#5A1E12] transition-colors shrink-0"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                      />
                                    </svg>
                                  </button>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                        {segregatedSearchResults.categories.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 px-5 pt-3 pb-2">
                              <span className="text-[10px] font-bold text-[#5A1E12] uppercase tracking-widest">
                                Categories
                              </span>
                              <div className="flex-1 h-px bg-[#5A1E12]/10" />
                            </div>
                            <div className="px-5 pb-2 flex flex-wrap gap-2">
                              {segregatedSearchResults.categories.map(
                                (category) => (
                                  <button
                                    key={category}
                                    onClick={() =>
                                      handleCategorySelect(category)
                                    }
                                    className="text-xs font-medium px-3 py-1.5 rounded-full border border-[#5A1E12]/20 text-[#5A1E12] hover:bg-[#5A1E12] hover:text-white transition-all"
                                  >
                                    {category}
                                  </button>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                        {segregatedSearchResults.artists.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 px-5 pt-3 pb-2">
                              <span className="text-[10px] font-bold text-[#5A1E12] uppercase tracking-widest">
                                Artists
                              </span>
                              <div className="flex-1 h-px bg-[#5A1E12]/10" />
                            </div>
                            <div className="px-3 pb-2">
                              {segregatedSearchResults.artists.map((artist) => (
                                <button
                                  key={artist}
                                  onClick={() => handleArtistSelect(artist)}
                                  className="w-full text-left px-3 py-3 rounded-xl hover:bg-[#5A1E12]/5 transition-colors group flex items-center gap-3"
                                >
                                  <div className="w-9 h-9 rounded-full bg-[#EAD7B7]/50 flex items-center justify-center shrink-0">
                                    <User className="w-4 h-4 text-[#5A1E12]" />
                                  </div>
                                  <span className="text-sm text-gray-700 group-hover:text-[#5A1E12] font-medium transition-colors flex-1 text-left">
                                    {artist}
                                  </span>
                                  <svg
                                    className="w-4 h-4 text-gray-300 group-hover:text-[#5A1E12] transition-colors shrink-0"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 5l7 7-7 7"
                                    />
                                  </svg>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="p-4 pt-2">
                          <button
                            onClick={() => {
                              closeSearch();
                              router.push(
                                `/shop?search=${encodeURIComponent(searchTerm)}`,
                              );
                            }}
                            className="w-full flex items-center justify-between px-5 py-3 bg-[#5A1E12] hover:bg-[#4a180f] text-white rounded-xl transition-colors text-sm font-semibold"
                          >
                            <span>
                              View all results for &ldquo;{searchTerm}&rdquo;
                            </span>
                            <span className="bg-white/20 text-white text-xs px-2.5 py-1 rounded-full font-bold">
                              {segregatedSearchResults.products.length +
                                segregatedSearchResults.categories.length +
                                segregatedSearchResults.artists.length}
                            </span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="py-14 flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                          <Search className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-base font-medium text-gray-700">
                          No results found
                        </p>
                        <p className="text-sm text-gray-400">
                          Try a different keyword
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="max-h-[55vh] overflow-y-auto py-4">
                    <div className="px-6 pb-3 text-center">
                      <p className="text-sm font-medium text-gray-700">
                        Top suggestions
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Browse popular categories and artists
                      </p>
                    </div>

                    {defaultSearchSuggestions.categories.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 px-5 pt-1 pb-2">
                          <span className="text-[10px] font-bold text-[#5A1E12] uppercase tracking-widest">
                            Top Categories
                          </span>
                          <div className="flex-1 h-px bg-[#5A1E12]/10" />
                        </div>
                        <div className="px-5 pb-2 flex flex-wrap gap-2">
                          {defaultSearchSuggestions.categories.map((category) => (
                            <button
                              key={category}
                              onClick={() => handleCategorySelect(category)}
                              className="text-xs font-medium px-3 py-1.5 rounded-full border border-[#5A1E12]/20 text-[#5A1E12] hover:bg-[#5A1E12] hover:text-white transition-all"
                            >
                              {category}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {defaultSearchSuggestions.artists.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 px-5 pt-3 pb-2">
                          <span className="text-[10px] font-bold text-[#5A1E12] uppercase tracking-widest">
                            Top Artists
                          </span>
                          <div className="flex-1 h-px bg-[#5A1E12]/10" />
                        </div>
                        <div className="px-3 pb-2">
                          {defaultSearchSuggestions.artists.map((artist) => (
                            <button
                              key={artist}
                              onClick={() => handleArtistSelect(artist)}
                              className="w-full text-left px-3 py-3 rounded-xl hover:bg-[#5A1E12]/5 transition-colors group flex items-center gap-3"
                            >
                              <div className="w-9 h-9 rounded-full bg-[#EAD7B7]/50 flex items-center justify-center shrink-0">
                                <User className="w-4 h-4 text-[#5A1E12]" />
                              </div>
                              <span className="text-sm text-gray-700 group-hover:text-[#5A1E12] font-medium transition-colors flex-1 text-left">
                                {artist}
                              </span>
                              <svg
                                className="w-4 h-4 text-gray-300 group-hover:text-[#5A1E12] transition-colors shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {defaultSearchSuggestions.categories.length === 0 &&
                      defaultSearchSuggestions.artists.length === 0 && (
                        <div className="py-8 flex flex-col items-center gap-2 text-center px-6">
                          <div className="w-12 h-12 rounded-full bg-[#EAD7B7]/40 flex items-center justify-center mb-1">
                            <Search className="w-5 h-5 text-[#5A1E12]" />
                          </div>
                          <p className="text-sm font-medium text-gray-600">
                            Search products, categories or artists
                          </p>
                          <p className="text-xs text-gray-400">
                            Type at least 2 characters to see results
                          </p>
                        </div>
                      )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
// header