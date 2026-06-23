export interface Lead {
  number: string;
  name?: string;
  business?: string;
  businessType?: string;
}

export interface CsvImportResult {
  leads: Lead[];
  errors: string[];
}
