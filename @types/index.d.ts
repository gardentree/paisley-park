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
  heat: string;
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
  books: Book[];
  updatedAt: number;
}

interface FilteringOption {
  heatMaximum: number;
  passingLine: number;
}
