/**
 * Azure OpenAI AI Advisor Adapter
 * Implements the AIAdvisor port from @uicare-hui/safety-core.
 * Migrated from uicare-system/web/src/app/api/detect-loop/route.ts
 * and assess-risk/route.ts.
 *
 * CRITICAL CONTRACT: This adapter MUST return a valid AIAdvisoryResponse
 * even on total failure. Never throw. Local gates are independent of AI.
 */

import type { AIAdvisor, AIAdvisoryRequest, AIAdvisoryResponse } from "@uicare-hui/safety-core";

interface AzureConfig {
  endpoint: string;
  apiKey: string;
  deployment: string;
  apiVersion: string;
}

export class AzureOpenAIAdvisor implements AIAdvisor {
  private config: AzureConfig;

  constructor(config: AzureConfig) {
    this.config = config;
  }

  async advise(request: AIAdvisoryRequest): Promise<AIAdvisoryResponse> {
    try {
      const url = `${this.config.endpoint}/openai/deployments/${this.config.deployment}/chat/completions?api-version=${this.config.apiVersion}`;

      const systemPrompt = [
        "You are a behavioral pattern analysis assistant for a neurodivergent support tool.",
        "You do NOT diagnose, provide medical advice, or claim emergency response capability.",
        "Analyze the provided content sample and return ONLY valid JSON matching this schema:",
        '{"advisoryScore": number 0-1, "loopDetected": boolean, "rationale": "string (internal use only, not shown to user)"}',
        "If uncertain, return advisoryScore: null, loopDetected: null.",
      ].join(" ");

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": this.config.apiKey,
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `State: ${request.behavioralStateLabel}. Local score: ${request.localRiskScore}. Sample: ${request.contentSample}`,
            },
          ],
          max_tokens: 200,
          temperature: 0,
        }),
      });

      if (!res.ok) {
        return { advisoryScore: null, loopDetected: null, rationale: `HTTP ${res.status}` };
      }

      const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
      const content = data.choices?.[0]?.message?.content ?? "{}";
      const parsed = JSON.parse(content) as Partial<AIAdvisoryResponse>;

      return {
        advisoryScore: parsed.advisoryScore ?? null,
        loopDetected: parsed.loopDetected ?? null,
        rationale: parsed.rationale ?? null,
      };
    } catch {
      // AI failure must never bubble up — return null response
      return { advisoryScore: null, loopDetected: null, rationale: "AI unavailable" };
    }
  }
}
