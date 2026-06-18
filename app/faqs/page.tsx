"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import VideoHeroSection from "@/components/common-components/VideoHeroSection";
import type { Metadata } from "next";

// ─── FAQ Data ────────────────────────────────────────────────────────────────
const SECTIONS = [
  {
    label: "Section A — Buying on the Marketplace",
    items: [
      {
        question: "A1. What is the Made in Arnhem Land Marketplace?",
        answer:
          "The Made in Arnhem Land Marketplace is an online platform that connects buyers with authentic products made by Aboriginal artists, artisans, and businesses from Arnhem Land in the Northern Territory of Australia.\n\nEvery product on the platform has been reviewed to ensure it meets our standards for authenticity, cultural integrity, and quality. When you shop with us, you are buying directly from the communities, families, and creators behind each piece, and your purchase contributes directly to the economic and cultural wellbeing of Arnhem Land.",
      },
      {
        question: "A2. Are all products authentic?",
        answer:
          "Yes. Authenticity is the foundation of this marketplace. All sellers are vetted before their accounts are approved, and every product listing is reviewed by our team before it becomes visible on the platform.\n\nSellers who have completed our certification process are permitted to display the 100% Made in Arnhem Land certification logo. This mark is your guarantee that the product was created by Indigenous artists or businesses under proper cultural authority. For more information, visit our Certification page.",
      },
      {
        question: "A3. What payment methods do you accept?",
        answer:
          "We accept all major credit and debit cards including Visa and Mastercard, processed securely through Stripe. No card details are stored on our platform, and all payment processing is handled by Stripe's secure infrastructure.",
      },
      {
        question: "A4. How long will my order take to arrive?",
        answer:
          "Delivery timeframes depend on the individual seller, the product type, and your delivery location. Sellers set their own processing timeframes.\n\nAs a general guide, orders within Australia typically arrive within 5 to 10 business days. Remote or regional locations, including parts of the Northern Territory, may take longer. International orders are subject to customs processing and Australia Post schedules.\n\nPlease note that some products, particularly hand-crafted artworks, may have longer processing times as they are made to order. This will be stated in the product listing.",
      },
      {
        question: "A5. Can I track my order?",
        answer:
          "Yes. Once your order has been dispatched, your seller will provide tracking information through the platform where available. You can use the Track My Order tool on our website — just enter your Order ID and the email address used for placing the order.\n\nIf you have an account, you can also view your order status by logging in and navigating to your Orders page under your account.",
      },
      {
        question: "A6. Do you ship internationally?",
        answer:
          "International shipping availability varies by seller and product. Where a seller offers international shipping, this will be shown at checkout. Delivery timeframes for international orders are estimates and may be affected by customs processing in the destination country.\n\nPlease note that buyers are responsible for any customs duties, taxes, or import fees imposed by their country. The marketplace and sellers have no control over customs processes and cannot be held responsible for delays or charges incurred.",
      },
      {
        question: "A7. What is your return and refund policy?",
        answer:
          "All purchases on the Made in Arnhem Land Marketplace are covered by Australian Consumer Law. If a product is faulty, not as described, or undelivered, you are entitled to a refund, replacement, or repair from the seller.\n\nTo request a refund, visit our Refund Policy page and use the refund request form. You will need your Order ID and the email address used at checkout. We aim to acknowledge all requests within 3 business days.\n\nChange-of-mind returns are at each seller's discretion and are not automatically available on all products. Full details are set out in our Refund Policy.",
      },
      {
        question: "A8. How does my purchase benefit local communities?",
        answer:
          "In several important ways. By purchasing directly from First Nations sellers and artists, you ensure that the economic value of their work stays in the hands of the creators and their communities.\n\nThese purchases support training, enterprise development, cultural preservation, and mentoring programs across Arnhem Land.\n\nBy choosing certified products, you actively signal to the market that authentic, community-approved Aboriginal goods are valued — helping combat the widespread problem of inauthentic 'Indigenous-style' products that divert income away from real artists.",
      },
      {
        question: "A9. How do I contact the marketplace if I have a problem with my order?",
        answer:
          "If you have an issue with your order, we recommend first reaching out to your seller directly. Most issues are resolved quickly this way.\n\nIf you cannot reach a resolution with your seller, our team is here to help. Use the Contact Us page to submit an enquiry, select 'Customer Order Support' from the issue type menu, and include your Order ID so we can assist you promptly. We aim to respond as quickly as possible.",
      },
    ],
  },
  {
    label: "Section B — Selling on the Marketplace",
    items: [
      {
        question: "B1. Who can sell on the Made in Arnhem Land Marketplace?",
        answer:
          "The marketplace is open to individuals, businesses, and community organisations that meet our eligibility requirements. To become a seller, you must:\n\n• Hold a valid Australian Business Number (ABN)\n• Be an Arnhem Land Aboriginal artist, artisan, business, or community enterprise — or a partner organisation operating under a culturally appropriate agreement\n• Agree to our Terms and Conditions and Seller Guidelines\n• Submit accurate registration information and pass our identity verification process",
      },
      {
        question: "B2. How do I register as a seller?",
        answer:
          "Click 'Become a Seller' on our website to start the onboarding process. You will be asked to provide:\n\n• Your contact details and ABN\n• Your business or community organisation information\n• Your store name and profile\n• Banking details for payouts via Stripe Connect\n• Agreement to our Seller Terms & Conditions\n\nOnce submitted, our team will review your application and be in touch. If approved, you can begin uploading product listings, each of which will be reviewed before appearing on the marketplace.",
      },
      {
        question: "B3. How much does it cost to sell?",
        answer:
          "A sales commission is charged on each successful sale, deducted at the time of order confirmation. For a current fee schedule, please visit our Fees & Commission page or contact our Seller Support team.",
      },
      {
        question: "B4. How does product approval work?",
        answer:
          "After uploading a product listing, it enters a review queue. Our team checks each listing to ensure it meets our standards for authenticity, accurate description, cultural appropriateness, and image quality before it becomes visible to buyers.\n\nMost listings are reviewed within 2 to 3 business days. You will be notified through the dashboard and email when your listing is approved, or if any changes are requested.",
      },
      {
        question: "B5. Can I use the 100% Made in Arnhem Land logo on my products?",
        answer:
          "Only certified sellers may use the 100% Made in Arnhem Land certification logo, and only on products that have been officially certified. Using the logo on non-certified products or modifying the logo design is strictly prohibited and may result in account suspension.\n\nTo apply for certification, visit our Certification page. The process involves submitting an application and supporting cultural endorsements, which are reviewed by our certification team.",
      },
      {
        question: "B6. How and when do I get paid?",
        answer:
          "All seller payouts are processed through Stripe Connect, our secure payment platform. Once an order is processed and any applicable dispute window closes, funds are released to your nominated bank account.\n\nFor payment enquiries, contact our Seller Support team.",
      },
      {
        question: "B7. What if a buyer wants to return a product?",
        answer:
          "Sellers are required to comply with Australian Consumer Law on all returns. If a product is faulty, not as described, or undelivered, you must offer a refund, replacement, or repair as appropriate.\n\nIf a buyer raises a return request through the platform, respond promptly through your seller dashboard. If a resolution cannot be reached directly with the buyer, our support team will facilitate mediation. For full details, see our Refund Policy and Seller Guidelines.",
      },
      {
        question: "B8. How do I handle shipping?",
        answer:
          "Sellers are responsible for managing their own fulfilment and shipping. Products can be shipped via Australia Post, and charges are based on the standard pricing table available on their website.\n\nWe recommend providing tracking information wherever possible and communicating proactively with buyers about dispatch status. For full guidance, see our Shipping Policy and Seller Guidelines.",
      },
      // {
      //   question: "B9. Can I manage my store inventory from a mobile device?",
      //   answer:
      //     "Our seller dashboard is designed to be mobile-responsive, allowing you to manage your store from a smartphone or tablet. You can add and update product listings, track active orders, and review customer enquiries on the go.",
      // },
    ],
  },
  {
    label: "Section C — General",
    items: [
      {
        question: "C1. How do I create an account?",
        answer:
          "Click 'Create Account' in the top navigation or on the Login page. You will need to provide your name, email address, and a mobile number to register. Once your account is created, you can track orders, manage returns, and save your favourite products.",
      },
      {
        question: "C2. I have forgotten my password. What do I do?",
        answer:
          "Click 'Login' and then select 'Forgot Password'. Enter the email address associated with your account and we will send you a link to reset your password. If you do not receive the email within a few minutes, please check your spam or junk folder.",
      },
      {
        question: "C3. Is my personal information secure?",
        answer:
          "Yes. The Made in Arnhem Land Marketplace takes your privacy seriously and is committed to protecting your personal information in accordance with the Privacy Act 1988 and the Australian Privacy Principles.\n\nAll payment processing is handled by Stripe, which is PCI-DSS compliant. We do not store your card details. For more details on how we collect, use, and protect your information, see our Privacy Policy.",
      },
      {
        question: "C4. How do I unsubscribe from your newsletter?",
        answer:
          "You can unsubscribe at any time by clicking the 'Unsubscribe' link at the bottom of any newsletter email you receive from us. You can also contact us directly via the Contact Us page to request removal from our mailing list. Requests will be actioned within a reasonable timeframe.",
      },
      {
        question: "C5. I have a media or partnership enquiry. Who should I contact?",
        answer:
          "For media enquiries, partnership opportunities, or cultural collaboration enquiries, please send us an email via the information shared on our Media / Press page.",
      },
      {
        question: "C6. Something looks wrong on the website. How do I report it?",
        answer:
          "We appreciate your help in keeping the platform running well. If you spot a broken link, incorrect information, or any other issue, please contact us via the Contact Us page and select 'General Enquiry'. Describe the issue and the page you found it on, and our team will investigate promptly.",
      },
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function FAQsPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggle = (key: string) => setOpenIndex(openIndex === key ? null : key);

  return (
    <div className="bg-[#f3e9dd]">

      {/* HERO */}
      <VideoHeroSection className="min-h-[70vh]">
        <div className="relative z-10 flex flex-col items-center justify-center text-white text-center px-4 py-32 md:py-60">
          <h1 className="text-5xl font-bold mb-2">Frequently Asked Questions</h1>
          <p className="text-lg max-w-2xl">
            Find answers to some of the most common questions about buying and selling on the Made in Arnhem Land Marketplace.
          </p>
        </div>
      </VideoHeroSection>

      {/* CONTENT */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pb-24">

        {SECTIONS.map((section) => (
          <div key={section.label} className="mb-14">

            {/* Section heading */}
            <h2 className="text-2xl font-bold text-[#3b0f06] mb-6 pb-3 border-b-2 border-[#3b0f06]/20">
              {section.label}
            </h2>

            {/* Accordion items */}
            <div className="grid grid-cols-1 gap-4">
              {section.items.map((faq, index) => {
                const key = `${section.label}-${index}`;
                const isOpen = openIndex === key;
                return (
                  <div
                    key={key}
                    className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all duration-300 ${
                      isOpen
                        ? "border-[#3b0f06]/40 shadow-md"
                        : "border-gray-100 hover:border-[#3b0f06]/20"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggle(key)}
                      className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                    >
                      <h3
                        className={`font-bold text-base leading-snug transition-colors pr-4 ${
                          isOpen ? "text-[#3b0f06]" : "text-gray-800"
                        }`}
                      >
                        {faq.question}
                      </h3>
                      <ChevronDown
                        className={`w-5 h-5 shrink-0 text-[#3b0f06] transition-transform duration-300 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <div
                      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="px-6 pb-6 text-gray-600 text-sm leading-relaxed space-y-3">
                          {faq.answer.split("\n\n").map((para, i) => (
                            <p key={i} className="whitespace-pre-line">{para}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}
