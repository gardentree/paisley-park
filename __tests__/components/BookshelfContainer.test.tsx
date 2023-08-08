import {render, screen, waitFor, within} from "@testing-library/react";
import {act} from "react-dom/test-utils";
import {faker} from "@faker-js/faker";
import {UniqueEnforcer} from "enforce-unique";
import BookshelfContainer from "@/components/BookshelfContainer";
import buildBookReader from "@/borders/books";

jest.mock("@/borders/books", () => {
  const originalModule = jest.requireActual("@/borders/books");

  return {
    __esModule: true,
    ...originalModule,
    default: jest.fn(),
  };
});

const unique = new UniqueEnforcer();
function fakeBook(): Book {
  return {
    title: unique.enforce(faker.music.songName),
    magazine: faker.music.genre(),
    anchor: faker.internet.url(),
    image: faker.internet.avatar(),
    review: {
      star: faker.number.int({min: 0, max: 5}),
      count: faker.number.int({min: 0, max: 10000}),
    },
  };
}

describe(BookshelfContainer, () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("when single book", async () => {
    const book1 = fakeBook();
    async function* mock() {
      yield {books: [book1], progress: 100};
    }

    (buildBookReader as jest.Mock).mockImplementation(mock);

    act(() => {
      render(<BookshelfContainer url={faker.internet.url()} />);
    });

    await waitFor(() => expect(screen.getByAltText(book1.title)).toBeInTheDocument());

    const main = within(screen.getByAltText(book1.title).closest("main")!);
    expect(main.getByAltText(book1.title)).toBeInTheDocument();
    expect(main.getByText(book1.magazine)).toBeInTheDocument();

    const navigation = within(screen.getByRole("navigation"));
    expect(navigation.getByText("Update")).toBeInTheDocument();
    expect(navigation.getByText("新着のみ")).toBeInTheDocument();
  });
  it("when multi book", async () => {
    const book1 = fakeBook();
    const book2 = fakeBook();
    async function* mock() {
      yield {books: [book1], progress: 50};
      yield {books: [book1, book2], progress: 100};
    }
    (buildBookReader as jest.Mock).mockImplementation(mock);

    act(() => {
      render(<BookshelfContainer url={faker.internet.url()} />);
    });

    await waitFor(() => expect(screen.getByAltText(book2.title)).toBeInTheDocument());

    const main = within(screen.getByAltText(book2.title).closest("main")!);
    expect(main.getByAltText(book1.title)).toBeInTheDocument();
    expect(main.getByText(book1.magazine)).toBeInTheDocument();
    expect(main.getByAltText(book2.title)).toBeInTheDocument();
    expect(main.getByText(book2.magazine)).toBeInTheDocument();

    const navigation = within(screen.getByRole("navigation"));
    expect(navigation.getByText("Update")).toBeInTheDocument();
    expect(navigation.getByText("新着のみ")).toBeInTheDocument();
  });
  it("when update and update", async () => {
    const book1 = fakeBook();
    (() => {
      async function* mock() {
        yield {books: [book1], progress: 100};
      }
      (buildBookReader as jest.Mock).mockImplementation(mock);
    })();

    act(() => {
      render(<BookshelfContainer url={faker.internet.url()} />);
    });

    await waitFor(() => expect(screen.getByAltText(book1.title)).toBeInTheDocument());

    const main = within(screen.getByAltText(book1.title).closest("main")!);
    expect(main.getByAltText(book1.title)).toBeInTheDocument();
    expect(main.getByText(book1.magazine)).toBeInTheDocument();

    const navigation = within(screen.getByRole("navigation"));
    expect(navigation.getByText("Update")).toBeInTheDocument();
    expect(navigation.getByText("新着のみ")).toBeInTheDocument();

    const book2 = fakeBook();
    (() => {
      async function* mock() {
        yield {books: [book2], progress: 100};
      }
      (buildBookReader as jest.Mock).mockImplementation(mock);
    })();

    act(() => {
      const button = navigation.getByText("Update");
      button.click();
    });

    await waitFor(() => expect(screen.getByAltText(book2.title)).toBeInTheDocument());

    expect(main.getByAltText(book2.title)).toBeInTheDocument();
    expect(main.getByText(book2.magazine)).toBeInTheDocument();

    expect(main.queryByAltText(book1.title)).toBeNull();

    expect(navigation.getByText("Update")).toBeInTheDocument();
    expect(navigation.getByText("新着のみ")).toBeInTheDocument();
  });
  it("when update and resume", async () => {
    const book1 = fakeBook();
    (() => {
      async function* mock() {
        yield {books: [book1], progress: 50};
        throw new Error(`503: ${book1.anchor}`);
      }
      (buildBookReader as jest.Mock).mockImplementation(mock);
    })();

    act(() => {
      render(<BookshelfContainer url={faker.internet.url()} />);
    });

    await waitFor(() => expect(screen.getByAltText(book1.title)).toBeInTheDocument());

    const main = within(screen.getByAltText(book1.title).closest("main")!);
    expect(main.getByAltText(book1.title)).toBeInTheDocument();
    expect(main.getByText(book1.magazine)).toBeInTheDocument();

    const navigation = within(screen.getByRole("navigation"));
    expect(navigation.getByText("Resume")).toBeInTheDocument();
    expect(navigation.getByText("新着のみ")).toBeInTheDocument();

    const book2 = fakeBook();
    (() => {
      async function* mock() {
        yield {books: [book2], progress: 100};
      }
      (buildBookReader as jest.Mock).mockImplementation(mock);
    })();

    act(() => {
      const button = navigation.getByText("Resume");
      button.click();
    });

    await waitFor(() => expect(screen.getByAltText(book2.title)).toBeInTheDocument());

    expect(main.getByAltText(book1.title)).toBeInTheDocument();
    expect(main.getByText(book1.magazine)).toBeInTheDocument();
    expect(main.getByAltText(book2.title)).toBeInTheDocument();
    expect(main.getByText(book2.magazine)).toBeInTheDocument();

    expect(navigation.getByText("Update")).toBeInTheDocument();
    expect(navigation.getByText("新着のみ")).toBeInTheDocument();
  });
  it("when update and resume", async () => {
    const book1 = fakeBook();
    (() => {
      async function* mock() {
        yield {books: [book1], progress: 50};
        throw new DOMException("abort", "AbortError");
      }
      (buildBookReader as jest.Mock).mockImplementation(mock);
    })();

    act(() => {
      render(<BookshelfContainer url={faker.internet.url()} />);
    });

    await waitFor(() => expect(screen.getByAltText(book1.title)).toBeInTheDocument());

    const main = within(screen.getByAltText(book1.title).closest("main")!);
    expect(main.getByAltText(book1.title)).toBeInTheDocument();
    expect(main.getByText(book1.magazine)).toBeInTheDocument();

    const navigation = within(screen.getByRole("navigation"));
    expect(navigation.getByText("Resume")).toBeInTheDocument();
    expect(navigation.getByText("新着のみ")).toBeInTheDocument();

    const book2 = fakeBook();
    (() => {
      async function* mock() {
        yield {books: [book2], progress: 100};
      }
      (buildBookReader as jest.Mock).mockImplementation(mock);
    })();

    act(() => {
      const button = navigation.getByText("Resume");
      button.click();
    });

    await waitFor(() => expect(screen.getByAltText(book2.title)).toBeInTheDocument());

    expect(main.getByAltText(book1.title)).toBeInTheDocument();
    expect(main.getByText(book1.magazine)).toBeInTheDocument();
    expect(main.getByAltText(book2.title)).toBeInTheDocument();
    expect(main.getByText(book2.magazine)).toBeInTheDocument();

    expect(navigation.getByText("Update")).toBeInTheDocument();
    expect(navigation.getByText("新着のみ")).toBeInTheDocument();
  });
  it("when raise server error", async () => {
    const book1 = fakeBook();
    const book2 = fakeBook();
    async function* mock() {
      yield {books: [book1], progress: 50};
      throw new Error(`503: ${book2.anchor}`);
    }
    (buildBookReader as jest.Mock).mockImplementation(mock);

    act(() => {
      render(<BookshelfContainer url={faker.internet.url()} />);
    });

    await waitFor(() => expect(screen.getByAltText(book1.title)).toBeInTheDocument());

    const main = within(screen.getByAltText(book1.title).closest("main")!);
    expect(main.getByAltText(book1.title)).toBeInTheDocument();
    expect(main.getByText(book1.magazine)).toBeInTheDocument();

    const navigation = within(screen.getByRole("navigation"));
    expect(navigation.getByText("Resume")).toBeInTheDocument();
    expect(navigation.getByText("新着のみ")).toBeInTheDocument();

    expect(screen.getByRole("progressbar")).not.toHaveClass("progress-bar-animated");
  });
  it("when raise server error and resume", async () => {
    const book1 = fakeBook();
    const book2 = fakeBook();

    (buildBookReader as jest.Mock).mockImplementation(async function* mock() {
      yield {books: [book1], progress: 50};
      throw new Error(`503: ${book2.anchor}`);
    });

    act(() => {
      render(<BookshelfContainer url={faker.internet.url()} />);
    });

    await waitFor(() => expect(screen.getByAltText(book1.title)).toBeInTheDocument());
    (() => {
      const main = within(screen.getByAltText(book1.title).closest("main")!);

      expect(main.getByAltText(book1.title)).toBeInTheDocument();
      expect(main.getByText(book1.magazine)).toBeInTheDocument();
    })();

    expect(screen.getByRole("progressbar")).not.toHaveClass("progress-bar-animated");

    const navigation = within(screen.getByRole("navigation"));
    const button = navigation.getByText("Resume");
    expect(button).toBeInTheDocument();
    expect(navigation.getByText("新着のみ")).toBeInTheDocument();

    (buildBookReader as jest.Mock).mockImplementation(async function* mock() {
      yield {books: [book2], progress: 100};
    });

    act(() => {
      button.click();
    });
    await waitFor(() => expect(screen.getByAltText(book2.title)).toBeInTheDocument());

    (() => {
      const main = within(screen.getByAltText(book2.title).closest("main")!);

      expect(main.getByAltText(book2.title)).toBeInTheDocument();
      expect(main.getByText(book2.magazine)).toBeInTheDocument();
    })();

    expect(navigation.getByText("Update")).toBeInTheDocument();
    expect(navigation.getByText("新着のみ")).toBeInTheDocument();

    expect(screen.queryByRole("progressbar")).toBeNull();
  });
  it("when stored in local storage", async () => {
    const book0 = fakeBook();
    const book1 = fakeBook();
    async function* mock() {
      yield {books: [book1], progress: 100};
    }

    (buildBookReader as jest.Mock).mockImplementation(mock);

    const url = faker.internet.url();
    localStorage.setItem(
      url,
      JSON.stringify({
        url: url,
        title: url,
        books: [book0],
        updatedAt: Date.now(),
      })
    );

    act(() => {
      render(<BookshelfContainer url={url} />);
    });

    await waitFor(() => expect(screen.getByAltText(book0.title)).toBeInTheDocument());

    const main = within(screen.getByAltText(book0.title).closest("main")!);
    expect(main.getByAltText(book0.title)).toBeInTheDocument();
    expect(main.getByText(book0.magazine)).toBeInTheDocument();

    expect(screen.queryByAltText(book1.title)).toBeNull();

    const navigation = within(screen.getByRole("navigation"));
    expect(navigation.getByText("Update")).toBeInTheDocument();
    expect(navigation.getByText("全て")).toBeInTheDocument();
  });
  it("when stored in local storage and start", async () => {
    const book0 = fakeBook();
    const book1 = fakeBook();
    async function* mock() {
      yield {books: [book1], progress: 100};
    }

    (buildBookReader as jest.Mock).mockImplementation(mock);

    const url = faker.internet.url();
    localStorage.setItem(
      url,
      JSON.stringify({
        url: url,
        title: url,
        books: [book0],
        updatedAt: Date.now(),
      })
    );

    act(() => {
      render(<BookshelfContainer url={url} />);
    });

    await waitFor(() => expect(screen.getByAltText(book0.title)).toBeInTheDocument());

    (() => {
      const main = within(screen.getByAltText(book0.title).closest("main")!);

      const image = main.getByAltText(book0.title);
      expect(image).toBeInTheDocument();
      expect(image.classList.contains("img-thumbnail")).toBeFalsy();
      expect(main.getByText(book0.magazine)).toBeInTheDocument();
    })();

    expect(screen.queryByAltText(book1.title)).toBeNull();

    const navigation = within(screen.getByRole("navigation"));
    const button = navigation.getByText("Update");
    expect(navigation.getByText("全て")).toBeInTheDocument();

    act(() => {
      button.click();
    });

    await waitFor(() => expect(screen.getByAltText(book1.title)).toBeInTheDocument());

    expect(screen.queryByAltText(book0.title)).toBeNull();

    (() => {
      const main = within(screen.getByAltText(book1.title).closest("main")!);

      const image = main.getByAltText(book1.title);
      expect(image).toBeInTheDocument();
      expect(image.classList.contains("img-thumbnail")).toBeTruthy();
      expect(main.getByText(book1.magazine)).toBeInTheDocument();
    })();

    expect(navigation.getByText("新着のみ")).toBeInTheDocument();
  });
});
