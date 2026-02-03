import { Vazirmatn } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import { Metadata, Viewport } from "next";
import "./globals.css";
import { AboutSection } from "@/components/about-section";
import { BASE_URL } from "@/lib/utils";

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  variable: "--font-vazirmatn",
});

export const metadata: Metadata = {
  title: {
    default: "Vify - سابسکریپشن V2Ray و وب پروکسی رایگان",
    template: "%s | Vify",
  },
  description:
    "مجموعه کامل سابسکریپشن‌های V2Ray، وب پروکسی رایگان، اسکنر کانفیگ و پروکسی تلگرام. دسترسی امن و سریع به اینترنت آزاد.",
  keywords: [
    "V2Ray",
    "سابسکریپشن V2Ray",
    "فیلترشکن",
    "وب پروکسی",
    "پروکسی رایگان",
    "VMess",
    "VLESS",
    "Trojan",
    "Shadowsocks",
    "کانفیگ V2Ray",
    "اسکنر تلگرام",
    "پروکسی تلگرام",
  ],
  generator: "mrmeshky.ir",
  manifest: "/manifest.json",
  metadataBase: new URL(BASE_URL),
  openGraph: {
    title: "Vify - سابسکریپشن V2Ray و وب پروکسی رایگان",
    description:
      "مجموعه کامل سابسکریپشن‌های V2Ray، وب پروکسی رایگان و ابزارهای کاربردی برای دسترسی امن به اینترنت",
    url: BASE_URL,
    siteName: "Vify",
    locale: "fa_IR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vify - سابسکریپشن V2Ray و وب پروکسی رایگان",
    description: "مجموعه کامل سابسکریپشن‌های V2Ray و ابزارهای کاربردی",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Vify",
  },
  icons: {
    icon: [
      {
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: "/android-chrome-192x192.png",
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fa" dir="rtl">
      <body className={`${vazirmatn.variable} font-sans antialiased`}>
        {children}
        <div className="mx-auto max-w-2xl px-4 py-6">
          {/* About Section */}
          <section className="mb-6">
            <AboutSection />
          </section>

          {/* Install PWA Hint */}
          <footer className="rounded-2xl border border-dashed border-border/50 bg-secondary/20 p-4 text-center">
            <p className="text-xs text-muted-foreground">
              برای نصب به صورت اپلیکیشن: منوی مرورگر {">"} Add to Home Screen
            </p>
          </footer>
        </div>

        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=G-PYQYFWNLMP`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-PYQYFWNLMP'); 
            `,
          }}
        />

        {/* Microsoft Clarity Script */}
        <Script
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);
                t.async=1;
                t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];
                y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "v9iack468k"); 
            `,
          }}
        />

        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
