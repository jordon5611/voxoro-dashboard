"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TopBarProps {
  onRefresh?: () => void;
  refreshing?: boolean;
}

const pageLabels: Record<string, string> = {
  "/dashboard/campaigns": "Campaigns",
  "/dashboard/logs": "Call Logs",
  "/dashboard/activity": "Activity Log",
};

export function TopBar({ onRefresh, refreshing }: TopBarProps) {
  const pathname = usePathname();

  const label =
    Object.entries(pageLabels).find(([key]) => pathname.startsWith(key))?.[1] ||
    "Dashboard";

  const isCampaignDetail = /^\/dashboard\/campaigns\/[^/]+$/.test(pathname);

  return (
    <header className="flex h-14 items-center justify-between border-b border-border px-6">
      <h1 className="text-lg font-semibold">
        {isCampaignDetail ? "Campaign Detail" : label}
      </h1>

      {onRefresh && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onRefresh}
          disabled={refreshing}
          title="Refresh data"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
        </Button>
      )}
    </header>
  );
}
