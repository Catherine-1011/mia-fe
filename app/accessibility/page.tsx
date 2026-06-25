import React from "react";
import type { Metadata } from "next";
import { FaUniversalAccess } from "react-icons/fa";
import VideoHeroSection from "@/components/common-components/VideoHeroSection";

export const metadata: Metadata = {
  title: "Accessibility",
  description:
    "Accessibility information for the Made in Arnhem Land marketplace. We are committed to making our platform usable for everyone.",
  alternates: { canonical: "/accessibility" },
};

export default function AccessibilityPage() {
  return (
    <div className="bg-[#f3e9dd]">

      {/* HERO SECTION */}
      <VideoHeroSection className="min-h-[70vh]">
        <div className="relative z-10 flex flex-col items-center justify-center text-white text-center px-4 py-32 md:py-60">
          <h1 className="text-5xl font-bold mb-2">Accessibility</h1>
          <p className="text-lg max-w-2xl">
            Made in Arnhem Land Marketplace — our commitment to an inclusive,
            accessible platform for everyone.
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
              { id: "marketplace", label: "Accessibility on Our Marketplace" },
              { id: "browser", label: "Use an Up-to-Date Browser" },
              { id: "browser-options", label: "Options in Your Browser" },
              { id: "screen-readers", label: "Screen Readers" },
              { id: "zoom", label: "Zoom and Display Options" },
              { id: "contact", label: "Contact Us About Accessibility" },
              { id: "statement", label: "Statement Last Reviewed" },
            ].map((item) => (
              <li
                key={item.id}
                className="bg-[#D0BFB3] rounded-2xl hover:bg-[#440C03] hover:text-white transition"
              >
                <a href={`#${item.id}`} className="flex items-center gap-3 px-4 py-2">
                  <FaUniversalAccess size={18} />
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1">
          <h1 className="text-3xl font-bold mb-8">
            Made in Arnhem Land Marketplace — Accessibility
          </h1>

          {/* OVERVIEW */}
          <section id="overview" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">Accessibility</h2>
            <p className="leading-relaxed mb-4">
              We are committed to providing a website that is accessible to the widest possible audience,
              regardless of technology or ability, including people with disability, those using assistive
              technology, and those in lower-bandwidth or remote environments.
            </p>
            <p className="leading-relaxed mb-4">
              The Made in Arnhem Land Marketplace endeavours to conform to Level AA of the Web Content
              Accessibility Guidelines (WCAG) 2.1, published by the World Wide Web Consortium (W3C). These
              guidelines explain how to make web content more accessible for people with disabilities.
              Conforming to these guidelines helps make the web more usable for everyone.
            </p>
            <p className="leading-relaxed mb-4">
              Under the Disability Discrimination Act 1992 (Cth), it is unlawful to discriminate against a
              person on the grounds of disability in the supply of goods or services. We take this obligation
              seriously and are actively working to ensure our platform meets and maintains that standard.
            </p>
            <p className="leading-relaxed mb-4">
              This website has been built using code compliant with W3C standards for HTML and CSS and
              displays correctly in current browsers.
            </p>
            <p className="leading-relaxed">
              While we strive to adhere to accepted guidelines and standards for accessibility and usability,
              it is not always possible to do so across every area of the site. We are continually seeking
              solutions to bring all areas of the platform up to the same level of accessibility. If you
              experience any difficulty using our website, please do not hesitate to contact us — details are
              at the bottom of this page.
            </p>
          </section>

          {/* ACCESSIBILITY ON OUR MARKETPLACE */}
          <section id="marketplace" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">Accessibility on Our Marketplace</h2>
            <p className="leading-relaxed mb-6">
              As an online marketplace, we have specific commitments that go beyond a standard information
              website:
            </p>
            <ul className="space-y-4">
              {[
                {
                  title: "Product listings",
                  body: "All product images on our platform are required to include a text description (alt text) that conveys the artwork, materials, and cultural context — ensuring buyers using screen readers can fully understand what they are purchasing.",
                },
                {
                  title: "Checkout and payment",
                  body: "Our checkout process is designed to be fully navigable by keyboard and compatible with assistive technologies.",
                },
                {
                  title: "Seller onboarding",
                  body: "Our seller registration process includes clear labels, inline error messages, and step-by-step guidance to support sellers with varying levels of digital literacy and ability.",
                },
                {
                  title: "Mobile access",
                  body: "Many of our community members and customers access the internet primarily on mobile devices. We design for mobile-first, with touch targets sized for ease of use and no hover-only interactions.",
                },
                {
                  title: "Plain language",
                  body: "We write in clear, plain English throughout the platform to support users across a range of reading abilities and digital literacy levels.",
                },
              ].map((item) => (
                <li key={item.title} className="flex gap-3 leading-relaxed">
                  <span className="mt-1 text-[#440C03]">&#9658;</span>
                  <span>
                    <strong>{item.title}:</strong> {item.body}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* USE AN UP-TO-DATE BROWSER */}
          <section id="browser" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">Use an Up-to-Date Browser</h2>
            <p className="leading-relaxed mb-6">
              By using an up-to-date browser, you will have access to the best accessibility options available
              when navigating this site. We recommend the following browsers, each of which is free to download:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#440C03] text-white">
                    <th className="px-4 py-3 font-semibold rounded-tl-xl">Browser</th>
                    <th className="px-4 py-3 font-semibold">Download</th>
                    <th className="px-4 py-3 font-semibold rounded-tr-xl">Accessibility Settings</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      name: "Mozilla Firefox",
                      download: "mozilla.org/firefox",
                      downloadHref: "https://www.mozilla.org/firefox",
                      settings: "firefox.com/accessibility",
                      settingsHref: "https://support.mozilla.org/en-US/kb/accessibility-features-firefox",
                    },
                    {
                      name: "Google Chrome",
                      download: "google.com/chrome",
                      downloadHref: "https://www.google.com/chrome",
                      settings: "support.google.com/chrome/accessibility",
                      settingsHref: "https://support.google.com/chromebook/answer/177893",
                    },
                    {
                      name: "Apple Safari (Mac / iOS)",
                      download: "Pre-installed on Apple devices",
                      downloadHref: null,
                      settings: "support.apple.com/accessibility",
                      settingsHref: "https://support.apple.com/accessibility",
                    },
                    {
                      name: "Microsoft Edge",
                      download: "microsoft.com/edge",
                      downloadHref: "https://www.microsoft.com/edge",
                      settings: "support.microsoft.com/accessibility",
                      settingsHref: "https://support.microsoft.com/en-us/microsoft-edge/accessibility-features-in-microsoft-edge-4c696192-338e-9465-b2cd-bd9b698ad19a",
                    },
                  ].map((row, i) => (
                    <tr key={row.name} className={i % 2 === 0 ? "bg-[#e8d9cb]" : "bg-[#f3e9dd]"}>
                      <td className="px-4 py-3 font-medium">{row.name}</td>
                      <td className="px-4 py-3">
                        {row.downloadHref ? (
                          <a href={row.downloadHref} target="_blank" rel="noopener noreferrer" className="text-[#440C03] underline">
                            {row.download}
                          </a>
                        ) : (
                          row.download
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <a href={row.settingsHref} target="_blank" rel="noopener noreferrer" className="text-[#440C03] underline">
                          {row.settings}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="leading-relaxed mt-4 text-gray-700">
              Once installed, each browser provides its own accessibility options including text resizing,
              high contrast modes, and support for additional plug-ins.
            </p>
          </section>

          {/* OPTIONS IN YOUR BROWSER */}
          <section id="browser-options" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">Options in Your Browser</h2>
            <p className="leading-relaxed mb-6">
              Most modern browsers include the following built-in accessibility features:
            </p>

            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold mb-2">Incremental Search</h3>
                <p className="leading-relaxed">
                  Search for any word or phrase on the current page by pressing{" "}
                  <kbd className="bg-[#D0BFB3] px-2 py-0.5 rounded text-sm font-mono">Ctrl + F</kbd> (Windows) or{" "}
                  <kbd className="bg-[#D0BFB3] px-2 py-0.5 rounded text-sm font-mono">Command + F</kbd> (Mac).
                  Matches are highlighted as you type.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">Keyboard Navigation</h3>
                <p className="leading-relaxed">
                  Press <kbd className="bg-[#D0BFB3] px-2 py-0.5 rounded text-sm font-mono">Tab</kbd> to move
                  forward through all interactive elements on a page (links, buttons, form fields). Press{" "}
                  <kbd className="bg-[#D0BFB3] px-2 py-0.5 rounded text-sm font-mono">Shift + Tab</kbd> to move
                  backwards. Press{" "}
                  <kbd className="bg-[#D0BFB3] px-2 py-0.5 rounded text-sm font-mono">Enter</kbd> or{" "}
                  <kbd className="bg-[#D0BFB3] px-2 py-0.5 rounded text-sm font-mono">Space</kbd> to activate a
                  focused element. You do not need a mouse to navigate this site.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">Skip to Content</h3>
                <p className="leading-relaxed">
                  A &lsquo;Skip to main content&rsquo; link is available at the top of each page for keyboard users,
                  allowing you to bypass the navigation menu and jump directly to the main content area.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">Spacebar</h3>
                <p className="leading-relaxed">
                  Pressing the spacebar on any page will scroll down to the next visible portion of the content.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">Text Size and Fonts</h3>
                <p className="leading-relaxed mb-3">
                  You can increase or decrease the text size on any page using your browser&rsquo;s zoom function:
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex gap-2">
                    <span className="text-[#440C03]">•</span>
                    <span>
                      Zoom in:{" "}
                      <kbd className="bg-[#D0BFB3] px-2 py-0.5 rounded text-sm font-mono">Ctrl + Plus</kbd> (Windows) or{" "}
                      <kbd className="bg-[#D0BFB3] px-2 py-0.5 rounded text-sm font-mono">Command + Plus</kbd> (Mac)
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#440C03]">•</span>
                    <span>
                      Zoom out:{" "}
                      <kbd className="bg-[#D0BFB3] px-2 py-0.5 rounded text-sm font-mono">Ctrl + Minus</kbd> (Windows) or{" "}
                      <kbd className="bg-[#D0BFB3] px-2 py-0.5 rounded text-sm font-mono">Command + Minus</kbd> (Mac)
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#440C03]">•</span>
                    <span>
                      Reset to default:{" "}
                      <kbd className="bg-[#D0BFB3] px-2 py-0.5 rounded text-sm font-mono">Ctrl + 0</kbd> (Windows) or{" "}
                      <kbd className="bg-[#D0BFB3] px-2 py-0.5 rounded text-sm font-mono">Command + 0</kbd> (Mac)
                    </span>
                  </li>
                </ul>
                <p className="leading-relaxed mt-3">
                  You can also override fonts in your browser settings to use a typeface that is easier for you
                  to read. Refer to the accessibility settings page for your chosen browser (links in the table
                  above).
                </p>
              </div>
            </div>
          </section>

          {/* SCREEN READERS */}
          <section id="screen-readers" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">Screen Readers</h2>
            <p className="leading-relaxed mb-6">
              This website has been built with screen readers in mind. Menus, images, form inputs, and
              interactive elements include the correct tags and markup to work with your chosen screen reader.
            </p>
            <p className="leading-relaxed mb-6">We have tested with the following tools:</p>

            <div className="space-y-6">
              {[
                {
                  name: "NVDA (NonVisual Desktop Access)",
                  body: "NVDA is a free, open-source screen reader for Windows. It reads text aloud and works with most modern browsers. Download the latest version at ",
                  link: "nvaccess.org",
                  href: "https://www.nvaccess.org",
                },
                {
                  name: "VoiceOver",
                  body: "VoiceOver is built into all Apple devices (Mac, iPhone, iPad). Enable it on Mac via System Settings > Accessibility > VoiceOver, or on iPhone/iPad via Settings > Accessibility > VoiceOver.",
                  link: null,
                  href: null,
                },
                {
                  name: "Windows Narrator",
                  body: "Windows Narrator is built into Microsoft Windows and reads text and interface elements aloud without requiring any additional software. Enable it via Settings > Ease of Access > Narrator.",
                  link: null,
                  href: null,
                },
                {
                  name: "WAVE",
                  body: "WAVE is a free accessibility evaluation tool developed by WebAIM that helps identify accessibility issues on web pages. It is available as a browser extension at ",
                  link: "wave.webaim.org",
                  href: "https://wave.webaim.org",
                },
              ].map((tool) => (
                <div key={tool.name} className="bg-[#e8d9cb] rounded-2xl px-6 py-5">
                  <h3 className="text-xl font-semibold mb-2">{tool.name}</h3>
                  <p className="leading-relaxed">
                    {tool.body}
                    {tool.link && tool.href && (
                      <a href={tool.href} target="_blank" rel="noopener noreferrer" className="text-[#440C03] underline">
                        {tool.link}
                      </a>
                    )}
                    {tool.link && "."}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Voice Control</h3>
              <p className="leading-relaxed mb-3">
                Both Windows and macOS provide built-in tools to control your computer using your voice:
              </p>
              <ul className="space-y-2 ml-4">
                {[
                  "Windows: Voice Access is available via Settings > Accessibility > Voice Access. Windows Speech Recognition is also available in earlier versions of Windows.",
                  "Apple Mac: Voice Control is available via System Settings > Accessibility > Voice Control.",
                  "Apple iPhone / iPad: Voice Control is available via Settings > Accessibility > Voice Control.",
                ].map((item) => (
                  <li key={item} className="flex gap-2 leading-relaxed">
                    <span className="text-[#440C03] mt-1">&#9658;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* ZOOM AND DISPLAY OPTIONS */}
          <section id="zoom" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">Zoom and Display Options</h2>
            <p className="leading-relaxed mb-4">
              In addition to browser zoom, both Windows and macOS provide system-level display options:
            </p>
            <ul className="space-y-3 ml-4">
              {[
                "Windows: Settings > Ease of Access > Magnifier — enlarges part or all of your screen.",
                "Mac: System Settings > Accessibility > Zoom — use keyboard shortcuts or scroll gesture to zoom.",
                "High contrast mode: Windows supports a range of high contrast themes via Settings > Ease of Access > Colour & High Contrast.",
              ].map((item) => (
                <li key={item} className="flex gap-2 leading-relaxed">
                  <span className="text-[#440C03] mt-1">&#9658;</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* CONTACT */}
          <section id="contact" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">Contact Us About Accessibility</h2>
            <p className="leading-relaxed mb-4">
              If you experience any difficulty accessing our website, find content that is not working as
              expected with your assistive technology, or would like to request information in an alternative
              format, please get in touch. We are committed to helping.
            </p>
            <p className="leading-relaxed mb-4">You can reach our team in the following ways:</p>
            <div className="bg-[#e8d9cb] rounded-2xl px-6 py-5 space-y-2 text-gray-800">
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
            </div>
            <p className="leading-relaxed mt-4">
              We aim to respond to all accessibility enquiries within 5 business days. If you are unable to
              access a specific product listing, document, or feature, we will make reasonable efforts to
              provide the information you need in an accessible format upon request.
            </p>
          </section>

          {/* STATEMENT */}
          <section id="statement" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-bold mb-4">Statement Last Reviewed</h2>
            <p className="leading-relaxed">
              We review this statement regularly and update it to reflect changes to the platform and evolving
              accessibility standards.
            </p>
          </section>

        </main>
      </div>
    </div>
  );
}
