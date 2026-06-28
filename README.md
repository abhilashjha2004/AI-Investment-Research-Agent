# 📈 InvestResearch AI - Multi-Agent Investment Assistant

A production-quality, AI-powered equity and investment research platform developed for the **InsideIIM AI Product Development Engineer Internship** assignment. 

The application orchestrates a structured, multi-agent workflow using **LangGraph** and **Gemini 1.5 Pro** to query real-time market data via **Tavily Search**, evaluate financial statements, analyze risk profiles, and output institutional-grade investment reports.

---

## 🔗 Live Demo
Explore the deployed application here: **[InvestResearch AI Dashboard](https://invest-research-ai.vercel.app/)** *(Placeholder)*

---

## 📝 Project Overview

### Problem Statement
Traditional investment research is highly fragmented. Buy-side and sell-side analysts must manually scour SEC filings, aggregate global news feeds, compile spreadsheet financial ratios, and evaluate macroeconomic threats. This process is time-consuming, prone to cognitive bias, and lacks a coordinated validation layer.

### Project Objective
Build an automated multi-agent system that aggregates web-scale data in real-time, computes key financial health indicators, grades risk vectors, and outputs structured investment recommendation ratings with verifiable source citations and consensus scores.

### Business Use Case
Investment firms, family offices, and retail traders can immediately initiate research on any public corporation. The tool generates initial screening verdicts (INVEST / WATCHLIST / PASS) with low-latency execution, allowing analysts to triage investment pipelines before committing manual labor.

---

## ⚙️ What This Application Does
The application automates a comprehensive analyst workflow in under 15 seconds:

```
[ Enter Company ] ➔ [ Research Web Scraping ] ➔ [ Financial Statement Audit ] ➔ [ Risk Vector Evaluation ] ➔ [ AI Verdict Synthesis ] ➔ [ Report Output ] ➔ [ PDF Export ]
```

1. **Company Input**: The user enters a stock ticker or company name (e.g., Nvidia, Tesla).
2. **Dynamic Researching**: The system searches current news, general statistics, and corporate models.
3. **Financial Auditing**: Key revenue streams, profit margins, balance sheet health, and debt metrics are scraped and compiled.
4. **Threat Assessment**: Regulatory compliance, competitive pressures, and macro risks are indexed.
5. **Verdict Generation**: A final decision agent weighs findings to compute a conviction percentage, conviction meter, and reasoning thesis.
6. **Report Presentation**: Renders an interactive, responsive dashboard featuring collapsible index folders, pros/cons columns, severity bars, and verification cards.
7. **Document Export**: Outputs print-optimized corporate PDF documents via browser overrides.

---

## 🌟 Key Features

*   **Multi-Agent LangGraph Orchestrator**: An event-driven state graph that isolates concerns across specialized agent nodes, sharing context via a typed state schema.
*   **Newline-Delimited JSON (NDJSON) Streaming**: Low-latency, chunk-by-chunk API stream processing using the standard browser `ReadableStream` interface to update step indicators in real-time.
*   **Smart Markdown Parser**: Custom client-side parser that separates unstructured LLM analysis into stylized dashboard tables, strengths columns, and collapsible sections.
*   **Confidence Circular Gauge**: A premium, animated SVG circle gauge visualizing verdict consensus (0-100%) using Framer Motion springs.
*   **Live Operations Log**: A chronological timeline that logs and displays agent status changes with localized timestamps (e.g., `09:31:12 Research Agent Started`).
*   **Citation Favicon Cards**: Converts search URLs into citation blocks containing site favicons, source names, domain labels, and reliability ratings.
*   **Sandbox Simulation Fallback**: Auto-detects missing API keys and shifts to a high-fidelity simulation engine for popular equities (Nvidia, Tesla, etc.) to ensure instant evaluator testing.

---

## 🏗️ Architecture & Request Flow

### Request Flow Diagram
```
    [ User Dashboard ]
           │  (Submit Company Ticker)
           ▼
    [ Next.js API Route ] (/api/analyze)
           │  (Initialize Graph State)
           ▼
    [ LangGraph Orchestrator ] (.stream())
           │
           ├─➔ [ Research Agent Node ] ───➔ Tavily API (News, Overview)
           │           │
           ├─➔ [ Financial Agent Node ] ──➔ Tavily API (Margins, Debt)
           │           │
           ├─➔ [ Risk Agent Node ] ────────➔ Tavily API (Regulatory, Competitors)
           │           │
           └─➔ [ Decision Agent Node ] ───➔ Gemini 1.5 Pro (Verdict consensus)
                       │
                       ▼
    [ Newline-Delimited NDJSON Stream ]
                       │
                       ▼
    [ React useAnalyze Hook ] (Decodes Stream Chunks)
                       │
                       ▼
    [ Premium React Dashboard UI ] (Renders Gauge & Chrono-timeline)
```

### Multi-Agent LangGraph Workflow
Each agent is represented as a single node in the state graph. Nodes are executed sequentially, appending findings to the central graph state:

```
       [ START ]
           │
           ▼
    +───────────────+
    │Research Agent │ ───➔ Scrapes overview, product offerings, & latest news
    +───────────────+
           │ (appends state.researchSummary & state.sources)
           ▼
 +──────────────────────+
 │Financial Anal. Agent │ ───➔ Scrapes income statement metrics & computes margins
 +──────────────────────+
           │ (appends state.financialAnalysis)
           ▼
    +───────────────+
    │  Risk Agent   │ ───➔ Scans macro, regulatory, and competitor threats
    +───────────────+
           │ (appends state.riskAnalysis)
           ▼
 +──────────────────────+
 │Decision Making Agent │ ───➔ Synthesizes context to output JSON rating schema
 +──────────────────────+
           │ (appends state.recommendation, state.confidence, state.reasoning)
           ▼
        [ END ]
```

---

## 🤖 AI Agents Reference

*   **Research Agent**: Responsible for setting company context. It scans business units, revenue models, core products, and indexes current articles.
*   **Financial Agent**: Responsible for historical and active financial ratios. It targets cash balances, margin growth rates, debt leverage, and evaluates overall balance sheet health.
*   **Risk Agent**: Responsible for operational threats. It indexes regulatory penalties, competitor market share encroachment, and macroeconomic sensitivities.
*   **Decision Agent**: Responsible for final audit synthesis. It processes accumulated context, compares pros/cons, and outputs a structured score, rating, and thesis statement.

---

## 📁 Folder Structure
The important directories of the application are organized as follows:

```
.
├── public/                      # Static assets & favicons
└── src/
    ├── app/                     # Next.js App Router
    │   ├── api/
    │   │   └── analyze/         # NDJSON Streaming API endpoint (/api/analyze)
    │   ├── globals.css          # Design system variables, radial glows & CSS scrollbars
    │   ├── layout.tsx           # Page structure wrapper
    │   └── page.tsx             # Welcome cards, loader dashboard, and UI integration
    ├── components/              # UI Components
    │   ├── Header.tsx           # Logo, feature badges, active agent visualizer
    │   ├── SearchForm.tsx       # Search bar, suggested chips, gradient button
    │   ├── Timeline.tsx         # Agent status cards & dynamic timestamps timeline
    │   └── ReportView.tsx       # Stats row, gauge, accordions, risk/strength grids, citations
    ├── hooks/
    │   └── useAnalyze.ts        # Custom stream parsing & decoder hook
    ├── lib/
    │   ├── graph/               # LangGraph Engine
    │   │   ├── state.ts         # Annotations state schema definition
    │   │   └── workflow.ts      # Node definitions, Gemini API bindings, compiled graph
    │   └── tavily.ts            # Tavily query execution client
    └── types/
        └── index.ts             # TypeScript definitions
```

---

## 🛠️ Tech Stack
*   **Orchestration**: LangGraph JS (`@langchain/langgraph`), LangChain Core (`@langchain/core`)
*   **LLM Provider**: Google Gemini (`@langchain/google-genai`)
*   **Search Provider**: Tavily Search API
*   **Framework**: Next.js 15 (App Router, Server-Sent NDJSON Response Stream)
*   **Frontend**: React 19, TypeScript, Tailwind CSS v4, Framer Motion
*   **Icons**: Lucide React

---

## 🚀 Setup & Installation

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
*Note: If no API keys are provided, the system automatically runs in sandbox simulation mode to let you test the dashboard immediately.*

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

| Company | Agent Flow Path | Recommendation | Confidence | Primary Rationale |
| :--- | :--- | :---: | :---: | :--- |
| **Tesla (TSLA)** | Research ➔ Financial ➔ Risk ➔ Decision | **INVEST** | 82% | Industry-leading EV market share and robust energy storage offsets near-term vehicle margin headwinds. |
| **Nvidia (NVDA)** | Research ➔ Financial ➔ Risk ➔ Decision | **INVEST** | 90% | Dominant position in GPU hardware market and massive competitive moat in enterprise AI workloads. |
| **Microsoft (MSFT)** | Research ➔ Financial ➔ Risk ➔ Decision | **INVEST** | 88% | Resilient enterprise cloud growth and early first-mover advantages in generative AI. |
| **Amazon (AMZN)** | Research ➔ Financial ➔ Risk ➔ Decision | **INVEST** | 85% | Solid e-commerce margin recoveries and AWS cloud growth trajectory. |

---

## 🧠 Challenges Faced & Solutions

*   **Gemini Model Integration**: Coordinating transitions between legacy LangChain providers and the latest Google GenAI SDK. *Solution*: Utilized `@langchain/google-genai` directly with standardized system prompts for structured JSON schema outputs.
*   **Tavily Search Rate Limiting**: Handling rate limits during consecutive node execution. *Solution*: Configured custom query filters to limit search domains, fetching structured pages in parallel batches to prevent timeouts.
*   **LangGraph State Reducers**: Passing accumulative outputs across nodes without overwriting overlapping keys. *Solution*: Configured clean TypeScript state annotator schemas to define append operations on resources.
*   **Decoupled Chunk Parsing**: Streaming NDJSON events from serverless functions sometimes buffer, causing chunks to merge. *Solution*: Implemented a custom text decoder buffer inside `useAnalyze` that splits chunks by newlines (`\n`) and saves incomplete JSON buffers for the next frame.
*   **Serverless Timeout Limits**: Managing network requests in serverless functions without hitting the default Vercel 15s limit. *Solution*: Set lightweight API calls, kept Tavily query limits tight, and configured rapid stream responses to keep the connections open.

---

## 🔮 Future Improvements

1.  **SEC RAG Pipeline**: Support uploading quarterly (10-Q) and annual (10-K) PDFs to perform vector search comparisons alongside Tavily search.
2.  **Historical Repository**: Integrate a PostgreSQL or SQLite backend to cache compiled research histories and view them in a side dashboard.
3.  **Ticker Comparison**: Add a side-by-side agent audit interface to compare multiple tickers (e.g., MSFT vs GOOG).
4.  **User Workspaces**: Configure secure user authentication (Clerk or NextAuth) to store personal watchlists and notes.
5.  **Interactive Visualizations**: Embed interactive Recharts SVG diagrams showing revenue, gross margin trends, and balance sheets.
6.  **Periodic Agent Triggers**: Configure cron jobs to run agent checks weekly and email watchlists alerts on rating changes.
7.  **Interactive AI Chat Assistant**: Allow users to chat directly with a specialized AI agent about the report findings.

---

## 🧠 AI Development Note
AI tools were utilized for brainstorming architectural layouts, refactoring complex styling configurations, debugging stream decoders, and refining documentation. All system integrations, testing, state configurations, and code execution flows were engineered, analyzed, and verified by the author.

---

## 👤 Author
*   **Name**: [Abhilash Kumar Jha]
*   **Email**: [abhilashjha2004@gmail.com]
*   **GitHub**: [github.com/abhilashjha2004](https://github.com/)
*   **LinkedIn**: [linkedin.com/in/abhilashjha20](https://linkedin.com/)

---

## 📄 License
This project was developed for the **InsideIIM AI Product Development Engineer Internship Assignment** for educational, demonstration, and evaluation purposes.
