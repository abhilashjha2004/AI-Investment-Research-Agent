import { NextResponse } from "next/server";
import { app } from "@/lib/graph/workflow";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { company } = body;

    if (!company || typeof company !== 'string' || company.trim() === '') {
      return NextResponse.json({ error: "Company name is required." }, { status: 400 });
    }

    const encoder = new TextEncoder();
    const customStream = new ReadableStream({
      async start(controller) {
        const sendUpdate = (event: string, data: any) => {
          const payload = JSON.stringify({ event, data });
          controller.enqueue(encoder.encode(payload + "\n"));
        };

        try {
          sendUpdate("start", { message: `Initializing AI Agent Graph for ${company}...` });

          // Start the stream from LangGraph
          // We stream updates. Each update yields the result of a node that has executed.
          const graphStream = await app.stream(
            { companyName: company },
            { streamMode: "updates" }
          );

          for await (const chunk of graphStream) {
            console.log("Graph Stream Chunk:", Object.keys(chunk));
            
            // The chunk key corresponds to the name of the node that finished running: "research", "financial", "risk", "decision"
            if (chunk.research) {
              sendUpdate("research_complete", {
                researchSummary: chunk.research.researchSummary,
                sources: chunk.research.sources,
                loadingStatus: chunk.research.loadingStatus
              });
            } else if (chunk.financial) {
              sendUpdate("financial_complete", {
                financialAnalysis: chunk.financial.financialAnalysis,
                loadingStatus: chunk.financial.loadingStatus
              });
            } else if (chunk.risk) {
              sendUpdate("risk_complete", {
                riskAnalysis: chunk.risk.riskAnalysis,
                loadingStatus: chunk.risk.loadingStatus
              });
            } else if (chunk.decision) {
              sendUpdate("decision_complete", {
                recommendation: chunk.decision.recommendation,
                confidence: chunk.decision.confidence,
                reasoning: chunk.decision.reasoning,
                loadingStatus: chunk.decision.loadingStatus
              });
            }
          }

          sendUpdate("complete", { message: "Analysis complete!" });
          controller.close();
        } catch (error: any) {
          console.error("Error in LangGraph execution stream:", error);
          sendUpdate("error", { message: error.message || "An error occurred during analysis." });
          controller.close();
        }
      }
    });

    return new Response(customStream, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error: any) {
    console.error("API POST parse error:", error);
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }
}
