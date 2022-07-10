import {fetchWithRetry} from "@/libraries/utility";

export default function buildBookReader(url: string) {
  let target: string | null = url;

  return {
    read: async () => {
      if (!target) {
        return null;
      }
      const response = await fetchWithRetry(`api/books/${encodeURIComponent(target)}`, 3);

      if (!response.ok) {
        throw new Error(JSON.stringify(await response.json()));
      }

      const payload: Payload = await response.json();
      target = payload.pagination.next;

      return {
        books: payload.books,
        progress: Math.ceil((payload.pagination.numerator * 100) / payload.pagination.denominator),
      };
    },
  };
}
