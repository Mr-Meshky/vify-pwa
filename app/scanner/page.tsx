"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Loader2,
  Copy,
  Check,
  ArrowRight,
  Globe,
  Server,
  Layers,
  AlertCircle,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";

interface CategoryResult {
  protocol: Record<string, string[]>;
  country: Record<string, string[]>;
  type: Record<string, string[]>;
  all: string[];
  errors: string[];
}

interface ScanResult {
  success: boolean;
  data: CategoryResult;
  stats: {
    totalConfigs: number;
    protocols: number;
    countries: number;
    types: number;
    errors: number;
  };
}

export default function ScannerPage() {
  const [channels, setChannels] = useState("");
  const [messageCount, setMessageCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleScan = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    const channelList = channels
      .split("\n")
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    if (channelList.length === 0) {
      setError("لطفا حداقل یک کانال وارد کنید");
      setLoading(false);
      return;
    }

    if (channelList.length > 20) {
      setError("حداکثر 20 کانال در هر درخواست مجاز است");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/scan-channels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-vify-client": "web",
        },
        body: JSON.stringify({ channels: channelList, messageCount }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "خطا در پردازش درخواست");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در برقراری ارتباط");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const renderConfigList = (
    configs: Record<string, string[]>,
    icon: React.ReactNode,
    title: string
  ) => {
    const entries = Object.entries(configs);
    if (entries.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <AlertCircle className="mb-2 h-8 w-8" />
          <p>کانفیگی یافت نشد</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {entries.map(([key, configList]) => (
          <Card key={key} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between py-3">
              <div className="flex items-center gap-2">
                {icon}
                <CardTitle className="text-sm font-medium">{key}</CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {configList.length}
                </Badge>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(configList.join("\n"), key)}
                className="h-8"
              >
                {copiedKey === key ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </CardHeader>
            <CardContent className="py-2">
              <div className="max-h-32 overflow-y-auto rounded-lg bg-secondary/50 p-2">
                <pre className="text-xs text-muted-foreground" dir="ltr">
                  {configList.slice(0, 5).join("\n")}
                  {configList.length > 5 &&
                    `\n... و ${configList.length - 5} مورد دیگر`}
                </pre>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-background pb-safe">
      <div className="mx-auto max-w-2xl px-4 py-6">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 shadow-lg shadow-primary/10">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  اسکنر کانال
                </h1>
                <p className="text-sm text-muted-foreground">
                  استخراج کانفیگ از کانال‌های تلگرام
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

        {/* Suggested Channels Link */}
        <Card className="mb-4 border-primary/30 bg-primary/5">
          <CardContent className="flex items-center justify-between py-3">
            <span className="text-sm text-foreground">
              لیست پیشنهادی کانال‌ها
            </span>
            <a
              href="https://t.me/MrMeshkyChannel/1959"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <ExternalLink className="h-4 w-4" />
              مشاهده
            </a>
          </CardContent>
        </Card>

        {/* Input Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">کانال‌های تلگرام</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder={`نام کانال‌ها را وارد کنید (هر خط یک کانال)\nمثال:\nMrMeshkyChannel\nv2rayng`}
              value={channels}
              onChange={(e) => setChannels(e.target.value)}
              className="min-h-32 font-mono text-sm"
              dir="ltr"
            />

            {/* Message Count Input */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 rounded-lg bg-secondary/50 p-3">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <label className="mb-1 block text-sm font-medium text-foreground">
                  تعداد پیام آخر
                </label>
                <p className="text-xs text-muted-foreground">
                  چند پیام آخر هر کانال بررسی شود؟
                </p>
              </div>
              <div className="flex items-center gap-2">
                {[2, 5, 10, 20, 30].map((num) => (
                  <button
                    key={num}
                    onClick={() => setMessageCount(num)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                      messageCount === num
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleScan}
              disabled={loading || !channels.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  در حال اسکن...
                </>
              ) : (
                "شروع اسکن"
              )}
            </Button>
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        {result && (
          <>
            {/* Stats */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Card>
                <CardContent className="flex flex-col items-center py-4">
                  <span className="text-2xl font-bold text-primary">
                    {result.stats.totalConfigs}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    کل کانفیگ‌ها
                  </span>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center py-4">
                  <span className="text-2xl font-bold text-primary">
                    {result.stats.protocols}
                  </span>
                  <span className="text-xs text-muted-foreground">پروتکل</span>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center py-4">
                  <span className="text-2xl font-bold text-primary">
                    {result.stats.countries}
                  </span>
                  <span className="text-xs text-muted-foreground">کشور</span>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center py-4">
                  <span className="text-2xl font-bold text-destructive">
                    {result.stats.errors}
                  </span>
                  <span className="text-xs text-muted-foreground">خطا</span>
                </CardContent>
              </Card>
            </div>

            {/* Copy All Button */}
            {result.data.all.length > 0 && (
              <Card className="mb-6">
                <CardContent className="flex items-center justify-between py-4">
                  <span className="text-sm font-medium">
                    کپی همه کانفیگ‌ها ({result.data.all.length})
                  </span>
                  <Button
                    size="sm"
                    onClick={() =>
                      copyToClipboard(result.data.all.join("\n"), "all")
                    }
                  >
                    {copiedKey === "all" ? (
                      <>
                        <Check className="ml-2 h-4 w-4" />
                        کپی شد
                      </>
                    ) : (
                      <>
                        <Copy className="ml-2 h-4 w-4" />
                        کپی
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Tabs */}
            <Tabs defaultValue="protocol" className="w-full">
              <TabsList className="mb-4 w-full">
                <TabsTrigger value="protocol" className="flex-1">
                  <Server className="ml-1 h-4 w-4" />
                  پروتکل
                </TabsTrigger>
                <TabsTrigger value="country" className="flex-1">
                  <Globe className="ml-1 h-4 w-4" />
                  کشور
                </TabsTrigger>
                <TabsTrigger value="type" className="flex-1">
                  <Layers className="ml-1 h-4 w-4" />
                  نوع
                </TabsTrigger>
              </TabsList>
              <TabsContent value="protocol">
                {renderConfigList(
                  result.data.protocol,
                  <Server className="h-4 w-4 text-primary" />,
                  "پروتکل"
                )}
              </TabsContent>
              <TabsContent value="country">
                {renderConfigList(
                  result.data.country,
                  <Globe className="h-4 w-4 text-primary" />,
                  "کشور"
                )}
              </TabsContent>
              <TabsContent value="type">
                {renderConfigList(
                  result.data.type,
                  <Layers className="h-4 w-4 text-primary" />,
                  "نوع"
                )}
              </TabsContent>
            </Tabs>

            {/* Errors */}
            {result.data.errors.length > 0 && (
              <Card className="mt-6 border-destructive/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    کانال‌های با خطا
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg bg-destructive/10 p-3">
                    <pre className="text-xs text-destructive" dir="ltr">
                      {result.data.errors.join("\n")}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </main>
  );
}
