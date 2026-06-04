"use client";

import React, { useState, useEffect } from "react";
import { Call } from "@/types/call";
import { getCall } from "@/lib/vapi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  formatDateTime,
  formatDuration,
  formatCost,
} from "@/lib/utils";
import {
  Clock,
  DollarSign,
  Phone,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface CallDetailModalProps {
  call: Call | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CallDetailModal({
  call: initialCall,
  open,
  onOpenChange,
}: CallDetailModalProps) {
  const [call, setCall] = useState<Call | null>(initialCall);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialCall && open) {
      setCall(initialCall);
      setLoading(true);
      getCall(initialCall.id)
        .then((fullCall) => setCall(fullCall))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [initialCall, open]);

  if (!call) return null;

  const isSuccess =
    call.analysis?.successEvaluation?.toLowerCase().includes("true") ||
    call.analysis?.successEvaluation?.toLowerCase().includes("yes");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <span>{call.customer?.name || call.customer?.number}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Meta info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-md bg-muted p-3">
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="mt-0.5 font-medium capitalize">{call.status}</p>
            </div>
            <div className="rounded-md bg-muted p-3">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> Duration
              </p>
              <p className="mt-0.5 font-medium">
                {formatDuration(call.startedAt, call.endedAt)}
              </p>
            </div>
            <div className="rounded-md bg-muted p-3">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <DollarSign className="h-3 w-3" /> Cost
              </p>
              <p className="mt-0.5 font-medium">{formatCost(call.cost)}</p>
            </div>
            <div className="rounded-md bg-muted p-3">
              <p className="text-xs text-muted-foreground">Outcome</p>
              <div className="mt-0.5 flex items-center gap-1">
                {isSuccess ? (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive" />
                )}
                <span className="text-sm">
                  {isSuccess ? "Success" : "Failed"}
                </span>
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Phone:</span>{" "}
            {call.customer?.number}
            {call.startedAt && (
              <>
                {" "}
                &middot;{" "}
                <span className="font-medium text-foreground">Started:</span>{" "}
                {formatDateTime(call.startedAt)}
              </>
            )}
            {call.endedReason && (
              <>
                {" "}
                &middot;{" "}
                <span className="font-medium text-foreground">Ended:</span>{" "}
                {call.endedReason}
              </>
            )}
          </div>

          <Separator />

          {/* Analysis */}
          {call.analysis && (
            <div className="space-y-3">
              {call.analysis.summary && (
                <div>
                  <h4 className="text-sm font-semibold mb-1">Summary</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {call.analysis.summary}
                  </p>
                </div>
              )}
              {call.analysis.successEvaluation && (
                <div>
                  <h4 className="text-sm font-semibold mb-1">
                    Success Evaluation
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {call.analysis.successEvaluation}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Recording */}
          {call.recordingUrl && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Recording</h4>
              <audio controls className="w-full" src={call.recordingUrl}>
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          <Separator />

          {/* Transcript */}
          {call.messages && call.messages.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Transcript</h4>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2 pr-3">
                  {call.messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        msg.role === "assistant"
                          ? "justify-start"
                          : "justify-end"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                          msg.role === "assistant"
                            ? "bg-primary/10 text-foreground"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        <p className="text-xs text-muted-foreground mb-0.5 capitalize">
                          {msg.role}
                        </p>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-4">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
