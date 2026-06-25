import React from "react";
import type { Metadata } from "next";
import { FaFileSignature } from "react-icons/fa";
import VideoHeroSection from "@/components/common-components/VideoHeroSection";

export const metadata: Metadata = {
  title: "100% Made in Arnhem Land Certification",
  description:
    "Learn about our certification process ensuring every product is authentically made by Aboriginal artists and businesses from Arnhem Land.",
  alternates: { canonical: "/certification" },
};

export default function CertificationPage() {
  return (
    <div className="bg-[#f3e9dd]">

      {/* HERO SECTION */}
      <VideoHeroSection className="min-h-[70vh]">
        <div className="relative z-10 flex flex-col items-center justify-center text-white text-center px-4 py-32 md:py-60">
          <h1 className="text-5xl font-bold mb-2">100% Made in Arnhem Land</h1>
          <p className="text-lg max-w-2xl">
            Certification Framework for Authentic Indigenous Products — guaranteeing cultural
            integrity, community benefit, and genuine Arnhem Land origin.
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
              { id: "what-is", label: "What is the Arnhem Land Certification?" },
              { id: "how-it-works", label: "How Certification Works" },
              { id: "why-logo", label: "Why the Logo Matters" },
              { id: "benefits", label: "Benefits for Sellers and Buyers" },
              { id: "using-logo", label: "Using the Arnhem Land Logo" },
              { id: "faq", label: "Frequently Asked Questions" },
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

          <h1 className="text-3xl font-bold mb-4">
            100% Made in Arnhem Land — Certification Framework for Authentic Indigenous Products
          </h1>

          <p className="leading-relaxed mb-12 text-gray-700">
            The Made in Arnhem Land Marketplace is committed to protecting and celebrating genuine
            Arnhem Land culture, art, and businesses through a rigorous certification framework.
          </p>

          {/* WHAT IS THE CERTIFICATION */}
          <section id="what-is" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">What is the Arnhem Land Certification?</h2>
            <p className="leading-relaxed mb-4">
              The 100% Arnhem Land Certification is a regional trust mark for genuine Indigenous products
              from Arnhem Land (a regional area in the NT). It guarantees that certified products truly
              &ldquo;come from country&rdquo; and follow local cultural protocols. In practice, this means the product
              is either originating in Arnhem Land, or made or approved by local Aboriginal makers, and
              delivers clear benefits to Arnhem Land communities. In short, the Arnhem Land logo signals
              that an item is authentic, ethically sourced and culturally approved.
            </p>

            <ul className="space-y-4 mb-4">
              <li className="flex gap-3">
                <span className="mt-1 shrink-0 w-2 h-2 rounded-full bg-[#440C03]" />
                <p className="leading-relaxed text-gray-700">
                  <strong>Authentication:</strong> The mark assures buyers that the product was created by
                  Arnhem Land artists or businesses and approved by the right Elder or clan. It is not a
                  generic &ldquo;Indigenous style&rdquo; label; products must originate from Arnhem Land or be approved
                  by the community and respect traditional laws.
                </p>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 shrink-0 w-2 h-2 rounded-full bg-[#440C03]" />
                <p className="leading-relaxed text-gray-700">
                  <strong>Cultural Integrity:</strong> Certified items must comply with local protocols
                  (for example, no unauthorised use of sacred designs or language).
                </p>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 shrink-0 w-2 h-2 rounded-full bg-[#440C03]" />
                <p className="leading-relaxed text-gray-700">
                  <strong>Community Benefit:</strong> Producers agree to share income or jobs with Arnhem
                  Land communities. Profits from certified items flow back to the people and places of
                  Arnhem Land.
                </p>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 shrink-0 w-2 h-2 rounded-full bg-[#440C03]" />
                <p className="leading-relaxed text-gray-700">
                  <strong>Quality Assurance:</strong> The certification provides a quality and provenance
                  guarantee. Buyers can trust that certified goods meet agreed standards and are not
                  exploitative copies.
                </p>
              </li>
            </ul>

            <p className="leading-relaxed">
              These guarantees address a serious problem: studies show most &ldquo;Indigenous art&rdquo; on the market
              is inauthentic — a bigger chunk in some tourist outlets are copies or imports. Fake or exploitative
              products divert income away from real artists, damage reputations and offend Indigenous cultural IP.
              The Arnhem Land logo helps shoppers distinguish legitimate Arnhem Land products from look-alikes,
              and ensures artists and communities receive a fair share of the value.
            </p>
          </section>

          {/* HOW CERTIFICATION WORKS */}
          <section id="how-it-works" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">How Certification Works</h2>
            <p className="leading-relaxed mb-4">
              To become certified, a seller submits an application outlining their product and process.
              Key requirements include:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6 text-gray-700">
              <li>
                The product must be made or designed by Indigenous people of Arnhem Land (for example,
                Yolŋu artists or community members running a business) and produced in Arnhem Land —
                meaning the creative work, design or harvesting happens in the community.
              </li>
              <li>
                The product must have cultural approval: Elders or Traditional Owners must have endorsed
                the design, stories, materials or usage.
              </li>
              <li>
                It must respect cultural protocols: no sacred stories or restricted symbols are used
                without permission, and artists are properly credited.
              </li>
              <li>
                There must be a direct benefit to Arnhem Land — e.g. part of the revenue goes back into
                the local community, or jobs/training are created.
              </li>
            </ul>

            <p className="leading-relaxed mb-4">
              There are certification tiers to acknowledge different levels of involvement:
            </p>
            <div className="space-y-3 mb-6">
              <div className="bg-[#440C03]/10 rounded-xl p-4">
                <p className="font-semibold text-[#440C03] mb-1">Tier 1 — Community Made</p>
                <p className="text-gray-700 leading-relaxed">
                  100% Arnhem Land made goods by local artists.
                </p>
              </div>
              <div className="bg-[#440C03]/10 rounded-xl p-4">
                <p className="font-semibold text-[#440C03] mb-1">Tier 2 — Community Directed</p>
                <p className="text-gray-700 leading-relaxed">
                  Covers designs from Arnhem Land creators or businesses made with outside help.
                </p>
              </div>
              <div className="bg-[#440C03]/10 rounded-xl p-4">
                <p className="font-semibold text-[#440C03] mb-1">Tier 3 — Collaborative</p>
                <p className="text-gray-700 leading-relaxed">
                  Applies when non-Indigenous partners co-produce under fair agreements.
                </p>
              </div>
            </div>

            <p className="leading-relaxed mb-4">
              An independent board of Arnhem Land representatives and experts evaluates each application.
              If approved, the seller receives a digital certificate and permission to use the 100% Arnhem
              Land logo on that product. Certified producers must then make an annual declaration to keep
              the certification valid, and the board can conduct spot checks or audits. This ongoing oversight
              ensures the mark remains a trusted symbol.
            </p>
          </section>

          {/* WHY THE LOGO MATTERS */}
          <section id="why-logo" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">Why the Logo Matters</h2>
            <p className="leading-relaxed mb-4">
              The Arnhem Land logo is a trusted authenticity mark. For consumers, it acts like a seal of
              authenticity and ethical assurance. When buyers see the logo, they know: &ldquo;This item was
              genuinely made by Arnhem Land artists under proper cultural guidance.&rdquo; That confidence is
              crucial, because fake or mislabelled Indigenous products are a widespread issue. Independent
              reports warn that unethical dealers often sell &ldquo;false&rdquo; art or souvenirs without telling buyers.
              A visible certification mark cuts through that confusion.
            </p>
            <p className="leading-relaxed mb-4">
              For Indigenous communities, the logo helps reclaim control over their culture and economy.
              Studies of similar Indigenous labelling schemes show major benefits:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6 text-gray-700">
              <li>Certified artists get a fairer share of sales.</li>
              <li>Retailers and tourists can easily spot authentic goods.</li>
              <li>Manufacturers are encouraged to license designs directly from artists.</li>
            </ul>
            <p className="leading-relaxed mb-4">
              In many cases, a label of authenticity was found to ensure &ldquo;Indigenous artists will receive a
              fair and improved return&rdquo; and that consumers &ldquo;will identify goods of Indigenous origin in
              preference to &lsquo;copy-cat&rsquo; products.&rdquo; In other words, certification puts buying power into the
              hands of artists and community people.
            </p>
            <p className="leading-relaxed mb-4">
              Likewise, global examples underline the value of such marks. Canada&apos;s &ldquo;Original Original&rdquo; seal
              only marks experiences or products that are majority-owned by Indigenous people and uphold
              Indigenous values. In Australia, tourism programs like Respecting Our Cultures have similarly
              used Indigenous-led standards to boost recognition and economic benefits. Made in Arnhem Land&apos;s
              certification follows this model: it celebrates and promotes genuine Indigenous goods rather than
              merely policing fraud.
            </p>
          </section>

          {/* BENEFITS */}
          <section id="benefits" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">Benefits for Sellers and Buyers</h2>
            <p className="leading-relaxed mb-4">
              Why should sellers get certified? Using the Arnhem Land logo can make your product stand out.
              Buyers increasingly want ethical, authentic items and are willing to pay for certified origin.
              The logo tells customers the story and value behind the product — they know it supports local
              artists and culture.
            </p>
            <p className="leading-relaxed mb-4">
              For consumers and traders, the certification is a quick reference: if they care about ethical
              sourcing, the logo simplifies their choice. It guarantees that the product has undergone
              &ldquo;cultural approval&rdquo; and that proceeds benefit the local community.
            </p>
            <p className="leading-relaxed">
              In short, certification creates a virtuous cycle: authentic Arnhem Land products fetch better
              value, ensuring artists earn more, which in turn funds community projects and keeps traditional
              arts alive.
            </p>
          </section>

          {/* USING THE LOGO */}
          <section id="using-logo" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">Using the Arnhem Land Logo</h2>
            <p className="leading-relaxed mb-4">
              Once certified, you may display the 100% Made in Arnhem Land logo on packaging, labels, online
              listings, signage or social media — wherever it helps identify your product. To keep the logo
              meaningful, you must follow the brand guidelines:
            </p>
            <ul className="list-disc pl-6 space-y-3 mb-4 text-gray-700">
              <li>
                <strong>Integrity:</strong> Do not alter the logo&apos;s shape, colour or design. Always use
                the official artwork.
              </li>
              <li>
                <strong>Placement:</strong> Position the logo prominently alongside product information
                (for example, near the product name).
              </li>
              <li>
                <strong>Legibility:</strong> Use the logo at a size where all text and design elements are
                easily readable. On small products or images, consider placing it on tags or inserts instead.
              </li>
              <li>
                <strong>Context:</strong> Where possible, explain the logo. For example, add a brief line
                like &ldquo;Certified 100% Arnhem Land&rdquo; or link to a FAQ page so consumers understand the
                mark&apos;s significance.
              </li>
            </ul>
          </section>

          {/* FAQ */}
          <section id="faq" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-[#440C03] mb-2">
                  Q: What kinds of products qualify?
                </h3>
                <p className="leading-relaxed text-gray-700">
                  The logo covers traditional and contemporary cultural items. This includes artworks,
                  crafts, carvings, jewellery, woven goods, bush tucker or bush-food products, language
                  apps or books, cultural tours and any product or service created or managed by Arnhem
                  Land people under cultural authority.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#440C03] mb-2">
                  Q: Do I have to be an Indigenous art centre or business to apply?
                </h3>
                <p className="leading-relaxed text-gray-700">
                  No, individual artists, community workshops, cooperatives or even partnerships can apply.
                  The key is that the creators are Arnhem Land Indigenous people and that any outside
                  collaborators respect the rules.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#440C03] mb-2">
                  Q: What is the process and how long does it take?
                </h3>
                <p className="leading-relaxed text-gray-700">
                  After you submit the application form and supporting documents (like artist details and
                  community endorsements), the certification group will review it. This includes checking the
                  cultural approvals. Once approved, you can use the logo. Generally, it can take about 1–2
                  weeks, depending on completeness of the application.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#440C03] mb-2">
                  Q: Are there fees or obligations?
                </h3>
                <p className="leading-relaxed text-gray-700">
                  Applicants usually pay a modest application fee to cover administration. Certified sellers
                  must submit an annual declaration confirming continued compliance. Any reported misuse of
                  the logo can lead to suspension.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#440C03] mb-2">
                  Q: My product is inspired by Arnhem Land but not made there — can I still use the logo?
                </h3>
                <p className="leading-relaxed text-gray-700">
                  No. To use the logo, the product must be at least Tier 2 or 3 in the certification sense
                  (meaning Arnhem Land people direct or co-create it). If significant parts of production
                  happen outside Arnhem Land without local leadership, it does not qualify for the logo.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#440C03] mb-2">
                  Q: Who enforces this certification?
                </h3>
                <p className="leading-relaxed text-gray-700">
                  A board made up of Arnhem Land community representatives and experts oversees the scheme.
                  They ensure that only authentic products get certified and that logo use follows the rules.
                  Community members are encouraged to report misuse (for example, seeing the logo on a
                  counterfeit item). The system has penalties (like revoking certification) to protect the
                  integrity of the mark.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#440C03] mb-2">
                  Q: How does this differ from other trademarks or authenticity schemes?
                </h3>
                <p className="leading-relaxed text-gray-700">
                  Unlike a regular trademark, the Arnhem Land certification is a collective authenticity
                  label. It will be managed by a community-controlled body, and it specifically signals
                  cultural legitimacy and benefit-sharing.
                </p>
              </div>
            </div>
          </section>

          {/* SUMMARY & CTA */}
          <section className="scroll-mt-32 mb-8 bg-[#440C03]/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-3">In Summary</h2>
            <p className="leading-relaxed text-gray-700 mb-4">
              The 100% Arnhem Land logo is your guarantee of authenticity and cultural integrity. It tells
              everyone — from gallery owners to souvenir shoppers — that the product is truly Arnhem Land
              made and ethically sourced. By seeking certification and using the logo, sellers show respect
              for Yolŋu culture and support local communities. In doing so, they join a growing movement
              where buyers ask &ldquo;Who made this? Where did it come from?&rdquo; and the logo provides a clear,
              honest answer.
            </p>
            <p className="leading-relaxed text-gray-700">
              Learn more and apply:{" "}
              <a
                href="/sellerOnboarding"
                className="text-[#440C03] font-semibold underline hover:text-[#7a1a06] transition-colors"
              >
                Visit our registration page
              </a>{" "}
              for application forms, branding guidelines, and detailed criteria. Join the Arnhem Land
              family of authentic creators and let your art or product carry the pride of country.
            </p>
          </section>

        </main>
      </div>
    </div>
  );
}
