import axios, { AxiosRequestConfig, AxiosError } from "axios";
import { VAPI_BASE_URL, VAPI_KEY } from "./constants";
import { Campaign, CreateCampaignPayload } from "@/types/campaign";
import { Call } from "@/types/call";
import { addActivityEntry } from "./activity-log";

const vapiClient = axios.create({
  baseURL: VAPI_BASE_URL,
  headers: {
    Authorization: `Bearer ${VAPI_KEY}`,
    "Content-Type": "application/json",
  },
});

async function vapiRequest<T>(
  method: string,
  endpoint: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const startTime = Date.now();

  try {
    const response = await vapiClient.request<T>({
      method,
      url: endpoint,
      ...config,
    });

    addActivityEntry({
      timestamp: new Date().toISOString(),
      method: method.toUpperCase(),
      endpoint,
      status: response.status,
      statusText: response.statusText,
      duration: Date.now() - startTime,
    });

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    addActivityEntry({
      timestamp: new Date().toISOString(),
      method: method.toUpperCase(),
      endpoint,
      status: axiosError.response?.status || 0,
      statusText: axiosError.response?.statusText || "Network Error",
      duration: Date.now() - startTime,
      error:
        (axiosError.response?.data as Record<string, string>)?.message ||
        axiosError.message,
    });

    const vapiMessage =
      (axiosError.response?.data as Record<string, string>)?.message ||
      (axiosError.response?.data as Record<string, string[]>)?.error?.[0] ||
      axiosError.message;

    throw new Error(vapiMessage);
  }
}

// Campaigns
export async function listCampaigns(): Promise<Campaign[]> {
  const response = await vapiRequest<{ results: Campaign[] }>("GET", "/campaign");
  return response.results ?? response;
}

export async function getCampaign(id: string): Promise<Campaign> {
  return vapiRequest<Campaign>("GET", `/campaign/${id}`);
}

export async function createCampaign(
  payload: CreateCampaignPayload
): Promise<Campaign> {
  return vapiRequest<Campaign>("POST", "/campaign", { data: payload });
}

export async function updateCampaign(
  id: string,
  payload: Partial<Campaign>
): Promise<Campaign> {
  return vapiRequest<Campaign>("PATCH", `/campaign/${id}`, { data: payload });
}

export async function deleteCampaign(id: string): Promise<void> {
  return vapiRequest<void>("DELETE", `/campaign/${id}`);
}

// Calls
export async function listCalls(
  campaignId?: string,
  limit = 100
): Promise<Call[]> {
  const params: Record<string, string | number> = { limit };
  if (campaignId) params.campaignId = campaignId;
  return vapiRequest<Call[]>("GET", "/call", { params });
}

export async function getCall(id: string): Promise<Call> {
  return vapiRequest<Call>("GET", `/call/${id}`);
}
