export interface Customer {
  number: string;
  name?: string;
  numberE164CheckEnabled: true;
  assistantOverrides?: {
    variableValues?: Record<string, string>;
  };
  schedulePlan?: {
    earliestAt: string;
    latestAt: string;
  };
}

export interface SchedulePlan {
  earliestAt: string;
  latestAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  assistantId: string;
  phoneNumberId: string;
  customers: Customer[];
  schedulePlan?: SchedulePlan;
  status?: "queued" | "running" | "paused" | "completed";
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCampaignPayload {
  name: string;
  assistantId: string;
  phoneNumberId: string;
  customers: Customer[];
  schedulePlan?: SchedulePlan;
}

export interface CampaignFormData {
  name: string;
  assistantId: string;
  phoneNumberId: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  callsPerHour: number;
  leadsText: string;
}

export interface CampaignCallCounts {
  scheduled: number;
  queued: number;
  "in-progress": number;
  ended: number;
  voicemail: number;
  total: number;
}
