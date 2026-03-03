interface IngestPayload {
  tweets?: Array<Record<string, unknown>>;
  lossEvents?: Array<Record<string, unknown>>;
  timelineEvents?: Array<Record<string, unknown>>;
  warEstimate?: Record<string, unknown>;
  cronRun?: Record<string, unknown>;
}

export async function pushToWorker(
  workerUrl: string,
  secret: string,
  payload: IngestPayload,
): Promise<{ ok: boolean; results?: Record<string, number> }> {
  const response = await fetch(workerUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`Ingest failed: ${response.status} ${text}`);
    return { ok: false };
  }

  return response.json() as Promise<{
    ok: boolean;
    results?: Record<string, number>;
  }>;
}
