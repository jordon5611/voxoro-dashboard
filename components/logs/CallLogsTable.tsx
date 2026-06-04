"use client";

import React from "react";
import { Call } from "@/types/call";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatDuration, formatCost } from "@/lib/utils";

interface CallLogsTableProps {
  calls: Call[];
  loading?: boolean;
  onCallClick?: (call: Call) => void;
}

function getCallStatusBadge(status: string, endedReason?: string) {
  if (endedReason === "voicemail" || endedReason === "no-answer") {
    return <Badge variant="warning">Voicemail</Badge>;
  }

  switch (status) {
    case "in-progress":
    case "ringing":
      return <Badge variant="success">In Progress</Badge>;
    case "queued":
      return <Badge variant="outline">Queued</Badge>;
    case "ended":
      return <Badge variant="secondary">Ended</Badge>;
    case "forwarding":
      return <Badge variant="default">Forwarding</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export function CallLogsTable({ calls, loading, onCallClick }: CallLogsTableProps) {
  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (calls.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center text-center">
        <p className="text-muted-foreground">No calls found</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Started</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Cost</TableHead>
          <TableHead>Summary</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {calls.map((call) => (
          <TableRow
            key={call.id}
            className="cursor-pointer"
            onClick={() => onCallClick?.(call)}
          >
            <TableCell>
              <div>
                <p className="font-medium">
                  {call.customer?.name || "Unknown"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {call.customer?.number}
                </p>
              </div>
            </TableCell>
            <TableCell>
              {getCallStatusBadge(call.status, call.endedReason)}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatDateTime(call.startedAt)}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatDuration(call.startedAt, call.endedAt)}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatCost(call.cost)}
            </TableCell>
            <TableCell className="max-w-[200px] truncate text-muted-foreground">
              {call.analysis?.summary || "--"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
