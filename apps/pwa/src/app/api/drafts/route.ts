import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const DRAFT_DIR = path.resolve(process.cwd(), "../drafts");
const IMPROVED_DIR = path.join(DRAFT_DIR, "improved");

async function readFiles(dir: string) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = entries.filter(e => e.isFile());
    const results = [] as { name: string; content: string }[];
    for (const f of files) {
      const filePath = path.join(dir, f.name);
      const content = await fs.readFile(filePath, "utf8");
      results.push({ name: f.name, content });
    }
    return results;
  } catch {
    return [];
  }
}

export async function GET() {
  const original = await readFiles(DRAFT_DIR);
  const improved = await readFiles(IMPROVED_DIR);
  return NextResponse.json({ original, improved });
}
