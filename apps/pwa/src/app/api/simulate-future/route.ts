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
    const { snapshot } = await req.json();

    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a proactive planning agent. Given a repository snapshot, suggest potential future project branches. Respond in JSON array with objects {branch: string, summary: string, timeline: string[]}.",
        },
        { role: "user", content: snapshot },
      ],
    });

    const text = completion.data.choices[0]?.message?.content || "[]";
    return NextResponse.json(JSON.parse(text));
  } catch (e) {
    return NextResponse.json({ error: "Failed to simulate future states" }, { status: 500 });
  }
}
