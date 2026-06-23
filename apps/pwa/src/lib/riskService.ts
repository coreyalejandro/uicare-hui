export async function assessRisk(text: string) {
  const response = await fetch("/api/assess-risk", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error("Failed to assess risk");
  }

  return response.json();
}
