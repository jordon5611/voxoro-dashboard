export interface CallMessage {
  role: "assistant" | "user";
  content: string;
  time?: number;
  endTime?: number;
}

export interface CallAnalysis {
  summary?: string;
  successEvaluation?: string;
  structuredData?: Record<string, unknown>;
}

export interface Call {
  id: string;
  status: "queued" | "ringing" | "in-progress" | "forwarding" | "ended";
  endedReason?: string;
  campaignId?: string;
  customer: {
    number: string;
    name?: string;
  };
  startedAt?: string;
  endedAt?: string;
  cost?: number;
  recordingUrl?: string;
  messages?: CallMessage[];
  analysis?: CallAnalysis;
  assistantId?: string;
  phoneNumberId?: string;
  createdAt?: string;
}

export type CallStatusFilter =
  | "all"
  | "queued"
  | "ringing"
  | "in-progress"
  | "forwarding"
  | "ended";
