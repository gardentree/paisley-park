interface Payload {
  books: Book[];
  pagination: Pagination;
}
interface Book {
  title: string;
  magazine: string;
  anchor: string;
  image: string;
}
interface Pagination {
  next: string | null;
  numerator: number;
  denominator: number;
}
