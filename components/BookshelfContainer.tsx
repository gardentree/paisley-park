import type React from "react";
import {useState, useEffect, useMemo, useRef} from "react";
import {Button, Container, Form, Nav, Navbar, NavDropdown} from "react-bootstrap";
import BookshelfByMagazine from "@/components/BookshelfByMagazine";
import SubNavigation from "@/components/SubNavigation";
import FilteringOptionForm from "@/components/FilteringOptionForm";
import Progress from "./Progress";
import buildBookReader, {FetchError} from "@/borders/books";
import {useObjectWithLocalStorage} from "@/hooks/LocalStorage";
import {sleep} from "@/libraries/utility";
import {Heat} from "@/libraries/heat";
import "bootstrap-icons/font/bootstrap-icons.css";

interface Props {
  url: string;
}

const MODE: {[key in DisplayMode]: string} = {
  all: "全て",
  newArrival: "新着のみ",
};

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
  const [subNavigation, setSubNavigation] = useState(false);
  const [option, setOption] = useState<FilteringOption>({
    heatMaximum: 1024,
    passingLine: 0,
  });

  const books = useMemo(() => {
    const heat = new Heat(option.heatMaximum);

    return allBooks.filter((book) => book.review.count >= option.passingLine).map((book) => Object.assign({}, book, {heat: heat.measure(book.review.count)}));
  }, [allBooks, option]);

  const [controller, setController] = useState<Controller | null>(null);
  useEffect(() => {
    const builder = createControllerBuilder(url);
    const controller = builder({
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
    });
    setController(controller);

    controller.startIfEmpty();

    return controller.stop;
  }, [url]);

  if (!controller) {
    return null;
  }

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

  const controlButton = (() => {
    let state;
    if (processing) {
      state = "stop";
    } else {
      if (controller.paused()) {
        state = "resume";
      } else {
        state = "start";
      }
    }

    switch (state) {
      case "start":
        return (
          <Button onClick={() => controller.start()} variant="outline-success">
            Update
          </Button>
        );
      case "resume":
        return (
          <Button onClick={() => controller.resume()} variant="outline-success">
            Resume
          </Button>
        );
      case "stop":
        return (
          <Button onClick={() => controller.stop()} variant="outline-secondary">
            Stop
          </Button>
        );
    }
  })();

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
            <Button variant="link" onClick={() => setSubNavigation(true)}>
              <i className="bi-layout-sidebar-reverse" />
            </Button>
            {controlButton}
          </Nav>
        </Container>
      </Navbar>

      <BookshelfByMagazine books={books} mode={mode} />
      <Progress now={progress} processing={processing} />

      <SubNavigation show={subNavigation} setShow={setSubNavigation}>
        <FilteringOptionForm
          config={option}
          setConfig={(config) => {
            setOption(config);
            setSubNavigation(false);
          }}
        />
      </SubNavigation>
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
interface Controller {
  start(): void;
  resume(): void;
  paused(): boolean;
  stop(): void;
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
    const resume = async () => {
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
    const start = () => {
      Array.from(books.values()).forEach((book) => {
        book.newArrival = false;
      });
      resume();
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
      resume,
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
