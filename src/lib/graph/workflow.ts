import { StateGraph, START, END } from "@langchain/langgraph";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AgentState, AgentStateAnnotation } from "./state";
import { tavilySearch } from "../tavily";

/**
 * Invokes the Gemini model with a simulation fallback if API keys are missing.
 */
async function invokeLLM(prompt: string, jsonMode = false): Promise<string> {
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey.startsWith('your_')) {
    console.warn("Gemini API key is missing. Using simulated LLM response.");
    return getSimulatedLLMResponse(prompt, jsonMode);
  }

  try {
    const model = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      apiKey: apiKey,
      temperature: 0.2,
      maxOutputTokens: 2048,
    });

    const response = await model.invoke(prompt);
    return response.content as string;
  } catch (error) {
    console.error("Gemini invocation failed, using simulated response:", error);
    return getSimulatedLLMResponse(prompt, jsonMode);
  }
}

/**
 * 1. Research Agent Node
 * Collects overview, business model, recent news, and competitive landscape.
 */
async function researchAgent(state: typeof AgentStateAnnotation.State) {
  const company = state.companyName || "Tesla";
  console.log(`[Research Agent] Analyzing ${company}...`);

  // Perform search query
  const query = `${company} company overview business model news competitive advantage 2025 2026`;
  const searchResults = await tavilySearch(query, "advanced");

  // Extract sources
  const urls = searchResults.results.map(r => r.url);
  const context = searchResults.results.map(r => `Source: ${r.title} (${r.url})\nContent: ${r.content}`).join("\n\n");

  const prompt = `You are a professional equity research analyst. Analyze the following web search data about "${company}" and write a detailed, structured research summary.
  
Your summary MUST cover:
1. Overview and Business Model: What the company does and how it makes money.
2. Market Position and Industry Outlook: Where it stands in its industry and the sector growth potential.
3. Competitive Advantages (Moat): Intellectual property, brand power, network effects, or scale advantages.
4. Recent News and Developments: Any notable events in 2025/2026.

Format the output with clean markdown headings (###). Do not include introductory or concluding banter.

Search Results Data:
${context}`;

  const summary = await invokeLLM(prompt);

  return {
    researchSummary: summary,
    sources: urls,
    loadingStatus: "Research Agent complete. Financial Analysis Agent starting..."
  };
}

/**
 * 2. Financial Analysis Agent Node
 * Evaluates revenue trends, profitability, and key balance sheet indicators.
 */
async function financialAgent(state: typeof AgentStateAnnotation.State) {
  const company = state.companyName;
  console.log(`[Financial Agent] Analyzing finances for ${company}...`);

  const query = `${company} financial performance revenue growth margins debt cash flow 2025 2026`;
  const searchResults = await tavilySearch(query, "advanced");
  const context = searchResults.results.map(r => `Source: ${r.title} (${r.url})\nContent: ${r.content}`).join("\n\n");

  const prompt = `You are a senior financial analyst. Based on the research summary and recent financial search data below, analyze the financial health of "${company}".
  
Your report MUST include:
1. Revenue and Earnings Trends: Recent performance and future projections.
2. Profitability Margins: Gross, operating, and net margins.
3. Growth Indicators: Capital allocation and expansion drivers.
4. Competitive Moat durability from a financial perspective (pricing power).
5. **Strengths**: A bulleted list of the company's financial strengths.
6. **Weaknesses**: A bulleted list of the company's financial weaknesses.

Format your output using clear markdown headings (###). Ensure there is a section called "### Financial Strengths" and "### Financial Weaknesses" with clear bullet points, as these will be parsed for the UI card.

Research Summary:
${state.researchSummary}

Financial Search Results Data:
${context}`;

  const analysis = await invokeLLM(prompt);

  return {
    financialAnalysis: analysis,
    loadingStatus: "Financial Analysis Agent complete. Risk Analysis Agent starting..."
  };
}

/**
 * 3. Risk Analysis Agent Node
 * Highlights market, regulatory, competition, and technological risks.
 */
async function riskAgent(state: typeof AgentStateAnnotation.State) {
  const company = state.companyName;
  console.log(`[Risk Agent] Analyzing risks for ${company}...`);

  const query = `${company} regulatory risks competition technological threats macroeconomic risks 2025 2026`;
  const searchResults = await tavilySearch(query, "advanced");
  const context = searchResults.results.map(r => `Source: ${r.title} (${r.url})\nContent: ${r.content}`).join("\n\n");

  const prompt = `You are a risk officer. Based on the previous research and financial details, analyze the risk factors threatening "${company}".
  
Group your risks into these categories, providing details for each:
1. Market & Competitive Risks: Competition from rivals and shifting market share.
2. Regulatory & Legal Risks: Investigations, safety standards, environmental guidelines, or antitrust.
3. Technological & Execution Risks: Disruptive technologies, product delays, or R&D issues.
4. Macroeconomic & Geopolitical Risks: Supply chain vulnerability, inflation, interest rates, or international tensions.

Format your output using clear markdown headings (###). Do not include conversational filler.

Research Summary:
${state.researchSummary}

Financial Analysis:
${state.financialAnalysis}

Risk Search Results Data:
${context}`;

  const risks = await invokeLLM(prompt);

  return {
    riskAnalysis: risks,
    loadingStatus: "Risk Analysis Agent complete. Investment Decision Agent starting..."
  };
}

/**
 * 4. Investment Decision Agent Node
 * Collates all analyses to form the final decision, confidence score, and rationale.
 */
async function decisionAgent(state: typeof AgentStateAnnotation.State) {
  const company = state.companyName;
  console.log(`[Decision Agent] Making final decision for ${company}...`);

  const prompt = `You are the chairperson of an investment committee. Review the accumulated research, financials, and risk reports for "${company}" and make a final recommendation: INVEST or PASS.
  
Provide:
1. Recommendation: Must be exactly "INVEST" or "PASS" (all caps).
2. Confidence Score: An integer between 0 and 100, representing your team's conviction.
3. Rationale: A detailed paragraph explaining the investment case, weighing the potential rewards against the risks.

You MUST respond with a raw JSON object only. Do NOT include markdown styling, backticks, or text before/after. The JSON structure must match this exactly:
{
  "recommendation": "INVEST",
  "confidence": 85,
  "reasoning": "The detailed rationale goes here..."
}

Research Summary:
${state.researchSummary}

Financial Analysis:
${state.financialAnalysis}

Risk Analysis:
${state.riskAnalysis}`;

  const rawDecision = await invokeLLM(prompt, true);

  let recommendation: "INVEST" | "PASS" | "" = "PASS";
  let confidence = 50;
  let reasoning = "Failed to parse investment decision model output.";

  try {
    // Strip possible markdown code blocks if any
    const jsonStr = rawDecision
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    const parsed = JSON.parse(jsonStr);

    if (parsed.recommendation === "INVEST" || parsed.recommendation === "PASS") {
      recommendation = parsed.recommendation;
    }
    if (typeof parsed.confidence === "number") {
      confidence = parsed.confidence;
    }
    if (parsed.reasoning) {
      reasoning = parsed.reasoning;
    }
  } catch (e) {
    console.error("Error parsing decision JSON, attempting regex extraction:", e);
    // Regex fallback
    const recMatch = rawDecision.match(/"recommendation":\s*"?(INVEST|PASS)"?/i);
    const confMatch = rawDecision.match(/"confidence":\s*(\d+)/);
    const reasonMatch = rawDecision.match(/"reasoning":\s*"([^"]+)"/);

    if (recMatch) recommendation = recMatch[1].toUpperCase() as "INVEST" | "PASS";
    if (confMatch) confidence = parseInt(confMatch[1], 10);
    if (reasonMatch) reasoning = reasonMatch[1];
  }

  return {
    recommendation,
    confidence,
    reasoning,
    loadingStatus: "Workflow completed!"
  };
}

// Compile the workflow graph
const workflow = new StateGraph(AgentStateAnnotation)
  .addNode("research", researchAgent)
  .addNode("financial", financialAgent)
  .addNode("risk", riskAgent)
  .addNode("decision", decisionAgent)
  .addEdge(START, "research")
  .addEdge("research", "financial")
  .addEdge("financial", "risk")
  .addEdge("risk", "decision")
  .addEdge("decision", END);

export const app = workflow.compile();

/**
 * Returns mock LLM responses for clean local development when keys are not configured.
 */
function getSimulatedLLMResponse(prompt: string, jsonMode: boolean): string {
  const isTesla = prompt.toLowerCase().includes("tesla") || prompt.toLowerCase().includes("tsla");
  const isNvidia = prompt.toLowerCase().includes("nvidia") || prompt.toLowerCase().includes("nvda");
  const isApple = prompt.toLowerCase().includes("apple") || prompt.toLowerCase().includes("aapl");

  if (jsonMode) {
    if (isTesla) {
      return JSON.stringify({
        recommendation: "INVEST",
        confidence: 82,
        reasoning: "Tesla represents a highly compelling but volatile investment. Its core electric vehicle franchise is seeing margin pressures due to Chinese competition, but its vertical integration, supercharging network, and rapidly expanding energy storage business (+120% growth) create a solid financial buffer. The true valuation unlock lies in its Dojo-driven autonomous vehicle technology, Full Self-Driving software, and upcoming robotics pipeline. Given the solid cash buffer of $25B, we recommend a medium-size INVEST position with an 82% confidence level for long-term growth investors."
      });
    }
    if (isNvidia) {
      return JSON.stringify({
        recommendation: "INVEST",
        confidence: 90,
        reasoning: "Nvidia is the primary beneficiary and driver of the global AI computing buildout. With gross margins exceeding 75% and over 150% YoY datacenter growth, the financial performance is unmatched in the tech sector. While supply chain dependencies on TSMC's CoWoS packaging and regulatory export controls present meaningful execution risks, Nvidia's CUDA software ecosystem creates an incredibly sticky competitive moat. We recommend an INVEST decision with a high 90% confidence score."
      });
    }
    if (isApple) {
      return JSON.stringify({
        recommendation: "INVEST",
        confidence: 85,
        reasoning: "Apple remains a premium defensive compounder. Despite flat iPhone hardware growth in mature markets, the company's active installed device base has surpassed 2.2 billion users, creating a captive ecosystem. Its high-margin Services division (generating $24B+ quarterly at high margins) provides steady recurring cash flow. Antitrust risks and App Store fee scrutiny in the US and Europe represent tail-risks, but the upcoming rollout of Apple Intelligence will stimulate a massive hardware upgrade cycle. We recommend an INVEST decision with 85% confidence."
      });
    }

    // Default catch-all
    return JSON.stringify({
      recommendation: "INVEST",
      confidence: 72,
      reasoning: "The company displays solid market positioning and a stable financial profile. While risks in competition and macroeconomic factors persist, the firm's focus on digital transformation, capital efficiency, and customer retention supports a positive long-term outlook. We recommend a cautious INVEST decision with a 72% confidence score."
    });
  }

  // Text mode nodes
  if (prompt.includes("professional equity research analyst")) {
    // Research Agent summary
    if (isTesla) {
      return `### Overview and Business Model
Tesla Inc. (TSLA) is a global leader in electric vehicles (EVs) and energy storage solutions. The company operates two main segments: Automotive (selling and leasing premium EVs) and Energy Generation and Storage (manufacturing and installing Powerwall, Megapack, and solar panels).

### Market Position and Industry Outlook
Tesla holds the largest EV market share in the United States and remains a dominant global player. The EV sector is experiencing transition pains with slowing growth in North America and surging competition in China. However, the secular shift towards transport electrification and battery-powered grid storage remains intact for the next decade.

### Competitive Advantages (Moat)
1. **Vertical Integration**: Tesla manufactures its own battery packs, drive units, and designs its own custom AI chips.
2. **Charging Infrastructure**: The NACS Supercharger network is the gold standard of EV charging globally.
3. **Software & Autonomy**: Millions of Tesla vehicles collect real-world driving logs, fueling its Full Self-Driving neural networks.

### Recent News and Developments
In 2025/2026, Tesla is pivoting aggressively towards autonomous transport, unveiling its dedicated Cybercab (Robotaxi) and scaling capital expenditures on its Dojo supercomputing clusters to train humanoid robot intelligence (Optimus).`;
    }
    if (isNvidia) {
      return `### Overview and Business Model
Nvidia Corporation (NVDA) designs graphics processing units (GPUs) and system-on-a-chip units. The company's business model has shifted from gaming graphics cards to high-performance AI computing accelerators and networking systems sold directly to global hyperscalers and enterprises.

### Market Position and Industry Outlook
Nvidia owns an estimated 85% to 90% share of the AI hardware accelerator market. As Generative AI models expand in parameter size, the demand for GPU clusters is growing exponentially. The industry outlook for AI factories and data center chips remains highly expansionary.

### Competitive Advantages (Moat)
1. **CUDA Ecosystem**: Nvidia's proprietary computing library (CUDA) is the industry standard. Millions of developers write software optimized exclusively for Nvidia chips.
2. **System Integration**: Nvidia sells entire clusters (GPU, CPU, high-speed InfiniBand networking) as unified systems, which competitors cannot match.

### Recent News and Developments
In 2025/2026, Nvidia is ramping production of its Blackwell GPU architecture, which promises to reduce computing costs for LLMs by 25x while boosting performance, despite initial packaging bottlenecks.`;
    }
    if (isApple) {
      return `### Overview and Business Model
Apple Inc. (AAPL) designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories. It also operates a highly profitable Services segment including the App Store, iCloud, Apple Pay, Apple Music, and Apple TV+.

### Market Position and Industry Outlook
Apple is a dominant player in the premium global smartphone market, enjoying over 80% of industry profits. The consumer electronics market is mature, with long upgrade cycles, but Apple enjoys unmatched consumer loyalty.

### Competitive Advantages (Moat)
1. **The Ecosystem Moat**: Apple's hardware, software, and services are seamlessly integrated, making switching costs extremely high for consumers.
2. **Brand Equity**: Apple is consistently ranked among the world's most valuable and trusted brands, allowing it to charge premium prices.

### Recent News and Developments
Apple is rolling out 'Apple Intelligence' across its newer devices, a private, on-device AI system that is expected to trigger a significant device upgrade cycle in 2025/2026.`;
    }

    // General research summary fallback
    return `### Overview and Business Model
The company operates as a leading player in its market, providing products/services that satisfy core business or consumer demands. Its business model relies on customer retention and subscription/recurring revenue streams.

### Market Position and Industry Outlook
The company operates in a stable, mature industry with moderate barrier-to-entry. The industry outlook is positive, driven by digital transformation and efficiency gains.

### Competitive Advantages (Moat)
The company maintains a competitive advantage through strong brand recognition, proprietary operations software, and high customer switching costs.

### Recent News and Developments
Recent announcements show the company is expanding its partnerships and incorporating AI features into its product line to drive efficiency.`;
  }

  if (prompt.includes("senior financial analyst")) {
    // Financial Agent
    if (isTesla) {
      return `### Revenue and Earnings Trends
Tesla's revenue grows in cycles. While automotive sales growth has moderated, the Energy Storage division has experienced triple-digit growth, driving overall revenues upward. EPS has stabilized after price adjustments.

### Profitability Margins
Gross automotive margins have compressed from historical highs of 25% down to approximately 18% due to competitive price reductions. However, energy storage gross margins are improving towards 20%+, stabilizing overall profitability.

### Growth Indicators
Tesla continues to self-fund its growth, maintaining over $25 billion in cash with minimal debt. Capital expenditure is focused on Gigafactory expansion and AI model training infrastructure.

### Competitive Moat (Financial)
Tesla maintains pricing flexibility because its cost-per-vehicle is significantly lower than legacy automakers, allowing it to remain profitable during market downturns.

### Financial Strengths
- Unmatched balance sheet with $25B+ in cash and cash equivalents
- High-growth, high-margin energy storage segment (+120% YoY)
- Low cost of debt and strong free cash flow generation

### Financial Weaknesses
- Compression of automotive gross margins from price cuts
- High capital expenditure run-rate on unproven AI/robotics projects
- Over-dependence on regulatory credits to boost net income in soft quarters`;
    }
    if (isNvidia) {
      return `### Revenue and Earnings Trends
Nvidia's financial performance is record-breaking. Datacenter revenues grew over 150% YoY. Net income growth has mirrored revenue growth, making Nvidia one of the most profitable companies in tech history.

### Profitability Margins
Nvidia's gross margins are industry-leading, standing at ~75%. Operating margins exceed 50%, reflecting immense pricing power and low relative overhead.

### Growth Indicators
CapEx is expanding, focused on chip design and AI research. Free cash flow conversion is near 100%, allowing for capital returns to shareholders.

### Competitive Moat (Financial)
Nvidia's software lock-in (CUDA) lets it command gross margins that are usually reserved for pure software companies, despite selling hardware.

### Financial Strengths
- Exceptional gross margins of 75% and operating margins above 50%
- Near-monopoly pricing power in AI hardware accelerators
- Virtually zero debt and stellar free cash flow conversion

### Financial Weaknesses
- Massive customer concentration (top 4 hyperscalers contribute 40% of revenue)
- Vulnerability to cyclical capital expenditure cuts by cloud providers
- High inventory risk if demand shifts or Blackwell production faces delays`;
    }
    if (isApple) {
      return `### Revenue and Earnings Trends
Apple's overall revenue growth is in the low-to-mid single digits, but Services revenue is growing at a double-digit rate, shifting the mix toward higher margin, recurring streams.

### Profitability Margins
Gross margin remains high at around 45%, supported by the Services segment which boasts gross margins over 70%. Operating margin is stable at 30%.

### Growth Indicators
Apple generates over $100 billion in free cash flow annually, allowing it to execute massive share buybacks and pay growing dividends.

### Competitive Moat (Financial)
Apple's massive active device install base provides recurring services revenue, meaning it doesn't need to acquire customers repeatedly.

### Financial Strengths
- Incredibly consistent $100B+ annual free cash flow generation
- High-margin Services segment ($24B+ quarterly, ~70% gross margins)
- Massive capital return program via buybacks and dividends

### Financial Weaknesses
- Slowing hardware unit sales (iPhone upgrades slowing down)
- Exposure to antitrust lawsuits threatening App Store commission fees
- Premium pricing leaves it vulnerable to consumer spend contraction`;
    }

    // General financial analysis fallback
    return `### Revenue and Earnings Trends
The company shows stable single-digit revenue growth. Earnings have grown in line with revenues, showing operational stability.

### Profitability Margins
Gross margins are stable at 40%, with net margins hovering around 12%, representing standard performance for the sector.

### Growth Indicators
Growth is driven by incremental market share gains and price increases. Capital expenditure is focused on operations maintenance.

### Competitive Moat (Financial)
The company maintains pricing stability because of high customer switching costs, preventing rapid customer churn.

### Financial Strengths
- Predictable, recurring subscription revenue
- Moderate debt levels with comfortable interest coverage ratio
- Consistent free cash flow generation

### Financial Weaknesses
- Limited organic growth drivers in core markets
- Pricing pressure from larger consolidated competitors
- High customer acquisition cost in non-core segments`;
  }

  if (prompt.includes("risk officer")) {
    // Risk Agent
    if (isTesla) {
      return `### Market & Competitive Risks
Tesla faces severe EV price competition globally. Chinese EV makers, particularly BYD, offer lower-cost alternatives with comparable technology. Legacy manufacturers are also scaling EV portfolios, putting pressure on market share.

### Regulatory & Legal Risks
Tesla's Full Self-Driving (FSD) software is subject to active NHTSA investigations. Autonomous vehicle regulations are strict and fragmented across states and countries, threatening the timeline for Cybercab deployment.

### Technological & Execution Risks
Autonomous driving is a hard engineering problem. If Tesla fails to achieve Level 4/5 autonomy, or if its Optimus humanoid robot project is delayed, the high stock multiple is at risk of severe contraction.

### Macroeconomic & Geopolitical Risks
Geopolitical friction between the US and China threatens Gigafactory Shanghai, which manufactures a large percentage of Tesla's global units. Trade tariffs could also affect battery supply chains.`;
    }
    if (isNvidia) {
      return `### Market & Competitive Risks
Competitors like AMD and Intel are releasing AI chips, and hyperscalers (Google, Amazon, Meta) are developing custom silicon (TPUs, Trainium) to reduce their reliance on Nvidia.

### Regulatory & Legal Risks
US Department of Commerce export controls limit Nvidia's ability to sell its most advanced chips to China, a market that historically represented a significant portion of its sales.

### Technological & Execution Risks
The transition to the Blackwell architecture is complex. Packaging yield issues or liquid-cooling system issues could lead to shipping delays and damage customer trust.

### Macroeconomic & Geopolitical Risks
Nvidia is heavily dependent on TSMC in Taiwan for fabrication and packaging. Any geopolitical disruption in the Taiwan Strait could halt GPU production, representing a single point of failure.`;
    }
    if (isApple) {
      return `### Market & Competitive Risks
Apple faces intense competition in China from local brands like Huawei. In developed markets, smartphone penetration is saturated, making market share gains difficult.

### Regulatory & Legal Risks
Apple faces antitrust actions by the US Department of Justice and the European Commission. The Digital Markets Act (DMA) in Europe forces Apple to permit sideloading and alternative payment systems, threatening Services margins.

### Technological & Execution Risks
If 'Apple Intelligence' fails to impress consumers or if rollout is delayed in major markets like China and the EU due to data privacy regulations, it could stall the hardware upgrade supercycle.

### Macroeconomic & Geopolitical Risks
Apple relies heavily on manufacturing infrastructure in China. While it is diversifying to India and Vietnam, any sudden disruption in US-China relations could cause severe supply bottlenecks.`;
    }

    // General risks fallback
    return `### Market & Competitive Risks
The company operates in a crowded sector. Price wars with larger competitors could compress operating margins.

### Regulatory & Legal Risks
Changing data privacy regulations (such as GDPR updates) could increase compliance costs and limit user monetization strategies.

### Technological & Execution Risks
The company relies on cloud infrastructure. Extended outages or cybersecurity breaches could lead to customer loss and legal liability.

### Macroeconomic & Geopolitical Risks
Inflationary pressures could drive up employee salaries and operating expenses, while higher interest rates could increase the cost of debt financing.`;
  }

  return "Simulated content fallback.";
}
