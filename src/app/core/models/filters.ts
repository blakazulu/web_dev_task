export interface DataFilter {
  id?: string;
  name?: string;
  grade?: { min?: number; max?: number };
  date?: { before?: Date; after?: Date };
  subject?: string;
  isGeneralSearch?: boolean; // Flag to indicate if this is a general search across fields
}

export interface AnalysisFilter {
  ids: number[];
  subjects: string[];
}

export interface MonitorFilter {
  ids: number[];
  names: string;
  state: { passed: boolean; failed: boolean };
}
