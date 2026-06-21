"use client";

import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Upload, AlertCircle, Download } from "lucide-react";
import { parseLeadsText, parseCsv } from "@/lib/utils";

interface CreateCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    name: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    callsPerHour: number;
    leads: { number: string; name?: string; business?: string }[];
  }) => void;
  loading?: boolean;
}

export function CreateCampaignModal({
  open,
  onOpenChange,
  onSubmit,
  loading,
}: CreateCampaignModalProps) {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("17:00");
  const [callsPerHour, setCallsPerHour] = useState(30);
  const [leadsText, setLeadsText] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const [leadCount, setLeadCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setName("");
    setStartDate("");
    setStartTime("09:00");
    setEndDate("");
    setEndTime("17:00");
    setCallsPerHour(30);
    setLeadsText("");
    setErrors([]);
    setCsvErrors([]);
    setLeadCount(0);
  };

  const handleLeadsChange = (text: string) => {
    setLeadsText(text);
    const leads = parseLeadsText(text);
    setLeadCount(leads.length);
    setCsvErrors([]);
  };

  const handleCsvImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await parseCsv(file);
    const csvLines = result.leads
      .map((l) => {
        const parts = [l.number];
        if (l.name) parts.push(l.name);
        if (l.business) {
          if (!l.name) parts.push("");
          parts.push(l.business);
        }
        return parts.join(",");
      })
      .join("\n");

    const existingLeads = leadsText.trim() ? leadsText.trim() + "\n" : "";
    const newText = existingLeads + csvLines;

    setLeadsText(newText);
    setLeadCount(parseLeadsText(newText).length);
    setCsvErrors(result.errors);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = () => {
    const newErrors: string[] = [];

    if (!name.trim()) newErrors.push("Campaign name is required");
    if (!startDate) newErrors.push("Start date is required");
    if (!endDate) newErrors.push("End date is required");
    if (callsPerHour < 1) newErrors.push("Calls per hour must be at least 1");

    const leads = parseLeadsText(leadsText);
    if (leads.length === 0)
      newErrors.push("At least one valid E.164 lead is required");

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors([]);
    onSubmit({
      name: name.trim(),
      startDate,
      startTime,
      endDate,
      endTime,
      callsPerHour,
      leads,
    });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) resetForm();
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Campaign</DialogTitle>
          <DialogDescription>
            Configure a new outbound call campaign
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {errors.length > 0 && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3">
              {errors.map((err, i) => (
                <p key={i} className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {err}
                </p>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Campaign Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Q4 Sales Outreach"
                className="mt-1.5"
              />
            </div>
          </div>

          <Separator />

          <div>
            <Label>Schedule Window</Label>
            <div className="mt-1.5 grid grid-cols-2 gap-4">
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-28"
                />
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-28"
                />
              </div>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Start and end date/time for the campaign calling window
            </p>
          </div>

          <div>
            <Label htmlFor="callsPerHour">Calls Per Hour</Label>
            <Input
              id="callsPerHour"
              type="number"
              min={1}
              max={500}
              value={callsPerHour}
              onChange={(e) => setCallsPerHour(parseInt(e.target.value) || 1)}
              className="mt-1.5 w-32"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Staggered scheduling: ~{callsPerHour} calls/hour max
            </p>
          </div>

          <Separator />

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="leads">
                Leads ({leadCount} valid)
              </Label>
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleCsvImport}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const csv = "phone,name,business\n+447742868942,Zaid,Pizza Palace\n+441234567890,Jane Smith,Smith & Co Law Firm\n+923001234567,Ali Khan,Tech Solutions";
                    const blob = new Blob([csv], { type: "text/csv" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "leads-template.csv";
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  Template
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-1.5 h-3.5 w-3.5" />
                  Import CSV
                </Button>
              </div>
            </div>
            <Textarea
              id="leads"
              value={leadsText}
              onChange={(e) => handleLeadsChange(e.target.value)}
              placeholder="+1234567890,John Doe,Acme Inc&#10;+1987654321,Jane Smith,Smith Co"
              className="mt-1.5 min-h-[120px] font-mono text-sm"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              One lead per line. Format: +phone,name,business (name &amp; business optional). E.164 format required.
            </p>
            {csvErrors.length > 0 && (
              <div className="mt-2 rounded-md border border-warning/50 bg-warning/10 p-2">
                <p className="text-xs font-medium text-warning">
                  CSV Import Issues:
                </p>
                {csvErrors.slice(0, 5).map((err, i) => (
                  <p key={i} className="text-xs text-warning/80">
                    {err}
                  </p>
                ))}
                {csvErrors.length > 5 && (
                  <p className="text-xs text-warning/80">
                    ...and {csvErrors.length - 5} more
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating..." : "Create Campaign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
