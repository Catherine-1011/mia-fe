// app/examples/OptimisticUpdatesDemo.tsx
"use client";

import { useState } from "react";
import { ShoppingCart, Heart, Loader2, CheckCircle, XCircle } from "lucide-react";

export default function OptimisticUpdatesDemo() {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Simulate optimistic cart add
  const simulateAddToCart = () => {
    // Immediate UI update (optimistic)
    setCartCount(prev => prev + 1);
    setIsAddingToCart(true);

    // Simulate API delay
    setTimeout(() => {
      setIsAddingToCart(false);
      // In real world, if API fails, we'd revert the count
    }, 2000);
  };

  // Simulate optimistic wishlist toggle
  const simulateWishlistToggle = () => {
    // Immediate UI update (optimistic)
    setIsWishlisted(prev => !prev);
    setIsTogglingWishlist(true);

    // Simulate API delay
    setTimeout(() => {
      setIsTogglingWishlist(false);
      // In real world, if API fails, we'd revert the wishlist state
    }, 2000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🚀 Optimistic Updates Demo</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Before: Slow UX */}
        <div className="p-6 border border-red-200 rounded-lg bg-red-50">
          <h2 className="text-xl font-semibold mb-4 text-red-800">❌ Before: Slow UX</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-red-700">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>User clicks "Add to Cart"</span>
            </div>
            <div className="flex items-center gap-2 text-red-700">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading spinner shows...</span>
            </div>
            <div className="flex items-center gap-2 text-red-700">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Waiting 2 seconds for API...</span>
            </div>
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span>Finally shows updated cart count</span>
            </div>
          </div>
          <p className="text-sm text-red-600 mt-3">
            <strong>Result:</strong> User waits 2 seconds, feels like the app is slow
          </p>
        </div>

        {/* After: Fast UX */}
        <div className="p-6 border border-green-200 rounded-lg bg-green-50">
          <h2 className="text-xl font-semibold mb-4 text-green-800">✅ After: Instant UX</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span>User clicks "Add to Cart"</span>
            </div>
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span>Cart count updates INSTANTLY</span>
            </div>
            <div className="flex items-center gap-2 text-green-700">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>API processes in background...</span>
            </div>
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span>Confirmed when API completes</span>
            </div>
          </div>
          <p className="text-sm text-green-600 mt-3">
            <strong>Result:</strong> User sees instant feedback, app feels fast!
          </p>
        </div>
      </div>

      {/* Interactive Demo */}
      <div className="p-6 border border-blue-200 rounded-lg bg-blue-50">
        <h2 className="text-xl font-semibold mb-4 text-blue-800">🎮 Try It Yourself</h2>
        
        <div className="flex items-center gap-6 mb-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            <span className="font-medium">Cart: {cartCount} items</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Heart className={`h-5 w-5 ${isWishlisted ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
            <span className="font-medium">Wishlist: {isWishlisted ? 'Added' : 'Not added'}</span>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={simulateAddToCart}
            disabled={isAddingToCart}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isAddingToCart ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </>
            )}
          </button>

          <button
            onClick={simulateWishlistToggle}
            disabled={isTogglingWishlist}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isWishlisted 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-gray-600 text-white hover:bg-gray-700'
            } disabled:opacity-50`}
          >
            {isTogglingWishlist ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
                {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </>
            )}
          </button>
        </div>

        <p className="text-sm text-blue-600 mt-4">
          <strong>Notice:</strong> The UI updates instantly when you click, even though the "API" takes 2 seconds to respond!
        </p>
      </div>

      {/* What Changed */}
      <div className="mt-8 p-6 border border-gray-200 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">🔧 What We Implemented</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-green-700 mb-2">✅ Optimistic Updates</h3>
            <ul className="text-sm space-y-1 text-gray-600">
              <li>• Instant UI feedback on user actions</li>
              <li>• Cart count updates immediately</li>
              <li>• Wishlist state changes instantly</li>
              <li>• Loading indicators show API progress</li>
              <li>• Auto-rollback if API fails</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-blue-700 mb-2">🚀 Performance Benefits</h3>
            <ul className="text-sm space-y-1 text-gray-600">
              <li>• 0ms perceived response time</li>
              <li>• Better user experience</li>
              <li>• Reduced loading states</li>
              <li>• Background API processing</li>
              <li>• Automatic error handling</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}