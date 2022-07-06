export default function read(url: string, callback: (books: Map<string, Book>, progress: number) => void) {
  const books = new Map();

  async function load(url: string) {
    const response = await fetch(`api/books/${encodeURIComponent(url)}`);

    if (!response.ok) {
      throw new Error(JSON.stringify(await response.json()));
    }

    const payload: Payload = await response.json();
    payload.books.forEach((book) => {
      if (!books.has(book.title)) {
        books.set(book.title, book);
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
