export async function detectLoop(text: string) {
  const response = await fetch("/api/detect-loop", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error("Failed to detect loop");
  }

  return response.json();
}

export async function getAdvice(details: string) {
  const response = await fetch("/api/get-advice", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ details }),
  });

  if (!response.ok) {
    throw new Error("Failed to get advice");
  }

  const data = await response.json();
  return data.steps;
} 