import type React from "react";
import Bookshelf from "./Bookshelf";
import Progress from "./Progress";
import readBooks from "@/borders/books";
import {useState, useEffect} from "react";

interface Props {
  url: string;
}

export default function BookshelfContainer(props: Props) {
  const {url} = props;
  const [books, setBooks] = useState(new Map());
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    readBooks(url, (newBooks, newProgress) => {
      setBooks(newBooks);
      setProgress(newProgress);
    });
  }, [url]);

  return (
    <>
      <Bookshelf books={books} />
      <Progress now={progress} />
    </>
  );
}
