"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: "default" | "primary" | "success" | "warning" | "destructive";
}

interface StatsRowProps {
  stats: StatCard[];
}

const colorMap: Record<string, string> = {
  default: "text-muted-foreground",
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
};

export function StatsRow({ stats }: StatsRowProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted",
                colorMap[stat.color || "default"]
              )}
            >
              {stat.icon}
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold leading-none">{stat.value}</p>
              <p className="mt-1 text-xs text-muted-foreground truncate">
                {stat.label}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
