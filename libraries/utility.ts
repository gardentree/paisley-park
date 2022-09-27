import {AbortException} from "./abort";
import * as self from "./utility";

export async function fetchWithRetry(url: URL | string, retry: number, signal: AbortSignal): Promise<Response> {
  try {
    const response = await fetch(url, {signal});
    if (![503].includes(response.status) || retry <= 0) {
      return response;
    }

    await self.sleep((30 / retry) * 1000, signal);

    console.info(`retry[${retry}] ${response.status}: ${url}`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      switch (error.constructor) {
        case DOMException:
          if ("AbortError" == error.name) {
            throw new AbortException();
          }
      }
    }

    throw error;
  }

  return fetchWithRetry(url, --retry, signal);
}

export function sleep(millisecond: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    signal.addEventListener("abort", () => {
      reject(new AbortException());
    });
    setTimeout(resolve, millisecond);
  });
}
