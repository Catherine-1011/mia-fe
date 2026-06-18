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
            Made in Arnhem Land Marketplace - Fees &amp; Commission
          </p>
        </div>
      </VideoHeroSection>

      {/* CONTENT SECTION */}
      <div className="flex flex-col md:flex-row gap-10 md:gap-20 pt-10 pb-20 px-6 md:px-16 max-w-screen-2xl mx-auto">
        {/* TABLE OF CONTENTS */}
        <aside className="w-full md:w-56 lg:w-64 md:sticky md:top-28 flex flex-col self-start">
          <h2 className="font-bold mb-3 text-xl shrink-0">Table of Contents</h2>
          <ul
            className="space-y-1.5 text-gray-800 md:overflow-y-auto pr-1 text-sm md:max-h-[calc(100vh-8rem)]"
            style={{
              scrollBehavior: "smooth",
              scrollbarWidth: "thin",
              scrollbarColor: "#c4a99a transparent",
            }}
          >
            {[
              { id: "overview", label: "Overview" },
              { id: "platform-commission", label: "Platform Commission" },
              { id: "how-commission-works", label: "How Commission Works" },
              { id: "shipping", label: "Shipping & Handling" },
              {
                id: "payment-processing",
                label: "Payment Processing (Stripe)",
              },
              { id: "payout-schedule", label: "Payout Schedule" },
              { id: "seller-payout", label: "What Sellers Receive" },
              { id: "fee-summary", label: "Fee Summary" },
              { id: "example", label: "Worked Example" },
              { id: "refunds", label: "Refunds & Adjustments" },
              { id: "gst", label: "GST Responsibility" },
              { id: "faq", label: "FAQs" },
              { id: "contact", label: "Contact Us" },
            ].map((item) => (
              <li
                key={item.id}
                className="bg-[#D0BFB3] rounded-2xl hover:bg-[#440C03] hover:text-white transition"
              >
                <a
                  href={`#${item.id}`}
                  className="flex items-center gap-2 px-3 py-1.5"
                >
                  <FaFileInvoiceDollar size={14} />
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1">
          <h1 className="text-3xl font-bold mb-8">
            Made in Arnhem Land Marketplace - Fees &amp; Commission
          </h1>

          {/* OVERVIEW */}
          <section id="overview" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">Overview</h2>
            <p className="leading-relaxed mb-4">
              Made in Arnhem Land Marketplace is committed to supporting
              Indigenous Australian artists and sellers with a fair, transparent
              fee structure. We keep our platform fees simple, so you always
              know what you earn before you list a product.
            </p>
            <p className="leading-relaxed mb-8">
              There are no monthly subscription fees, no listing fees, and no
              hidden charges. We only earn when you earn, a single commission is
              taken per completed order.
            </p>

            {/* No Hidden Costs Promise */}
            <div className="bg-[#e8d9cb] rounded-2xl px-6 py-5">
              <h3 className="text-lg font-semibold mb-2">
                No Hidden Costs Promise
              </h3>
              <p className="leading-relaxed text-gray-700 mb-3">
                We will never introduce hidden fees, markups on shipping, or
                undisclosed deductions. The 10% commission is the only fee Made
                in Arnhem Land Marketplace charges; we do not take any cut of
                Stripe&apos;s fees. Stripe&apos;s payment processing and payout
                fees are charged separately by Stripe (a third party) directly
                to your account and are fully set out below. Any future change
                to our fee structure will be communicated to sellers clearly and
                in advance.
              </p>
              <p className="text-sm text-gray-600">
                For more details on Terms &amp; Conditions, please visit:{" "}
                <a href="/term-and-conditions" className="text-[#440C03] underline">
                  Terms &amp; Conditions
                </a>
              </p>
            </div>
          </section>

          {/* PLATFORM COMMISSION */}
          <section id="platform-commission" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-6">Platform Commission</h2>

            {/* Highlight card */}
            <div className="bg-[#440C03] text-white rounded-2xl px-8 py-8 mb-8 flex flex-col md:flex-row md:items-center gap-6">
              <div className="text-center md:text-left">
                <p className="text-5xl font-extrabold">10%</p>
                <p className="text-white/70 text-sm mt-1">
                  per completed order
                </p>
              </div>
              <div className="md:border-l md:border-white/20 md:pl-8">
                <p className="text-white/90 leading-relaxed">
                  We charge a <strong>10% commission</strong> on each completed
                  order, calculated on the value excluding GST and shipping.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                {
                  title: "Applied to the product price only",
                  body: "The 10% commission is calculated on the pre-GST product price of the order. Shipping fees collected at checkout are not included in the commission calculation.",
                },
                {
                  title: "GST exclusive",
                  body: "Commission is calculated on the price excluding GST. If your product is listed at $110 (GST inclusive), the commission is calculated on $100 - the ex-GST amount.",
                },
                {
                  title: "Per completed order",
                  body: "Commission is only deducted when an order is successfully completed. Cancelled or fully refunded orders are not subject to commission.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-[#e8d9cb] rounded-2xl px-6 py-5"
                >
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
              When a buyer completes a purchase, payment is processed directly
              to the seller&apos;s Stripe account, and the platform&apos;s
              commission is collected automatically. The process works as
              follows:
            </p>
            <ol className="space-y-4">
              {[
                "Buyer places an order and pays securely through Stripe, directly to the seller's connected Stripe account.",
                "Stripe deducts its payment processing fee from the transaction, this is charged to the seller's account, not to the marketplace platform.",
                "Made in Arnhem Land Marketplace collects its 10% commission from the ex-GST product price of the order, and nothing more.",
                "The balance product revenue, the full GST component, and 100% of the collected shipping settles to the seller.",
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
              Sellers are responsible for fulfilling and dispatching orders to
              buyers. The full shipping amount collected at checkout is passed
              on to the seller.
            </p>
            <div className="bg-[#e8d9cb] rounded-2xl px-6 py-5 mb-4">
              <ul className="space-y-3">
                {[
                  "Shipping rates are calculated using Australia Post's domestic and international rates, applied according to the destination. These rates are reviewed whenever Australia Post updates its pricing (typically annually).",
                  "100% of the shipping amount collected from the buyer is remitted to the seller by Stripe.",
                  "Sellers are responsible for packaging, dispatch, and tracking.",
                  "International shipping is available where enabled by the platform.",
                ].map((item) => (
                  <li key={item} className="flex gap-2 leading-relaxed">
                    <span className="text-[#440C03] ">&#9658;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-sm text-gray-500">
              For more details on shipping-related queries, please visit:{" "}
              <a href="/shipping-policy" className="text-[#440C03] underline">
                Shipping Policy
              </a>
            </p>
          </section>

          {/* PAYMENT PROCESSING */}
          <section id="payment-processing" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">
              Payment Processing (Stripe)
            </h2>
            <p className="leading-relaxed mb-4">
              All payments on Made in Arnhem Land Marketplace are processed
              securely by <strong>Stripe</strong>. Stripe charges its own
              payment processing fees for each transaction, separate from the
              platform commission. Under the current setup, these Stripe fees
              are charged directly to the seller&apos;s account, the platform
              does not pay them and does not take any share of them.
            </p>
            <div className="bg-[#e8d9cb] rounded-2xl px-6 py-5 mb-4">
              <p className="leading-relaxed text-gray-700 mb-2">
                Stripe&apos;s standard fees (subject to change - refer to{" "}
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
                  "Domestic cards: 1.7% + A$0.30 per successful transaction (standard Stripe Australia rates, as of June 2026 and subject to change).",
                  "International cards: higher rates may apply depending on card origin.",
                  "Currency conversion fees may apply for non-AUD transactions.",
                ].map((item) => (
                  <li key={item} className="flex gap-2 leading-relaxed text-sm">
                    <span className="text-[#440C03]">&#9658;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-sm text-gray-500">
              Stripe fees are charged independently and are not controlled by
              Made in Arnhem Land Marketplace. Sellers should refer to
              Stripe&apos;s official pricing page for the latest rates.{" "}
              <strong>Note:</strong> Stripe fees shown are exclusive of GST.
            </p>
          </section>

          {/* PAYOUT SCHEDULE */}
          <section id="payout-schedule" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">
              Payout Schedule - when and how you get paid
            </h2>
            <p className="leading-relaxed mb-6">
              All seller payouts are processed through Stripe Connect to your
              nominated account. How quickly you receive your funds depends on
              the payout method you choose.
            </p>

            <div className="space-y-4 mb-8">
              {/* Instant Payouts */}
              <div className="bg-[#e8d9cb] rounded-2xl px-6 py-5">
                <h3 className="text-lg font-semibold mb-3">
                  Instant Payouts (faster mode)
                </h3>
                <ul className="space-y-3">
                  {[
                    "Funds typically arrive within 30 minutes, available 24/7, including weekends and public holidays.",
                    "Paid to an eligible Australian Visa or Mastercard debit card linked to your account. Standard bank (BSB) routing does not support instant delivery speeds, so a debit card is required for Instant Payouts, you'll be asked to add one during onboarding with Stripe.",
                    "A Stripe Instant Payout fee of 1.5% of the payout amount applies, deducted from the amount paid out.",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex gap-2 leading-relaxed text-sm"
                    >
                      <span className="text-[#440C03] ">&#9658;</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
</div>
                {/* Instant Payout example */}
                <div className="mt-5">
                  <p className="text-2xl font-semibold mb-3 text-gray-700">
                    Simple example - Instant Payout:
                  </p>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-[#440C03] text-white">
                          <th className="px-4 py-3 font-semibold rounded-tl-xl">
                            Instant Payout request
                          </th>
                          <th className="px-4 py-3 font-semibold rounded-tr-xl">
                            Amount
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {[
                          ["You request an Instant Payout of", "A$1,000.00"],
                          ["Instant Payout fee (1.5%)", "A$15.00"],
                          [
                            "You receive (to your debit card, usually within 30 minutes)",
                            "A$985.00",
                          ],
                        ].map(([label, value], i) => (
                          <tr
                            key={label}
                            className={
                              i % 2 === 0 ? "bg-white/60" : "bg-[#e8d9cb]"
                            }
                          >
                            <td className="px-4 py-3 font-medium">{label}</td>
                            <td className="px-4 py-3 font-semibold">{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               
              </div>
              {/* First payout */}
              <div className="bg-[#e8d9cb] rounded-2xl px-6 py-5">
                <h3 className="text-lg font-semibold mb-2">
                  Your first payout
                </h3>
                <p className="leading-relaxed text-gray-700 text-sm">
                  Your very first payout is subject to a standard Stripe
                  security hold of 7 to 14 days for fraud and compliance checks.
                  Instant Payouts are not available for this first payout; it is
                  released once the hold clears. Subsequent payouts are not
                  affected.
                </p>
              </div>

              {/* Daily limits */}
              <div className="bg-[#e8d9cb] rounded-2xl px-6 py-5">
                <h3 className="text-lg font-semibold mb-2">Daily limits</h3>
                <p className="leading-relaxed text-gray-700 text-sm">
                  Stripe applies daily caps on how much can be moved via Instant
                  Payout in a single day. If a payout exceeds the cap, the
                  remaining balance is paid out on the next available cycle,
                  usually in 24 hours.
                </p>
              </div>

              {/* Who pays Stripe fees */}
              <div className="bg-[#e8d9cb] rounded-2xl px-6 py-5">
                <h3 className="text-lg font-semibold mb-3">
                  Who pays Stripe&apos;s fees
                </h3>
                <p className="leading-relaxed text-gray-700 text-sm mb-3">
                  Made in Arnhem Land Marketplace charges one fee only: the 10%
                  commission. Every Stripe fee is charged by Stripe directly to
                  your connected account and the platform does not pay these and
                  takes no share of them. The Stripe fees that apply to you are:
                </p>
                <ul className="space-y-2">
                  {[
                    "Payment processing on each sale (1.7% + A$0.30 for domestic cards; higher for international).",
                    "The Instant Payout fee (1.5% of the payout).",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex gap-2 leading-relaxed text-sm"
                    >
                      <span className="text-[#440C03]">&#9658;</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-gray-500 mt-3">
                  For more details please visit:{" "}
                  <a href="/faqs" className="text-[#440C03] underline">
                    FAQ - How and when do I get paid?
                  </a>{" "}
                  ·{" "}
                  <a
                    href="https://stripe.com/au/connect/pricing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#440C03] underline"
                  >
                    Stripe Connect pricing
                  </a>
                </p>
              </div>
            </div>
          </section>

          {/* SELLER PAYOUT */}
          <section id="seller-payout" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">What Sellers Receive</h2>
            <p className="leading-relaxed mb-6">
              Here is the current breakdown of seller-related fees, charges, and
              who applies them across each completed order and payout:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#440C03] text-white">
                    <th className="px-4 py-3 font-semibold rounded-tl-xl">
                      Fee / Charge
                    </th>
                    <th className="px-4 py-3 font-semibold">Amount / Basis</th>
                    <th className="px-4 py-3 font-semibold">Charged By</th>
                    <th className="px-4 py-3 font-semibold rounded-tr-xl">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    [
                      "Marketplace Commission",
                      "10% of product sale value",
                      "Platform Marketplace",
                      "Currently applied to product sale value only. Shipping, GST treatment, refunds, and other applicable charges are handled separately.",
                    ],
                    [
                      "Stripe Card Processing - Domestic Cards",
                      "Currently 1.7% + A$0.30 per successful transaction",
                      "Stripe",
                      "Deducted by Stripe from the connected seller account, subject to Stripe's current AU pricing and account setup.",
                    ],
                    [
                      "Stripe Card Processing - International Cards",
                      "Currently 3.5% + A$0.30 per successful transaction",
                      "Stripe",
                      "Applies where an international card is used. Additional currency conversion or cross-border charges may apply.",
                    ],
                    [
                      "Stripe Connect Active Account Fee",
                      "A$2 per active seller account per month",
                      "Stripe",
                      "Applies only to seller accounts that process transactions and receive payouts during the month. No charge for inactive accounts.",
                    ],
                    [
                      "Stripe Connect Payout Fee",
                      "0.25% + A$0.25 per payout",
                      "Stripe",
                      "Charged when funds are paid out from Stripe to the seller's bank account. Not charged per product sold.",
                    ],
                    [
                      "Instant Payouts",
                      "Currently 1.5% of payout volume, where eligible",
                      "Stripe",
                      "Optional. Only applies if the seller uses Instant Payouts and is eligible under Stripe rules.",
                    ],
                    [
                      "Refunds",
                      "As per Stripe rules",
                      "Stripe / Seller Account",
                      "Stripe may not return the original processing, Connect, or currency conversion fees. Refund handling depends on transaction status and seller balance. Connected sellers remain responsible for obligations associated with their Stripe account, subject to Stripe's policies and account configuration.",
                    ],
                    [
                      "Disputes / Chargebacks",
                      "As per Stripe rules",
                      "Stripe / Seller Account",
                      "Any dispute fees, chargeback outcomes, or balance impacts are governed by Stripe's policies.",
                    ],
                    [
                      "Shipping Charges",
                      "Shown at checkout",
                      "Customer",
                      "Shipping is charged separately based on the platform's shipping setup.",
                    ],
                    [
                      "GST",
                      "As applicable under Australian tax rules",
                      "Seller / Platform as applicable",
                      "Sellers are responsible for their own tax obligations. This page is not tax advice.",
                    ],
                    [
                      "Meeting Follow-ups",
                      "Frontend fixes pending",
                      "Internal team",
                      "Some flags are broken in the number field. Email still has a color issue, Fanindra name issue, duplicate Track Order button, and button design review pending.",
                    ],
                    [
                      "Live Testing Coordination",
                      "Action required",
                      "Internal team",
                      "Mail Fanindra. Mail Hussain for live testing. Ritik to chat with support for live testing.",
                    ],
                  ].map(([feeType, amount, chargedBy, notes], i) => (
                    <tr
                      key={i}
                      className={i % 2 === 0 ? "bg-white/60" : "bg-[#e8d9cb]"}
                    >
                      <td className="px-4 py-3 font-medium">{feeType}</td>
                      <td className="px-4 py-3">{amount}</td>
                      <td className="px-4 py-3">{chargedBy}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        {notes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Fee examples and Stripe pricing references are indicative only and
              may change over time. Sellers should review Stripe&apos;s latest
              pricing and policies directly before using the platform.
            </p>
          </section>

          {/* FEE SUMMARY */}
          {/* <section id="fee-summary" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-6">
              Fee Summary - at a glance
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#440C03] text-white">
                    <th className="px-4 py-3 font-semibold rounded-tl-xl">
                      Fee type
                    </th>
                    <th className="px-4 py-3 font-semibold rounded-tr-xl">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Listing fee", "$0"],
                    ["Monthly fee", "$0"],
                    [
                      "Our commission",
                      "10% on the product price of each order, excluding GST and shipping. This is the only fee the marketplace charges",
                    ],
                    ["Shipping", "100% yours"],
                    [
                      "Payment processing",
                      "Stripe fees apply, paid by the seller (separate from our commission)",
                    ],
                    [
                      "Instant Payout",
                      "1.5% Stripe fee for under-30-minute payouts, paid by the seller for each payout",
                    ],
                  ].map(([feeType, amount], i) => (
                    <tr
                      key={i}
                      className={i % 2 === 0 ? "bg-white/60" : "bg-[#e8d9cb]"}
                    >
                      <td className="px-4 py-3 font-medium">{feeType}</td>
                      <td className="px-4 py-3 text-gray-700">{amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section> */}

          {/* WORKED EXAMPLE */}
          <section id="example" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">Worked Example</h2>
            <p className="leading-relaxed mb-6">
              The following is an illustrative example of how fees are
              calculated for a single product sale. Stripe fees are indicative
              only.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#440C03] text-white">
                    <th className="px-4 py-3 font-semibold rounded-tl-xl">
                      Line item
                    </th>
                    <th className="px-4 py-3 font-semibold rounded-tr-xl">
                      Amount
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {[
                    ["Product listed price (GST inclusive)", "A$110.00"],
                    ["GST component (1/11 of $110)", "A$10.00"],
                    ["Ex-GST product price", "A$100.00"],
                    ["Platform commission (10% of $100)", "A$10.00"],
                    ["Shipping collected from buyer (example)", "A$12.00"],
                    ["Stripe fee (est. 1.7% + $0.30 on $122 total)", "A$2.37"],
                    ["Instant Payout fees (1.5% of A$109.63)", "A$1.64"],
                    ["Estimated seller payout (Instant payout)", "A$107.99"],
                  ].map(([label, value], i) => (
                    <tr
                      key={label}
                      className={i % 2 === 0 ? "bg-white/60" : "bg-[#e8d9cb]"}
                    >
                      <td className="px-4 py-3 font-medium">{label}</td>
                      <td className="px-4 py-3 text-gray-700 font-semibold">
                        {value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              In this example the marketplace receives its full 10% commission
              (A$10) with no Stripe deduction, and the Stripe processing fee is
              borne by the seller. For an Instant Payout, a further 1.5% Stripe
              fee applies to the amount paid out (see Schedule above).
              <br />* This example is illustrative. Stripe fees are shown
              exclusive of GST. Actual Stripe fees depend on card type, country
              of issue, and current Stripe pricing. GST obligations are the
              seller&apos;s responsibility.
            </p>
          </section>

          {/* REFUNDS & ADJUSTMENTS */}
          <section id="refunds" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-6">
              Refunds &amp; Adjustments
            </h2>
            <div className="space-y-4">
              {[
                {
                  title: "Full refund",
                  body: "if an order is fully refunded, no platform commission is taken, any commission already deducted is returned.",
                  example:
                    "Example: a $110 order (including $10 GST) is fully refunded, the $10 commission is reversed, so you keep nothing and owe nothing on that sale.",
                },
                {
                  title: "Partial refund",
                  body: "if an order is partially refunded, commission is adjusted proportionally to the amount refunded.",
                  example:
                    "Example: you refund half of a $100 (ex-GST) order, the commission drops from $10 to $5.",
                },
                {
                  title: "Stripe processing fees",
                  body: "Stripe processing fees may not be refunded, depending on Stripe's policy.",
                  example: null,
                },
                {
                  title: "Shipping refunds",
                  body: "Shipping refunds are at the seller's discretion, in line with returns policy and subject to Australian Consumer Law.",
                  example: null,
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-[#e8d9cb] rounded-2xl px-6 py-5"
                >
                  <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                  <p className="leading-relaxed text-gray-700">{item.body}</p>
                  {item.example && (
                    <p className="text-sm text-gray-500 mt-2 italic">
                      {item.example}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-4">
              For more details please visit:{" "}
              <a href="/guest/refund" className="text-[#440C03] underline">
                Refund &amp; Return Policy
              </a>{" "}
              ·{" "}
              <a href="/term-and-conditions" className="text-[#440C03] underline">
                Terms &amp; Conditions
              </a>
            </p>
          </section>

          {/* GST RESPONSIBILITY */}
          <section id="gst" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">GST Responsibility</h2>
            <p className="leading-relaxed mb-6">Sellers are responsible for:</p>
            <div className="bg-[#e8d9cb] rounded-2xl px-6 py-5 mb-4">
              <ul className="space-y-3">
                {[
                  "Determining whether they are registered for GST.",
                  "Including GST in their pricing where required.",
                  "Reporting and remitting GST to the ATO.",
                ].map((item) => (
                  <li key={item} className="flex gap-2 leading-relaxed">
                    <span className="text-[#440C03]">&#9658;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-gray-500 mt-4 italic">
                Example: if you are registered for GST and list a product at
                $110 including GST, $10 of that is GST that you report and remit
                to the ATO. The marketplace passes the full $10 GST component to
                you and does not take commission on it.
              </p>
            </div>
            <p className="leading-relaxed text-gray-700 mb-2">
              If you are unsure of your obligations, we recommend consulting a
              registered tax professional or the Australian Taxation Office
              (ATO).
            </p>
            <p className="text-sm text-gray-500">
              For more details please visit:{" "}
              <a
                href="https://www.ato.gov.au"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#440C03] underline"
              >
                ATO ato.gov.au
              </a>
            </p>
          </section>

          {/* FAQs */}
          <section id="faq" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-6">FAQs</h2>
            <div className="space-y-4">
              {[
                {
                  q: "Is commission charged on shipping?",
                  a: "No. The 10% platform commission is only applied to the product price of the order (ex-GST). The full shipping amount collected is passed to the seller.",
                },
                {
                  q: "Are there any listing fees or monthly charges?",
                  a: "No. There are no upfront costs, listing fees, or monthly subscription fees. Commission is only deducted when a sale is made.",
                },
                {
                  q: "What if an order is refunded?",
                  a: "If an order is fully refunded, no platform commission is retained. Partial refunds adjust the commission proportionally. See Refunds & Adjustments above for details. Stripe may apply their own refund processing fees and may not refund their charges.",
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
                <div
                  key={item.q}
                  className="bg-[#e8d9cb] rounded-2xl px-6 py-5"
                >
                  <h3 className="font-semibold text-[#440C03] mb-2">
                    {item.q}
                  </h3>
                  <p className="leading-relaxed text-gray-700 text-sm">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-4">
              For more details please visit:{" "}
              <a href="/faqs" className="text-[#440C03] underline">
                View all FAQs
              </a>
            </p>
          </section>

          {/* CONTACT */}
          <section id="contact" className="scroll-mt-32 mb-8">
            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <p className="leading-relaxed mb-4">
              If you have any questions about our fees, commission structure, or
              payout process, please don&apos;t hesitate to reach out to our
              seller support team.
            </p>
            <div className="bg-[#e8d9cb] rounded-2xl px-6 py-5 mb-6">
              <p className="leading-relaxed">
                <strong>Made in Arnhem Land Marketplace</strong>
                <br />
                Email:{" "}
                <a
                  href="mailto:support@madeinarnhemland.com.au"
                  className="text-[#440C03] underline"
                >
                  support@madeinarnhemland.com.au
                </a>
                <br/>
                Seller Email:{" "}
                <a
                  href="mailto:seller@madeinarnhemland.com.au"
                  className="text-[#440C03] underline"
                >
                  seller@madeinarnhemland.com.au
                </a>
                <br />

                Website:{" "}
                <a
                  href="https://madeinarnhemland.com.au"
                  className="text-[#440C03] underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  madeinarnhemland.com.au
                </a>
              </p>
            </div>

            {/* DISCLAIMER */}
            <div className="bg-[#e8d9cb] rounded-2xl px-6 py-5">
              <h3 className="text-lg font-semibold mb-3">Disclaimer</h3>
              <ul className="space-y-2">
                {[
                  "Fees are subject to change, with advance notice to sellers.",
                  "Stripe processing and payout fees are set and controlled by Stripe, not by Made in Arnhem Land Marketplace, and are charged to the seller's account. The marketplace's only fee is the set commission as shared above.",
                  "All transactions are governed by our Terms & Conditions.",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 leading-relaxed text-sm text-gray-700"
                  >
                    <span className="text-[#440C03]">&#9658;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
