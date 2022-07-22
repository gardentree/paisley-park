import {render, screen, waitFor} from "@testing-library/react";
import {act} from "react-dom/test-utils";
import {faker} from "@faker-js/faker";
import BookshelfContainer from "@/components/BookshelfContainer";
import buildBookReader, {FetchError} from "@/borders/books";

jest.mock("@/borders/books");

function fakeBook(): Book {
  return {
    title: faker.unique(faker.music.songName),
    magazine: faker.music.genre(),
    anchor: faker.internet.url(),
    image: faker.internet.avatar(),
  };
}

describe(BookshelfContainer, () => {
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

    expect(screen.getByAltText(book1.title)).toBeInTheDocument();
    expect(screen.getByText(book1.magazine)).toBeInTheDocument();

    expect(screen.getByText("Update")).toBeInTheDocument();
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

    expect(screen.getByAltText(book1.title)).toBeInTheDocument();
    expect(screen.getByText(book1.magazine)).toBeInTheDocument();

    expect(screen.getByAltText(book2.title)).toBeInTheDocument();
    expect(screen.getByText(book2.magazine)).toBeInTheDocument();

    expect(screen.getByText("Update")).toBeInTheDocument();
  });
  it("when raise server error", async () => {
    const book1 = fakeBook();
    const book2 = fakeBook();
    async function* mock() {
      yield {books: [book1], progress: 50};
      throw new FetchError(book2.anchor, 503);
    }
    (buildBookReader as jest.Mock).mockImplementation(mock);

    act(() => {
      render(<BookshelfContainer url={faker.internet.url()} />);
    });

    await waitFor(() => expect(screen.getByAltText(book1.title)).toBeInTheDocument());

    expect(screen.getByAltText(book1.title)).toBeInTheDocument();
    expect(screen.getByText(book1.magazine)).toBeInTheDocument();

    expect(screen.getByRole("progressbar")).not.toHaveClass("progress-bar-animated");
    expect(screen.getByText("Resume")).toBeInTheDocument();
  });
  it("when raise server error and resume", async () => {
    const book1 = fakeBook();
    const book2 = fakeBook();

    (buildBookReader as jest.Mock).mockImplementation(async function* mock() {
      yield {books: [book1], progress: 50};
      throw new FetchError(book2.anchor, 503);
    });

    act(() => {
      render(<BookshelfContainer url={faker.internet.url()} />);
    });

    await waitFor(() => expect(screen.getByAltText(book1.title)).toBeInTheDocument());

    expect(screen.getByAltText(book1.title)).toBeInTheDocument();
    expect(screen.getByText(book1.magazine)).toBeInTheDocument();

    expect(screen.getByRole("progressbar")).not.toHaveClass("progress-bar-animated");

    const button = screen.getByText("Resume");
    expect(button).toBeInTheDocument();

    (buildBookReader as jest.Mock).mockImplementation(async function* mock() {
      yield {books: [book2], progress: 100};
    });

    act(() => {
      button.click();
    });
    await waitFor(() => expect(screen.getByAltText(book2.title)).toBeInTheDocument());

    expect(screen.getByAltText(book2.title)).toBeInTheDocument();
    expect(screen.getByText(book2.magazine)).toBeInTheDocument();

    expect(screen.queryByRole("progressbar")).toBeNull();
    expect(screen.getByText("Update")).toBeInTheDocument();
  });
  it("when stored in local storage", async () => {
    const book0 = fakeBook();
    const book1 = fakeBook();
    async function* mock() {
      yield {books: [book1], progress: 100};
    }

    (buildBookReader as jest.Mock).mockImplementation(mock);

    const url = faker.internet.url();
    jest.spyOn(window.localStorage.__proto__, "getItem").mockImplementation((key) => {
      switch (key) {
        case "exclusions":
          return null;
        case url:
          const campaign = {
            url: key,
            title: key,
            books: [book0],
            updatedAt: Date.now(),
          };
          return JSON.stringify(campaign);
        default:
          throw new Error();
      }
    });

    act(() => {
      render(<BookshelfContainer url={url} />);
    });

    await waitFor(() => expect(screen.getByAltText(book0.title)).toBeInTheDocument());

    expect(screen.getByAltText(book0.title)).toBeInTheDocument();
    expect(screen.getByText(book0.magazine)).toBeInTheDocument();

    expect(screen.queryByAltText(book1.title)).toBeNull();

    expect(screen.getByText("Update")).toBeInTheDocument();
  });
  it("when stored in local storage and start", async () => {
    const book0 = fakeBook();
    const book1 = fakeBook();
    async function* mock() {
      yield {books: [book1], progress: 100};
    }

    (buildBookReader as jest.Mock).mockImplementation(mock);

    const url = faker.internet.url();
    jest.spyOn(window.localStorage.__proto__, "getItem").mockImplementation((key) => {
      switch (key) {
        case "exclusions":
          return null;
        case url:
          const campaign = {
            url: key,
            title: key,
            books: [book0],
            updatedAt: Date.now(),
          };
          return JSON.stringify(campaign);
        default:
          throw new Error();
      }
    });

    act(() => {
      render(<BookshelfContainer url={url} />);
    });

    await waitFor(() => expect(screen.getByAltText(book0.title)).toBeInTheDocument());

    (() => {
      const image = screen.getByAltText(book0.title);
      expect(image).toBeInTheDocument();
      expect(image.classList.contains("img-thumbnail")).toBeFalsy();
      expect(screen.getByText(book0.magazine)).toBeInTheDocument();
    })();

    expect(screen.queryByAltText(book1.title)).toBeNull();

    const button = screen.getByText("Update");
    act(() => {
      button.click();
    });

    await waitFor(() => expect(screen.getByAltText(book1.title)).toBeInTheDocument());

    expect(screen.queryByAltText(book0.title)).toBeNull();

    (() => {
      const image = screen.getByAltText(book1.title);
      expect(image).toBeInTheDocument();
      expect(image.classList.contains("img-thumbnail")).toBeTruthy();
      expect(screen.getByText(book1.magazine)).toBeInTheDocument();
    })();
  });
});
