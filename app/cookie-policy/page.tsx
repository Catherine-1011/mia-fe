import React from "react";
import { FaCookie } from "react-icons/fa";
import VideoHeroSection from "@/components/common-components/VideoHeroSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy | Made in Arnhem Land Marketplace",
};

export default function CookiePolicyPage() {
  return (
    <div className="bg-[#f3e9dd]">

      {/* HERO SECTION */}
      <VideoHeroSection className="min-h-[70vh]">
        <div className="relative z-10 flex flex-col items-center justify-center text-white text-center px-4 py-32 md:py-60">
          <h1 className="text-5xl font-bold mb-2">Cookie Policy</h1>
          <p className="text-lg max-w-2xl">
            Made in Arnhem Land Marketplace — how we use cookies and similar
            technologies to improve your experience.
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
              { id: "what-are-cookies", label: "What Are Cookies?" },
              { id: "how-we-use", label: "How We Use Cookies" },
              { id: "types", label: "Types of Cookies We Use" },
              { id: "third-party", label: "Third-Party Cookies" },
              { id: "your-choices", label: "Your Cookie Choices" },
              { id: "managing", label: "Managing Cookies in Your Browser" },
              { id: "do-not-track", label: "Do Not Track" },
              { id: "updates", label: "Updates to This Policy" },
              { id: "contact", label: "Contact Us" },
            ].map((item) => (
              <li
                key={item.id}
                className="bg-[#D0BFB3] rounded-2xl hover:bg-[#440C03] hover:text-white transition"
              >
                <a href={`#${item.id}`} className="flex items-center gap-3 px-4 py-2">
                  <FaCookie size={18} />
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1">
          <h1 className="text-3xl font-bold mb-2">
            Made in Arnhem Land Marketplace — Cookie Policy
          </h1>
          <p className="text-gray-500 text-sm mb-10">Last updated: June 2026</p>

          {/* WHAT ARE COOKIES */}
          <section id="what-are-cookies" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">What Are Cookies?</h2>
            <p className="leading-relaxed mb-4">
              Cookies are small text files that are placed on your device (computer, tablet, or mobile phone)
              when you visit a website. They are widely used to make websites work more efficiently, to
              remember your preferences, and to provide information to website owners.
            </p>
            <p className="leading-relaxed">
              Cookies do not contain personally identifiable information on their own, but information we store
              about you may be linked to information obtained from cookies.
            </p>
          </section>

          {/* HOW WE USE COOKIES */}
          <section id="how-we-use" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">How We Use Cookies</h2>
            <p className="leading-relaxed mb-4">
              The Made in Arnhem Land Marketplace uses cookies and similar technologies to:
            </p>
            <ul className="space-y-3 ml-4">
              {[
                "Keep you signed in to your account across pages and sessions.",
                "Remember items you have added to your shopping cart.",
                "Understand how visitors use our platform so we can improve it.",
                "Remember your preferences such as language and display settings.",
                "Enable secure payment processing and fraud prevention.",
                "Measure the effectiveness of our marketing and promotional campaigns.",
                "Provide a personalised browsing experience based on your activity.",
              ].map((item) => (
                <li key={item} className="flex gap-2 leading-relaxed">
                  <span className="text-[#440C03] mt-1">&#9658;</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* TYPES OF COOKIES */}
          <section id="types" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-6">Types of Cookies We Use</h2>
            <div className="space-y-6">
              {[
                {
                  title: "Strictly Necessary Cookies",
                  badge: "Always Active",
                  body: "These cookies are essential for the website to function and cannot be switched off. They are set in response to actions you take such as logging in, adding items to your cart, or filling in forms. Without these cookies, services you have asked for cannot be provided.",
                },
                {
                  title: "Performance & Analytics Cookies",
                  badge: "Optional",
                  body: "These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us understand which pages are the most and least popular and see how visitors move around the site. All information collected is aggregated and anonymous.",
                },
                {
                  title: "Functionality Cookies",
                  badge: "Optional",
                  body: "These cookies enable the website to provide enhanced functionality and personalisation. They may be set by us or by third-party providers whose services we have added to our pages. If you disable these cookies, some or all of these services may not function properly.",
                },
                {
                  title: "Targeting & Marketing Cookies",
                  badge: "Optional",
                  body: "These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant advertisements on other sites. They do not store directly personal information, but are based on uniquely identifying your browser and device.",
                },
                {
                  title: "Session Cookies",
                  badge: "Temporary",
                  body: "Session cookies are temporary and are deleted from your device when you close your browser. They are used to maintain your session state while you navigate between pages on our site, such as keeping your cart intact or maintaining your login status.",
                },
                {
                  title: "Persistent Cookies",
                  badge: "Long-term",
                  body: "Persistent cookies remain on your device for a set period or until you delete them manually. They are used to remember your preferences and settings for your next visit so you do not need to re-enter them each time.",
                },
              ].map((cookie) => (
                <div key={cookie.title} className="bg-[#e8d9cb] rounded-2xl px-6 py-5">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">{cookie.title}</h3>
                    <span className="text-xs bg-[#440C03] text-white px-3 py-0.5 rounded-full">
                      {cookie.badge}
                    </span>
                  </div>
                  <p className="leading-relaxed text-gray-700">{cookie.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* THIRD-PARTY COOKIES */}
          <section id="third-party" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">Third-Party Cookies</h2>
            <p className="leading-relaxed mb-4">
              Some cookies on our site are set by third-party services that appear on our pages. We do not
              control the operation of these cookies. The third parties we work with may include:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#440C03] text-white">
                    <th className="px-4 py-3 font-semibold rounded-tl-xl">Provider</th>
                    <th className="px-4 py-3 font-semibold">Purpose</th>
                    <th className="px-4 py-3 font-semibold rounded-tr-xl">More Information</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      provider: "Stripe",
                      purpose: "Secure payment processing and fraud prevention",
                      link: "stripe.com/privacy",
                      href: "https://stripe.com/privacy",
                    },
                    {
                      provider: "Google Analytics",
                      purpose: "Website usage analytics and performance measurement",
                      link: "policies.google.com/privacy",
                      href: "https://policies.google.com/privacy",
                    },
                    {
                      provider: "Cloudflare",
                      purpose: "Security, performance, and DDoS protection",
                      link: "cloudflare.com/privacypolicy",
                      href: "https://www.cloudflare.com/privacypolicy",
                    },
                  ].map((row, i) => (
                    <tr key={row.provider} className={i % 2 === 0 ? "bg-[#e8d9cb]" : "bg-[#f3e9dd]"}>
                      <td className="px-4 py-3 font-medium">{row.provider}</td>
                      <td className="px-4 py-3">{row.purpose}</td>
                      <td className="px-4 py-3">
                        <a
                          href={row.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#440C03] underline"
                        >
                          {row.link}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="leading-relaxed mt-4 text-gray-700">
              We encourage you to read the privacy policies of these third parties to understand how they
              use your data.
            </p>
          </section>

          {/* YOUR CHOICES */}
          <section id="your-choices" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">Your Cookie Choices</h2>
            <p className="leading-relaxed mb-4">
              When you first visit our website, you will be presented with a cookie consent banner. You can
              choose to accept all cookies, reject optional cookies, or customise your preferences.
            </p>
            <p className="leading-relaxed mb-4">
              You may update or withdraw your consent at any time by clearing your browser cookies and
              revisiting the site, which will re-display the consent banner.
            </p>
            <p className="leading-relaxed">
              Please note that disabling certain cookies may affect the functionality of our website. For
              example, disabling strictly necessary cookies may prevent you from logging in or completing
              a purchase.
            </p>
          </section>

          {/* MANAGING COOKIES */}
          <section id="managing" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">Managing Cookies in Your Browser</h2>
            <p className="leading-relaxed mb-6">
              All modern browsers allow you to control cookies through their settings. You can choose to
              block or delete cookies at any time. Here is how to manage cookies in the most common browsers:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#440C03] text-white">
                    <th className="px-4 py-3 font-semibold rounded-tl-xl">Browser</th>
                    <th className="px-4 py-3 font-semibold rounded-tr-xl">Cookie Settings Page</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      browser: "Google Chrome",
                      link: "support.google.com/chrome/answer/95647",
                      href: "https://support.google.com/chrome/answer/95647",
                    },
                    {
                      browser: "Mozilla Firefox",
                      link: "support.mozilla.org/kb/cookies",
                      href: "https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer",
                    },
                    {
                      browser: "Apple Safari",
                      link: "support.apple.com/guide/safari/manage-cookies",
                      href: "https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac",
                    },
                    {
                      browser: "Microsoft Edge",
                      link: "support.microsoft.com/microsoft-edge/cookies",
                      href: "https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09",
                    },
                  ].map((row, i) => (
                    <tr key={row.browser} className={i % 2 === 0 ? "bg-[#e8d9cb]" : "bg-[#f3e9dd]"}>
                      <td className="px-4 py-3 font-medium">{row.browser}</td>
                      <td className="px-4 py-3">
                        <a
                          href={row.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#440C03] underline"
                        >
                          {row.link}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* DO NOT TRACK */}
          <section id="do-not-track" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">Do Not Track</h2>
            <p className="leading-relaxed mb-4">
              Some browsers include a &ldquo;Do Not Track&rdquo; (DNT) feature that signals to websites that you do
              not want your online activity tracked. Because there is currently no universally accepted
              standard for responding to DNT signals, our website does not currently respond to DNT browser
              settings.
            </p>
            <p className="leading-relaxed">
              We will continue to monitor developments in this area and update our approach if a clear
              standard emerges.
            </p>
          </section>

          {/* UPDATES */}
          <section id="updates" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">Updates to This Policy</h2>
            <p className="leading-relaxed mb-4">
              We may update this Cookie Policy from time to time to reflect changes in the cookies we use,
              changes to applicable law, or improvements to our platform. Any changes will be posted on this
              page with an updated revision date.
            </p>
            <p className="leading-relaxed">
              We encourage you to review this policy periodically to stay informed about how we use cookies.
              Your continued use of our website after any changes constitutes your acceptance of the updated
              policy.
            </p>
          </section>

          {/* CONTACT */}
          <section id="contact" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <p className="leading-relaxed mb-4">
              If you have any questions about our use of cookies or this Cookie Policy, please contact us:
            </p>
            <div className="bg-[#e8d9cb] rounded-2xl px-6 py-5 space-y-2 text-gray-800">
              <p>
                <strong>Made in Arnhem Land Marketplace</strong>
              </p>
              <p>
                <strong>Email:</strong>{" "}
                <a href="mailto:support@madeinarnhemland.com.au" className="text-[#440C03] underline">
                  support@madeinarnhemland.com.au
                </a>
              </p>
              <p>
                <strong>Phone:</strong>{" "}
                <a href="tel:+61889446444" className="text-[#440C03] underline">
                  +61 (08) 8944 6444
                </a>
              </p>
              <p>
                <strong>Website:</strong>{" "}
                <a href="https://madeinarnhemland.com.au" className="text-[#440C03] underline">
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
