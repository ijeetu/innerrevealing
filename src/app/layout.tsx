import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meditation & Yoga Classes in Kolkata for Kids and Adults",
  description:
    "Meditation and Yoga classes in Kolkata for kids and adults. Reduce stress, improve flexibility, find inner balance through guided mindfulness and yoga practice.",
  applicationName: "Inner Revealing Meditation Centre",
  metadataBase: new URL("https://www.innerrevealing.com"),
  alternates: { canonical: "/" },
  icons: { icon: "/logo.png", apple: "/logo.png" },
  openGraph: {
    title: "Meditation & Yoga Classes in Kolkata for Kids and Adults",
    description:
      "Meditation and Yoga classes in Kolkata for kids and adults. Reduce stress, improve flexibility, find inner balance through guided mindfulness and yoga practice.",
    type: "website",
    locale: "en_IN",
    siteName: "Inner Revealing Meditation Centre",
    images: [
      {
        url: "/logo.png",
        width: 1774,
        height: 887,
        alt: "Inner Revealing Meditation Centre",
      },
    ],
  },
};

const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Inner Revealing Meditation Centre",
  url: "https://www.innerrevealing.com",
  logo: "https://www.innerrevealing.com/logo.png",
  email: "innerrevealing@gmail.com",
  telephone: "+919836147999",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Satish Mukherjee Road, Kalighat",
    addressLocality: "Kolkata",
    addressRegion: "West Bengal",
    postalCode: "700026",
    addressCountry: "IN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
        />
        {children}
      </body>
    </html>
  );
}
