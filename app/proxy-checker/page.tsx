"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Shield,
  Loader2,
  Copy,
  Check,
  ArrowRight,
  AlertCircle,
  Play,
  Square,
  RefreshCw,
  Wifi,
  WifiOff,
  Clock,
  Download,
  Trash2,
  Search,
  FlaskConical,
  ExternalLink,
  Zap,
  Activity,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface ProxyData {
  server: string;
  port: number;
  secret: string;
  original: string;
}

interface CheckedProxy extends ProxyData {
  status: "pending" | "checking" | "success" | "failed";
  ping?: number;
  avgPing?: number;
  jitter?: number;
  testCount?: number;
  error?: string;
}

const PROXY_SOURCES = [
  {
    name: "Telegram Proxy 1",
    url: "https://raw.githubusercontent.com/V2RAYCONFIGSPOOL/TELEGRAM_PROXY_SUB/refs/heads/main/telegram_proxy_no1.txt",
  },
  {
    name: "Telegram Proxy 2",
    url: "https://raw.githubusercontent.com/V2RAYCONFIGSPOOL/TELEGRAM_PROXY_SUB/refs/heads/main/telegram_proxy_no2.txt",
  },
  {
    name: "Telegram Proxy 3",
    url: "https://raw.githubusercontent.com/V2RAYCONFIGSPOOL/TELEGRAM_PROXY_SUB/refs/heads/main/telegram_proxy_no3.txt",
  },
  {
    name: "Telegram Proxy 4",
    url: "https://raw.githubusercontent.com/V2RAYCONFIGSPOOL/TELEGRAM_PROXY_SUB/refs/heads/main/telegram_proxy_no4.txt",
  },
  {
    name: "Telegram Proxy 5",
    url: "https://raw.githubusercontent.com/V2RAYCONFIGSPOOL/TELEGRAM_PROXY_SUB/refs/heads/main/telegram_proxy_no5.txt",
  },
  {
    name: "Telegram Proxy 6",
    url: "https://raw.githubusercontent.com/V2RAYCONFIGSPOOL/TELEGRAM_PROXY_SUB/refs/heads/main/telegram_proxy_no6.txt",
  },
  {
    name: "Telegram Proxy 7",
    url: "https://raw.githubusercontent.com/V2RAYCONFIGSPOOL/TELEGRAM_PROXY_SUB/refs/heads/main/telegram_proxy_no7.txt",
  },
  {
    name: "Telegram Proxy 8",
    url: "https://raw.githubusercontent.com/V2RAYCONFIGSPOOL/TELEGRAM_PROXY_SUB/refs/heads/main/telegram_proxy_no8.txt",
  },
  {
    name: "Telegram Proxy 9",
    url: "https://raw.githubusercontent.com/V2RAYCONFIGSPOOL/TELEGRAM_PROXY_SUB/refs/heads/main/telegram_proxy_no9.txt",
  },
  {
    name: "Telegram Proxy 10",
    url: "https://raw.githubusercontent.com/V2RAYCONFIGSPOOL/TELEGRAM_PROXY_SUB/refs/heads/main/telegram_proxy_no10.txt",
  },
  {
    name: "Telegram Proxy 11",
    url: "https://raw.githubusercontent.com/Argh94/Proxy-List/refs/heads/main/MTProto.txt",
  },
  {
    name: "Telegram Proxy 12",
    url: "https://raw.githubusercontent.com/SoliSpirit/mtproto/master/all_proxies.txt",
  },
];

export default function ProxyCheckerPage() {
  const [activeTab, setActiveTab] = useState("auto");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [proxies, setProxies] = useState<CheckedProxy[]>([]);
  const [workingProxies, setWorkingProxies] = useState<CheckedProxy[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("آماده برای شروع...");
  const [logs, setLogs] = useState<
    { time: string; message: string; isError?: boolean }[]
  >([
    {
      time: new Date().toLocaleTimeString("fa-IR"),
      message: "سیستم آماده است.",
    },
  ]);
  const [channels, setChannels] = useState("");
  const [messageCount, setMessageCount] = useState(5);
  const [scanningChannels, setScanningChannels] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const addLog = useCallback((message: string, isError = false) => {
    setLogs((prev) => [
      ...prev,
      { time: new Date().toLocaleTimeString("fa-IR"), message, isError },
    ]);
  }, []);

  const parseProxyLink = (link: string): ProxyData | null => {
    try {
      let cleanLink = link.trim().replace(".&", "&");
      if (!cleanLink.includes("://")) return null;

      const urlObj = new URL(cleanLink);
      const params = new URLSearchParams(urlObj.search);

      const server = params.get("server");
      const port = parseInt(params.get("port") || "0");
      const secret = params.get("secret");

      if (!server || !port || !secret || isNaN(port)) return null;
      if (port <= 0 || port > 65535) return null;

      // Skip fake/bad secrets
      if (secret.length > 170 || secret.includes("AAAAAAAAAAAAAAAAAAAA")) {
        return null;
      }

      return { server, port, secret, original: cleanLink };
    } catch {
      return null;
    }
  };

  const fetchProxies = async () => {
    setLoading(true);
    setError(null);
    setProxies([]);
    setWorkingProxies([]);
    setProgress(0);
    addLog("در حال دریافت لیست پروکسی‌ها...");

    try {
      const allLinks: string[] = [];

      for (const source of PROXY_SOURCES) {
        addLog(`دریافت از ${source.name}...`);
        const response = await fetch(
          `/api/fetch-subscription?url=${encodeURIComponent(source.url)}`
        );
        if (!response.ok) {
          addLog(`خطا در دریافت از ${source.name}`, true);
          continue;
        }
        const text = await response.text();
        const lines = text.split("\n").filter((l) => l.trim());
        allLinks.push(...lines);
        addLog(`${lines.length} لینک از ${source.name} دریافت شد.`);
      }

      // Parse and deduplicate
      const uniqueServers = new Set<string>();
      const parsedProxies: CheckedProxy[] = [];

      for (const link of allLinks) {
        const parsed = parseProxyLink(link);
        if (parsed) {
          const key = `${parsed.server}:${parsed.port}`;
          if (!uniqueServers.has(key)) {
            uniqueServers.add(key);
            parsedProxies.push({ ...parsed, status: "pending" });
          }
        }
      }

      if (parsedProxies.length === 0) {
        setError("هیچ لینک معتبری یافت نشد!");
        addLog("هیچ لینک معتبری پیدا نشد.", true);
        return;
      }

      setProxies(parsedProxies);
      addLog(`${parsedProxies.length} پروکسی معتبر آماده بررسی است.`);
      setStatusText(`${parsedProxies.length} پروکسی آماده بررسی`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "خطای نامشخص";
      setError(errorMessage);
      addLog(`خطا: ${errorMessage}`, true);
    } finally {
      setLoading(false);
    }
  };

  // Scan channels for proxies
  const scanChannelsForProxies = async () => {
    const channelList = channels
      .split("\n")
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    if (channelList.length === 0) {
      setError("لطفا حداقل یک کانال وارد کنید");
      return;
    }

    if (channelList.length > 20) {
      setError("حداکثر 20 کانال در هر درخواست مجاز است");
      return;
    }

    setScanningChannels(true);
    setError(null);
    setProxies([]);
    setWorkingProxies([]);
    setProgress(0);
    addLog("در حال اسکن کانال‌ها برای پروکسی...");

    try {
      const response = await fetch("/api/scan-proxy-channels", {
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

      const allLinks: string[] = data.proxies || [];
      addLog(`${allLinks.length} پروکسی از کانال‌ها پیدا شد.`);

      // Parse and deduplicate
      const uniqueServers = new Set<string>();
      const parsedProxies: CheckedProxy[] = [];

      for (const link of allLinks) {
        const parsed = parseProxyLink(link);
        if (parsed) {
          const key = `${parsed.server}:${parsed.port}`;
          if (!uniqueServers.has(key)) {
            uniqueServers.add(key);
            parsedProxies.push({ ...parsed, status: "pending" });
          }
        }
      }

      if (parsedProxies.length === 0) {
        setError("هیچ پروکسی معتبری در کانال‌ها یافت نشد!");
        addLog("هیچ پروکسی معتبری پیدا نشد.", true);
        return;
      }

      setProxies(parsedProxies);
      addLog(`${parsedProxies.length} پروکسی یکتا آماده بررسی است.`);
      setStatusText(`${parsedProxies.length} پروکسی آماده بررسی`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "خطای نامشخص";
      setError(errorMessage);
      addLog(`خطا: ${errorMessage}`, true);
    } finally {
      setScanningChannels(false);
    }
  };

  // Enhanced proxy check with multiple tests
  const checkProxy = async (
    proxy: ProxyData
  ): Promise<{
    ok: boolean;
    ping?: number;
    avgPing?: number;
    jitter?: number;
    testCount?: number;
  }> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch("/api/check-proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...proxy, multiTest: true }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return { ok: false };
      }

      const result = await response.json();
      return result;
    } catch {
      clearTimeout(timeoutId);
      return { ok: false };
    }
  };

  const startChecking = async () => {
    if (proxies.length === 0) {
      setError("ابتدا لیست پروکسی‌ها را دریافت کنید");
      return;
    }

    setChecking(true);
    setWorkingProxies([]);
    setProgress(0);
    abortControllerRef.current = new AbortController();
    addLog("شروع بررسی پروکسی‌ها (تست چند مرحله‌ای)...");

    const batchSize = 3; // Smaller batch for more accurate testing
    let completed = 0;
    const total = proxies.length;
    const working: CheckedProxy[] = [];

    // Reset all to pending
    setProxies((prev) => prev.map((p) => ({ ...p, status: "pending" })));

    for (let i = 0; i < proxies.length; i += batchSize) {
      if (abortControllerRef.current?.signal.aborted) {
        addLog("بررسی متوقف شد.", true);
        break;
      }

      const batch = proxies.slice(i, i + batchSize);

      // Mark batch as checking
      setProxies((prev) =>
        prev.map((p, idx) =>
          idx >= i && idx < i + batchSize ? { ...p, status: "checking" } : p
        )
      );

      const results = await Promise.all(
        batch.map(async (proxy, batchIdx) => {
          const result = await checkProxy(proxy);
          const idx = i + batchIdx;

          if (result.ok) {
            const checkedProxy: CheckedProxy = {
              ...proxy,
              status: "success",
              ping: result.ping,
              avgPing: result.avgPing,
              jitter: result.jitter,
              testCount: result.testCount,
            };
            working.push(checkedProxy);
            addLog(
              `سالم: ${proxy.server}:${proxy.port} | Ping: ${result.avgPing}ms | Jitter: ${result.jitter}ms`
            );
            return { idx, proxy: checkedProxy };
          } else {
            return {
              idx,
              proxy: {
                ...proxy,
                status: "failed" as const,
                error: "اتصال ناموفق",
              },
            };
          }
        })
      );

      // Update proxies with results
      setProxies((prev) => {
        const newProxies = [...prev];
        for (const { idx, proxy } of results) {
          newProxies[idx] = proxy;
        }
        return newProxies;
      });

      completed += batch.length;
      const progressPercent = Math.round((completed / total) * 100);
      setProgress(progressPercent);
      setStatusText(`${completed} / ${total} | سالم: ${working.length}`);
      // Sort by average ping
      setWorkingProxies(
        [...working].sort(
          (a, b) =>
            (a.avgPing || a.ping || 9999) - (b.avgPing || b.ping || 9999)
        )
      );
    }

    setChecking(false);
    if (working.length > 0) {
      addLog(`بررسی تمام شد. ${working.length} پروکسی سالم پیدا شد.`);
    } else {
      addLog("هیچ پروکسی سالمی پیدا نشد.", true);
    }
  };

  const stopChecking = () => {
    abortControllerRef.current?.abort();
    setChecking(false);
    addLog("توقف بررسی...", true);
  };

  const copyWorkingProxies = async () => {
    if (workingProxies.length === 0) return;

    const text = workingProxies.map((p) => `${p.original}`).join("\n\n");

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setProxies([]);
    setWorkingProxies([]);
    setProgress(0);
    setStatusText("آماده برای شروع...");
    setLogs([
      {
        time: new Date().toLocaleTimeString("fa-IR"),
        message: "سیستم پاک شد.",
      },
    ]);
  };

  return (
    <main className="min-h-screen bg-background pb-safe">
      <div className="mx-auto max-w-2xl px-4 py-6">
        {/* Header */}
        <header className="mb-6">
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
                  اسکنر پروکسی تلگرام
                </h1>
                <p className="text-sm text-muted-foreground">
                  استخراج پروکسی از کانال‌های تلگرام
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

        {/* Beta Alert */}
        <Alert className="mb-6 border-amber-500/50 bg-amber-500/10">
          <FlaskConical className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-600 dark:text-amber-400">
            نسخه آزمایشی (Beta)
          </AlertTitle>
          <AlertDescription className="text-amber-600/80 dark:text-amber-400/80">
            این بخش در حال توسعه است. نتایج تست ممکن است با عملکرد واقعی متفاوت
            باشد و صددرصد تضمینی نیست. تست از سرور انجام می‌شود و ممکن است با
            اینترنت شما تفاوت داشته باشد.
          </AlertDescription>
        </Alert>

        {/* Tabs for Auto/Manual */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="mb-6"
          dir="rtl"
        >
          <TabsList className="w-full">
            <TabsTrigger value="auto" className="flex-1 gap-2">
              <Zap className="h-4 w-4" />
              دریافت خودکار
            </TabsTrigger>
            <TabsTrigger value="scanner" className="flex-1 gap-2">
              <Search className="h-4 w-4" />
              اسکنر کانال
            </TabsTrigger>
          </TabsList>

          <TabsContent value="auto" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Download className="h-5 w-5 text-primary" />
                  دریافت از منابع آماده
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  پروکسی‌ها از منابع معتبر GitHub دریافت و تست می‌شوند.
                </p>
                <div className="rounded-lg bg-secondary/50 p-3">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    منابع:
                  </p>
                  {PROXY_SOURCES.map((source, idx) => (
                    <div
                      key={idx}
                      dir="ltr"
                      className="flex items-center gap-2 text-xs text-muted-foreground"
                    >
                      <Shield className="h-3 w-3 text-primary" />
                      {source.name}
                    </div>
                  ))}
                </div>
                <Button
                  onClick={fetchProxies}
                  disabled={loading || checking}
                  className="w-full gap-2"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  دریافت لیست پروکسی
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scanner" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Search className="h-5 w-5 text-primary" />
                  اسکنر کانال تلگرام
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Suggested Channels Link */}
                <div className="flex items-center justify-between rounded-lg bg-primary/10 p-3">
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
                </div>

                <Textarea
                  placeholder={`نام کانال‌ها را وارد کنید (هر خط یک کانال)\nمثال:\nMTProxies\nproxymtproto`}
                  value={channels}
                  onChange={(e) => setChannels(e.target.value)}
                  className="min-h-24 font-mono text-sm"
                  dir="ltr"
                />

                {/* Message Count */}
                <div className="flex flex-col gap-2 rounded-lg bg-secondary/50 p-3 sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-foreground">
                      تعداد پیام آخر
                    </label>
                    <p className="text-xs text-muted-foreground">
                      چند پیام آخر هر کانال بررسی شود؟
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {[5, 10, 20, 30, 50].map((num) => (
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
                  onClick={scanChannelsForProxies}
                  disabled={scanningChannels || checking || !channels.trim()}
                  className="w-full gap-2"
                >
                  {scanningChannels ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      در حال اسکن...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      اسکن کانال‌ها
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Progress Section */}
        {proxies.length > 0 && (
          <Card className="mb-6">
            <CardContent className="py-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  پیشرفت تست
                </span>
                <span className="text-sm text-muted-foreground">
                  {progress}%
                </span>
              </div>
              <Progress value={progress} className="h-2" />
              <p
                className="mt-2 text-center text-xs text-muted-foreground"
                dir="ltr"
              >
                {statusText}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Start/Stop Checking */}
        {proxies.length > 0 && (
          <div className="mb-6 grid grid-cols-2 gap-3">
            {!checking ? (
              <Button
                onClick={startChecking}
                disabled={loading || scanningChannels}
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                شروع تست
              </Button>
            ) : (
              <Button
                onClick={stopChecking}
                variant="destructive"
                className="gap-2"
              >
                <Square className="h-4 w-4" />
                توقف
              </Button>
            )}
            <Button
              onClick={clearAll}
              variant="outline"
              disabled={checking}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              پاک کردن
            </Button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Stats */}
        {proxies.length > 0 && (
          <div className="mb-6 grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="flex flex-col items-center py-4">
                <span className="text-2xl font-bold text-foreground">
                  {proxies.length}
                </span>
                <span className="text-xs text-muted-foreground">کل</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center py-4">
                <span className="text-2xl font-bold text-accent">
                  {workingProxies.length}
                </span>
                <span className="text-xs text-muted-foreground">سالم</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center py-4">
                <span className="text-2xl font-bold text-destructive">
                  {proxies.filter((p) => p.status === "failed").length}
                </span>
                <span className="text-xs text-muted-foreground">خراب</span>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Working Proxies */}
        {workingProxies.length > 0 && (
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-5 w-5 text-accent" />
                پروکسی‌های سالم ({workingProxies.length})
              </CardTitle>
              <Button
                size="sm"
                onClick={copyWorkingProxies}
                className="h-8 gap-1 text-xs"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3" />
                    کپی شد
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    کپی همه
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="max-h-80 space-y-2 overflow-y-auto">
                {workingProxies.map((proxy, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col gap-2 rounded-xl bg-secondary/50 p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Wifi className="h-4 w-4 shrink-0 text-accent" />
                      <span
                        className="break-all font-mono text-xs text-foreground"
                        dir="ltr"
                      >
                        {proxy.server}:{proxy.port}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="gap-1 bg-accent/10 text-accent"
                      >
                        <Clock className="h-3 w-3" />
                        {proxy.avgPing || proxy.ping}ms
                      </Badge>
                      {proxy.jitter !== undefined && (
                        <Badge
                          variant="secondary"
                          className="gap-1 bg-primary/10 text-primary"
                        >
                          <Activity className="h-3 w-3" />
                          {proxy.jitter}ms
                        </Badge>
                      )}
                      {proxy.testCount && (
                        <Badge variant="outline" className="gap-1 text-xs">
                          {proxy.testCount}x
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Proxy List Preview */}
        {proxies.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">وضعیت بررسی</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-48 space-y-1.5 overflow-y-auto">
                {proxies.slice(0, 50).map((proxy, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2"
                  >
                    <span
                      className="truncate font-mono text-xs text-muted-foreground"
                      dir="ltr"
                    >
                      {proxy.server}:{proxy.port}
                    </span>
                    {proxy.status === "pending" && (
                      <Badge variant="secondary" className="shrink-0 text-xs">
                        در انتظار
                      </Badge>
                    )}
                    {proxy.status === "checking" && (
                      <Badge className="shrink-0 gap-1 text-xs">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        تست
                      </Badge>
                    )}
                    {proxy.status === "success" && (
                      <Badge className="shrink-0 gap-1 bg-accent text-accent-foreground text-xs">
                        <Wifi className="h-3 w-3" />
                        {proxy.avgPing || proxy.ping}ms
                      </Badge>
                    )}
                    {proxy.status === "failed" && (
                      <Badge
                        variant="destructive"
                        className="shrink-0 gap-1 text-xs"
                      >
                        <WifiOff className="h-3 w-3" />
                        خطا
                      </Badge>
                    )}
                  </div>
                ))}
                {proxies.length > 50 && (
                  <p className="text-center text-xs text-muted-foreground">
                    و {proxies.length - 50} پروکسی دیگر...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Console Logs */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm">
              <span>لاگ‌ها</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  setLogs([
                    {
                      time: new Date().toLocaleTimeString("fa-IR"),
                      message: "لاگ پاک شد.",
                    },
                  ])
                }
                className="h-6 gap-1 px-2 text-xs"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-32 overflow-y-auto rounded-xl bg-black p-3 font-vazirmatin text-xs text-green-400">
              {logs.map((log, idx) => (
                <div key={idx} className={log.isError ? "text-red-400" : ""}>
                  [{log.time}] {log.message}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
