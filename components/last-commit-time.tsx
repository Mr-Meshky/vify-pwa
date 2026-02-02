"use client";

import useSWR from "swr";
import { Clock } from "lucide-react";

interface CommitData {
  date: string;
  message?: string;
}

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });

function formatPersianDate(dateString: string): string {
  const date = new Date(dateString);

  const persianDate = date.toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const persianTime = date.toLocaleTimeString("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${persianDate} - ${persianTime}`;
}

export function LastCommitTime() {
  const { data, error, isLoading } = useSWR<CommitData>(
    "/api/last-commit",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 0,
      dedupingInterval: 60 * 60 * 1000,
    }
  );

  if (isLoading) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
        <Clock className="h-3 w-3 animate-pulse" />
        <span className="animate-pulse">در حال بارگذاری...</span>
      </div>
    );
  }

  if (error || !data?.date) return null;

  const formattedDate = formatPersianDate(data.date);

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80">
      <Clock className="h-3 w-3" />
      <span dir="rtl">{formattedDate}</span>
    </div>
  );
}
