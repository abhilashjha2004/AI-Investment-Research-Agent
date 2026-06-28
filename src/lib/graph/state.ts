import { Annotation } from "@langchain/langgraph";

export interface AgentState {
  companyName: string;
  researchSummary: string;
  financialAnalysis: string;
  riskAnalysis: string;
  recommendation: "INVEST" | "PASS" | "";
  confidence: number;
  reasoning: string;
  sources: string[];
  loadingStatus: string;
}

export const AgentStateAnnotation = Annotation.Root({
  companyName: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),
  researchSummary: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),
  financialAnalysis: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),
  riskAnalysis: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),
  recommendation: Annotation<"INVEST" | "PASS" | "">({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),
  confidence: Annotation<number>({
    reducer: (x, y) => y ?? x,
    default: () => 0,
  }),
  reasoning: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),
  sources: Annotation<string[]>({
    reducer: (x, y) => (y ? Array.from(new Set([...x, ...y])) : x),
    default: () => [],
  }),
  loadingStatus: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => "pending",
  }),
});
