export async function fetchWithRetry(url: URL | string, retry: number): Promise<Response> {
  const response = await fetch(url);
  if (![503].includes(response.status) || retry <= 0) {
    return response;
  }

  await sleep(1000);

  console.info(`retry[${retry}] ${response.status}: ${url}`);
  return fetchWithRetry(url, --retry);
}

export function sleep(millisecond: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, millisecond));
}
