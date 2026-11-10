import { StoreProvider } from "@/redux/store/StoreProvider";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import 'react-quill-new/dist/quill.snow.css';
import { Toaster } from "react-hot-toast";
import Script from "next/script";
import { cookies } from "next/headers";
import { getSystemLanguages } from "@/server/catalogue";

interface InitialLangData {
  code: string;
  isRTL: boolean;
  translations: Record<string, string>;
  languages: Array<{ id: number; name: string; code: string; is_rtl: boolean; is_default: boolean; image: string }>;
}

async function fetchInitialLanguage(langCode: string): Promise<InitialLangData | null> {
  const { languages } = await getSystemLanguages();
  const target = languages.find((language) => language.code === langCode) ||
    languages.find((language) => language.is_default);
  if (!target) return null;
  return {
    code: target.code,
    isRTL: target.is_rtl,
    translations: target.translations_web,
    languages,
  };
}

const geist = Geist({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-geist",
  display: "swap",
});

const clarityProjectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
const hasClarityProject = Boolean(clarityProjectId && /^[a-z0-9]+$/i.test(clarityProjectId));

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_TITLE,
  description: process.env.NEXT_PUBLIC_DESCRIPTION,
  keywords: process.env.NEXT_PUBLIC_KEYWORDS,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const langCookie = cookieStore.get("lang")?.value ?? "";
  const initialLang = await fetchInitialLanguage(langCookie);

  return (
    <html lang={initialLang?.code ?? "en"} dir={initialLang?.isRTL ? "rtl" : "ltr"}>
      <head>
        {initialLang && (
          <script
            dangerouslySetInnerHTML={{
              __html: `window.__INITIAL_LANG__=${JSON.stringify(initialLang).replace(/</g, "\\u003c")};`,
            }}
          />
        )}
      </head>
      <body className={`${geist.variable} font-sans !pointer-events-auto`} suppressHydrationWarning>
        <StoreProvider>
          <Toaster position="top-center" toastOptions={{
            style: {
              background: "#000",
              color: "#fff",
            },
          }} />
          {children}
        </StoreProvider>

        {hasClarityProject && <Script
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", ${JSON.stringify(clarityProjectId)});
          `,
          }}
        />}
      </body>
    </html>
  );
}
