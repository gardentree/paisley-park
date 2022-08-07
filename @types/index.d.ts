interface Payload {
  books: Book[];
  pagination: Pagination;
}
interface Book {
  title: string;
  magazine: string;
  anchor: string;
  image: string;
  review: Review;
}
interface Review {
  star: number;
  count: number;
}
interface BookWithState extends Book {
  newArrival: boolean;
}
interface Pagination {
  next: string | null;
  numerator: number;
  denominator: number;
}
type DisplayMode = "all" | "newArrival";

interface Campaign {
  title: string;
  url: string;
  books: BookWithState[];
  updatedAt: number;
}
