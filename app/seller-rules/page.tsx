import React from "react";
import type { Metadata } from "next";
import { FaListAlt } from "react-icons/fa";
import VideoHeroSection from "@/components/common-components/VideoHeroSection";

export const metadata: Metadata = {
  title: "Seller Rules & Guidelines",
  description:
    "Rules and guidelines for sellers on the Made in Arnhem Land marketplace including listing standards and seller obligations.",
  alternates: { canonical: "/seller-rules" },
};

export default function SellerRulesPage() {
  return (
    <div className="bg-[#f3e9dd]">

      {/* HERO SECTION */}
      <VideoHeroSection className="min-h-[70vh]">
        <div className="relative z-10 flex flex-col items-center justify-center text-white text-center px-4 py-32 md:py-60">
          <h1 className="text-5xl font-bold mb-2">Guidelines for Seller</h1>
          <p className="text-lg max-w-2xl">
            Made in Arnhem Land Marketplace Quick Seller Guide governing authenticity,
            certification, listings, cultural protocols, and community behaviour.
          </p>
        </div>
      </VideoHeroSection>

      {/* CONTENT SECTION */}
      <div className="flex flex-col md:flex-row gap-10 md:gap-20 pt-10 pb-20 px-6 md:px-16 max-w-screen-2xl mx-auto">

        {/* TABLE OF CONTENTS */}
        <aside className="w-full md:w-64 lg:w-72 h-fit md:sticky md:top-32">

          <h2 className="font-bold mb-4 text-2xl">Table of Contents</h2>

          <ul className="space-y-3 text-gray-800">
            {[
              { id: "introduction", label: "Introduction" },
              { id: "authenticity", label: "1. Authenticity Comes First" },
              { id: "certification", label: "2. Certification Logo Use" },
              { id: "listings", label: "3. Accurate Product Listings" },
              { id: "cultural-protocols", label: "4. Respect Cultural Protocols" },
              { id: "fulfilment", label: "5. Order Fulfilment" },
              { id: "returns", label: "6. Handling Returns and Issues" },
              { id: "community-behaviour", label: "7. Respectful Community Behaviour" },
              { id: "supporting-communities", label: "8. Supporting Arnhem Land Communities" },
            ].map((item) => (
              <li
                key={item.id}
                className="bg-[#D0BFB3] rounded-2xl hover:bg-[#440C03] hover:text-white transition"
              >
                <a
                  href={`#${item.id}`}
                  className="flex items-center gap-3 px-4 py-2"
                >
                  <FaListAlt size={18} />
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1">

          <h1 className="text-3xl font-bold mb-4">
            Made in Arnhem Land Marketplace Guidelines for Seller
          </h1>

          <p className="leading-relaxed mb-12 text-gray-700">
            The Made in Arnhem Land Marketplace exists to support authentic Arnhem Land products,
            artists, and communities. To participate in the marketplace, all sellers must follow
            these simple rules.
          </p>

          {/* 1. AUTHENTICITY */}
          <section id="authenticity" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">1. Authenticity Comes First</h2>
            <p className="leading-relaxed mb-4">
              All products listed on the marketplace must be genuine Arnhem Land products.
            </p>
            <p className="leading-relaxed mb-2 font-medium">This means:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-gray-700">
              <li>created by Arnhem Land Indigenous artists or businesses,</li>
              <li>culturally approved where required,</li>
              <li>respectful of cultural knowledge and stories.</li>
            </ul>
            <p className="leading-relaxed">
              Misrepresenting a product&apos;s origin or cultural meaning is not permitted.
            </p>
          </section>

          {/* 2. CERTIFICATION LOGO USE */}
          <section id="certification" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">2. Certification Logo Use</h2>
            <p className="leading-relaxed mb-4">
              The 100% Arnhem Land Certification logo may only be used on products that have
              been officially certified.
            </p>
            <p className="leading-relaxed mb-2 font-medium">You must not:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-gray-700">
              <li>place the logo on non-certified items</li>
              <li>alter the logo design</li>
              <li>use the logo in misleading marketing</li>
            </ul>
            <p className="leading-relaxed">
              Misuse of the certification mark may lead to removal from the platform.
            </p>
          </section>

          {/* 3. ACCURATE PRODUCT LISTINGS */}
          <section id="listings" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">3. Accurate Product Listings</h2>
            <p className="leading-relaxed mb-4">
              Your product listings must be clear and honest.
            </p>
            <p className="leading-relaxed mb-2 font-medium">Listings must include:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-gray-700">
              <li>accurate product descriptions</li>
              <li>artist or maker information (where applicable)</li>
              <li>correct pricing</li>
              <li>clear images of the product</li>
            </ul>
            <p className="leading-relaxed">
              Buyers should understand exactly what they are purchasing.
            </p>
          </section>

          {/* 4. CULTURAL PROTOCOLS */}
          <section id="cultural-protocols" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">4. Respect Cultural Protocols</h2>
            <p className="leading-relaxed mb-4">
              Some cultural stories, symbols, and designs are restricted.
            </p>
            <p className="leading-relaxed mb-2 font-medium">Sellers must ensure:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-gray-700">
              <li>appropriate cultural permission exists</li>
              <li>sacred or restricted knowledge is not shared publicly</li>
              <li>community protocols are respected</li>
            </ul>
            <p className="leading-relaxed">
              The marketplace reserves the right to remove listings that breach cultural protocols.
            </p>
          </section>

          {/* 5. ORDER FULFILMENT */}
          <section id="fulfilment" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">5. Order Fulfilment</h2>
            <p className="leading-relaxed mb-4">
              Sellers are responsible for fulfilling orders placed through the marketplace.
            </p>
            <p className="leading-relaxed mb-2 font-medium">Sellers should:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-gray-700">
              <li>dispatch orders within the timeframe listed</li>
              <li>communicate with buyers regarding shipping</li>
              <li>
                share tracking under seller login to advise the customer as soon as an order
                is dispatched
              </li>
            </ul>
            <p className="leading-relaxed">
              Reliable fulfilment helps maintain trust in the marketplace.
            </p>
          </section>

          {/* 6. RETURNS AND ISSUES */}
          <section id="returns" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">6. Handling Returns and Issues</h2>
            <p className="leading-relaxed mb-4">
              If a buyer raises a concern, sellers should respond promptly and work toward a
              fair resolution.
            </p>
            <p className="leading-relaxed mb-2 font-medium">Issues may include:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-gray-700">
              <li>damaged items</li>
              <li>incorrect products</li>
              <li>delivery issues</li>
            </ul>
            <p className="leading-relaxed">
              The marketplace may assist with dispute resolution where needed.
            </p>
          </section>

          {/* 7. COMMUNITY BEHAVIOUR */}
          <section id="community-behaviour" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">7. Respectful Community Behaviour</h2>
            <p className="leading-relaxed mb-4">
              The marketplace is a shared cultural platform.
            </p>
            <p className="leading-relaxed mb-2 font-medium">All sellers must act respectfully toward:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-gray-700">
              <li>artists</li>
              <li>communities</li>
              <li>buyers</li>
              <li>other sellers</li>
            </ul>
            <p className="leading-relaxed">
              Harassment, discrimination, or culturally disrespectful behaviour will not be tolerated.
            </p>
          </section>

          {/* 8. SUPPORTING COMMUNITIES */}
          <section id="supporting-communities" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">8. Supporting Arnhem Land Communities</h2>
            <p className="leading-relaxed mb-4">
              This marketplace exists to support Arnhem Land. By selling on this platform you
              agree to support:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-gray-700">
              <li>community benefit</li>
              <li>ethical trade</li>
              <li>cultural integrity</li>
            </ul>
            <p className="leading-relaxed">
              Together we help ensure Arnhem Land culture, art, and businesses continues to thrive.
            </p>
          </section>

          {/* QUESTIONS */}
          <section id="introduction" className="scroll-mt-32 mb-8 bg-[#440C03]/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-3">Questions?</h2>
            <p className="leading-relaxed text-gray-700">
              Contact the marketplace team at:{" "}
              <a
                href="/contact-us"
                className="text-[#440C03] font-semibold underline hover:text-[#7a1a06] transition-colors"
              >
                Contact Us
              </a>
            </p>
          </section>

        </main>
      </div>
    </div>
  );
}
