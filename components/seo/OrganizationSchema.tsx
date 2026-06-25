export function OrganizationSchema() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Made in Arnhem Land",
    url: "https://madeinarnhemland.com.au",
    logo: "https://madeinarnhemland.com.au/images/navbarLogo.png",
    description:
      "Authentic art, bush foods and handmade crafts direct from Arnhem Land artists. 100% certified, ethically sourced, community-supported.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "70 O'Sullivan Circuit",
      addressLocality: "East Arm",
      addressRegion: "NT",
      postalCode: "0822",
      addressCountry: "AU",
    },
    sameAs: [
      "https://www.instagram.com/arnhemland_1972/",
      "https://www.facebook.com/ALPA1972",
      "https://www.linkedin.com/company/the-arnhem-land-progress-aboriginal-corporation",
      "https://www.youtube.com/channel/UCdTcDZefhjM_aybwAyrqKaQ",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
