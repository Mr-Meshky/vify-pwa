import { Metadata } from "next";

export const metadata: Metadata = {
  title: "اسکنر پروکسی تلگرام - Vify | تست و بررسی MTProto",
  description:
    "اسکنر و تستر پروکسی‌های تلگرام MTProto. دریافت خودکار پروکسی‌ها از منابع معتبر، تست سلامت با اندازه‌گیری پینگ و نمایش پروکسی‌های سالم.",
  keywords: [
    "پروکسی تلگرام",
    "MTProto",
    "تست پروکسی",
    "پروکسی سالم",
    "پروکسی رایگان تلگرام",
    "اسکنر پروکسی",
    "Telegram proxy",
    "پینگ پروکسی",
  ],
  openGraph: {
    title: "اسکنر پروکسی تلگرام - Vify",
    description: "تست و بررسی خودکار پروکسی‌های تلگرام MTProto",
    type: "website",
    locale: "fa_IR",
    siteName: "Vify",
  },
  alternates: {
    canonical: "https://vify.ir/proxy-checker",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ProxyCheckerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
