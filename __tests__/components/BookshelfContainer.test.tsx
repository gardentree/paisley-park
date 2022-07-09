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
    const mockRead = jest
      .fn()
      .mockReturnValueOnce(Promise.resolve({books: [book1], progress: 100}))
      .mockReturnValueOnce(Promise.resolve(null));

    (buildBookReader as jest.Mock).mockReturnValue({
      read: mockRead,
    });

    act(() => {
      render(<BookshelfContainer url={faker.internet.url()} />);
    });

    await waitFor(() => expect(mockRead.mock.calls.length).toBe(2));

    expect(screen.getByAltText(book1.title)).toBeInTheDocument();
    expect(screen.getByText(book1.magazine)).toBeInTheDocument();
  });
  it("when multi book", async () => {
    const book1 = fakeBook();
    const book2 = fakeBook();
    const mockRead = jest
      .fn()
      .mockReturnValueOnce(Promise.resolve({books: [book1], progress: 50}))
      .mockReturnValueOnce(Promise.resolve({books: [book1, book2], progress: 100}))
      .mockReturnValueOnce(Promise.resolve(null));

    (buildBookReader as jest.Mock).mockReturnValue({
      read: mockRead,
    });

    act(() => {
      render(<BookshelfContainer url={faker.internet.url()} />);
    });

    await waitFor(() => expect(mockRead.mock.calls.length).toBe(3));

    expect(screen.getByAltText(book1.title)).toBeInTheDocument();
    expect(screen.getByText(book1.magazine)).toBeInTheDocument();

    expect(screen.getByAltText(book2.title)).toBeInTheDocument();
    expect(screen.getByText(book2.magazine)).toBeInTheDocument();
  });
  it("when raise server error", async () => {
    const book1 = fakeBook();
    const mockRead = jest
      .fn()
      .mockReturnValueOnce(Promise.resolve({books: [book1], progress: 50}))
      .mockReturnValueOnce(Promise.reject("server error"));

    (buildBookReader as jest.Mock).mockReturnValue({
      read: mockRead,
    });

    act(() => {
      render(<BookshelfContainer url={faker.internet.url()} />);
    });

    await waitFor(() => expect(mockRead.mock.calls.length).toBe(2));

    expect(screen.getByAltText(book1.title)).toBeInTheDocument();
    expect(screen.getByText(book1.magazine)).toBeInTheDocument();

    expect(screen.getByRole("progressbar")).not.toHaveClass("progress-bar-animated");
  });
});
