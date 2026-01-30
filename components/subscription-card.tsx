"use client";

import React from "react";

import { useState } from "react";
import {
  Copy,
  Check,
  Download,
  Loader2,
  QrCode,
  X,
  ChevronDown,
  ChevronUp,
  Shield,
  Zap,
  Globe,
  Server,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QRCodeSVG } from "qrcode.react";

interface SubscriptionCardProps {
  name: string;
  url: string;
  icon: string;
  description?: string;
}

const iconMap: Record<string, React.ReactNode> = {
  all: <Globe className="h-5 w-5" />,
  trojan: <Shield className="h-5 w-5" />,
  vmess: <Zap className="h-5 w-5" />,
  vless: <Server className="h-5 w-5" />,
};

export function SubscriptionCard({
  name,
  url,
  icon,
  description,
}: SubscriptionCardProps) {
  const [copied, setCopied] = useState(false);
  const [contentCopied, setContentCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<string | null>(null);
  const [configCount, setConfigCount] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rangeStart, setRangeStart] = useState(0);
  const [rangeEnd, setRangeEnd] = useState(150);

  const copyUrl = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    navigator.vibrate?.(50);
    setTimeout(() => setCopied(false), 2000);
  };

  const fetchContent = async () => {
    if (content) {
      setExpanded(!expanded);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/fetch-subscription?url=${encodeURIComponent(url)}`,
      );
      if (!response.ok) throw new Error("خطا در دریافت محتوا");
      const data = await response.text();
      setContent(data);

      // Count configs (each line is a config)
      const lines = data.split("\n").filter((line) => line.trim().length > 0);
      setConfigCount(lines.length);

      setExpanded(true);
      navigator.vibrate?.(50);
    } catch {
      setError("خطا در دریافت");
      navigator.vibrate?.([50, 50, 50]);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedConfigs = () => {
    if (!content) return "";
    const lines = content.split("\n").filter((line) => line.trim().length > 0);
    const maxEnd = Math.min(rangeEnd, lines.length);
    const start = Math.min(rangeStart, maxEnd);
    return lines.slice(start, maxEnd).join("\n");
  };

  const getSelectedCount = () => {
    if (!content) return 0;
    const lines = content.split("\n").filter((line) => line.trim().length > 0);
    const maxEnd = Math.min(rangeEnd, lines.length);
    const start = Math.min(rangeStart, maxEnd);
    return maxEnd - start;
  };

  const copyContent = async () => {
    if (content) {
      const selectedContent = getSelectedConfigs();
      await navigator.clipboard.writeText(selectedContent);
      setContentCopied(true);
      navigator.vibrate?.(50);
      setTimeout(() => setContentCopied(false), 2000);
    }
  };

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-card transition-all active:scale-[0.98]">
        {/* Main Row */}
        <div className="flex items-center gap-3 p-4">
          {/* Icon */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {iconMap[icon] || <Globe className="h-5 w-5" />}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground">{name}</h3>
            <p className="text-xs text-muted-foreground">
              {description || url.split("/").pop()}
            </p>
          </div>

          {/* Count Badge */}
          {configCount !== null && (
            <Badge variant="secondary" className="shrink-0 font-mono text-xs">
              {configCount}
            </Badge>
          )}

          {/* Copy URL Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={copyUrl}
            className="h-10 w-10 shrink-0 rounded-xl"
          >
            {copied ? (
              <Check className="h-4 w-4 text-accent" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 border-t border-border/50 p-3">
          <Button
            onClick={fetchContent}
            disabled={loading}
            variant="secondary"
            className="flex-1 rounded-xl"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : expanded ? (
              <>
                <ChevronUp className="ml-2 h-4 w-4" />
                بستن
              </>
            ) : (
              <>
                <Download className="ml-2 h-4 w-4" />
                دریافت
              </>
            )}
          </Button>

          <Button
            onClick={() => setShowQR(true)}
            variant="secondary"
            className="rounded-xl px-4"
          >
            <QrCode className="h-4 w-4" />
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="border-t border-destructive/20 bg-destructive/10 px-4 py-2">
            <p className="text-xs text-destructive">{error}</p>
          </div>
        )}

        {/* Expanded Content */}
        {expanded && content && (
          <div className="border-t border-border/50 bg-secondary/20 p-4">
            {/* Range Selector */}
            <div className="mb-4 rounded-xl bg-background/50 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">
                  انتخاب محدوده
                </span>
                <span className="rounded-lg bg-primary/10 px-2 py-1 font-mono text-xs text-primary">
                  {getSelectedCount()} از {configCount}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex flex-1 items-center gap-2">
                  <input
                    type="number"
                    value={rangeStart}
                    onChange={(e) => setRangeStart(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-16 rounded-lg border border-border bg-background px-2 py-1.5 text-center font-mono text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    min={0}
                    max={configCount || 0}
                  />
                  <div className="flex-1">
                    <input
                      type="range"
                      value={rangeStart}
                      onChange={(e) => setRangeStart(parseInt(e.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-border accent-primary"
                      min={0}
                      max={configCount || 150}
                    />
                  </div>
                </div>
                
                <span className="text-muted-foreground">-</span>
                
                <div className="flex flex-1 items-center gap-2">
                  <div className="flex-1">
                    <input
                      type="range"
                      value={rangeEnd}
                      onChange={(e) => setRangeEnd(parseInt(e.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-border accent-primary"
                      min={0}
                      max={configCount || 150}
                    />
                  </div>
                  <input
                    type="number"
                    value={rangeEnd}
                    onChange={(e) => setRangeEnd(Math.min(configCount || 150, parseInt(e.target.value) || 0))}
                    className="w-16 rounded-lg border border-border bg-background px-2 py-1.5 text-center font-mono text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    min={0}
                    max={configCount || 150}
                  />
                </div>
              </div>
              
              {/* Quick Select Buttons */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {[
                  { label: "همه", start: 0, end: configCount || 150 },
                  { label: "50 اول", start: 0, end: 50 },
                  { label: "100 اول", start: 0, end: 100 },
                  { label: "150 اول", start: 0, end: 150 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      setRangeStart(preset.start);
                      setRangeEnd(Math.min(preset.end, configCount || preset.end));
                    }}
                    className="rounded-lg bg-secondary px-2.5 py-1 text-xs text-secondary-foreground transition-colors hover:bg-secondary/80 active:scale-95"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {configCount} کانفیگ
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyContent}
                className="h-8 rounded-lg text-xs"
              >
                {contentCopied ? (
                  <>
                    <Check className="ml-1 h-3 w-3 text-accent" />
                    کپی شد
                  </>
                ) : (
                  <>
                    <Copy className="ml-1 h-3 w-3" />
                    کپی {getSelectedCount()} کانفیگ
                  </>
                )}
              </Button>
            </div>
            <div className="max-h-40 overflow-auto rounded-xl bg-background/50 p-3">
              <pre
                className="whitespace-pre-wrap break-all font-mono text-xs text-muted-foreground"
                dir="ltr"
              >
                {getSelectedConfigs().slice(0, 800)}
                {getSelectedConfigs().length > 800 ? "\n..." : ""}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* QR Modal */}
      {showQR && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onClick={() => setShowQR(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-card p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-foreground">{name}</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowQR(false)}
                className="h-8 w-8 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex justify-center rounded-2xl bg-white p-6">
              <QRCodeSVG
                value={url}
                size={200}
                level="M"
                includeMargin={false}
              />
            </div>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              اسکن با V2Box یا هر کلاینت V2Ray
            </p>

            <Button onClick={copyUrl} className="mt-4 w-full rounded-xl">
              {copied ? (
                <>
                  <Check className="ml-2 h-4 w-4" />
                  کپی شد
                </>
              ) : (
                <>
                  <Copy className="ml-2 h-4 w-4" />
                  کپی لینک
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
