"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Send,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";
import { submitConfig, type SubmitConfigResult } from "@/app/donate-configs/actions";
import { cn } from "@/lib/utils";

const CONFIG_TYPES = [
  { value: "VLESS", label: "VLESS", prefix: "vless://" },
  { value: "VMESS", label: "VMess", prefix: "vmess://" },
  { value: "Trojan", label: "Trojan", prefix: "trojan://" },
  { value: "Shadowsocks", label: "Shadowsocks", prefix: "ss://" },
  { value: "SOCKS", label: "SOCKS", prefix: "socks://" },
  { value: "HTTP Proxy", label: "HTTP Proxy", prefix: "http://" },
];

const NETWORK_TYPES = [
  { value: "mobile_data", label: "اینترنت موبایل" },
  { value: "home_wifi", label: "وای‌فای خانگی" },
  { value: "public_wifi", label: "وای‌فای عمومی" },
  { value: "isp_based", label: "اینترنت ثابت (ISP)" },
  { value: "custom", label: "سایر" },
];

const USE_CASES = [
  { value: "browsing", label: "وب‌گردی" },
  { value: "gaming", label: "بازی آنلاین" },
  { value: "download", label: "دانلود" },
  { value: "telegram", label: "تلگرام" },
];

const COUNTRIES = [
  "ایران", "آلمان", "هلند", "فرانسه", "آمریکا", "کانادا", "انگلستان",
  "سوئد", "فنلاند", "نروژ", "ترکیه", "روسیه", "ژاپن", "کره جنوبی",
  "سنگاپور", "هنگ کنگ", "سایر",
];

export function DonateConfigForm() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<SubmitConfigResult | null>(null);
  const [configType, setConfigType] = useState("");
  const [networkType, setNetworkType] = useState("");
  const [useCase, setUseCase] = useState("");
  const [country, setCountry] = useState("");

  const handleSubmit = (formData: FormData) => {
    // Add select values to formData
    formData.set("config_type", configType);
    formData.set("network_type", networkType);
    formData.set("use_case", useCase);
    formData.set("country", country);

    startTransition(async () => {
      const res = await submitConfig(formData);
      setResult(res);
      if (res.success) {
        // Reset form
        setConfigType("");
        setNetworkType("");
        setUseCase("");
        setCountry("");
      }
    });
  };

  if (result?.success) {
    return (
      <div className="space-y-4">
        <div
          className={cn(
            "rounded-2xl border p-6 text-center",
            result.isDuplicate
              ? "border-yellow-500/30 bg-yellow-500/5"
              : "border-primary/30 bg-primary/5"
          )}
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            {result.isDuplicate ? (
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            ) : (
              <CheckCircle2 className="h-8 w-8 text-primary" />
            )}
          </div>
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            {result.isDuplicate ? "ثبت شد (احتمال تکراری)" : "با موفقیت ثبت شد!"}
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {result.message}
          </p>
        </div>
        <Button
          onClick={() => setResult(null)}
          variant="secondary"
          className="w-full rounded-xl"
        >
          ارسال کانفیگ جدید
        </Button>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      {/* Error display */}
      {result && !result.success && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">{result.message}</p>
        </div>
      )}

      {/* Config Type */}
      <div className="space-y-2">
        <Label htmlFor="config_type" className="text-sm font-medium text-foreground">
          نوع پروتکل *
        </Label>
        <Select value={configType} onValueChange={setConfigType}>
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder="انتخاب پروتکل..." />
          </SelectTrigger>
          <SelectContent>
            {CONFIG_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                <span className="flex items-center gap-2">
                  <code className="rounded bg-secondary px-1.5 py-0.5 text-xs font-mono">
                    {type.prefix}
                  </code>
                  {type.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Config Content */}
      <div className="space-y-2">
        <Label htmlFor="config_content" className="text-sm font-medium text-foreground">
          محتوای کانفیگ *
        </Label>
        <Textarea
          id="config_content"
          name="config_content"
          placeholder={
            configType
              ? `${CONFIG_TYPES.find((t) => t.value === configType)?.prefix || ""}...`
              : "کانفیگ خود را اینجا وارد کنید..."
          }
          className="min-h-[120px] rounded-xl font-mono text-sm"
          dir="ltr"
          required
        />
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <Info className="h-3 w-3" />
          کانفیگ باید با پیشوند مناسب پروتکل شروع شود
        </p>
      </div>

      {/* Country */}
      <div className="space-y-2">
        <Label htmlFor="country" className="text-sm font-medium text-foreground">
          کشور / منطقه سرور *
        </Label>
        <Select value={country} onValueChange={setCountry}>
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder="انتخاب کشور..." />
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Network Type */}
      <div className="space-y-2">
        <Label htmlFor="network_type" className="text-sm font-medium text-foreground">
          نوع شبکه *
        </Label>
        <Select value={networkType} onValueChange={setNetworkType}>
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder="بهترین شبکه..." />
          </SelectTrigger>
          <SelectContent>
            {NETWORK_TYPES.map((n) => (
              <SelectItem key={n.value} value={n.value}>
                {n.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Use Case */}
      <div className="space-y-2">
        <Label htmlFor="use_case" className="text-sm font-medium text-foreground">
          بهترین کاربرد *
        </Label>
        <Select value={useCase} onValueChange={setUseCase}>
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder="کاربرد اصلی..." />
          </SelectTrigger>
          <SelectContent>
            {USE_CASES.map((u) => (
              <SelectItem key={u.value} value={u.value}>
                {u.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Separator */}
      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/50" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-card px-3 text-xs text-muted-foreground">
            اختیاری
          </span>
        </div>
      </div>

      {/* Contributor Name */}
      <div className="space-y-2">
        <Label htmlFor="contributor_name" className="text-sm font-medium text-foreground">
          نام مستعار
        </Label>
        <Input
          id="contributor_name"
          name="contributor_name"
          placeholder="نام شما (نمایش داده می‌شود)"
          className="rounded-xl"
          maxLength={50}
        />
      </div>

      {/* Contributor Telegram */}
      <div className="space-y-2">
        <Label htmlFor="contributor_telegram" className="text-sm font-medium text-foreground">
          آیدی تلگرام
        </Label>
        <Input
          id="contributor_telegram"
          name="contributor_telegram"
          placeholder="@username"
          className="rounded-xl"
          dir="ltr"
          maxLength={50}
        />
      </div>

      {/* Review Notice */}
      <div className="rounded-xl border border-border/50 bg-secondary/20 p-3">
        <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          تمام کانفیگ‌ها قبل از انتشار توسط تیم ما بررسی می‌شوند. کانفیگ‌های
          تایید شده به لیست اصلی اضافه و امتیاز شما افزایش می‌یابد.
        </p>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isPending || !configType || !country || !networkType || !useCase}
        className="w-full gap-2 rounded-xl py-6 text-base"
      >
        {isPending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            در حال ارسال...
          </>
        ) : (
          <>
            <Send className="h-5 w-5" />
            ارسال کانفیگ
          </>
        )}
      </Button>
    </form>
  );
}
