import { NextResponse } from "next/server";
import { Configuration, OpenAIApi } from "openai";
import fs from "fs";
import path from "path";

const config = new Configuration({
  apiKey: process.env.NEXT_PUBLIC_AZURE_OPENAI_KEY,
  basePath: process.env.NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT + "/openai/deployments/gpt-4",
});

const openai = new OpenAIApi(config);
const logPath = path.join(process.cwd(), "risk-stats.log");

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "Assess the following text for signs of mental health crisis. Respond with JSON {\"score\": number} where score is between 0 and 1.",
        },
        { role: "user", content: text },
      ],
    });

    const result = completion.data.choices[0]?.message?.content || "{\"score\":0}";
    const { score } = JSON.parse(result);

    // Log anonymized risk statistics
    const entry = { timestamp: new Date().toISOString(), score };
    fs.appendFileSync(logPath, JSON.stringify(entry) + "\n");

    return NextResponse.json({ score });
  } catch (error) {
    return NextResponse.json({ error: "Failed to assess risk" }, { status: 500 });
  }
}
