// aiService.js
import fetch from "node-fetch";

const endpoint = process.env.NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT || process.env.AZURE_OPENAI_ENDPOINT;
const key = process.env.NEXT_PUBLIC_AZURE_OPENAI_KEY || process.env.AZURE_OPENAI_KEY;

async function callAgent(deploymentName, messages) {
  if (!endpoint || !key) {
    throw new Error('Azure OpenAI credentials not configured');
  }

  const url = `${endpoint}openai/deployments/${deploymentName}/chat/completions?api-version=2024-02-15-preview`;
  console.log('Calling Azure OpenAI:', url);
  
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": key
    },
    body: JSON.stringify({ messages })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error ${res.status}: ${err}`);
  }
  const json = await res.json();
  return json.choices[0].message.content;
}

export async function detectLoop(text) {
  const content = await callAgent("monitor-agent", [
    { role: "system", content: "Detect if the user text is stuck repeating or looping." },
    { role: "user", content: text }
  ]);
  return JSON.parse(content);
}

export async function getAdvice(details) {
  const content = await callAgent("rescue-agent", [
    { role: "system", content: "Given loopDetected details, return exactly three clear steps as a JSON array." },
    { role: "user", content: JSON.stringify(details) }
  ]);
  return JSON.parse(content);
} 