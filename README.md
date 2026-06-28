# AI Investment Research Agent

A production-quality AI-powered equity and investment research platform built for the **InsideIIM AI Product Development Engineer Internship** assignment. 

The application accepts a company name, spins up a structured multi-agent workflow using **LangGraph** and **Gemini**, queries real-time web news using **Tavily**, and streams live agent execution logs (Pending -> Running -> Completed) directly to a modern glassmorphism dashboard.

---

## 🌟 Key Features

*   **Multi-Agent LangGraph Workflow**: Structured execution graph passing state from Research ➔ Financial Analysis ➔ Risk Analysis ➔ Final Decision Agent.
*   **Real-time NDJSON Streaming**: Backend stream processor using Web standard `ReadableStream` to display agent progress chunk-by-chunk in real-time.
*   **Smart Financial Parser**: Dynanically extracts strengths and weaknesses from unstructured agent texts to render stylized dashboard cards.
*   **Circular Conviction Gauge**: Beautiful visual gauge representing the decision confidence score (0-100%).
*   **Local Simulated Fallback**: Fully functional offline/simulated mode that provides rich research metrics for popular companies (Tesla, Nvidia, Apple, etc.) even when API keys are not yet configured.
*   **Vector PDF Download**: A custom print CSS template enabling users to print/export clean, professional corporate reports directly from their browser print command.

---

## 🏗️ Architecture & How It Works

### Multi-Agent LangGraph Workflow

```
       [ START ]
           │
           ▼
   +───────────────+
   │Research Agent │ <─── Tavily Search (Overview, news, model)
   +───────────────+
           │ (state.researchSummary)
           ▼
+──────────────────────+
│Financial Anal. Agent │ <─── Tavily Search (Revenue, margins)
+──────────────────────+
           │ (state.financialAnalysis)
           ▼
   +───────────────+
   │  Risk Agent   │ <─── Tavily Search (Regulatory, market risks)
   +───────────────+
           │ (state.riskAnalysis)
           ▼
+──────────────────────+
│Decision Making Agent │ ───➔ JSON (INVEST / PASS, Confidence %, Reasoning)
+──────────────────────+
           │
           ▼
        [ END ]
```

1.  **State Management**: We use LangGraph's Annotation API (`src/lib/graph/state.ts`) to maintain state. Each node executes its analysis, appends URLs to sources, updates the loading message, and populates its specific state partition.
2.  **Streaming Engine**: The Next.js API Route `/api/analyze` runs the compiled graph using `.stream()`. As each node finishes, the API route emits a JSON newline-delimited (NDJSON) event.
3.  **UI Consumption**: The `useAnalyze` custom React hook consumes the body reader chunk-by-chunk, updating individual agent status lights in real-time before displaying the full report.

---

## 🛠️ Tech Stack

*   **Framework**: Next.js 15 (App Router, Server-Sent NDJSON Response)
*   **Frontend**: React 19, TypeScript, Tailwind CSS v4
*   **Icons**: Lucide React
*   **AI Engine**: LangGraph JS (`@langchain/langgraph`), LangChain Core (`@langchain/core`)
*   **LLM Provider**: Google Gemini (`@langchain/google-genai`)
*   **Search Engine**: Tavily Search API

---

## 🚀 Setup Instructions

### Prerequisites
*   Node.js 18+ and npm

### 1. Clone the project and configure Env Variables
Create a `.env.local` file in the root directory:
```bash
cp .env.local.example .env.local
```

Open `.env.local` and add your API keys:
```env
# Google Gemini API Key (Get one from https://aistudio.google.com/)
GOOGLE_API_KEY=your_gemini_api_key_here

# Tavily Search API Key (Get one from https://tavily.com/)
TAVILY_API_KEY=your_tavily_api_key_here
```

*Note: If no API keys are provided, the system runs in a smart simulator mode to let you test the dashboard out of the box.*

### 2. Install dependencies
```bash
npm install
```

### 3. Run diagnostics
To test your API keys and local connections, run the validation script:
```bash
node src/scratch/test-agent.js "Nvidia"
```

### 4. Boot the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📈 Example Run Output

When you type **"Tesla"** or **"Nvidia"** and click **Start Analysis**:
1.  **Timeline Status**: 
    *   Research Agent: `Running` ➔ `Completed`
    *   Financial Agent: `Running` ➔ `Completed`
    *   Risk Agent: `Running` ➔ `Completed`
    *   Decision Agent: `Running` ➔ `Completed`
2.  **Recommendation**: Renders a glowing **INVEST** badge with **82% Confidence** (for Tesla) or **90% Confidence** (for Nvidia).
3.  **Strengths Cards**: Displays structured bullet points (e.g. "Unmatched balance sheet with $25B+ in cash", "High-growth energy storage segment").
4.  **Citations**: Lists links to Reuters, Bloomberg, and CNBC articles used in the synthesis.

---

## ⚖️ Trade-offs & Decisions

*   **REST Tavily calls vs LangChain Tool**: We query Tavily using direct HTTP REST requests. This avoids complex LangChain package dependencies, reduces bundle size, and guarantees that requests execute without routing failures or timeouts in standard serverless functions.
*   **Custom Parser vs react-markdown**: We wrote a lightweight parser inside `ReportView` to extract strengths/weaknesses and render headers. This avoids adding a heavy markdown parsing library, reducing cumulative layout shifts (CLS) and optimizing page speed.
*   **Dynamic Simulation Mode**: Rather than crashing if the user runs the app without setup, we designed a full simulated data mode. This ensures that the interviewer can evaluate the layout and timeline transitions instantly.

---

## 🔮 Future Improvements

1.  **Vector Store Integration**: Add an upload field for company quarterly (10-Q) reports to perform RAG analysis alongside Tavily web search.
2.  **Streaming Text (Tokens)**: Stream the reasoning explanation token-by-token alongside the timeline completion events.
3.  **Historical Records**: Connect to a local SQLite or Vercel KV database to cache previous company reports and show a "Past Researches" sidebar.

---

## 📦 Deployment Instructions

The application is fully prepared for Vercel deployment:
1.  Push the code to your GitHub repository.
2.  Import the project into Vercel.
3.  Set the environment variables `GOOGLE_API_KEY` and `TAVILY_API_KEY` in the Vercel Dashboard.
4.  Click **Deploy**.
