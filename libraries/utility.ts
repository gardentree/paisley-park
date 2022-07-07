export async function fetchWithRetry(url: URL | string, retry: number): Promise<Response> {
  const response = await fetch(url);
  if (![503].includes(response.status) || retry <= 0) {
    return response;
  }

  console.error(`${response.status}: ${url}`);
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return fetchWithRetry(url, --retry);
}
