export interface Lead {
  number: string;
  name?: string;
  business?: string;
}

export interface CsvImportResult {
  leads: Lead[];
  errors: string[];
}
