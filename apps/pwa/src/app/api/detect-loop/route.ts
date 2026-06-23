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
    const { text } = await req.json();
    
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a loop detector. Analyze the text and determine if there's a loop pattern. Return {loopDetected: true/false, details: 'explanation'}"
        },
        {
          role: "user",
          content: text
        }
      ]
    });

    const result = completion.data.choices[0]?.message?.content || "";
    return NextResponse.json(JSON.parse(result));
  } catch (error) {
    return NextResponse.json({ error: "Failed to detect loop" }, { status: 500 });
  }
} 