export interface Lead {
  number: string;
  name?: string;
}

export interface CsvImportResult {
  leads: Lead[];
  errors: string[];
}
