"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { TopBar } from "@/components/shared/TopBar";
import { CallLogsTable } from "@/components/logs/CallLogsTable";
import { CallDetailModal } from "@/components/logs/CallDetailModal";
import { CallFilters } from "@/components/logs/CallFilters";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { getCampaign, listCalls, updateCampaign } from "@/lib/vapi";
import { Campaign } from "@/types/campaign";
import { Call, CallStatusFilter } from "@/types/call";
import { formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Pause,
  Play,
  Users,
  Calendar,
  Gauge,
} from "lucide-react";

export default function CampaignDetailPage() {
  const params = useParams();
  const campaignId = params.id as string;
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [showCallModal, setShowCallModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<CallStatusFilter>("all");
  const { addToast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const [campaignData, callsData] = await Promise.all([
        getCampaign(campaignId),
        listCalls(campaignId, 500),
      ]);
      setCampaign(campaignData);
      setCalls(callsData);
    } catch (error) {
      addToast({
        title: "Failed to load campaign",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [campaignId, addToast]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handlePause = async () => {
    try {
      await updateCampaign(campaignId, { status: "paused" });
      addToast({ title: "Campaign paused", variant: "success" });
      fetchData();
    } catch (error) {
      addToast({
        title: "Failed to pause",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleResume = async () => {
    try {
      await updateCampaign(campaignId, { status: "running" });
      addToast({ title: "Campaign resumed", variant: "success" });
      fetchData();
    } catch (error) {
      addToast({
        title: "Failed to resume",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleCallClick = (call: Call) => {
    setSelectedCall(call);
    setShowCallModal(true);
  };

  const filteredCalls = calls.filter((call) => {
    if (statusFilter !== "all" && call.status !== statusFilter) {
      if (
        statusFilter === "in-progress" &&
        call.status !== "ringing" &&
        call.status !== "in-progress"
      ) {
        return false;
      }
      if (statusFilter !== "in-progress" && call.status !== statusFilter) {
        return false;
      }
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const name = call.customer?.name?.toLowerCase() || "";
      const number = call.customer?.number || "";
      if (!name.includes(query) && !number.includes(query)) {
        return false;
      }
    }

    return true;
  });

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Campaign not found</p>
        <Link href="/dashboard/campaigns">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Campaigns
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <TopBar onRefresh={handleRefresh} refreshing={refreshing} />

      <div className="flex-1 space-y-6 p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Link
              href="/dashboard/campaigns"
              className="mt-1 rounded-md p-1 hover:bg-accent"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold">{campaign.name}</h2>
                <Badge
                  variant={
                    campaign.status === "running"
                      ? "success"
                      : campaign.status === "paused"
                        ? "warning"
                        : "secondary"
                  }
                >
                  {campaign.status || "unknown"}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                ID: {campaign.id}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {campaign.status === "running" && (
              <Button variant="outline" onClick={handlePause}>
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </Button>
            )}
            {campaign.status === "paused" && (
              <Button variant="outline" onClick={handleResume}>
                <Play className="mr-2 h-4 w-4" />
                Resume
              </Button>
            )}
          </div>
        </div>

        {/* Campaign info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-xs">Leads</span>
            </div>
            <p className="mt-1 text-2xl font-bold">
              {campaign.customers?.length || 0}
            </p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Gauge className="h-4 w-4" />
              <span className="text-xs">Calls/Hour</span>
            </div>
            <p className="mt-1 text-2xl font-bold">--</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="text-xs">Created</span>
            </div>
            <p className="mt-1 text-lg font-bold">
              {formatDate(campaign.createdAt)}
            </p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="text-xs">Schedule</span>
            </div>
            <p className="mt-1 text-sm font-medium">
              {campaign.schedulePlan?.earliestAt
                ? `${formatDate(campaign.schedulePlan.earliestAt)} - ${formatDate(campaign.schedulePlan.latestAt)}`
                : "--"}
            </p>
          </Card>
        </div>

        {/* Call logs */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold">
            Call Logs ({filteredCalls.length})
          </h3>
          <CallFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            campaignFilter=""
            onCampaignFilterChange={() => {}}
          />
          <Card>
            <CallLogsTable
              calls={filteredCalls}
              onCallClick={handleCallClick}
            />
          </Card>
        </div>
      </div>

      <CallDetailModal
        call={selectedCall}
        open={showCallModal}
        onOpenChange={setShowCallModal}
      />
    </div>
  );
}
