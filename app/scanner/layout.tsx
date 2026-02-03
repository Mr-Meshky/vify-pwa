import { BASE_URL } from "@/lib/utils";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "اسکنر کانال تلگرام - Vify | استخراج کانفیگ V2Ray",
  description:
    "اسکنر هوشمند کانال‌های تلگرام برای استخراج کانفیگ‌های V2Ray، VMess، VLESS، Trojan و Shadowsocks. دریافت خودکار و تست سلامت کانفیگ‌ها.",
  keywords: [
    "اسکنر تلگرام",
    "استخراج کانفیگ",
    "V2Ray",
    "VMess",
    "VLESS",
    "Trojan",
    "Shadowsocks",
    "کانفیگ رایگان",
    "فیلترشکن",
    "کانال تلگرام V2Ray",
  ],
  openGraph: {
    title: "اسکنر کانال تلگرام - Vify",
    description: "استخراج و تست خودکار کانفیگ‌های V2Ray از کانال‌های تلگرام",
    type: "website",
    locale: "fa_IR",
    siteName: "Vify",
  },
  alternates: {
    canonical: `${BASE_URL}/scanner`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ScannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
