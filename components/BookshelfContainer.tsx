import type React from "react";
import {useState, useEffect, useMemo} from "react";
import {Button, Container, Form, Nav, Navbar, NavDropdown} from "react-bootstrap";
import Bookshelf from "./Bookshelf";
import Progress from "./Progress";
import buildBookReader, {FetchError} from "@/borders/books";
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

const MODE: {[key in DisplayMode]: string} = {
  all: "全て",
  newArrival: "新着のみ",
};

export default function BookshelfContainer(props: Props) {
  const {url} = props;
  const [source, setSource] = useState(url);
  const [campaign, setCampaign] = useObjectWithLocalStorage<Campaign>(url, {
    title: url,
    url,
    books: [],
    updatedAt: Date.now(),
  });
  const [books, setBooks] = useState<Map<string, BookWithState>>(new Map(campaign.books.map((book: Book) => [book.title, Object.assign({}, book, {latest: false})])));
  const [progress, setProgress] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [mode, setMode] = useState<DisplayMode>("all");

  const controller = useMemo(() => {
    let terminate = false;

    const start = async () => {
      terminate = false;
      setProcessing(true);

      let latest = new Map();
      try {
        const reader = buildBookReader(source);
        for await (const result of reader) {
          if (terminate) {
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
        setSource(url);
      } catch (error: any) {
        switch (error.constructor) {
          case FetchError:
            setSource(error.url);
            break;
          case Error:
            console.error(error.message);
            break;
          default:
            console.error(error);
        }
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
  }, [source]);

  useEffect(() => {
    if (books.size <= 0) {
      controller.start();
    }

    return controller.stop;
  }, [source]);

  const changeMode = (mode: DisplayMode) => {
    setMode(mode);
  };
  const modeItems = Object.entries(MODE).map(([key, title]) => {
    return (
      <NavDropdown.Item onClick={() => changeMode(key as DisplayMode)} key={key}>
        {title}
      </NavDropdown.Item>
    );
  });

  const titleHandler: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    const title = event.currentTarget.elements["title" as any] as HTMLInputElement;

    setCampaign((previous) => ({...previous, title: title.value}));

    title.blur();
  };

  return (
    <>
      <Navbar expand="md" fixed="top" variant="dark" bg="dark">
        <Container>
          <Navbar.Brand href="/">PaisleyPark</Navbar.Brand>
          <Form onSubmit={titleHandler} className="flex-fill">
            <Form.Control name="title" defaultValue={campaign.title} plaintext />
          </Form>
          <Nav className="justify-content-end">
            <Navbar.Text>Updated: {new Date(campaign.updatedAt).toLocaleString("ja-JP")}</Navbar.Text>
            <NavDropdown title={MODE[mode]}>{modeItems}</NavDropdown>
            {processing ? (
              <Button onClick={() => controller.stop()} variant="outline-secondary">
                Stop
              </Button>
            ) : (
              <Button onClick={() => controller.start()} variant="outline-success">
                {url == source ? "Update" : "Resume"}
              </Button>
            )}
          </Nav>
        </Container>
      </Navbar>

      <Bookshelf books={Array.from(books.values())} mode={mode} />
      <Progress now={progress} processing={processing} />
    </>
  );
}
