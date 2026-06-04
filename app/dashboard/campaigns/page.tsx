"use client";

import React, { useState, useEffect, useCallback } from "react";
import { TopBar } from "@/components/shared/TopBar";
import { StatsRow } from "@/components/shared/StatsRow";
import { CampaignTable } from "@/components/campaigns/CampaignTable";
import { CreateCampaignModal } from "@/components/campaigns/CreateCampaignModal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import {
  listCampaigns,
  listCalls,
  createCampaign,
  updateCampaign,
  deleteCampaign,
} from "@/lib/vapi";
import { Campaign, CampaignCallCounts } from "@/types/campaign";
import { Call } from "@/types/call";
import {
  Radio,
  Phone,
  PhoneOff,
  Voicemail,
  Plus,
} from "lucide-react";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [callCounts, setCallCounts] = useState<Record<string, CampaignCallCounts>>({});
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { addToast } = useToast();

  const fetchCallCounts = useCallback(
    async (campaignIds: string[]) => {
      const counts: Record<string, CampaignCallCounts> = {};

      await Promise.all(
        campaignIds.map(async (id) => {
          try {
            const calls: Call[] = await listCalls(id, 1000);
            const c: CampaignCallCounts = {
              scheduled: 0,
              queued: 0,
              "in-progress": 0,
              ended: 0,
              voicemail: 0,
              total: calls.length,
            };

            calls.forEach((call) => {
              if (call.status === "queued") c.queued++;
              else if (
                call.status === "in-progress" ||
                call.status === "ringing"
              )
                c["in-progress"]++;
              else if (call.status === "ended") {
                c.ended++;
                if (
                  call.endedReason === "voicemail" ||
                  call.endedReason === "no-answer"
                ) {
                  c.voicemail++;
                }
              }
            });

            counts[id] = c;
          } catch {
            counts[id] = {
              scheduled: 0,
              queued: 0,
              "in-progress": 0,
              ended: 0,
              voicemail: 0,
              total: 0,
            };
          }
        })
      );

      return counts;
    },
    []
  );

  const fetchData = useCallback(async () => {
    try {
      const campaignsData = await listCampaigns();
      setCampaigns(campaignsData);

      const ids = campaignsData.map((c) => c.id);
      if (ids.length > 0) {
        const counts = await fetchCallCounts(ids);
        setCallCounts(counts);
      }
    } catch (error) {
      addToast({
        title: "Failed to load campaigns",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchCallCounts, addToast]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleCreateCampaign = async (data: {
    name: string;
    assistantId: string;
    phoneNumberId: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    callsPerHour: number;
    leads: { number: string; name?: string }[];
  }) => {
    setCreating(true);
    try {
      const startDateTime = new Date(`${data.startDate}T${data.startTime}`);
      const endDateTime = new Date(`${data.endDate}T${data.endTime}`);

      const customers = data.leads.map((lead, index) => {
        const staggerMinutes = (index / data.callsPerHour) * 60;
        const leadEarliestAt = new Date(
          startDateTime.getTime() + staggerMinutes * 60 * 1000
        );

        return {
          number: lead.number,
          name: lead.name,
          numberE164CheckEnabled: true as const,
          assistantOverrides: lead.name
            ? {
                variableValues: { lead_name: lead.name },
              }
            : undefined,
          schedulePlan: {
            earliestAt: leadEarliestAt.toISOString(),
            latestAt: endDateTime.toISOString(),
          },
        };
      });

      await createCampaign({
        name: data.name,
        assistantId: data.assistantId,
        phoneNumberId: data.phoneNumberId,
        customers,
        schedulePlan: {
          earliestAt: startDateTime.toISOString(),
          latestAt: endDateTime.toISOString(),
        },
      });

      addToast({
        title: "Campaign created",
        description: `${data.name} created with ${data.leads.length} leads`,
        variant: "success",
      });

      setShowCreateModal(false);
      fetchData();
    } catch (error) {
      addToast({
        title: "Failed to create campaign",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handlePause = async (id: string) => {
    try {
      await updateCampaign(id, { status: "paused" });
      addToast({
        title: "Campaign paused",
        variant: "success",
      });
      fetchData();
    } catch (error) {
      addToast({
        title: "Failed to pause campaign",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleResume = async (id: string) => {
    try {
      await updateCampaign(id, { status: "running" });
      addToast({
        title: "Campaign resumed",
        variant: "success",
      });
      fetchData();
    } catch (error) {
      addToast({
        title: "Failed to resume campaign",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this campaign? This action cannot be undone.")) return;
    try {
      await deleteCampaign(id);
      addToast({
        title: "Campaign deleted",
        variant: "success",
      });
      fetchData();
    } catch (error) {
      addToast({
        title: "Failed to delete campaign",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const totalCampaigns = campaigns.length;
  const totalInProgress = Object.values(callCounts).reduce(
    (sum, c) => sum + (c["in-progress"] || 0),
    0
  );
  const totalEnded = Object.values(callCounts).reduce(
    (sum, c) => sum + (c.ended || 0),
    0
  );
  const totalVoicemail = Object.values(callCounts).reduce(
    (sum, c) => sum + (c.voicemail || 0),
    0
  );
  const totalCalls = Object.values(callCounts).reduce(
    (sum, c) => sum + (c.total || 0),
    0
  );

  return (
    <div className="flex flex-col">
      <TopBar onRefresh={handleRefresh} refreshing={refreshing} />

      <div className="flex-1 space-y-6 p-6">
        <StatsRow
          stats={[
            {
              label: "Total Campaigns",
              value: totalCampaigns,
              icon: <Radio className="h-4 w-4" />,
              color: "primary",
            },
            {
              label: "Total Calls",
              value: totalCalls,
              icon: <Phone className="h-4 w-4" />,
              color: "default",
            },
            {
              label: "In Progress",
              value: totalInProgress,
              icon: <Phone className="h-4 w-4" />,
              color: "success",
            },
            {
              label: "Ended",
              value: totalEnded,
              icon: <PhoneOff className="h-4 w-4" />,
              color: "default",
            },
            {
              label: "Voicemails",
              value: totalVoicemail,
              icon: <Voicemail className="h-4 w-4" />,
              color: "warning",
            },
          ]}
        />

        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Campaigns</h2>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            New Campaign
          </Button>
        </div>

        <Card>
          <CampaignTable
            campaigns={campaigns}
            callCounts={callCounts}
            onPause={handlePause}
            onResume={handleResume}
            onDelete={handleDelete}
            loading={loading}
          />
        </Card>
      </div>

      <CreateCampaignModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={handleCreateCampaign}
        loading={creating}
      />
    </div>
  );
}
