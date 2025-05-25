export interface Mirror {
  type: string;
  name: string;
  url: string;
  status: string;
  isActive: boolean;
  lastSync?: string;
  speed?: number;
} 