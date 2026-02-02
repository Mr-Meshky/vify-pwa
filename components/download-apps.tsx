"use client";

import { useState } from "react";
import {
  ChevronDown,
  Download,
  ExternalLink,
  Smartphone,
  Monitor,
  Apple,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AppItem {
  name: string;
  description?: string;
  directDownload?: string;
  storeLink?: string;
  storeName?: string;
  recommended?: boolean;
}

interface PlatformApps {
  platform: string;
  icon: React.ReactNode;
  apps: AppItem[];
}

const platforms: PlatformApps[] = [
  {
    platform: "Android",
    icon: <Smartphone className="h-5 w-5" />,
    apps: [
      {
        name: "V2Box",
        description: "کلاینت محبوب و سبک",
        storeLink:
          "https://play.google.com/store/apps/details?id=dev.hexasoftware.v2box",
        storeName: "Google Play",
        recommended: true,
      },
      {
        name: "Hiddify",
        description: "بهترین انتخاب برای اندروید",
        storeLink:
          "https://play.google.com/store/apps/details?id=app.hiddify.com",
        storeName: "Google Play",
      },

      {
        name: "v2RayTun",
        storeLink:
          "https://play.google.com/store/apps/details?id=com.v2raytun.android",
        storeName: "Google Play",
      },
    ],
  },
  {
    platform: "iOS",
    icon: <Apple className="h-5 w-5" />,
    apps: [
      {
        name: "V2Box",
        description: "رابط کاربری زیبا",
        storeLink: "https://apps.apple.com/app/v2box-v2ray-client/id6446814690",
        storeName: "App Store",
        recommended: true,
      },
      {
        name: "Hiddify",
        description: "رایگان و قدرتمند",
        storeLink: "https://apps.apple.com/app/hiddify-proxy-vpn/id6596777532",
        storeName: "App Store",
      },
      {
        name: "NPV Tunnel",
        description: "کلاینت ساده و کاربردی",
        storeLink: "https://apps.apple.com/app/npv-tunnel/id1629465476",
        storeName: "App Store",
      },
      {
        name: "Shadowrocket",
        description: "حرفه‌ای و پرامکانات (پولی)",
        storeLink: "https://apps.apple.com/app/shadowrocket/id932747118",
        storeName: "App Store",
      },
    ],
  },
  // {
  //   platform: "Windows",
  //   icon: <Monitor className="h-5 w-5" />,
  //   apps: [
  //     {
  //       name: "Hiddify",
  //       description: "بهترین انتخاب برای ویندوز",
  //       directDownload: "#",
  //       recommended: true,
  //     },
  //     {
  //       name: "V2RayN",
  //       description: "کلاینت کلاسیک و محبوب",
  //       directDownload: "#",
  //     },
  //     {
  //       name: "Nekoray",
  //       description: "رابط کاربری مدرن",
  //       directDownload: "#",
  //     },
  //   ],
  // },
  // {
  //   platform: "macOS",
  //   icon: <Apple className="h-5 w-5" />,
  //   apps: [
  //     {
  //       name: "Hiddify",
  //       description: "بهترین انتخاب برای مک",
  //       directDownload: "#",
  //       recommended: true,
  //     },
  //     {
  //       name: "V2RayU",
  //       description: "کلاینت ساده برای مک",
  //       directDownload: "#",
  //     },
  //   ],
  // },
];

export function DownloadApps() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("Android");

  const currentPlatform = platforms.find(
    (p) => p.platform === selectedPlatform
  );

  return (
    <div className="rounded-2xl border border-border/50 bg-card/50 overflow-hidden">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 text-right transition-colors hover:bg-secondary/30 active:bg-secondary/50"
      >
        <div className="flex items-center gap-2">
          <Download className="h-5 w-5 text-primary" />
          <span className="font-medium text-foreground">دانلود برنامه‌ها</span>
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-muted-foreground transition-transform duration-300",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Content */}
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t border-border/50 p-4">
            {/* Platform Tabs */}
            <div className="mb-4 flex flex-wrap gap-2">
              {platforms.map((platform) => (
                <button
                  key={platform.platform}
                  onClick={() => setSelectedPlatform(platform.platform)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all active:scale-95",
                    selectedPlatform === platform.platform
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                >
                  {platform.icon}
                  {platform.platform}
                </button>
              ))}
            </div>

            {/* Apps List */}
            <div className="space-y-3">
              {currentPlatform?.apps.map((app) => (
                <div
                  key={app.name}
                  className={cn(
                    "rounded-xl border p-3 transition-colors",
                    app.recommended
                      ? "border-primary/30 bg-primary/5"
                      : "border-border/50 bg-background/50"
                  )}
                >
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-foreground">
                          {app.name}
                        </h4>
                        {app.recommended && (
                          <span className="rounded-md bg-primary/20 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                            پیشنهادی
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {app.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {app.directDownload && (
                      <a
                        href={app.directDownload}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 active:scale-95"
                      >
                        <Download className="h-3.5 w-3.5" />
                        دانلود مستقیم
                      </a>
                    )}
                    {app.storeLink && (
                      <a
                        href={app.storeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 active:scale-95"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        {app.storeName}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Note */}
            <p className="mt-4 text-center text-xs text-muted-foreground">
              لینک دانلود مستقیم برنامه‌ها به زودی اضافه می‌شود
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
