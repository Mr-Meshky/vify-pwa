import { SubscriptionCard } from "@/components/subscription-card";
import { AboutSection } from "@/components/about-section";
import { DownloadApps } from "@/components/download-apps";
import { Shield, Scan, Wifi } from "lucide-react";
import { LastCommitTime } from "@/components/last-commit-time";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const subscriptions = [
  {
    name: "All Configs",
    url: "https://raw.githubusercontent.com/Mr-Meshky/vify/main/configs/all.txt",
    icon: "all",
    description: "همه کانفیگ‌ها (Full)",
  },
  {
    name: "Light",
    url: "https://raw.githubusercontent.com/Mr-Meshky/vify/main/configs/light.txt",
    icon: "light",
    description: "کانفیگ‌های سبک و سریع",
  },
  {
    name: "VLESS",
    url: "https://raw.githubusercontent.com/Mr-Meshky/vify/main/configs/vless.txt",
    icon: "vless",
    description: "پروتکل VLESS",
  },
  {
    name: "VMess",
    url: "https://raw.githubusercontent.com/Mr-Meshky/vify/main/configs/vmess.txt",
    icon: "vmess",
    description: "پروتکل VMess",
  },
  {
    name: "Trojan",
    url: "https://raw.githubusercontent.com/Mr-Meshky/vify/main/configs/trojan.txt",
    icon: "trojan",
    description: "پروتکل Trojan",
  },
  {
    name: "Shadowsocks",
    url: "https://raw.githubusercontent.com/Mr-Meshky/vify/main/configs/ss.txt",
    icon: "ss",
    description: "پروتکل Shadowsocks",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background pb-safe">
      <div className="mx-auto max-w-2xl px-4 py-6">
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
                <h1 className="text-2xl font-bold text-foreground">Vify</h1>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/proxy-checker">
                <Button variant="outline" size="sm" className="gap-2">
                  <Wifi className="h-4 w-4" />
                  اسکنر پروکسی
                </Button>
              </Link>
              <Link href="/scanner">
                <Button variant="outline" size="sm" className="gap-2">
                  <Scan className="h-4 w-4" />
                  اسکنر
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Subscription List */}
        <section className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">
              سابسکریپشن‌ها
            </h2>
            <LastCommitTime />
          </div>
          <div className="space-y-3">
            {subscriptions.map((sub, index) => (
              <SubscriptionCard
                key={index}
                name={sub.name}
                url={sub.url}
                icon={sub.icon}
                description={sub.description}
              />
            ))}
          </div>
        </section>

        {/* Download Apps Section */}
        <section>
          <DownloadApps />
        </section>
      </div>
    </main>
  );
}
