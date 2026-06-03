import React from "react";
import { FaFileInvoiceDollar } from "react-icons/fa";
import VideoHeroSection from "@/components/common-components/VideoHeroSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fees & Commission | Made in Arnhem Land Marketplace",
};

export default function FeesAndCommissionPage() {
  return (
    <div className="bg-[#f3e9dd]">

      {/* HERO SECTION */}
      <VideoHeroSection className="min-h-[70vh]">
        <div className="relative z-10 flex flex-col items-center justify-center text-white text-center px-4 py-32 md:py-60">
          <h1 className="text-5xl font-bold mb-2">Fees &amp; Commission</h1>
          <p className="text-lg max-w-2xl">
            Transparent pricing for sellers on the Made in Arnhem Land Marketplace — know exactly what you keep from every sale.
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
              { id: "overview", label: "Overview" },
              { id: "platform-commission", label: "Platform Commission" },
              { id: "how-commission-works", label: "How Commission Works" },
              { id: "shipping", label: "Shipping & Handling" },
              { id: "payment-processing", label: "Payment Processing (Stripe)" },
              { id: "seller-payout", label: "What Sellers Receive" },
              { id: "example", label: "Worked Example" },
              { id: "faq", label: "FAQs" },
              { id: "contact", label: "Contact Us" },
            ].map((item) => (
              <li
                key={item.id}
                className="bg-[#D0BFB3] rounded-2xl hover:bg-[#440C03] hover:text-white transition"
              >
                <a href={`#${item.id}`} className="flex items-center gap-3 px-4 py-2">
                  <FaFileInvoiceDollar size={18} />
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1">
          <h1 className="text-3xl font-bold mb-8">
            Made in Arnhem Land Marketplace — Fees &amp; Commission
          </h1>
          {/* <p className="text-gray-500 text-sm mb-10">Last updated: June 2026</p> */}

          {/* OVERVIEW */}
          <section id="overview" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">Overview</h2>
            <p className="leading-relaxed mb-4">
              Made in Arnhem Land Marketplace is committed to supporting Indigenous Australian artists and
              sellers with a fair, transparent fee structure. We keep our platform fees simple so you always
              know what you earn before you list a product.
            </p>
            <p className="leading-relaxed">
              There are no monthly subscription fees, no listing fees, and no hidden charges. We only earn
              when you earn — a single commission is taken per completed order.
            </p>
          </section>

          {/* PLATFORM COMMISSION */}
          <section id="platform-commission" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-6">Platform Commission</h2>

            {/* Highlight card */}
            <div className="bg-[#440C03] text-white rounded-2xl px-8 py-8 mb-8 flex flex-col md:flex-row md:items-center gap-6">
              <div className="text-center md:text-left">
                <p className="text-5xl font-extrabold">10%</p>
                <p className="text-white/70 text-sm mt-1">per completed order</p>
              </div>
              <div className="md:border-l md:border-white/20 md:pl-8">
                <p className="text-white/90 leading-relaxed">
                  Made in Arnhem Land Marketplace charges a <strong>10% commission (excluding GST)</strong> on
                  the <strong>unit price</strong> of each product sold. This commission is deducted only from
                  the product price — it does not apply to shipping costs.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                {
                  title: "Applied to unit price only",
                  body: "The 10% commission is calculated on the pre-GST unit price of each product. Shipping fees collected at checkout are not included in the commission calculation.",
                },
                {
                  title: "GST exclusive",
                  body: "Commission is calculated on the price excluding GST. If your product is listed at $110 (GST inclusive), the commission is calculated on $100 — the ex-GST amount.",
                },
                {
                  title: "Per completed order",
                  body: "Commission is only deducted when an order is successfully completed. Cancelled or fully refunded orders are not subject to commission.",
                },
              ].map((item) => (
                <div key={item.title} className="bg-[#e8d9cb] rounded-2xl px-6 py-5">
                  <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                  <p className="leading-relaxed text-gray-700">{item.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* HOW COMMISSION WORKS */}
          <section id="how-commission-works" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">How Commission Works</h2>
            <p className="leading-relaxed mb-6">
              When a buyer completes a purchase, the platform automatically calculates the commission
              due from the seller&apos;s product revenue. The process works as follows:
            </p>
            <ol className="space-y-4">
              {[
                "Buyer places an order and payment is processed securely through Stripe.",
                "Stripe deducts its payment processing fees from the transaction total.",
                "Made in Arnhem Land Marketplace deducts its 10% platform commission from the ex-GST unit price of each product in the order.",
                "The remaining product revenue, plus 100% of the collected shipping amount, is paid out to the seller.",
              ].map((step, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <span className="shrink-0 bg-[#440C03] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                    {i + 1}
                  </span>
                  <p className="leading-relaxed pt-1">{step}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* SHIPPING */}
          <section id="shipping" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">Shipping &amp; Handling</h2>
            <p className="leading-relaxed mb-4">
              Sellers are responsible for fulfilling and dispatching orders to buyers. The full shipping
              amount collected at checkout is passed on to the seller — Made in Arnhem Land Marketplace
              does <strong>not</strong> take any commission on shipping.
            </p>
            <div className="bg-[#e8d9cb] rounded-2xl px-6 py-5">
              <ul className="space-y-3">
                {[
                  "Sellers set their own shipping rates when listing products.",
                  "100% of the shipping amount collected from the buyer is remitted to the seller.",
                  "Sellers are responsible for packaging, dispatch, and tracking.",
                  "International shipping is available where enabled by the platform and set up by the seller.",
                ].map((item) => (
                  <li key={item} className="flex gap-2 leading-relaxed">
                    <span className="text-[#440C03] mt-1">&#9658;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* PAYMENT PROCESSING */}
          <section id="payment-processing" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">Payment Processing (Stripe)</h2>
            <p className="leading-relaxed mb-4">
              All payments on Made in Arnhem Land Marketplace are processed securely by{" "}
              <strong>Stripe</strong>. Stripe charges their own payment processing fees for each
              transaction, which are separate from the platform commission.
            </p>
            <div className="bg-[#e8d9cb] rounded-2xl px-6 py-5 mb-4">
              <p className="leading-relaxed text-gray-700 mb-2">
                Stripe&apos;s standard fees (subject to change — refer to{" "}
                <a
                  href="https://stripe.com/au/pricing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#440C03] underline"
                >
                  stripe.com/au/pricing
                </a>{" "}
                for current rates):
              </p>
              <ul className="space-y-2 mt-3">
                {[
                  "Domestic cards: 1.7% + A$0.30 per successful transaction (standard Stripe Australia rates)",
                  "International cards: higher rates may apply depending on card origin",
                  "Currency conversion fees may apply for non-AUD transactions",
                ].map((item) => (
                  <li key={item} className="flex gap-2 leading-relaxed text-sm">
                    <span className="text-[#440C03] mt-1">&#9658;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-sm text-gray-500">
              Stripe fees are charged independently and are not controlled by Made in Arnhem Land
              Marketplace. Sellers should refer to Stripe&apos;s official pricing page for the latest rates.
            </p>
          </section>

          {/* SELLER PAYOUT */}
          <section id="seller-payout" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">What Sellers Receive</h2>
            <p className="leading-relaxed mb-6">
              After all deductions, here is what a seller receives from each completed order:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#440C03] text-white">
                    <th className="px-4 py-3 font-semibold rounded-tl-xl">Component</th>
                    <th className="px-4 py-3 font-semibold">Seller Receives</th>
                    <th className="px-4 py-3 font-semibold rounded-tr-xl">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Product price (ex-GST)", "90%", "10% platform commission deducted"],
                    ["GST component", "100%", "Sellers are responsible for GST obligations"],
                    ["Shipping collected", "100%", "Full shipping amount passed to seller"],
                    ["Stripe processing fees", "Deducted by Stripe", "Applied before seller payout"],
                  ].map(([component, receives, notes], i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white/60" : "bg-[#e8d9cb]"}>
                      <td className="px-4 py-3 font-medium">{component}</td>
                      <td className="px-4 py-3">{receives}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* WORKED EXAMPLE */}
          <section id="example" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">Worked Example</h2>
            <p className="leading-relaxed mb-6">
              The following is an illustrative example of how fees are calculated for a single product sale.
              Stripe fees are indicative only.
            </p>
            <div className="bg-[#440C03] text-white rounded-2xl px-8 py-6 text-sm space-y-3">
              {[
                ["Product listed price (GST inclusive)", "A$110.00"],
                ["GST component (1/11 of $110)", "A$10.00"],
                ["Ex-GST unit price", "A$100.00"],
                ["Platform commission (10% of $100)", "− A$10.00"],
                ["Shipping collected from buyer", "A$12.00"],
                ["Stripe fee (est. 1.7% + $0.30 on $122 total)", "− A$2.37"],
                ["Estimated seller payout", "A$109.63"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between border-b border-white/10 pb-3">
                  <span className="text-white/80">{label}</span>
                  <span className="font-semibold">{value}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              * This example is illustrative. Actual Stripe fees depend on card type, country of issue, and
              current Stripe pricing. GST obligations are the seller&apos;s responsibility.
            </p>
          </section>

          {/* FAQs */}
          <section id="faq" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-6">FAQs</h2>
            <div className="space-y-4">
              {[
                {
                  q: "Is commission charged on shipping?",
                  a: "No. The 10% platform commission is only applied to the product unit price (ex-GST). The full shipping amount collected is passed to the seller.",
                },
                {
                  q: "Are there any listing fees or monthly charges?",
                  a: "No. There are no upfront costs, listing fees, or monthly subscription fees. Commission is only deducted when a sale is made.",
                },
                {
                  q: "What if an order is refunded?",
                  a: "If an order is fully refunded, no platform commission is retained. Stripe may apply their own refund processing fees — refer to Stripe's documentation for details.",
                },
                {
                  q: "Do I need to register for GST to sell on the platform?",
                  a: "GST obligations depend on your individual circumstances and annual turnover. We recommend consulting a tax professional or the Australian Taxation Office (ATO) regarding your GST responsibilities.",
                },
                {
                  q: "Can fees change in the future?",
                  a: "Made in Arnhem Land Marketplace reserves the right to update its fee structure. Sellers will be notified in advance of any changes.",
                },
              ].map((item) => (
                <div key={item.q} className="bg-[#e8d9cb] rounded-2xl px-6 py-5">
                  <h3 className="font-semibold text-[#440C03] mb-2">{item.q}</h3>
                  <p className="leading-relaxed text-gray-700 text-sm">{item.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CONTACT */}
          <section id="contact" className="scroll-mt-32 mb-8">
            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <p className="leading-relaxed mb-4">
              If you have any questions about our fees, commission structure, or payout process, please
              don&apos;t hesitate to reach out to our seller support team.
            </p>
            <div className="bg-[#e8d9cb] rounded-2xl px-6 py-5">
              <p className="leading-relaxed">
                <strong>Made in Arnhem Land Marketplace</strong><br />
                Email:{" "}
                <a href="mailto:support@madeinarnhemland.com.au" className="text-[#440C03] underline">
                  support@madeinarnhemland.com.au
                </a><br />
                Website:{" "}
                <a href="https://madeinarnhemland.com.au" className="text-[#440C03] underline" target="_blank" rel="noopener noreferrer">
                  madeinarnhemland.com.au
                </a>
              </p>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}

