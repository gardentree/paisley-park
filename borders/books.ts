import {fetchWithRetry} from "@/libraries/utility";

export default async function* buildBookReader(url: string, signal: AbortSignal) {
  let target: string | null = url;

  for (let i = 0; target && i < 1000; i++) {
    const response = await fetchWithRetry(`/api/books/${encodeURIComponent(target)}`, 3, signal);

    if (!response.ok) {
      throw new Error(`${response.status}: ${target}`);
    }

    const payload: Payload = await response.json();
    target = payload.pagination.next;

    yield {
      books: payload.books,
      progress: Math.ceil((payload.pagination.numerator * 100) / payload.pagination.denominator),
      next: target,
    };
  }
}
