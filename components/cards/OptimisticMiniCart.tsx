// // app/components/cards/OptimisticMiniCart.tsx
// "use client";

// import Image from "next/image";
// import { X, Plus, Minus, ShoppingBag } from "lucide-react";
// import { useCart } from "@/context/CartContext";
// import { useOptimisticUpdateCart, useOptimisticRemoveFromCart } from "@/hooks/useCartMutations";
// import { useRouter } from "next/navigation";
// import { useEffect } from "react";

// export default function OptimisticMiniCart({ onClose }: { onClose: () => void }) {
//   const { cartItems, subtotal } = useCart();
//   const updateCartMutation = useOptimisticUpdateCart();
//   const removeCartMutation = useOptimisticRemoveFromCart();
//   const router = useRouter();

//   useEffect(() => {
//     const handlePopState = () => onClose();
//     window.addEventListener("popstate", handlePopState);
//     return () => window.removeEventListener("popstate", handlePopState);
//   }, [onClose]);

//   const navigate = (path: string) => {
//     onClose();
//     router.push(path);
//   };

//   // Instant quantity update
//   const handleQuantityChange = (productId: string, change: number) => {
//     updateCartMutation.mutate({ productId, change });
//   };

//   // Instant remove
//   const handleRemove = (productId: string) => {
//     removeCartMutation.mutate(productId);
//   };

//   return (
//     <div className="fixed inset-y-0 right-0 -top-5 pb-5 w-full sm:w-110 bg-linear-to-b from-white to-gray-50 z-50 flex flex-col shadow-2xl">
      
//       {/* HEADER */}
//       <div className="relative bg-linear-to-r from-[#440C03] to-[#6F433A] px-6 py-6">
//         <button
//           onClick={onClose}
//           className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
//           aria-label="Close cart"
//         >
//           <X size={20} />
//         </button>
        
//         <div className="flex items-center gap-3 text-white">
//           <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
//             <ShoppingBag size={24} />
//           </div>
//           <div>
//             <h2 className="text-2xl font-bold">Shopping Cart</h2>
//             <p className="text-white/80 text-sm mt-0.5">
//               {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* CONTENT */}
//       <div className="flex-1 overflow-y-auto px-6 py-6">
//         {cartItems.length === 0 ? (
//           <div className="h-full flex flex-col items-center justify-center text-center">
//             <div className="w-32 h-32 mb-6 bg-gray-100 rounded-full flex items-center justify-center">
//               <ShoppingBag size={48} className="text-gray-300" />
//             </div>
//             <h3 className="text-xl font-semibold text-gray-800 mb-2">Your cart is empty</h3>
//             <p className="text-gray-500 mb-8 max-w-xs">
//               Discover amazing products and start adding them to your cart
//             </p>
//             <button
//               onClick={() => navigate("/shop")}
//               className="px-8 py-3.5 bg-linear-to-r from-[#440C03] to-[#6F433A] text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium"
//             >
//               Explore Products
//             </button>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             {cartItems.map((item) => (
//               <div
//                 key={item.cartId || item.id}
//                 className="group relative bg-white p-4 rounded-2xl border border-gray-200 hover:border-[#A48068] hover:shadow-md transition-all duration-200"
//               >
//                 <div className="flex gap-4">
//                   {/* IMAGE */}
//                   <div 
//                     className="relative w-24 h-28 rounded-xl overflow-hidden bg-gray-50 shrink-0 cursor-pointer group-hover:scale-[1.02] transition-transform"
//                     onClick={() => navigate(`/shop/${item.slug || item.id}`)}
//                   >
//                     <Image
//                       src={item.image || "/images/placeholder.png"}
//                       alt={item.name}
//                       fill
//                       className="object-cover"
//                       sizes="96px"
//                     />
//                   </div>

//                   {/* INFO */}
//                   <div className="flex-1 min-w-0">
//                     <h3
//                       className="font-semibold text-gray-900 text-base sm:text-lg mb-1 line-clamp-2 cursor-pointer hover:text-[#440C03] transition-colors"
//                       onClick={() => navigate(`/shop/${item.slug || item.id}`)}
//                     >
//                       {item.name}
//                     </h3>

//                     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3">
//                       {/* PRICE */}
//                       <div className="flex items-center gap-3">
//                         <span className="font-bold text-lg text-[#440C03]">
//                           ${(item.price * item.qty).toFixed(2)}
//                         </span>
//                         <span className="text-sm text-gray-500">
//                           ${item.price.toFixed(2)} each
//                         </span>
//                       </div>

//                       {/* QUANTITY CONTROLS */}
//                       <div className="flex items-center gap-3">
//                         <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
//                           <button
//                             onClick={() => handleQuantityChange(item.id, -1)}
//                             className="p-2 hover:bg-white rounded-full transition-colors active:scale-90"
//                             aria-label="Decrease quantity"
//                           >
//                             <Minus size={14} className="text-gray-600" />
//                           </button>

//                           <span className="min-w-8 text-center font-semibold text-gray-900">
//                             {item.qty}
//                           </span>

//                           <button
//                             onClick={() => handleQuantityChange(item.id, 1)}
//                             disabled={item.qty >= (item.stock || 50)}
//                             className="p-2 hover:bg-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-90"
//                             aria-label="Increase quantity"
//                           >
//                             <Plus size={14} className="text-gray-600" />
//                           </button>
//                         </div>

//                         <button
//                           onClick={() => handleRemove(item.id)}
//                           className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors active:scale-90"
//                           aria-label="Remove item"
//                         >
//                           <X size={16} />
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* FOOTER */}
//       {cartItems.length > 0 && (
//         <div className="border-t border-gray-200 px-6 py-6 bg-white">
//           <div className="flex items-center justify-between mb-4">
//             <span className="text-lg font-medium text-gray-700">Subtotal</span>
//             <span className="text-2xl font-bold text-[#440C03]">
//               ${subtotal.toFixed(2)}
//             </span>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//             <button
//               onClick={() => navigate("/shop/cart")}
//               className="w-full py-3.5 border-2 border-[#440C03] text-[#440C03] rounded-xl font-medium hover:bg-[#440C03] hover:text-white transition-all duration-200 active:scale-95"
//             >
//               View Cart
//             </button>
//             <button
//               onClick={() => navigate("/shop/cart/checkout")}
//               className="w-full py-3.5 bg-[#440C03] text-white rounded-xl font-medium hover:bg-[#5A1E12] transform hover:scale-[1.02] transition-all duration-200 shadow-lg active:scale-95"
//             >
//               Checkout
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// app/components/cards/OptimisticMiniCart.tsx
"use client";

import Image from "next/image";
import { X, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useOptimisticUpdateCart, useOptimisticRemoveFromCart } from "@/hooks/useCartMutations";
import { useDebouncedMutation } from "@/hooks/useDebouncedMutation";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OptimisticMiniCart({ onClose }: { onClose: () => void }) {
  const { cartItems, subtotal } = useCart();
  const updateCartMutation = useOptimisticUpdateCart();
  // Debounced version for quantity changes
  const debouncedUpdateCartMutation = useDebouncedMutation(
    updateCartMutation.mutateAsync,
    400 // ms debounce
  );
  const removeCartMutation = useOptimisticRemoveFromCart();
  const router = useRouter();

  useEffect(() => {
    const handlePopState = () => onClose();
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [onClose]);

  const navigate = (path: string) => {
    onClose();
    router.push(path);
  };

  // Debounced quantity update
  const handleQuantityChange = (productId: string, change: number) => {
    debouncedUpdateCartMutation.debouncedMutate({ productId, change });
  };

  // Instant remove
  const handleRemove = (productId: string) => {
    removeCartMutation.mutate(productId);
  };

  return (
    <div className="relative w-full h-full bg-linear-to-b from-white to-gray-50 flex flex-col shadow-2xl overflow-hidden">
      
      {/* HEADER */}
      <div className="relative bg-linear-to-r from-[#440C03] to-[#6F433A] px-6 py-6 shrink-0">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          aria-label="Close cart"
        >
          <X size={20} />
        </button>
        
        <div className="flex items-center gap-3 text-white">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
            <ShoppingBag size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Shopping Cart</h2>
            <p className="text-white/80 text-sm mt-0.5">
              {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
            </p>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-6">
        {cartItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-32 h-32 mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <ShoppingBag size={48} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-8 max-w-xs">
              Discover amazing products and start adding them to your cart
            </p>
            <button
              onClick={() => navigate("/shop")}
              className="px-8 py-3.5 bg-linear-to-r from-[#440C03] to-[#6F433A] text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium"
            >
              Explore Products
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.cartId || item.id}
                className="group relative bg-white p-4 rounded-2xl border border-gray-200 hover:border-[#A48068] hover:shadow-md transition-all duration-200"
              >
                <div className="flex gap-4">
                  {/* IMAGE */}
                  <div 
                    className="relative w-20 h-24 rounded-xl overflow-hidden bg-gray-50 shrink-0 cursor-pointer group-hover:scale-[1.02] transition-transform"
                    onClick={() => navigate(`/shop/${item.name ? item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : `product-${item.id}`}`)}
                  >
                    <Image
                      src={item.image || "/images/placeholder.png"}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>

                  {/* INFO */}
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-semibold text-gray-900 text-sm line-clamp-2 cursor-pointer hover:text-[#440C03] transition-colors"
                      onClick={() => navigate(`/shop/${item.name ? item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : `product-${item.id}`}`)}
                    >
                      {item.name}
                    </h3>

                    <div className="flex flex-col gap-2 mt-2">
                      {/* PRICE */}
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-[#440C03]">
                          ${(item.price * item.qty).toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-500">
                          ${item.price.toFixed(2)} each
                        </span>
                      </div>

                      {/* QUANTITY CONTROLS */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
                          <button
                            onClick={() => handleQuantityChange(item.id, -1)}
                            className="p-1.5 hover:bg-white rounded-full transition-colors active:scale-90"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={14} className="text-gray-600" />
                          </button>

                          <span className="min-w-8 text-center font-semibold text-sm text-gray-900">
                            {item.qty}
                          </span>

                          <button
                            onClick={() => handleQuantityChange(item.id, 1)}
                            disabled={item.qty >= (item.stock || 50)}
                            className="p-1.5 hover:bg-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-90"
                            aria-label="Increase quantity"
                          >
                            <Plus size={14} className="text-gray-600" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemove(item.id)}
                          className="p-1.5 absolute top-3 right-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors active:scale-90"
                          aria-label="Remove item"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}
      {cartItems.length > 0 && (
        <div className="border-t border-gray-200 px-6 py-6 bg-white shrink-0">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-medium text-gray-700">Subtotal</span>
            <span className="text-2xl font-bold text-[#440C03]">
              ${subtotal.toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => navigate("/cart")}
              className="w-full py-3.5 border-2 border-[#440C03] text-[#440C03] rounded-xl font-medium hover:bg-[#440C03] hover:text-white transition-all duration-200 active:scale-95"
            >
              View Cart
            </button>
            <button
              onClick={() => navigate("/checkout")}
              className="w-full py-3.5 bg-[#440C03] text-white rounded-xl font-medium hover:bg-[#5A1E12] transform hover:scale-[1.02] transition-all duration-200 shadow-lg active:scale-95"
            >
              Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}