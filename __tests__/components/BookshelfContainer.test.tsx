import {render, screen, waitFor} from "@testing-library/react";
import {act} from "react-dom/test-utils";
import {faker} from "@faker-js/faker";
import BookshelfContainer from "@/components/BookshelfContainer";
import buildBookReader from "@/borders/books";

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
  });
  it("when raise server error", async () => {
    const book1 = fakeBook();
    async function* mock() {
      yield {books: [book1], progress: 50};
      throw new Error("Server Error");
    }
    (buildBookReader as jest.Mock).mockImplementation(mock);

    act(() => {
      render(<BookshelfContainer url={faker.internet.url()} />);
    });

    await waitFor(() => expect(screen.getByAltText(book1.title)).toBeInTheDocument());

    expect(screen.getByAltText(book1.title)).toBeInTheDocument();
    expect(screen.getByText(book1.magazine)).toBeInTheDocument();

    expect(screen.getByRole("progressbar")).not.toHaveClass("progress-bar-animated");
  });
});
