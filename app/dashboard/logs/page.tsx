"use client";

import React, { useState, useEffect, useCallback } from "react";
import { TopBar } from "@/components/shared/TopBar";
import { CallLogsTable } from "@/components/logs/CallLogsTable";
import { CallDetailModal } from "@/components/logs/CallDetailModal";
import { CallFilters } from "@/components/logs/CallFilters";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { listCalls, listCampaigns } from "@/lib/vapi";
import { Call, CallStatusFilter } from "@/types/call";
import { Campaign } from "@/types/campaign";

export default function CallLogsPage() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [showCallModal, setShowCallModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<CallStatusFilter>("all");
  const [campaignFilter, setCampaignFilter] = useState("");
  const { addToast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const [callsData, campaignsData] = await Promise.all([
        campaignFilter
          ? listCalls(campaignFilter, 500)
          : listCalls(undefined, 500),
        listCampaigns(),
      ]);
      setCalls(callsData);
      setCampaigns(campaignsData);
    } catch (error) {
      addToast({
        title: "Failed to load call logs",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [campaignFilter, addToast]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
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

  return (
    <div className="flex flex-col">
      <TopBar onRefresh={handleRefresh} refreshing={refreshing} />

      <div className="flex-1 space-y-6 p-6">
        <div className="space-y-3">
          <h2 className="text-base font-semibold">
            All Call Logs ({filteredCalls.length})
          </h2>
          <CallFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            campaignFilter={campaignFilter}
            onCampaignFilterChange={setCampaignFilter}
            campaigns={campaigns.map((c) => ({ id: c.id, name: c.name }))}
          />
          <Card>
            <CallLogsTable
              calls={filteredCalls}
              loading={loading}
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
