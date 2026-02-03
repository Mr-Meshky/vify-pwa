import { Metadata } from "next";

export const metadata: Metadata = {
  title: "وب پروکسی رایگان - Vify | گشت‌وگذار امن و ناشناس",
  description:
    "وب پروکسی رایگان و سریع برای دسترسی به سایت‌های مسدود شده. بدون نیاز به نصب نرم‌افزار، با رمزنگاری SSL و حفظ حریم خصوصی. دسترسی امن به YouTube، Instagram و سایر سایت‌ها.",
  keywords: [
    "وب پروکسی",
    "پروکسی رایگان",
    "باز کردن سایت",
    "دور زدن فیلتر",
    "پروکسی آنلاین",
    "وب پراکسی",
    "فیلترشکن آنلاین",
    "دسترسی به سایت‌های فیلتر شده",
    "گشت‌وگذار ناشناس",
    "web proxy",
    "free proxy",
    "unblock websites",
  ],
  openGraph: {
    title: "وب پروکسی رایگان - Vify",
    description:
      "دسترسی امن و ناشناس به سایت‌های مسدود شده بدون نیاز به نصب نرم‌افزار",
    type: "website",
    locale: "fa_IR",
    siteName: "Vify",
  },
  twitter: {
    card: "summary_large_image",
    title: "وب پروکسی رایگان - Vify",
    description: "دسترسی امن و ناشناس به سایت‌های مسدود شده",
  },
  alternates: {
    canonical: "https://vify.ir/web-proxy",
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
};

export default function WebProxyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
