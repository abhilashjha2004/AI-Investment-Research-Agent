const fs = require('fs');
const path = require('path');

// Helper to manually parse .env.local on Windows
function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    console.log('Loading environment from .env.local...');
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.\-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        // Remove surrounding quotes if any
        if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
          value = value.substring(1, value.length - 1);
        }
        if (value.length > 0 && value.charAt(0) === "'" && value.charAt(value.length - 1) === "'") {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value.trim();
      }
    });
  } else {
    console.log('No .env.local found. Using default environment variables.');
  }
}

loadEnvLocal();

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

async function runTest() {
  const company = process.argv[2] || "Tesla";
  console.log(`\n=== Testing AI Investment Research Agent Backend for: ${company} ===`);

  // 1. Validate Tavily Search
  console.log('\n--- 1. Testing Tavily Search API ---');
  if (!TAVILY_API_KEY) {
    console.log('⚠️ TAVILY_API_KEY is missing! Using simulated search data.');
  } else {
    console.log(`TAVILY_API_KEY found: ${TAVILY_API_KEY.substring(0, 5)}...`);
    try {
      const query = `${company} financial performance revenue 2025`;
      const res = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: TAVILY_API_KEY,
          query,
          max_results: 2
        })
      });
      if (res.ok) {
        const data = await res.json();
        console.log(`✅ Tavily Connection Successful! Found ${data.results?.length} results.`);
        if (data.results && data.results.length > 0) {
          console.log(`Sample Result Title: "${data.results[0].title}"`);
          console.log(`Sample Result Link: ${data.results[0].url}`);
        }
      } else {
        console.log(`❌ Tavily API Error: status ${res.status}`);
      }
    } catch (err) {
      console.log(`❌ Tavily Search request failed:`, err.message);
    }
  }

  // 2. Validate Gemini LLM
  console.log('\n--- 2. Testing Gemini LLM API ---');
  if (!GOOGLE_API_KEY) {
    console.log('⚠️ GOOGLE_API_KEY is missing! Gemini calls will fallback to simulations.');
  } else {
    console.log(`GOOGLE_API_KEY found: ${GOOGLE_API_KEY.substring(0, 5)}...`);
    try {
      // Use standard Gemini endpoint via Fetch REST call to bypass LangChain module caching issues in script
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GOOGLE_API_KEY}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Identify 3 brief core financial strengths of ${company}. Respond in bullet points.`
            }]
          }]
        })
      });

      if (res.ok) {
        const data = await res.json();
        console.log('✅ Gemini Connection Successful! Model Response:');
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        console.log(text ? text.trim() : 'No text content returned.');
      } else {
        const errText = await res.text();
        console.log(`❌ Gemini API Error: status ${res.status} - ${errText}`);
      }
    } catch (err) {
      console.log(`❌ Gemini request failed:`, err.message);
    }
  }

  console.log('\n=== Diagnostic Tests Complete ===\n');
}

runTest();
