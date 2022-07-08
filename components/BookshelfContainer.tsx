import type React from "react";
import Bookshelf from "./Bookshelf";
import Progress from "./Progress";
import buildBookReader from "@/borders/books";
import {useState, useEffect} from "react";
import {sleep} from "@/libraries/utility";

interface Props {
  url: string;
}

export default function BookshelfContainer(props: Props) {
  const {url} = props;
  const [books, setBooks] = useState(new Map());
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let stop = false;

    (async () => {
      const reader = buildBookReader(url);
      for (let i = 0; i < 1000; i++) {
        const result = await reader.read();
        if (!result || stop) {
          return;
        }

        setBooks((previous) => {
          const newBooks = new Map(previous);

          result.books.forEach((book) => {
            if (!newBooks.has(book.title)) {
              newBooks.set(book.title, book);
            }
          });

          return newBooks;
        });
        setProgress(result.progress);

        await sleep(1000);
      }
    })();

    return () => {
      stop = true;
    };
  }, [url]);

  return (
    <>
      <Bookshelf books={books} />
      <Progress now={progress} />
    </>
  );
}
