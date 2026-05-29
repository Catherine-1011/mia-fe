import React from "react";
import { FaFileSignature } from "react-icons/fa";
import VideoHeroSection from "@/components/common-components/VideoHeroSection";

const sections = [
  { id: "order-processing", label: "Order Processing" },
  { id: "shipping-methods", label: "Shipping Methods" },
  { id: "shipping-charges", label: "Shipping Charges" },
  { id: "delivery-estimates", label: "Delivery Estimates" },
  { id: "tracking", label: "Tracking" },
  { id: "authority-to-leave", label: "Authority to Leave" },
  { id: "address-accuracy", label: "Address Accuracy" },
  { id: "lost-or-damaged", label: "Lost or Damaged Items" },
  { id: "delivery-completion", label: "Delivery Completion" },
  { id: "split-deliveries", label: "Split Deliveries" },
  { id: "remote-areas", label: "Remote Areas & Special Deliveries" },
  { id: "marketplace-role", label: "Marketplace Role" },
  { id: "governing-law", label: "Governing Law" },
];

export default function Page() {
  return (
    <div className="bg-[#f3e9dd]">

      {/* HERO SECTION */}
      <VideoHeroSection className="min-h-[70vh]">
        <div className="relative z-10 flex flex-col items-center justify-center text-white text-center px-4 py-32 md:py-60">
          <h1 className="text-5xl font-bold mb-2">Shipping Policy</h1>
          <p className="text-lg max-w-2xl">
            Learn how orders are processed and delivered through the Made in Arnhem Land marketplace.
          </p>
        </div>
      </VideoHeroSection>

      {/* CONTENT SECTION */}
      <div className="flex flex-col md:flex-row gap-10 md:gap-20 pt-20 pb-20 px-6 md:px-16">

        {/* TABLE OF CONTENTS */}
        <aside className="w-full md:w-64 lg:w-72 md:sticky md:top-32 h-fit">
          <h2 className="font-bold mb-4 text-2xl">Table of Contents</h2>
          <ul className="space-y-3 text-gray-800">
            {sections.map((item) => (
              <li
                key={item.id}
                className="bg-[#D0BFB3] rounded-2xl hover:bg-[#440C03] hover:text-white transition"
              >
                <a
                  href={`#${item.id}`}
                  className="flex items-center gap-3 px-4 py-2"
                >
                  <FaFileSignature size={18} />
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 max-w-screen-2xl mx-auto">

          <h1 className="text-3xl font-bold mb-4">
            Welcome to our Shipping Policy
          </h1>

          {/* <p className="leading-relaxed mb-2">
            <span className="font-semibold">Effective Date:</span> 24/03/2026
          </p> */}
          <p className="leading-relaxed mb-12">
            This policy explains how orders are processed and delivered through the Made in Arnhem Land marketplace.
            This policy should be read together with our Terms &amp; Conditions.
          </p>

          {/* 1. Order Processing */}
          <section id="order-processing" className="scroll-mt-32 mb-10">
            <h2 className="text-2xl font-bold mb-2">1. Order Processing</h2>
            <p className="leading-relaxed">
              Processing timeframes are calculated in business days and do not include weekends or
              public holidays in the Northern Territory, unless otherwise stated by the seller.
            </p>
          </section>

          {/* 2. Shipping Methods */}
          <section id="shipping-methods" className="scroll-mt-32 mb-10">
            <h2 className="text-2xl font-bold mb-2">2. Shipping Methods</h2>
            <p className="leading-relaxed mb-4">
              Shipping methods are determined by individual sellers and may include:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Standard delivery</li>
              <li>Express delivery</li>
            </ul>
            <p className="leading-relaxed mt-4">
              Available options may vary depending on the seller, product type, and delivery location.
            </p>
          </section>

          {/* 3. Shipping Charges */}
          <section id="shipping-charges" className="scroll-mt-32 mb-10">
            <h2 className="text-2xl font-bold mb-2">3. Shipping Charges (Multi-Seller Orders)</h2>
            <p className="leading-relaxed mb-4">
              Shipping charges are calculated per shipment (per seller or fulfilment location), not per order.
            </p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>Where an order contains products from multiple sellers, each seller will ship items separately, and individual shipping charges will apply.</li>
              <li>Where multiple items are purchased from the same seller and dispatched together, a single shipping fee will be charged for that shipment.</li>
              <li>As a result, a single order may include multiple shipping charges.</li>
            </ul>
            <p className="leading-relaxed">
              All applicable shipping costs will be clearly displayed at checkout prior to payment.
            </p>
          </section>

          {/* 4. Delivery Estimates */}
          <section id="delivery-estimates" className="scroll-mt-32 mb-10">
            <h2 className="text-2xl font-bold mb-2">4. Delivery Estimates</h2>
            <p className="leading-relaxed mb-4">
              Delivery timeframes are estimates only and may vary by seller and location.
            </p>
            <p className="leading-relaxed mb-2 font-semibold">Events outside reasonable control</p>
            <p className="leading-relaxed mb-4">
              Sellers and the Marketplace are not responsible for delivery delays caused by events outside their reasonable control, including but not limited to:
            </p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>Severe weather or natural events</li>
              <li>Carrier disruptions or industrial action</li>
              <li>Infrastructure outages</li>
              <li>Emergency or government-imposed restrictions</li>
            </ul>
            <p className="leading-relaxed mb-2">Delays may also occur due to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Remote NT locations</li>
              <li>Weather conditions</li>
              <li>Transport disruptions</li>
              <li>Carrier delays</li>
              <li>Peak periods</li>
            </ul>
          </section>

          {/* 5. Tracking */}
          <section id="tracking" className="scroll-mt-32 mb-10">
            <h2 className="text-2xl font-bold mb-2">5. Tracking</h2>
            <p className="leading-relaxed">
              Where available, tracking details will be provided by the seller after dispatch.
              Availability of tracking may vary depending on the shipping method used.
            </p>
          </section>

          {/* 6. Authority to Leave */}
          <section id="authority-to-leave" className="scroll-mt-32 mb-10">
            <h2 className="text-2xl font-bold mb-2">6. Authority to Leave (ATL)</h2>
            <p className="leading-relaxed mb-4">If ATL is selected:</p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>Parcels may be left unattended</li>
              <li>The buyer accepts associated risks</li>
            </ul>
            <p className="leading-relaxed">
              To the extent permitted by law, the Marketplace is not responsible for loss after delivery under ATL.
            </p>
          </section>

          {/* 7. Address Accuracy */}
          <section id="address-accuracy" className="scroll-mt-32 mb-10">
            <h2 className="text-2xl font-bold mb-2">7. Address Accuracy</h2>
            <p className="leading-relaxed mb-4">
              Buyers must provide accurate and complete delivery addresses. Incorrect or incomplete addresses may result in:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Delivery delays</li>
              <li>Returned parcels</li>
              <li>Additional shipping charges (which may be payable by the buyer)</li>
            </ul>
          </section>

          {/* 8. Lost or Damaged Items */}
          <section id="lost-or-damaged" className="scroll-mt-32 mb-10">
            <h2 className="text-2xl font-bold mb-2">8. Lost or Damaged Items</h2>
            <p className="leading-relaxed mb-4">
              Returns, refunds, and related shipping costs are governed by the Made in Arnhem Land Returns &amp; Refunds Policy.
            </p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>Return shipping costs for change-of-mind returns may be payable by the buyer.</li>
              <li>Where a return is required due to a major failure, fault, or incorrect item, return shipping costs will be handled in accordance with Australian Consumer Law.</li>
            </ul>
            <p className="leading-relaxed mb-2 font-semibold">Failed deliveries and uncollected parcels</p>
            <p className="leading-relaxed mb-4">
              If a delivery cannot be completed due to incorrect address details, failure to collect from a designated location, or refusal of delivery:
            </p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>The parcel may be returned to the seller.</li>
              <li>Re-shipping or restocking fees may apply and may be payable by the buyer.</li>
              <li>Original shipping charges may be non-refundable, except where required by Australian Consumer Law.</li>
            </ul>
            <p className="leading-relaxed mb-4">
              Sellers are responsible for resolving missing item issues in accordance with Australian Consumer Law,
              which may include replacement, refund, or other remedies depending on the circumstances.
            </p>
            <p className="leading-relaxed">
              Buyers are responsible for monitoring delivery notifications and collection timeframes provided by carriers.
            </p>
          </section>

          {/* 9. Delivery Completion */}
          <section id="delivery-completion" className="scroll-mt-32 mb-10">
            <h2 className="text-2xl font-bold mb-2">9. Delivery Completion</h2>
            <p className="leading-relaxed mb-4">Delivery is considered complete when:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>The order is marked as delivered by the carrier</li>
              <li>Delivered under "Authority to Leave" (ATL)</li>
              <li>Collected by the buyer</li>
            </ul>
          </section>

          {/* 10. Split Deliveries */}
          <section id="split-deliveries" className="scroll-mt-32 mb-10">
            <h2 className="text-2xl font-bold mb-2">10. Split Deliveries</h2>
            <p className="leading-relaxed">
              Orders containing items from multiple sellers may be delivered in separate shipments
              and may arrive at different times.
            </p>
          </section>

          {/* 11. Remote Areas */}
          <section id="remote-areas" className="scroll-mt-32 mb-10">
            <h2 className="text-2xl font-bold mb-2">11. Remote Areas &amp; Special Deliveries</h2>
            <p className="leading-relaxed mb-4">
              Additional delivery timeframes or charges may apply for:
            </p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>Remote or regional locations</li>
              <li>Oversized or fragile items</li>
            </ul>
            <p className="leading-relaxed mb-2 font-semibold">International Shipping</p>
            <p className="leading-relaxed mb-4">
              International shipping availability is determined by individual sellers and may not be offered for all products.
              Where international shipping is available:
            </p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>Delivery timeframes are estimates only and may be subject to customs processing delays.</li>
              <li>Buyers are responsible for any customs duties, taxes, import fees, or other charges imposed by the destination country.</li>
              <li>Sellers and the Marketplace have no control over customs processes and are not responsible for delays, additional charges, or goods refused or seized by customs authorities.</li>
            </ul>
            <p className="leading-relaxed">
              In some cases, shipping may be subject to a custom quote, which will be communicated prior to dispatch by the seller directly.
            </p>
          </section>

          {/* 12. Marketplace Role */}
          <section id="marketplace-role" className="scroll-mt-32 mb-10">
            <h2 className="text-2xl font-bold mb-2">12. Marketplace Role Clarification</h2>
            <p className="leading-relaxed mb-4">
              The Made in Arnhem Land marketplace facilitates transactions between buyers and sellers.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Sellers are responsible for shipping, delivery, and fulfilment of their products.</li>
              <li>The marketplace does not take possession of goods or act as a shipping carrier.</li>
            </ul>
          </section>

          {/* 13. Governing Law */}
          <section id="governing-law" className="scroll-mt-32 mb-20">
            <h2 className="text-2xl font-bold mb-2">13. Governing Law</h2>
            <p className="leading-relaxed">
              This policy is governed by the laws of the Northern Territory, Australia and applicable Commonwealth laws.
            </p>
          </section>

        </main>
      </div>
    </div>
  );
}
