// app/examples/ReactQueryExample.tsx
"use client";

import { useCoupons } from "@/hooks/useCoupons";
import { useUser } from "@/hooks/useAuth";

export default function ReactQueryExample() {
  // Example 1: Fetch user data
  const { data: user, isLoading: userLoading, error: userError } = useUser();

  // Example 2: Fetch coupons
  const { 
    data: coupons = [], 
    isLoading: couponsLoading, 
    error: couponsError, 
    refetch: refetchCoupons 
  } = useCoupons();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">React Query Example</h1>

      {/* User Data Example */}
      <div className="mb-8 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-3">User Data (Cached)</h2>
        {userLoading && <p>Loading user...</p>}
        {userError && <p className="text-red-500">Error: {userError.message}</p>}
        {user && (
          <div>
            <p><strong>Name:</strong> {user.user.name}</p>
            <p><strong>Email:</strong> {user.user.email}</p>
            <p><strong>Role:</strong> {user.user.role || "user"}</p>
          </div>
        )}
        {!userLoading && !user && !userError && (
          <p className="text-gray-500">Not logged in</p>
        )}
      </div>

      {/* Coupons Data Example */}
      <div className="mb-8 p-4 border rounded-lg">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold">Coupons Data (Cached)</h2>
          <button 
            onClick={() => refetchCoupons()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={couponsLoading}
          >
            {couponsLoading ? "Loading..." : "Refetch"}
          </button>
        </div>
        
        {couponsLoading && <p>Loading coupons...</p>}
        {couponsError && <p className="text-red-500">Error: {couponsError.message}</p>}
        {coupons.length > 0 && (
          <div className="grid gap-2">
            {coupons.map((coupon) => (
              <div key={coupon.id || coupon._id} className="p-3 bg-gray-50 rounded">
                <p><strong>{coupon.code}</strong></p>
                <p className="text-sm text-gray-600">{coupon.description || coupon.discount || "No description"}</p>
              </div>
            ))}
          </div>
        )}
        {!couponsLoading && coupons.length === 0 && !couponsError && (
          <p className="text-gray-500">No coupons available or not logged in</p>
        )}
      </div>

      {/* Benefits Explanation */}
      <div className="p-4 bg-green-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-3 text-green-800">Benefits You're Getting:</h2>
        <ul className="list-disc list-inside space-y-2 text-green-700">
          <li><strong>Caching:</strong> Data is cached for 5-15 minutes, reducing API calls</li>
          <li><strong>Background Refetching:</strong> Data is automatically refreshed when stale</li>
          <li><strong>Error Handling:</strong> Built-in error states and retry logic</li>
          <li><strong>Loading States:</strong> Easy loading indicators</li>
          <li><strong>Manual Refetch:</strong> Refresh data on demand</li>
          <li><strong>Automatic Cleanup:</strong> Old cached data is automatically cleaned up</li>
          <li><strong>SSR Safe:</strong> Works correctly with Next.js server-side rendering</li>
        </ul>
      </div>
    </div>
  );
}