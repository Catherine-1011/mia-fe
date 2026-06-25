import React from "react";
import type { Metadata } from "next";
import { FaFileSignature } from "react-icons/fa";
import VideoHeroSection from "@/components/common-components/VideoHeroSection";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Terms and conditions for using the Made in Arnhem Land marketplace including purchase terms, user responsibilities and policies.",
  alternates: { canonical: "/term-and-conditions" },
};

export default function Page() {
  return (
    <div className="bg-[#f3e9dd]">

      {/* HERO SECTION */}
      <VideoHeroSection className="min-h-[70vh]">
        <div className="relative z-10 flex flex-col items-center justify-center text-white text-center px-4 py-32 md:py-60">
          <h1 className="text-5xl font-bold mb-2">Terms and Conditions</h1>
          <p className="text-lg max-w-2xl">
            Made in Arnhem Land Marketplace — Seller Terms and Conditions governing
            participation, certification, seller responsibilities, and cultural obligations.
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
              { id: "eligibility", label: "1. Eligibility and Registration" },
              { id: "certification", label: "2. Made in Arnhem Land Certification System" },
              { id: "seller-responsibilities", label: "3. Seller Responsibilities" },
              { id: "products", label: "4. Products and Services" },
              { id: "order-management", label: "5. Order Management and Delivery" },
              { id: "returns", label: "6. Returns, Refunds and Disputes" },
              { id: "payments", label: "7. Payments and Fees" },
              { id: "non-payment", label: "8. Non-Payment and Suspension" },
              { id: "reinvestment", label: "9. Community Reinvestment Model" },
              { id: "intellectual-property", label: "10. Intellectual Property" },
              { id: "platform-use", label: "11. Platform Use Policy" },
              { id: "privacy", label: "12. Privacy and Data Protection" },
              { id: "legal", label: "13. Legal Terms and Liabilities" },
              { id: "termination", label: "14. Termination and Suspension" },
              { id: "amendments", label: "15. Amendments and Notifications" },
              { id: "acknowledgement", label: "16. Acknowledgement and Acceptance" },
            ].map((item) => (
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
        <main className="flex-1">

          <h1 className="text-3xl font-bold mb-8">
            Made in Arnhem Land Marketplace — Seller Terms and Conditions
          </h1>

          {/* <p className="leading-relaxed mb-12 text-gray-700">
             Date: 13/11/2026 &nbsp;|&nbsp; Prepared for: Made in Arnhem Land Marketplace and Certification
          </p> */}

          {/* INTRODUCTION */}
          <section id="introduction" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">Introduction</h2>
            <p className="leading-relaxed mb-4">
              The Made in Arnhem Land Marketplace is a collaborative trading platform designed to connect
              producers, artists, and service providers from Arnhem Land with national and international buyers.
            </p>
            <p className="leading-relaxed mb-4">
              It reflects a spirit of cooperation, authenticity, and community benefit, ensuring that commerce
              serves as a form of contribution to the wellbeing of Arnhem Land communities.
            </p>
            <p className="leading-relaxed mb-4">
              This document sets out the Terms and Conditions governing participation in the Marketplace,
              including certification requirements, seller responsibilities, payment systems, and cultural obligations.
            </p>
            <p className="leading-relaxed">
              All participants agree to uphold the values of respect, integrity, and transparency central to the Made in Arnhem Land initiative.
            </p>
          </section>

          {/* ELIGIBILITY */}
          <section id="eligibility" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">1. Eligibility and Registration</h2>
            <p className="leading-relaxed mb-4">
              Participation is open to individuals, businesses, and community organizations that meet the eligibility
              requirements and agree to these Terms.
            </p>
            <p className="leading-relaxed mb-4">
              Sellers must hold a valid Australian Business Number (ABN), submit accurate registration information,
              and maintain compliance with Australian Consumer Law and Marketplace policies.
            </p>
            <p className="leading-relaxed">
              Account verification may include identity checks and confirmation of business details.
            </p>
          </section>

          {/* CERTIFICATION */}
          <section id="certification" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">2. Made in Arnhem Land Certification System</h2>
            <p className="leading-relaxed mb-4">
              The Made in Arnhem Land (MIA) Certification System upholds authenticity, quality, and cultural integrity.
            </p>
            <p className="leading-relaxed mb-4">
              Certification is voluntary but strongly encouraged. Certified sellers gain permission to use the Made in Arnhem Land brand
              and the &ldquo;100% Arnhem Land Certified&rdquo; logo, and access to VIP promotional services.
            </p>
            <p className="leading-relaxed mb-4">
              Certification ensures protection of Indigenous Cultural and Intellectual Property (ICIP), promotes ethical
              trade, and supports transparent sourcing. It includes criteria covering authenticity, cultural integrity,
              quality standards, and ethical practices. Certification is valid for two years and renewable through review.
            </p>
            <h3 className="text-xl font-semibold mb-3">Certification Requirements</h3>
            <p className="leading-relaxed mb-4">
              Certified sellers receive permission to use the 100% Arnhem Land Certification logo only in connection
              with approved certified products.
            </p>
            <p className="leading-relaxed mb-4">
              Use of the logo on non-certified products or modification of the logo design is strictly prohibited.
            </p>
            <p className="leading-relaxed">
              The Marketplace reserves the right to suspend listings or revoke certification privileges if misuse of
              the certification mark is identified.
            </p>
          </section>

          {/* SELLER RESPONSIBILITIES */}
          <section id="seller-responsibilities" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">3. Seller Responsibilities</h2>
            <p className="leading-relaxed mb-4">
              Sellers must ensure all information provided is accurate, complete, and current. Product descriptions
              and images must truthfully represent the items offered.
            </p>
            <p className="leading-relaxed mb-4">
              Sellers must comply with all applicable laws and cultural protocols, respond to buyers respectfully,
              and conduct business with professionalism. Use of the Marketplace must reflect the principles of
              respect and integrity.
            </p>
            <p className="leading-relaxed mb-4">
              Offensive or misleading conduct may result in suspension.
            </p>
            <p className="leading-relaxed">
              Sellers retain ownership of their intellectual property but grant the Marketplace a limited license
              to use approved images and descriptions for promotion.
            </p>
          </section>

          {/* PRODUCTS AND SERVICES */}
          <section id="products" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">4. Products and Services</h2>
            <p className="leading-relaxed mb-4">
              Certified and non-certified suppliers may participate. Certified suppliers include artists, cultural
              educators, bush food producers, and community enterprises. Non-certified suppliers include freight,
              transport, charter, construction, insurance, and other service providers contributing to Arnhem Land
              economic development.
            </p>
            <p className="leading-relaxed mb-4">
              All listings must be lawful, culturally appropriate, and clearly described. Prohibited items include
              restricted cultural materials, unsafe goods, and products that misrepresent Arnhem Land origin.
            </p>
            <p className="leading-relaxed">
              Sellers should include the name of the artist, maker, or originating community where applicable,
              along with relevant cultural context or story associated with the product.
            </p>
          </section>

          {/* ORDER MANAGEMENT */}
          <section id="order-management" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">5. Order Management and Delivery</h2>
            <p className="leading-relaxed mb-4">
              Sellers must confirm orders promptly and dispatch goods within stated timeframes. Packaging must be
              secure, professionally presented, and, where possible, sustainable. Delays due to weather or logistics
              must be communicated.
            </p>
            <p className="leading-relaxed mb-4">
              Lost or damaged items must be investigated promptly, and customers compensated or refunded as required.
              Sellers must maintain records of all orders and communications for 12 months.
            </p>
            <p className="leading-relaxed mb-4">
              Sellers are responsible for dispatching orders within the timeframe stated in their product listing.
              Sellers should provide tracking information where available and ensure reasonable communication with
              buyers regarding shipment status.
            </p>
            <h3 className="text-xl font-semibold mb-3">Authority to Leave (ATL) Deliveries</h3>
            <p className="leading-relaxed mb-4">
              Where a buyer selects or agrees to &ldquo;Authority to Leave&rdquo; delivery instructions, the delivery
              carrier may leave the package at the delivery address without obtaining a signature from the recipient.
              By selecting this option, the buyer acknowledges and accepts that the package may be left unattended
              at the delivery location.
            </p>
            <p className="leading-relaxed mb-4">
              The Marketplace and the seller are not responsible for loss, theft, or damage to packages after they
              have been delivered in accordance with the Authority to Leave instructions provided by the buyer.
            </p>
            <p className="leading-relaxed">
              Buyers who do not wish to use Authority to Leave should ensure that an attended delivery option or
              signature requirement is selected where available.
            </p>
          </section>

          {/* RETURNS */}
          <section id="returns" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">6. Returns, Refunds and Disputes</h2>
            <p className="leading-relaxed mb-4">
              All transactions are governed by Australian Consumer Law. Products must be of acceptable quality,
              fit for purpose, and match their description. Sellers must accept returns or issue refunds where
              goods are faulty, not as described, or undelivered.
            </p>
            <p className="leading-relaxed">
              Disputes should be resolved directly between buyer and seller. If unresolved, the Marketplace may
              mediate and, if necessary, refer matters to consumer protection authorities. Sellers should respond
              to return or refund requests within a reasonable timeframe and aim to resolve disputes promptly in
              accordance with Australian Consumer Law.
            </p>
          </section>

          {/* PAYMENTS */}
          <section id="payments" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">7. Payments and Fees</h2>
            <p className="leading-relaxed mb-4">
              Sellers pay a monthly licence fee (in advance) and a sales commission invoiced monthly in arrears.
              Advertising and optional service fees may also apply. Licence fees secure access to platform tools
              and support. Commission invoices must be paid within 14 days.
            </p>
            <p className="leading-relaxed mb-4">
              Non-payment may result in suspension or termination. Ask for detailed fees schedule. Sellers are
              responsible for their own tax compliance. Funds are reconciled monthly. Accounts with repeated
              non-payment may be terminated.
            </p>
            <p className="leading-relaxed">
              The Marketplace reserves the right to temporarily withhold payments where necessary to investigate
              suspected fraud, certification misuse, chargebacks, or other breaches of these Terms.
            </p>
          </section>

          {/* NON-PAYMENT */}
          <section id="non-payment" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">8. Non-Payment and Suspension</h2>

            <h3 className="text-xl font-semibold mb-2">Overdue License Fees</h3>
            <p className="leading-relaxed mb-4">
              If a monthly license fee remains unpaid for 14 days beyond the due date, the seller will receive a
              written reminder. Failure to pay within a further seven (7) days may result in automatic suspension
              of listings and account access until payment is made in full.
            </p>

            <h3 className="text-xl font-semibold mb-2">Overdue Commission Invoices</h3>
            <p className="leading-relaxed mb-4">
              Commission invoices not paid within 30 days of issue may incur late-payment interest at the standard
              commercial rate and trigger account suspension.
            </p>

            <h3 className="text-xl font-semibold mb-2">Repeated Non-Payment</h3>
            <p className="leading-relaxed mb-4">
              Repeated or extended non-payment (two or more consecutive billing cycles) may lead to termination
              under Section 13, loss of certification, and withdrawal of advertising privileges.
            </p>

            <h3 className="text-xl font-semibold mb-2">Reinstatement</h3>
            <p className="leading-relaxed mb-4">
              Accounts suspended for non-payment can be reinstated upon full settlement of arrears and administrative review.
            </p>
            <p className="leading-relaxed">
              The Marketplace reserves the right to recover unpaid fees or commissions through debt-recovery
              processes where necessary.
            </p>
          </section>

          {/* REINVESTMENT */}
          <section id="reinvestment" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">9. Community Reinvestment Model</h2>
            <p className="leading-relaxed mb-4">
              A portion of all Marketplace revenue contributes to the Community Reinvestment Fund. This fund
              supports training, mentoring, enterprise development, and cultural preservation programs across
              Arnhem Land.
            </p>
            <p className="leading-relaxed mb-4">
              A key initiative is the Made in Arnhem Land Business Builder Program, which provides mentoring, certification support,
              and start-up assistance for emerging local entrepreneurs.
            </p>
            <p className="leading-relaxed mb-4">
              Each quarter, allocations are made to projects that strengthen economic participation, digital
              inclusion, and wellbeing outcomes in Arnhem Land.
            </p>
            <p className="leading-relaxed">
              Reports on reinvestment outcomes are published annually through the Made in Arnhem Land Impact Report.
            </p>
          </section>

          {/* INTELLECTUAL PROPERTY */}
          <section id="intellectual-property" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">10. Intellectual Property and Cultural Ownership</h2>
            <p className="leading-relaxed mb-4">
              Cultural knowledge, designs, symbols, and stories remain the property of their communities. Sellers
              must obtain appropriate permissions before listing culturally significant works. Use of cultural
              imagery or language must be respectful and authorized.
            </p>
            <p className="leading-relaxed mb-4">
              The Marketplace may remove listings that breach ICIP principles or copyright law. All sellers agree
              to protect the integrity of Arnhem Land&apos;s traditional knowledge and avoid the misuse or
              commercialization of sacred or restricted material.
            </p>
            <p className="leading-relaxed">
              Cultural attribution must always be clear and accurate.
            </p>
          </section>

          {/* PLATFORM USE */}
          <section id="platform-use" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">11. Platform Use Policy</h2>
            <p className="leading-relaxed mb-4">
              All users must act respectfully, lawfully, and in accordance with Made in Arnhem Land values. Prohibited conduct
              includes harassment, fraud, offensive language, impersonation, and cultural misrepresentation.
              Sellers must protect customer data and use the platform responsibly.
            </p>
            <p className="leading-relaxed mb-4">
              All reviews and feedback must be truthful, professional, and based on genuine experience.
            </p>
            <p className="leading-relaxed">
              Breach of this policy may result in immediate suspension or permanent termination.
            </p>
          </section>

          {/* PRIVACY */}
          <section id="privacy" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">12. Privacy and Data Protection</h2>
            <p className="leading-relaxed mb-4">
              The Marketplace collects and processes personal information from buyers and sellers for the purposes
              of operating the platform, facilitating transactions, processing payments, delivering orders, and
              providing customer support. Personal information may include names, contact details, delivery
              addresses, and payment-related information.
            </p>
            <p className="leading-relaxed mb-4">
              The Marketplace will take reasonable steps to ensure that personal information is stored securely
              and used only for legitimate operational purposes.
            </p>
            <p className="leading-relaxed">
              Sellers must only use buyer information for the purpose of fulfilling orders and must not share or
              misuse personal data obtained through the Marketplace.
            </p>
          </section>

          {/* LEGAL TERMS */}
          <section id="legal" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">13. Legal Terms and Liabilities</h2>
            <p className="leading-relaxed mb-4">
              The Marketplace acts as an intermediary and is not liable for product quality, authenticity, or
              delivery delays. Liability is limited to the total value of fees paid by the seller in the previous
              six (6) months.
            </p>
            <p className="leading-relaxed mb-4">
              Sellers indemnify the Marketplace against any claim or loss arising from their conduct, listings,
              or breach of these Terms. Neither party will be held liable for events outside their control,
              including natural disasters, transport disruptions, or government restrictions.
            </p>
            <p className="leading-relaxed">
              These Terms are governed by the laws of the Northern Territory of Australia.
            </p>
          </section>

          {/* TERMINATION */}
          <section id="termination" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">14. Termination and Suspension</h2>
            <p className="leading-relaxed mb-4">
              Accounts may be suspended or terminated for breaches, non-payment, or repeated disputes. Sellers
              may also withdraw voluntarily by written notice. Upon termination, all branding rights and access
              are revoked, but financial obligations remain.
            </p>
            <p className="leading-relaxed mb-4">
              Appeals may be submitted in writing within 14 days of termination notice. Reinstatement is at
              the discretion of Made in Arnhem Land Marketplace management.
            </p>
            <p className="leading-relaxed">
              In the event of account suspension or termination, sellers remain responsible for fulfilling any
              outstanding confirmed orders unless otherwise agreed with the buyer or directed by the Marketplace.
            </p>
          </section>

          {/* AMENDMENTS */}
          <section id="amendments" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">15. Amendments and Notifications</h2>
            <p className="leading-relaxed mb-4">
              The Marketplace may update these Terms to reflect operational or legal changes. Sellers will be
              notified at least 30 days in advance through email, the Seller Dashboard, or the website.
            </p>
            <p className="leading-relaxed mb-4">
              Continued use of the platform after this notice period constitutes acceptance of the new Terms.
            </p>
            <p className="leading-relaxed">
              Sellers who do not agree may terminate participation before changes take effect.
            </p>
          </section>

          {/* ACKNOWLEDGEMENT */}
          <section id="acknowledgement" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">16. Acknowledgement and Acceptance</h2>
            <p className="leading-relaxed mb-4">
              By registering or continuing to trade on the Made in Arnhem Land Marketplace, the seller confirms
              that they:
            </p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>
                Have read and understood the Made in Arnhem Land Marketplace and Certification – Supplier Terms
                and Conditions;
              </li>
              <li>Agree to be bound by these Terms in full; and</li>
              <li>
                Commit to upholding the values of respect, authenticity, and integrity that underpin the Made in Arnhem Land initiative.
              </li>
            </ul>
            <p className="leading-relaxed mb-4">
              Digital acceptance (via tick box or dashboard click) carries the same legal effect as a signed agreement.
            </p>
            <p className="leading-relaxed">
              Where a seller is a business or organization, the individual accepting the Terms warrants that they
              have full authority to do so on behalf of that entity.
            </p>
          </section>

          {/* VERSION CONTROL */}
          {/* <section className="scroll-mt-32 mb-20 border-t border-gray-300 pt-8">
            <h2 className="text-xl font-bold mb-3">Version Control</h2>
            
            <p className="text-gray-700">Date: 11/13/2026</p>
            <p className="text-gray-700">Prepared for: Made in Arnhem Land Marketplace and Certification</p>
          </section> */}

        </main>
      </div>
    </div>
  );
}
