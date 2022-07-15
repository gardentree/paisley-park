import {fetchWithRetry} from "@/libraries/utility";

export default async function* buildBookReader(url: string) {
  let target: string | null = url;

  for (let i = 0; target && i < 1000; i++) {
    const response = await fetchWithRetry(`/api/books/${encodeURIComponent(target)}`, 3);

    if (!response.ok) {
      throw new FetchError(url, response.status);
    }

    const payload: Payload = await response.json();
    target = payload.pagination.next;

    yield {
      books: payload.books,
      progress: Math.ceil((payload.pagination.numerator * 100) / payload.pagination.denominator),
    };
  }
}

export class FetchError extends Error {
  url: string;
  status: number;

  constructor(url: string, status: number) {
    super(JSON.stringify({url, status}));

    this.url = url;
    this.status = status;
  }
}
