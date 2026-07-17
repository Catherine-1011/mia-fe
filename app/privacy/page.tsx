import React from "react";
import { FaFileSignature } from "react-icons/fa";
import VideoHeroSection from "@/components/common-components/VideoHeroSection";

const sections = [
  { id: "what-this-covers", label: "What This Policy Covers" },
  { id: "information-we-collect", label: "Information We Collect" },
  { id: "how-we-collect", label: "How We Collect Information" },
  { id: "how-we-use", label: "How We Use Information" },
  { id: "disclosure", label: "Disclosure of Information" },
  { id: "overseas-disclosure", label: "Overseas Disclosure" },
  { id: "cookies", label: "Cookies & Analytics" },
  { id: "data-security", label: "Data Security" },
  { id: "data-deletion", label: "Data Deletion & Retention" },
  { id: "access-correction", label: "Access & Correction" },
  { id: "marketing", label: "Marketing Communications" },
  { id: "changes", label: "Changes to This Policy" },
  { id: "governing-law", label: "Governing Law" },
  { id: "complaints", label: "Complaints" },
];

export default function Page() {
  return (
    <div className="bg-[#f3e9dd]">

      {/* HERO SECTION */}
      <VideoHeroSection className="min-h-[70vh]">
        <div className="relative z-10 flex flex-col items-center justify-center text-white text-center px-4 py-32 md:py-60">
          <h1 className="text-5xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-lg max-w-2xl">
            We respect your privacy and are committed to protecting your personal
            information in accordance with applicable Australian privacy laws.
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

        {/* MAIN CONTENT*/}
        <main className="flex-1 max-w-screen-2xl mx-auto">

          <h1 className="text-3xl font-bold mb-4">Welcome to our Privacy Policy</h1>

          {/* <p className="leading-relaxed mb-2">
            <span className="font-semibold">Effective Date:</span> 24/03/2026
          </p> */}
          <p className="leading-relaxed mb-4">
            Made in Arnhem Land ("Marketplace", "we", "our", "us") respects your privacy and is
            committed to protecting personal information in accordance with applicable Australian privacy laws.
          </p>
          <p className="leading-relaxed mb-4">
            This policy should be read together with our Terms &amp; Conditions.
          </p>
          <p className="leading-relaxed mb-2 font-semibold">Contact details</p>
          <p className="leading-relaxed mb-2">
            Made in Arnhem Land is responsible for handling personal information in accordance with
            the Privacy Act 1988 (Cth).
          </p>
          <p className="leading-relaxed mb-1">
            Privacy enquiries, access requests, correction requests, or complaints may be directed to:
          </p>
          <p className="leading-relaxed mb-1">
            <span className="font-semibold">Email:</span>{" "}
            <a href="mailto:reception@alpa.asn.au" className="text-[#440C03] underline">
              reception@alpa.asn.au
            </a>
          </p>
          <p className="leading-relaxed mb-12">
            <span className="font-semibold">Postal address:</span> GPO Box 3825 Darwin NT 0801
          </p>

          {/* 1 */}
          <section id="what-this-covers" className="scroll-mt-32 mb-10">
            <h2 className="text-2xl font-bold mb-2">1. What This Policy Covers</h2>
            <p className="leading-relaxed">
              This Privacy Policy applies to all users of the Made in Arnhem Land marketplace,
              including buyers, sellers, and visitors.
            </p>
          </section>

          {/* 2 */}
          <section id="information-we-collect" className="scroll-mt-32 mb-10">
            <h2 className="text-2xl font-bold mb-2">2. Information We Collect</h2>
            <p className="leading-relaxed mb-4">
              Some personal information is required to provide marketplace services, including account
              creation, order processing, seller onboarding, and payment processing.
            </p>
            <p className="leading-relaxed mb-4">
              If required information is not provided, we may be unable to provide certain services or
              complete transactions.
            </p>
            <p className="leading-relaxed mb-2">We may collect:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Name and contact details</li>
              <li>Billing and shipping address</li>
              <li>Business details (including ABN where applicable)</li>
              <li>Payment-related information (processed via third-party providers)</li>
              <li>Order and transaction history</li>
              <li>Seller verification and certification information</li>
              <li>Communications with us</li>
              <li>Website usage data, cookies, and analytics</li>
            </ul>
          </section>

          {/* 3 */}
          <section id="how-we-collect" className="scroll-mt-32 mb-10">
            <h2 className="text-2xl font-bold mb-2">3. How We Collect Information</h2>
            <p className="leading-relaxed mb-2">We collect information when you:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Create an account</li>
              <li>Place an order</li>
              <li>Register as a seller</li>
              <li>Apply for certification</li>
              <li>Contact support</li>
              <li>Browse or interact with the platform</li>
            </ul>
          </section>

          {/* 4 */}
          <section id="how-we-use" className="scroll-mt-32 mb-10">
            <h2 className="text-2xl font-bold mb-2">4. How We Use Information</h2>
            <p className="leading-relaxed mb-4">
              Where consent is required for particular uses of personal information, consent may be
              withdrawn at any time by contacting us. Withdrawal of consent may affect our ability to
              provide certain services.
            </p>
            <p className="leading-relaxed mb-2">We use personal information to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Operate and manage the marketplace</li>
              <li>Process transactions and payments</li>
              <li>Enable order fulfilment and delivery</li>
              <li>Support seller onboarding and certification</li>
              <li>Provide customer support</li>
              <li>Detect fraud or misuse</li>
              <li>Improve the platform</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          {/* 5 */}
          <section id="disclosure" className="scroll-mt-32 mb-10">
            <h2 className="text-2xl font-bold mb-2">5. Disclosure of Information</h2>
            <p className="leading-relaxed mb-2">We may share information with:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Sellers (to fulfil orders)</li>
              <li>Payment providers</li>
              <li>Shipping and logistics providers</li>
              <li>IT and service providers</li>
              <li>Legal and regulatory authorities where required</li>
            </ul>
          </section>

          {/* 6 */}
          <section id="overseas-disclosure" className="scroll-mt-32 mb-10">
            <h2 className="text-2xl font-bold mb-2">6. Overseas Disclosure</h2>
            <p className="leading-relaxed mb-4">
              Some third-party service providers (such as hosting, analytics, or payment services) may
              store or process personal information outside Australia.
            </p>
            <p className="leading-relaxed">
              We take reasonable steps to ensure that overseas recipients handle personal information
              in a manner consistent with the Australian Privacy Principles, including through
              contractual arrangements or other safeguards, unless an exception under the Privacy Act applies.
            </p>
          </section>

          {/* 7 */}
          <section id="cookies" className="scroll-mt-32 mb-10">
            <h2 className="text-2xl font-bold mb-2">7. Cookies &amp; Analytics</h2>
            <p className="leading-relaxed mb-4">
              We use cookies and similar technologies to operate the marketplace, remember your
              preferences, understand how visitors use our site, and improve performance.
            </p>
            <p className="leading-relaxed mb-2 font-semibold">Google Analytics 4</p>
            <p className="leading-relaxed mb-4">
              We use Google Analytics 4 ("GA4"), a web analytics service provided by Google LLC, to
              help us understand how visitors interact with our site. GA4 may collect information
              such as device and browser type, approximate location (derived from IP address),
              pages visited, time spent on the site, and referral source. This information is used
              in aggregated and statistical form and is not used to identify you personally.
            </p>
            <p className="leading-relaxed mb-4">
              Data collected by GA4 is transmitted to and stored on Google's servers, which may be
              located outside Australia, including in the United States. Google's use of this
              information is governed by the{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#440C03] underline"
              >
                Google Privacy Policy
              </a>
              .
            </p>
            <p className="leading-relaxed mb-4">
              When you first visit our site, you will be asked whether you consent to analytics
              cookies. GA4 will only be activated if you provide consent. You can change your
              preference at any time using the "Privacy Preferences" link in the site footer, or
              disable cookies entirely via your browser settings.
            </p>
            <p className="leading-relaxed">
              You can also opt out of Google Analytics tracking across all websites using the{" "}
              <a
                href="https://tools.google.com/dlpage/gaoptout"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#440C03] underline"
              >
                Google Analytics Opt-out Browser Add-on
              </a>
              .
            </p>
          </section>

          {/* 8 */}
          <section id="data-security" className="scroll-mt-32 mb-10">
            <h2 className="text-2xl font-bold mb-2">8. Data Security</h2>
            <p className="leading-relaxed">
              We take reasonable steps to protect personal information from unauthorised access, loss, or misuse.
            </p>
          </section>

          {/* 9 */}
          <section id="data-deletion" className="scroll-mt-32 mb-10">
            <h2 className="text-2xl font-bold mb-2">9. Data Deletion &amp; Retention</h2>
            <p className="leading-relaxed mb-4">
              You may request that we delete or de-identify your personal information at any time by contacting us.
              We will acknowledge your request promptly and aim to respond within 30 days.
            </p>
            <p className="leading-relaxed mb-2">
              We will take reasonable steps to delete your personal information where:
            </p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>The information is no longer required for the purposes for which it was collected, and</li>
              <li>We are not required to retain it under applicable laws or for legitimate business purposes</li>
            </ul>
            <p className="leading-relaxed mb-2">
              In some cases, we may be required or permitted to retain certain information, including where necessary to:
            </p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>Comply with legal or regulatory obligations</li>
              <li>Complete or manage ongoing transactions</li>
              <li>Resolve disputes or enforce agreements</li>
              <li>Detect or prevent fraud or misuse</li>
            </ul>
            <p className="leading-relaxed mb-4">
              Where deletion is not possible, we may retain and securely store the information or de-identify it
              so that it no longer identifies you.
            </p>
            <p className="leading-relaxed mb-4">
              We may retain transactional and financial records for a minimum of 5 years, and in some cases up to
              7 years or longer, to comply with Australian taxation, accounting, and regulatory obligations.
            </p>
            <p className="leading-relaxed mb-2 font-semibold">Data breaches</p>
            <p className="leading-relaxed">
              In the event of a data breach that is likely to result in serious harm, we will comply with the
              Notifiable Data Breaches scheme under the Privacy Act 1988 (Cth), including notifying affected
              individuals and the Office of the Australian Information Commissioner (OAIC) where required.
            </p>
          </section>

          {/* 10 */}
          <section id="access-correction" className="scroll-mt-32 mb-10">
            <h2 className="text-2xl font-bold mb-2">10. Access &amp; Correction</h2>
            <p className="leading-relaxed">
              You may request access to or correction of your personal information by contacting us.
            </p>
          </section>

          {/* 11 */}
          <section id="marketing" className="scroll-mt-32 mb-10">
            <h2 className="text-2xl font-bold mb-2">11. Marketing Communications</h2>
            <p className="leading-relaxed mb-4">
              We may send marketing communications where permitted by law.
            </p>
            <p className="leading-relaxed mb-4">
              You may opt out of receiving marketing communications at any time by using the unsubscribe
              option provided or by contacting us.
            </p>
            <p className="leading-relaxed">
              Requests to opt out will be actioned within a reasonable timeframe.
            </p>
          </section>

          {/* 12 */}
          <section id="changes" className="scroll-mt-32 mb-10">
            <h2 className="text-2xl font-bold mb-2">12. Changes to This Policy</h2>
            <p className="leading-relaxed">
              We may update this policy from time to time. Updates will be published on this page.
            </p>
          </section>

          {/* 13 */}
          <section id="governing-law" className="scroll-mt-32 mb-10">
            <h2 className="text-2xl font-bold mb-2">13. Governing Law</h2>
            <p className="leading-relaxed">
              This policy is governed by the laws of the Northern Territory, Australia and applicable
              Commonwealth laws.
            </p>
          </section>

          {/* 14 */}
          <section id="complaints" className="scroll-mt-32 mb-20">
            <h2 className="text-2xl font-bold mb-2">14. Complaints</h2>
            <p className="leading-relaxed mb-4">
              If you believe your privacy has been breached, you may lodge a complaint with us using the
              contact details above.
            </p>
            <p className="leading-relaxed mb-4">
              We will acknowledge receipt of your complaint promptly and aim to respond within a reasonable timeframe.
            </p>
            <p className="leading-relaxed">
              If you are not satisfied with our response, you may lodge a complaint with the Office of the
              Australian Information Commissioner (OAIC).
            </p>
          </section>

        </main>
      </div>
    </div>
  );
}