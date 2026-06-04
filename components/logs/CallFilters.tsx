"use client";

import React from "react";
import { CallStatusFilter } from "@/types/call";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CallFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: CallStatusFilter;
  onStatusChange: (status: CallStatusFilter) => void;
  campaignFilter: string;
  onCampaignFilterChange: (campaignId: string) => void;
  campaigns?: { id: string; name: string }[];
}

const statusOptions: { value: CallStatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "queued", label: "Queued" },
  { value: "in-progress", label: "In Progress" },
  { value: "ended", label: "Ended" },
];

export function CallFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  campaignFilter,
  onCampaignFilterChange,
  campaigns,
}: CallFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by number or name..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8 pr-8"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
        {statusOptions.map((option) => (
          <Button
            key={option.value}
            variant={statusFilter === option.value ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onStatusChange(option.value)}
            className={cn(
              "h-7 text-xs",
              statusFilter === option.value && "font-medium"
            )}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {campaigns && campaigns.length > 0 && (
        <select
          value={campaignFilter}
          onChange={(e) => onCampaignFilterChange(e.target.value)}
          className="h-8 rounded-md border border-border bg-transparent px-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">All Campaigns</option>
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
