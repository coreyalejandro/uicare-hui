import fs from "fs/promises";
import path from "path";

const DRAFT_DIR = path.resolve(process.cwd(), "../drafts");
const IMPROVED_DIR = path.join(DRAFT_DIR, "improved");

export async function autosaveDraft(text: string) {
  await fs.mkdir(DRAFT_DIR, { recursive: true });
  const filePath = path.join(DRAFT_DIR, `draft-${Date.now()}.txt`);
  await fs.writeFile(filePath, text, "utf8");
  return filePath;
}

export async function generateImprovedDraft(draft: string) {
  if (typeof fetch !== "function") {
    return [];
  }
  const response = await fetch(process.env.AI_ENHANCER_URL || "/api/generate-improved", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ draft }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate improved draft");
  }

  const { versions } = await response.json();
  await fs.mkdir(IMPROVED_DIR, { recursive: true });
  const saved: string[] = [];
  await Promise.all(
    versions.map(async (text: string, idx: number) => {
      const filePath = path.join(IMPROVED_DIR, `improved-${Date.now()}-${idx}.txt`);
      await fs.writeFile(filePath, text, "utf8");
      saved.push(filePath);
    })
  );
  return saved;
}
