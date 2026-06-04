"use client";

import React from "react";
import Link from "next/link";
import { Campaign, CampaignCallCounts } from "@/types/campaign";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Pause, Play, Trash2 } from "lucide-react";

interface CampaignTableProps {
  campaigns: Campaign[];
  callCounts: Record<string, CampaignCallCounts>;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

function getStatusBadge(status?: string) {
  switch (status) {
    case "running":
      return <Badge variant="success">Running</Badge>;
    case "paused":
      return <Badge variant="warning">Paused</Badge>;
    case "completed":
      return <Badge variant="secondary">Completed</Badge>;
    case "queued":
      return <Badge variant="outline">Queued</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
}

export function CampaignTable({
  campaigns,
  callCounts,
  onPause,
  onResume,
  onDelete,
  loading,
}: CampaignTableProps) {
  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center text-center">
        <p className="text-muted-foreground">No campaigns yet</p>
        <p className="text-sm text-muted-foreground">
          Create your first campaign to get started
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-center">Leads</TableHead>
          <TableHead className="text-center">In Progress</TableHead>
          <TableHead className="text-center">Ended</TableHead>
          <TableHead className="text-center">Voicemail</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {campaigns.map((campaign) => {
          const counts = callCounts[campaign.id];
          return (
            <TableRow key={campaign.id}>
              <TableCell>
                <Link
                  href={`/dashboard/campaigns/${campaign.id}`}
                  className="font-medium hover:text-primary transition-colors"
                >
                  {campaign.name}
                </Link>
              </TableCell>
              <TableCell>{getStatusBadge(campaign.status)}</TableCell>
              <TableCell className="text-center">
                {campaign.customers?.length || 0}
              </TableCell>
              <TableCell className="text-center">
                {counts?.["in-progress"] || 0}
              </TableCell>
              <TableCell className="text-center">
                {counts?.ended || 0}
              </TableCell>
              <TableCell className="text-center">
                {counts?.voicemail || 0}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(campaign.createdAt)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  {campaign.status === "running" ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onPause(campaign.id)}
                      title="Pause"
                    >
                      <Pause className="h-4 w-4" />
                    </Button>
                  ) : campaign.status === "paused" ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onResume(campaign.id)}
                      title="Resume"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  ) : null}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(campaign.id)}
                    title="Delete"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
