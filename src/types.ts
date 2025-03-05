export interface RLTask {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  algorithm: string;
  environment: string;
  parameters: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  submitter: {
    name: string;
    avatar: string;
  };
}

export interface ResourceMetrics {
  cpu_usage: number;
  memory_usage: number;
  gpu_usage?: number;
}

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  message: string;
}