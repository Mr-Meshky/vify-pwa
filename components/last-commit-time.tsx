"use client";

import useSWR from "swr";
import { Clock } from "lucide-react";

const GITHUB_API_URL =
  "https://api.github.com/repos/Mr-Meshky/vify/commits?per_page=1";

interface Commit {
  commit: {
    committer: {
      date: string;
    };
  };
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

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
  const { data, error, isLoading } = useSWR<Commit[]>(GITHUB_API_URL, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // 1 minute
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
        <Clock className="h-3 w-3 animate-pulse" />
        <span className="animate-pulse">در حال بارگذاری...</span>
      </div>
    );
  }

  if (error || !data || !data[0]) {
    return null;
  }

  const lastCommitDate = data[0].commit.committer.date;
  const formattedDate = formatPersianDate(lastCommitDate);

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80">
      <Clock className="h-3 w-3" />
      <span dir="rtl">{formattedDate}</span>
    </div>
  );
}
