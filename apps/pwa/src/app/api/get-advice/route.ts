import { NextResponse } from "next/server";
import { Configuration, OpenAIApi } from "openai";
import { requireAuth } from "@/lib/auth";

const config = new Configuration({
  apiKey: process.env.NEXT_PUBLIC_AZURE_OPENAI_KEY,
  basePath: process.env.NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT + "/openai/deployments/gpt-4",
});

const openai = new OpenAIApi(config);

export async function POST(req: Request) {
  const unauthorized = requireAuth(req);
  if (unauthorized) return unauthorized;

  try {
    const { details } = await req.json();
    
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a helpful AI that provides step-by-step advice for breaking out of thought loops. Return an array of clear, actionable steps."
        },
        {
          role: "user",
          content: details
        }
      ]
    });

    const result = completion.data.choices[0]?.message?.content || "[]";
    return NextResponse.json({ steps: JSON.parse(result) });
  } catch (error) {
    return NextResponse.json({ error: "Failed to get advice" }, { status: 500 });
  }
} 