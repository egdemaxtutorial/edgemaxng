export async function parseApiResponse<T = Record<string, unknown>>(
  res: Response
): Promise<T & { error?: string }> {
  const text = await res.text();
  if (!text) {
    return {} as T & { error?: string };
  }
  try {
    return JSON.parse(text) as T & { error?: string };
  } catch {
    return {
      error: res.ok
        ? 'Unexpected response format from EdgeMax server.'
        : `Server returned status ${res.status}. Please check backend or database configuration.`,
    } as T & { error?: string };
  }
}
