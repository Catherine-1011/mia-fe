'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const baseURL = 'https://backend.madeinarnhemland.com.au';

export default function StripeCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'processing' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const processCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state'); // userId
      const error = params.get('error');

      // Seller cancelled or denied
      if (error) {
        router.push('/sellerOnboarding?stripe_error=cancelled');
        return;
      }

      if (!code || !state) {
        router.push('/sellerOnboarding?stripe_error=missing_params');
        return;
      }

      try {
        const res = await fetch(
          `${baseURL}/api/seller-onboarding/stripe/oauth-callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`
        );
        const data = await res.json();

        if (data.success) {
          // Connected successfully — return to onboarding step 6
          router.push('/sellerOnboarding?connected=1');
        } else {
          setStatus('error');
          setErrorMessage(data.message || 'Failed to connect Stripe account.');
        }
      } catch {
        setStatus('error');
        setErrorMessage('A server error occurred. Please try again.');
      }
    };

    processCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF3E8] px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
        {status === 'processing' ? (
          <>
            <div className="w-10 h-10 border-4 border-[#5A1E12] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[#5A1E12] font-semibold text-lg">Connecting your Stripe account…</p>
            <p className="text-[#5A1E12]/60 text-sm mt-2">Please wait, this only takes a moment.</p>
          </>
        ) : (
          <>
            <p className="text-red-700 font-semibold text-lg mb-2">Connection failed</p>
            <p className="text-red-600 text-sm mb-6">{errorMessage}</p>
            <button
              onClick={() => router.push('/sellerOnboarding')}
              className="px-6 py-2.5 bg-[#5A1E12] text-white rounded-xl font-semibold hover:bg-[#4a180f] transition-colors"
            >
              Back to Onboarding
            </button>
          </>
        )}
      </div>
    </div>
  );
}
