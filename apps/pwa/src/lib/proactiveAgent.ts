export interface FutureState {
  branch: string;
  summary: string;
  timeline: string[];
}

export async function simulateFutureStates(currentRepoSnapshot: string): Promise<FutureState[]> {
  const response = await fetch("/api/simulate-future", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ snapshot: currentRepoSnapshot }),
  });

  if (!response.ok) {
    throw new Error("Failed to simulate future states");
  }

  return response.json();
}
