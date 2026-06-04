"use client";

import React, { useState, useEffect } from "react";
import { TopBar } from "@/components/shared/TopBar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getActivityLog,
  subscribeToActivityLog,
  clearActivityLog,
} from "@/lib/activity-log";
import { ActivityEntry } from "@/types/activity";
import { formatTime } from "@/lib/utils";
import { Trash2, Activity } from "lucide-react";

export default function ActivityPage() {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);

  useEffect(() => {
    setEntries(getActivityLog());
    const unsubscribe = subscribeToActivityLog(() => {
      setEntries([...getActivityLog()]);
    });
    return unsubscribe;
  }, []);

  const handleClear = () => {
    clearActivityLog();
  };

  return (
    <div className="flex flex-col">
      <TopBar />

      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-base font-semibold">
              Activity Log ({entries.length})
            </h2>
          </div>
          {entries.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleClear}>
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </div>

        <Card>
          {entries.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-center">
              <Activity className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No activity recorded yet</p>
              <p className="text-sm text-muted-foreground">
                API calls will appear here as they happen
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">Time</TableHead>
                  <TableHead className="w-[70px]">Method</TableHead>
                  <TableHead>Endpoint</TableHead>
                  <TableHead className="w-[80px]">Status</TableHead>
                  <TableHead className="w-[80px]">Duration</TableHead>
                  <TableHead>Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {formatTime(entry.timestamp)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          entry.method === "GET"
                            ? "outline"
                            : entry.method === "POST"
                              ? "default"
                              : entry.method === "PATCH"
                                ? "secondary"
                                : entry.method === "DELETE"
                                  ? "destructive"
                                  : "outline"
                        }
                        className="font-mono text-[10px]"
                      >
                        {entry.method}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {entry.endpoint}
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          entry.status >= 200 && entry.status < 300
                            ? "text-success"
                            : "text-destructive"
                        }
                      >
                        {entry.status || "--"}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {entry.duration}ms
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-xs text-destructive">
                      {entry.error || "--"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
}
