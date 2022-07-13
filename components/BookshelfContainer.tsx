import type React from "react";
import {useState, useEffect, useMemo} from "react";
import {Button, Container, Navbar} from "react-bootstrap";
import Bookshelf from "./Bookshelf";
import Progress from "./Progress";
import buildBookReader from "@/borders/books";
import {useObjectWithLocalStorage} from "@/hooks/LocalStorage";
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
  const [processing, setProcessing] = useState(false);

  const controller = useMemo(() => {
    let terminate = false;

    const start = async () => {
      terminate = false;
      setProcessing(true);

      let latest = new Map();
      try {
        const reader = buildBookReader(url);
        for (let i = 0; i < 1000; i++) {
          const result = await reader.read();
          if (!result || terminate) {
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
      } finally {
        setCampaign((previous) => ({
          ...previous,
          books: Array.from(latest.values()),
          updatedAt: Date.now(),
        }));
        setProcessing(false);
      }
    };

    const stop = () => {
      terminate = true;
    };

    return {start, stop};
  }, [url]);

  useEffect(() => {
    if (books.size <= 0) {
      controller.start();
    }

    return controller.stop;
  }, [url]);

  return (
    <>
      <Navbar expand="md" sticky="top" variant="dark" bg="dark">
        <Container>
          <Navbar.Brand href="/">PaisleyPark</Navbar.Brand>
          <Navbar.Collapse className="justify-content-end">
            <Navbar.Text>Updated: {new Date(campaign.updatedAt).toLocaleString("ja-JP")}</Navbar.Text>
            {processing ? (
              <Button onClick={() => controller.stop()} variant="outline-secondary">
                Stop
              </Button>
            ) : (
              <Button onClick={() => controller.start()} variant="outline-success">
                Update
              </Button>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Bookshelf books={books} />
      <Progress now={progress} processing={processing} />
    </>
  );
}
