export interface ActivityEntry {
  id: string;
  timestamp: string;
  method: string;
  endpoint: string;
  status: number;
  statusText: string;
  duration: number;
  error?: string;
}
