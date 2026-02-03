"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Globe,
  Shield,
  Zap,
  Lock,
  Eye,
  ArrowRight,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  Server,
  Wifi,
  ShieldCheck,
  Clock,
  Download,
  Share2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface ProxyResult {
  originalUrl: string;
  proxyUrl: string;
  timestamp: string;
}

const FEATURES = [
  {
    icon: Shield,
    title: "ناشناس بمانید",
    description: "آدرس IP شما مخفی می‌ماند و هویت شما محافظت می‌شود",
  },
  {
    icon: Lock,
    title: "رمزنگاری SSL",
    description: "تمام ترافیک شما با SSL رمزنگاری شده و امن است",
  },
  {
    icon: Zap,
    title: "سرعت بالا",
    description: "با استفاده از کش، صفحات سریع‌تر بارگذاری می‌شوند",
  },
  {
    icon: Globe,
    title: "دسترسی آزاد",
    description: "به سایت‌های مسدود شده دسترسی پیدا کنید",
  },
  {
    icon: Eye,
    title: "بدون ردیابی",
    description: "فعالیت آنلاین شما ردیابی نمی‌شود",
  },
  {
    icon: Download,
    title: "بدون نصب",
    description: "نیازی به نصب نرم‌افزار اضافی نیست",
  },
];

const FAQS = [
  {
    question: "وب پروکسی چیست؟",
    answer:
      "وب پروکسی یک ابزار ساده و کاربردی است که به شما امکان می‌دهد به صورت ناشناس در اینترنت گشت‌وگذار کنید و به محتوای مسدود شده دسترسی پیدا کنید. برخلاف VPN که نیاز به نصب نرم‌افزار دارد، وب پروکسی مستقیماً از مرورگر شما کار می‌کند.",
  },
  {
    question: "وب پروکسی چگونه کار می‌کند؟",
    answer:
      "وب پروکسی به عنوان یک واسطه بین دستگاه شما و اینترنت عمل می‌کند. وقتی شما یک سایت را از طریق پروکسی درخواست می‌کنید، سرور پروکسی محتوا را از طرف شما دریافت کرده و به شما برمی‌گرداند، در حالی که آدرس IP واقعی شما مخفی می‌ماند.",
  },
  {
    question: "آیا استفاده از وب پروکسی رایگان است؟",
    answer:
      "بله! سرویس ما کاملاً رایگان است و با پلتفرم‌های معروف مانند Google، YouTube، Instagram و بسیاری دیگر سازگار است.",
  },
  {
    question: "تفاوت وب پروکسی با VPN چیست؟",
    answer:
      "وب پروکسی فقط برای مرورگر کار می‌کند و نیازی به نصب ندارد، در حالی که VPN تمام ترافیک سیستم را پوشش می‌دهد و نیاز به نصب نرم‌افزار دارد. برای دسترسی سریع به سایت‌های مسدود، وب پروکسی گزینه بهتری است.",
  },
  {
    question: "آیا سرعت مرورگری کاهش می‌یابد؟",
    answer:
      "خیر! با استفاده از تکنولوژی کش، صفحاتی که قبلاً بازدید کرده‌اید سریع‌تر بارگذاری می‌شوند و تاخیر به حداقل می‌رسد.",
  },
];

export default function WebProxyPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProxyResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [recentProxies, setRecentProxies] = useState<ProxyResult[]>([]);

  const validateUrl = (inputUrl: string): string | null => {
    let processedUrl = inputUrl.trim();

    // Add protocol if missing
    if (
      !processedUrl.startsWith("http://") &&
      !processedUrl.startsWith("https://")
    ) {
      processedUrl = "https://" + processedUrl;
    }

    try {
      const urlObj = new URL(processedUrl);
      if (!urlObj.hostname.includes(".")) {
        return null;
      }
      return processedUrl;
    } catch {
      return null;
    }
  };

  const generateProxyUrl = useCallback(async () => {
    if (!url.trim()) {
      setError("لطفاً یک آدرس وارد کنید");
      return;
    }

    const validatedUrl = validateUrl(url);
    if (!validatedUrl) {
      setError("آدرس وارد شده معتبر نیست");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/web-proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: validatedUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "خطا در پردازش درخواست");
      }

      const newResult: ProxyResult = {
        originalUrl: validatedUrl,
        proxyUrl: data.proxyUrl,
        timestamp: new Date().toLocaleTimeString("fa-IR"),
      };

      setResult(newResult);
      setRecentProxies((prev) => [newResult, ...prev.slice(0, 4)]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "خطای نامشخص";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [url]);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      generateProxyUrl();
    }
  };

  return (
    <main className="min-h-screen bg-background pb-safe">
      <div className="mx-auto max-w-2xl px-4 pt-6">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 shadow-lg shadow-primary/10 aspect-square">
                <Image
                  src="/android-chrome-512x512.png"
                  alt="Vify"
                  width={32}
                  height={32}
                  className="size-8"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  وب پروکسی
                </h1>
                <p className="text-sm text-muted-foreground">
                  گشت‌وگذار امن و ناشناس
                </p>
              </div>
            </div>
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowRight className="ml-2 h-4 w-4" />
                بازگشت
              </Button>
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="mb-8">
          <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-card to-card/50">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Globe className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl">شروع کنید</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">
                آدرس سایت مورد نظر را وارد کنید و لینک پروکسی شده را دریافت کنید
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* URL Input */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Input
                    type="text"
                    placeholder="example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="h-12 pe-12 text-base ps-10"
                    dir="ltr"
                  />
                  <Globe className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                </div>
                <Button
                  onClick={generateProxyUrl}
                  disabled={loading}
                  className="h-12 gap-2 px-6"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Shield className="h-5 w-5" />
                  )}
                  پروکسی کن
                </Button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* Result */}
              {result && (
                <div className="space-y-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <span className="font-medium text-foreground">
                      لینک پروکسی آماده است
                    </span>
                    <Badge variant="secondary" className="mr-auto">
                      <Clock className="ml-1 h-3 w-3" />
                      {result.timestamp}
                    </Badge>
                  </div>

                  {/* Original URL */}
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">آدرس اصلی:</p>
                    <div
                      className="rounded-lg bg-secondary/50 p-2 text-sm text-muted-foreground truncate"
                      dir="ltr"
                    >
                      {result.originalUrl}
                    </div>
                  </div>

                  {/* Proxy URL */}
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      لینک پروکسی شده:
                    </p>
                    <div className="flex gap-2">
                      <div
                        className="flex-1 rounded-lg bg-background p-2 text-sm text-primary font-mono truncate border"
                        dir="ltr"
                      >
                        {result.proxyUrl}
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                        onClick={() => copyToClipboard(result.proxyUrl)}
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                        asChild
                      >
                        <a
                          href={result.proxyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>

                  {/* Share Button */}
                  <Button
                    variant="secondary"
                    className="w-full gap-2"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: "لینک پروکسی شده",
                          url: result.proxyUrl,
                        });
                      } else {
                        copyToClipboard(result.proxyUrl);
                      }
                    }}
                  >
                    <Share2 className="h-4 w-4" />
                    اشتراک‌گذاری
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Recent Proxies */}
        {recentProxies.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-4 text-sm font-medium text-muted-foreground">
              آخرین لینک‌ها
            </h2>
            <div className="space-y-2">
              {recentProxies.map((proxy, idx) => (
                <Card key={idx} className="p-3">
                  <div className="flex items-center gap-3">
                    <Server className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate" dir="ltr">
                        {proxy.originalUrl}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {proxy.timestamp}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={() => copyToClipboard(proxy.proxyUrl)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      asChild
                    >
                      <a
                        href={proxy.proxyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Features Grid */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            چرا از وب پروکسی استفاده کنیم؟
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {FEATURES.map((feature, idx) => (
              <Card key={idx} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* How it Works */}
        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wifi className="h-5 w-5 text-primary" />
                نحوه عملکرد
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-foreground">درخواست کاربر</p>
                    <p className="text-sm text-muted-foreground">
                      آدرس سایت مورد نظر را وارد می‌کنید
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      دریافت توسط پروکسی
                    </p>
                    <p className="text-sm text-muted-foreground">
                      سرور پروکسی محتوا را از طرف شما دریافت می‌کند
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-foreground">ارسال پاسخ</p>
                    <p className="text-sm text-muted-foreground">
                      محتوا به مرورگر شما ارسال می‌شود در حالی که IP شما مخفی
                      است
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Comparison Table */}
        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">مقایسه وب پروکسی با VPN</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 pe-4 text-start font-medium text-muted-foreground">
                        ویژگی
                      </th>
                      <th className="py-3 px-4 text-center font-medium text-primary">
                        وب پروکسی
                      </th>
                      <th className="py-3 ps-4 text-center font-medium text-muted-foreground">
                        VPN
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="py-3 pe-4 text-foreground">نیاز به نصب</td>
                      <td className="py-3 px-4 text-center text-green-500">
                        ندارد
                      </td>
                      <td className="py-3 ps-4 text-center text-muted-foreground">
                        دارد
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 pe-4 text-foreground">محدوده</td>
                      <td className="py-3 px-4 text-center text-foreground">
                        مرورگر
                      </td>
                      <td className="py-3 ps-4 text-center text-muted-foreground">
                        کل سیستم
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 pe-4 text-foreground">
                        سرعت راه‌اندازی
                      </td>
                      <td className="py-3 px-4 text-center text-green-500">
                        فوری
                      </td>
                      <td className="py-3 ps-4 text-center text-muted-foreground">
                        کند
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 pe-4 text-foreground">مناسب برای</td>
                      <td className="py-3 px-4 text-center text-foreground">
                        دسترسی سریع
                      </td>
                      <td className="py-3 ps-4 text-center text-muted-foreground">
                        حریم کامل
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* FAQs */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            سوالات متداول
          </h2>
          <Card>
            <CardContent className="pt-4">
              <Accordion type="single" collapsible className="w-full">
                {FAQS.map((faq, idx) => (
                  <AccordionItem key={idx} value={`item-${idx}`}>
                    <AccordionTrigger className="text-start text-foreground hover:text-primary">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
