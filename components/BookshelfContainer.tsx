import type React from "react";
import {useState, useEffect, useMemo, useRef} from "react";
import {Button, Container, Form, Nav, Navbar, NavDropdown} from "react-bootstrap";
import BookshelfByMagazine from "@/components/BookshelfByMagazine";
import Progress from "./Progress";
import buildBookReader, {FetchError} from "@/borders/books";
import {useObjectWithLocalStorage} from "@/hooks/LocalStorage";
import {sleep} from "@/libraries/utility";
import {Heat} from "@/libraries/heat";

interface Props {
  url: string;
}

const MODE: {[key in DisplayMode]: string} = {
  all: "全て",
  newArrival: "新着のみ",
};

const HEAT = new Heat(1024);

export default function BookshelfContainer(props: Props) {
  const {url} = props;
  const [campaign, setCampaign] = useObjectWithLocalStorage<Campaign>(url, {
    title: url,
    url,
    books: [],
    updatedAt: Date.now(),
  });
  const setCampaignRef = useRef(setCampaign);
  const [allBooks, setAllBooks] = useState<BookPlusNewArrival[]>([]);
  const [progress, setProgress] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [mode, setMode] = useState<DisplayMode>("all");

  const books = useMemo(() => allBooks.map((book) => Object.assign({}, book, {heat: HEAT.measure(book.review.count)})), [allBooks]);

  const builder = useMemo(() => createControllerBuilder(url), [url]);
  const controller = useMemo(
    () =>
      builder({
        onInitialize: (books) => {
          setAllBooks(books);
        },
        onStart: (books) => {
          setProcessing(true);
          setMode("newArrival");
          setAllBooks(books);
        },
        onUpdate: (books, progress) => {
          setAllBooks(books);
          setProgress(progress);
        },
        onFinish: (books) => {
          setCampaignRef.current((previous) => ({
            ...previous,
            books: books,
            updatedAt: Date.now(),
          }));
          setProcessing(false);
        },
      }),
    [builder]
  );

  useEffect(() => {
    controller.startIfEmpty();

    return controller.stop;
  }, [controller]);

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

    const title = event.currentTarget.elements.namedItem("title") as HTMLInputElement;

    setCampaignRef.current((previous) => ({...previous, title: title.value}));

    title.blur();
  };

  return (
    <>
      <Navbar expand="md" sticky="top" variant="dark" bg="dark">
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
                {controller.paused() ? "Resume" : "Update"}
              </Button>
            )}
          </Nav>
        </Container>
      </Navbar>

      <BookshelfByMagazine books={books} mode={mode} />
      <Progress now={progress} processing={processing} />
    </>
  );
}

type BookPlusNewArrival = Book & {newArrival: boolean};

interface ControllerEvents {
  onInitialize(books: BookPlusNewArrival[]): void;
  onStart(books: BookPlusNewArrival[]): void;
  onUpdate(books: BookPlusNewArrival[], progress: number): void;
  onFinish(books: BookPlusNewArrival[]): void;
}

function createControllerBuilder(url: string) {
  const campaign = loadCampaign(url);
  const previous = new Set(campaign.books.map((book) => book.title));
  const books = new Map<string, BookPlusNewArrival>();

  let source = url;
  return (events: ControllerEvents) => {
    const {onInitialize, onStart, onUpdate, onFinish} = events;

    onInitialize(campaign.books.map((book: Book) => Object.assign({}, book, {newArrival: false})));

    let terminate = false;
    const start = async () => {
      onStart(Array.from(books.values()));
      terminate = false;

      try {
        const reader = buildBookReader(source);
        for await (const result of reader) {
          if (terminate) {
            return;
          }

          result.books.forEach((book) => {
            if (!books.has(book.title)) {
              books.set(book.title, Object.assign({}, book, {newArrival: !previous.has(book.title)}));
            }
          });

          onUpdate(Array.from(books.values()), result.progress);

          await sleep(1000);
        }
        source = url;
      } catch (error: unknown) {
        if (error instanceof Error) {
          switch (error.constructor) {
            case FetchError:
              source = (error as FetchError).url;
              break;
            default:
              console.error(error.message);
              break;
          }
        } else {
          console.error(error);
        }
      } finally {
        onFinish(Array.from(books.values()));
      }
    };

    const stop = () => {
      terminate = true;
    };

    return {
      start,
      startIfEmpty: () => {
        if (previous.size <= 0) {
          start();
        }
      },
      stop,
      paused: () => url !== source,
    };
  };
}

function loadCampaign(url: string): Campaign {
  const item = localStorage.getItem(url);
  if (item) {
    return JSON.parse(item);
  } else {
    return {
      title: url,
      url,
      books: [],
      updatedAt: Date.now(),
    };
  }
}
