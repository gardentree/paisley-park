interface Payload {
  comics: Comic[];
  pagination: Pagination;
}
interface Comic {
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
