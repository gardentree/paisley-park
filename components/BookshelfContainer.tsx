import type React from "react";
import Bookshelf from "./Bookshelf";
import Progress from "./Progress";
import buildBookReader from "@/borders/books";
import {useObjectWithLocalStorage} from "@/hooks/LocalStorage";
import {useState, useEffect} from "react";
import {sleep} from "@/libraries/utility";

interface Props {
  url: string;
}

interface Campaign {
  title: string;
  url: string;
  books: BookWithState[];
  updatedAt: number;
}

export default function BookshelfContainer(props: Props) {
  const {url} = props;
  const [campaign, setCampaign] = useObjectWithLocalStorage<Campaign>(url, {
    title: url,
    url,
    books: [],
    updatedAt: Date.now(),
  });
  const [books, setBooks] = useState<Map<string, BookWithState>>(new Map(campaign.books.map((book: Book) => [book.title, Object.assign({}, book, {latest: false})])));
  const [progress, setProgress] = useState(0);
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    if (books.size > 0) {
      return;
    }

    let stop = false;
    (async () => {
      let latest = new Map();
      try {
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
                newBooks.set(book.title, Object.assign({}, book, {latest: true}));
              }
            });

            latest = newBooks;

            return newBooks;
          });
          setProgress(result.progress);

          await sleep(1000);
        }
      } catch (error) {
        console.error(error);
        setProcessing(false);
      } finally {
        setCampaign((previous) => ({
          ...previous,
          books: Array.from(latest.values()),
          updatedAt: Date.now(),
        }));
      }
    })();

    return () => {
      stop = true;
    };
  }, [url]);

  return (
    <>
      <Bookshelf books={books} />
      <Progress now={progress} processing={processing} />
    </>
  );
}
