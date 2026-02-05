"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import crypto from "crypto";

// Rate limiting: track submissions per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

async function getClientIp(): Promise<string> {
  const headersList = await headers();
  const forwarded = headersList.get("x-forwarded-for");
  const realIp = headersList.get("x-real-ip");
  return forwarded?.split(",")[0]?.trim() || realIp || "unknown";
}

function checkRateLimit(ipHash: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ipHash);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ipHash, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count };
}

// Sanitize input to prevent XSS
function sanitize(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .trim();
}

// Validate config content format
function validateConfigContent(content: string, type: string): boolean {
  const trimmed = content.trim();
  if (trimmed.length < 10 || trimmed.length > 5000) return false;

  const prefixMap: Record<string, string[]> = {
    VLESS: ["vless://"],
    VMESS: ["vmess://"],
    Trojan: ["trojan://"],
    Shadowsocks: ["ss://"],
    SOCKS: ["socks://", "socks5://"],
    "HTTP Proxy": ["http://", "https://"],
  };

  const prefixes = prefixMap[type];
  if (!prefixes) return false;
  return prefixes.some((p) => trimmed.toLowerCase().startsWith(p));
}

export type SubmitConfigResult = {
  success: boolean;
  message: string;
  isDuplicate?: boolean;
};

export async function submitConfig(formData: FormData): Promise<SubmitConfigResult> {
  const ip = await getClientIp();
  const ipHash = hashIp(ip);

  // Rate limit check
  const { allowed } = checkRateLimit(ipHash);
  if (!allowed) {
    return {
      success: false,
      message: "تعداد درخواست‌های شما بیش از حد مجاز است. لطفا یک ساعت دیگر تلاش کنید.",
    };
  }

  // Extract form fields
  const configType = formData.get("config_type") as string;
  const configContent = formData.get("config_content") as string;
  const country = formData.get("country") as string;
  const networkType = formData.get("network_type") as string;
  const useCase = formData.get("use_case") as string;
  const contributorName = formData.get("contributor_name") as string | null;
  const contributorTelegram = formData.get("contributor_telegram") as string | null;

  // Validation
  const validTypes = ["VLESS", "VMESS", "Trojan", "Shadowsocks", "SOCKS", "HTTP Proxy"];
  const validNetworkTypes = ["mobile_data", "home_wifi", "public_wifi", "isp_based", "custom"];
  const validUseCases = ["browsing", "gaming", "download", "telegram"];

  if (!configType || !validTypes.includes(configType)) {
    return { success: false, message: "نوع کانفیگ نامعتبر است." };
  }
  if (!configContent || configContent.trim().length === 0) {
    return { success: false, message: "محتوای کانفیگ الزامی است." };
  }
  if (!validateConfigContent(configContent, configType)) {
    return {
      success: false,
      message: "فرمت کانفیگ با نوع انتخاب شده مطابقت ندارد. لطفا بررسی کنید.",
    };
  }
  if (!country || country.trim().length === 0) {
    return { success: false, message: "کشور/منطقه الزامی است." };
  }
  if (!networkType || !validNetworkTypes.includes(networkType)) {
    return { success: false, message: "نوع شبکه نامعتبر است." };
  }
  if (!useCase || !validUseCases.includes(useCase)) {
    return { success: false, message: "کاربرد نامعتبر است." };
  }

  const supabase = await createClient();

  // Duplicate detection: check by config_content hash
  const contentHash = crypto
    .createHash("sha256")
    .update(configContent.trim())
    .digest("hex")
    .slice(0, 32);

  const { data: existingConfigs } = await supabase
    .from("config_submissions")
    .select("id")
    .eq("config_content", sanitize(configContent.trim()))
    .limit(1);

  const isDuplicate = existingConfigs && existingConfigs.length > 0;

  // Insert submission
  const { error } = await supabase.from("config_submissions").insert({
    config_type: configType,
    config_content: sanitize(configContent.trim()),
    country: sanitize(country.trim()),
    network_type: networkType,
    use_case: useCase,
    contributor_name: contributorName ? sanitize(contributorName.trim()) : null,
    contributor_telegram: contributorTelegram ? sanitize(contributorTelegram.trim()) : null,
    ip_hash: ipHash,
    is_duplicate: isDuplicate,
  });

  if (error) {
    console.error("Submission error:", error);
    return { success: false, message: "خطا در ثبت کانفیگ. لطفا دوباره تلاش کنید." };
  }

  if (isDuplicate) {
    return {
      success: true,
      isDuplicate: true,
      message: "کانفیگ شما ثبت شد، اما ممکن است مشابه کانفیگ‌های قبلی باشد.",
    };
  }

  return {
    success: true,
    message: "کانفیگ شما با موفقیت ثبت شد و پس از بررسی منتشر خواهد شد. از مشارکت شما سپاسگزاریم!",
  };
}

export async function getTopContributors() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contributors")
    .select("name, telegram, score, level")
    .order("score", { ascending: false })
    .limit(10);

  if (error) return [];
  return data || [];
}

export async function getApprovedConfigsCount() {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("config_submissions")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved");

  if (error) return 0;
  return count || 0;
}
