import { SubscriptionCard } from "@/components/subscription-card";
import { AboutSection } from "@/components/about-section";
import { Shield } from "lucide-react";
import { LastCommitTime } from "@/components/last-commit-time";

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
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 shadow-lg shadow-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">VIfy</h1>
              <p className="text-sm text-muted-foreground">
                مجموعه کانفیگ‌های رایگان V2Ray
              </p>
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

        {/* About Section */}
        <section className="mb-6">
          <AboutSection />
        </section>

        {/* Install PWA Hint */}
        <footer className="rounded-2xl border border-dashed border-border/50 bg-secondary/20 p-4 text-center">
          <p className="text-xs text-muted-foreground">
            برای نصب به صورت اپلیکیشن: منوی مرورگر {">"} Add to Home Screen
          </p>
        </footer>
      </div>
    </main>
  );
}
