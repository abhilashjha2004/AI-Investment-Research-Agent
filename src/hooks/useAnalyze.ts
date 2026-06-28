import { useState, useCallback } from 'react';
import { AgentProgress, AnalysisResult, StreamEvent } from '@/types';

const initialProgress = (): AgentProgress[] => [
  { id: 'research', name: 'Research Agent', status: 'pending', description: 'Investigates overview, model, and market outlook' },
  { id: 'financial', name: 'Financial Agent', status: 'pending', description: 'Analyzes revenue, margins, and financial balance sheet' },
  { id: 'risk', name: 'Risk Agent', status: 'pending', description: 'Evaluates market, regulatory, and execution threats' },
  { id: 'decision', name: 'Decision Agent', status: 'pending', description: 'Formulates investment recommendation and conviction' },
];

const initialResult = (): AnalysisResult => ({
  companyName: '',
  researchSummary: '',
  financialAnalysis: '',
  riskAnalysis: '',
  recommendation: '',
  confidence: 0,
  reasoning: '',
  sources: [],
});

export function useAnalyze() {
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<AgentProgress[]>(initialProgress());
  const [result, setResult] = useState<AnalysisResult>(initialResult());

  const reset = useCallback(() => {
    setIsLoading(false);
    setStatusMessage('');
    setError(null);
    setProgress(initialProgress());
    setResult(initialResult());
  }, []);

  const updateProgress = useCallback((id: string, status: AgentProgress['status']) => {
    setProgress((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p))
    );
  }, []);

  const analyze = useCallback(async (company: string) => {
    if (!company.trim()) return;

    setIsLoading(true);
    setError(null);
    setStatusMessage('Connecting to AI agent server...');
    setProgress(initialProgress());
    setResult({ ...initialResult(), companyName: company });

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ company }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: Failed to initiate research.`);
      }

      if (!response.body) {
        throw new Error('Response body is empty. Streaming not supported.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // The last split might be an incomplete JSON line, save it for the next chunk
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;

          try {
            const parsed = JSON.parse(line) as StreamEvent;
            const { event, data } = parsed;

            switch (event) {
              case 'start':
                setStatusMessage(data.message);
                updateProgress('research', 'running');
                break;

              case 'research_complete':
                setResult((prev) => ({
                  ...prev,
                  researchSummary: data.researchSummary,
                  sources: data.sources,
                }));
                updateProgress('research', 'completed');
                updateProgress('financial', 'running');
                setStatusMessage(data.loadingStatus || 'Research complete. Analyzing financials...');
                break;

              case 'financial_complete':
                setResult((prev) => ({
                  ...prev,
                  financialAnalysis: data.financialAnalysis,
                }));
                updateProgress('financial', 'completed');
                updateProgress('risk', 'running');
                setStatusMessage(data.loadingStatus || 'Financial analysis complete. Evaluating risk vectors...');
                break;

              case 'risk_complete':
                setResult((prev) => ({
                  ...prev,
                  riskAnalysis: data.riskAnalysis,
                }));
                updateProgress('risk', 'completed');
                updateProgress('decision', 'running');
                setStatusMessage(data.loadingStatus || 'Risk vectors analyzed. Making final decision...');
                break;

              case 'decision_complete':
                setResult((prev) => ({
                  ...prev,
                  recommendation: data.recommendation,
                  confidence: data.confidence,
                  reasoning: data.reasoning,
                }));
                updateProgress('decision', 'completed');
                setStatusMessage(data.loadingStatus || 'Analysis complete!');
                break;

              case 'complete':
                setIsLoading(false);
                setStatusMessage(data.message);
                break;

              case 'error':
                throw new Error(data.message || 'An error occurred during workflow execution.');

              default:
                break;
            }
          } catch (err: any) {
            console.error('Error parsing streaming line:', err);
            // Don't crash immediately unless it's a critical execution error
            if (line.includes('"event":"error"')) {
              throw err;
            }
          }
        }
      }
    } catch (err: any) {
      console.error('Research workflow failed:', err);
      setError(err.message || 'An unexpected error occurred during research.');
      setIsLoading(false);
      
      // Mark any currently running or pending agents as failed
      setProgress((prev) =>
        prev.map((p) =>
          p.status === 'running' || p.status === 'pending'
            ? { ...p, status: p.status === 'running' ? 'failed' : 'pending' }
            : p
        )
      );
    }
  }, [updateProgress]);

  return {
    isLoading,
    statusMessage,
    error,
    progress,
    result,
    analyze,
    reset,
  };
}
