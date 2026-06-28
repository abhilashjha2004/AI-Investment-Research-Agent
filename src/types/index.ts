export type AgentId = 'research' | 'financial' | 'risk' | 'decision';

export type AgentStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface AgentProgress {
  id: AgentId;
  name: string;
  status: AgentStatus;
  description: string;
}

export interface AnalysisResult {
  companyName: string;
  researchSummary: string;
  financialAnalysis: string;
  riskAnalysis: string;
  recommendation: 'INVEST' | 'PASS' | '';
  confidence: number;
  reasoning: string;
  sources: string[];
}

export interface StreamEvent {
  event: string;
  data: any;
}
