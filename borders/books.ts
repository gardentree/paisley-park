export default function read(url: string, callback: (books: Map<string, Comic>, progress: number) => void) {
  const books = new Map();

  async function load(url: string) {
    const response = await fetch(`api/comics/${encodeURIComponent(url)}`);

    if (!response.ok) {
      throw new Error(JSON.stringify(await response.json()));
    }

    const payload: Payload = await response.json();
    payload.comics.forEach((comic) => {
      if (!books.has(comic.title)) {
        books.set(comic.title, comic);
      }
    });

    const newBooks = new Map(books);
    if (payload.pagination.next) {
      const progress = Math.ceil((payload.pagination.numerator * 100) / payload.pagination.denominator);
      callback(newBooks, progress);

      await new Promise((resolve) => setTimeout(resolve, 500));
      await load(payload.pagination.next!);
    } else {
      callback(newBooks, 100);
    }
  }

  return load(url);
}
