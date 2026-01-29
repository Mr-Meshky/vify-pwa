"use client";

import { useState } from "react";
import {
  ChevronDown,
  Globe,
  MessageCircle,
  Clock,
  Smartphone,
  Copy,
  QrCode,
  RefreshCw,
  Heart,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function AboutSection() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-border/50 bg-card/50 overflow-hidden">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 text-right transition-colors hover:bg-secondary/30 active:bg-secondary/50"
      >
        <span className="font-medium text-foreground">درباره برنامه</span>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-muted-foreground transition-transform duration-300",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {/* Content */}
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-6 border-t border-border/50 p-4">
            {/* How it works */}
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 font-semibold text-foreground">
                <RefreshCw className="h-4 w-4 text-primary" />
                نحوه کار
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                این برنامه با استفاده از GitHub Actions به صورت خودکار هر ساعت
                کانفیگ‌های V2Ray را از منابع مختلف جمع‌آوری و به‌روزرسانی
                می‌کند. شما همیشه به جدیدترین و فعال‌ترین کانفیگ‌ها دسترسی
                دارید.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 font-semibold text-foreground">
                <Smartphone className="h-4 w-4 text-primary" />
                قابلیت‌ها
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Copy className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span>کپی لینک سابسکریپشن برای استفاده در کلاینت‌ها</span>
                </li>
                <li className="flex items-start gap-2">
                  <QrCode className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span>QR Code برای اسکن سریع با V2Box و سایر اپ‌ها</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span>به‌روزرسانی خودکار هر ساعت</span>
                </li>
              </ul>
            </div>

            {/* How to use */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">نحوه استفاده</h3>

              <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground marker:text-primary">
                <li>یکی از سابسکریپشن‌ها را انتخاب کنید</li>
                <li>لینک را کپی کنید یا QR Code را اسکن کنید</li>
                <li>
                  لینک را در کلاینت V2Ray خود اضافه کنید (V2Box, V2RayNG,
                  Shadowrocket و...)
                </li>
                <li>از اینترنت آزاد لذت ببرید!</li>
              </ol>

              <div className="pt-2 space-y-2 text-sm text-muted-foreground">
                <p>
                  🔹 چون تست پینگ گرفتن از این تعداد کانفیگ سخته، برای تست و
                  استفاده
                  <span className="text-foreground font-medium">
                    {" "}
                    Hiddify، NekoBox یا Nekoray
                  </span>{" "}
                  پیشنهاد میشه. مخزن به‌صورت مرتب آپدیت میشه.
                </p>

                <p>
                  🔸 در آیفون (iOS) می‌تونید از
                  <span className="text-foreground font-medium"> Hiddify </span>
                  یا
                  <span className="text-foreground font-medium">
                    {" "}
                    NPV Tunnel{" "}
                  </span>
                  استفاده کنید (پیشنهادی).
                </p>

                <p>
                  🔺 در ویندوز،
                  <span className="text-foreground font-medium">
                    {" "}
                    Hiddify، V2RayN یا Nekoray
                  </span>{" "}
                  گزینه‌های مناسبی هستن.
                </p>
              </div>
            </div>

            {/* Links */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">ارتباط با ما</h3>
              <div className="flex flex-wrap gap-2">
                <a
                  href="https://t.me/MrMeshkyChannel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0088cc]/10 px-4 py-2.5 text-sm font-medium text-[#0088cc] transition-colors hover:bg-[#0088cc]/20 active:bg-[#0088cc]/30"
                >
                  <MessageCircle className="h-4 w-4" />
                  کانال تلگرام
                </a>
                <a
                  href="https://mrmeshky.ir"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20 active:bg-primary/30"
                >
                  <Globe className="h-4 w-4" />
                  mrmeshky.ir
                </a>
                <a
                  href="https://github.com/ShatakVPN/ConfigForge-V2Ray"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80 active:bg-secondary/60"
                >
                  <Star className="h-4 w-4" />
                  ستاره بده
                </a>
              </div>
            </div>

            {/* Credit */}
            <div className="flex items-center justify-center gap-1.5 pt-2 text-xs text-muted-foreground">
              <span>ساخته شده با</span>
              <Heart className="h-3 w-3 fill-red-500 text-red-500" />
              <span>توسط</span>
              <a
                href="https://mrmeshky.ir"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
              >
                MrMeshky
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
