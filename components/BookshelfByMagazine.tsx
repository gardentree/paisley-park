import type React from "react";
import {ReactElement} from "react";
import {Container, Row, Col, Spinner, Accordion} from "react-bootstrap";
import Book from "./Book";
import {useSetWithLocalStorage} from "@/hooks/LocalStorage";
import styles from "@/styles/BookshelfByMagazine.module.css";

interface Props {
  books: BookWithState[];
  mode: DisplayMode;
  children: ReactElement;
}

export default function BookshelfByMagazine(props: Props) {
  const {books, mode, children: progress} = props;
  const [exclusions, toggleExclustion] = useSetWithLocalStorage<string>("exclusions");

  if (books.length <= 0) {
    return (
      <div className={styles.spinner}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  let filteredBooks;
  switch (mode) {
    case "all":
      filteredBooks = books;
      break;
    case "newArrival":
      filteredBooks = books.filter((book) => book.newArrival);
      break;
  }
  const entries = Array.from(groupByMagazine(filteredBooks).entries());

  const action = (event: React.MouseEvent) => {
    const magazine = event.currentTarget.closest(".accordion-header")!.textContent!;

    toggleExclustion(magazine);
  };

  return (
    <div>
      <Container fluid="md">
        <div className={styles.list}>
          {entries.map(([name, magazine]) => {
            return (
              <Accordion defaultActiveKey={exclusions.has(name) ? null : "0"} flush className={styles.magazine} key={name}>
                <Accordion.Item eventKey="0">
                  <Accordion.Header onClick={action}>{name}</Accordion.Header>
                  <Accordion.Body>
                    <Row className={styles.books}>
                      {Array.from(magazine.values()).map((book) => {
                        return (
                          <Col className={styles.book} md={2} key={book.title}>
                            <Book attributes={book} />
                          </Col>
                        );
                      })}
                    </Row>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            );
          })}
        </div>
      </Container>
      {progress}
    </div>
  );
}

function groupByMagazine(books: BookWithState[]): Map<string, Map<string, BookWithState>> {
  const magazines = new Map<string, Map<string, BookWithState>>();

  Array.from(books).forEach((book) => {
    let magazine;
    if (magazines.has(book.magazine)) {
      magazine = magazines.get(book.magazine);
    } else {
      magazine = new Map();
      magazines.set(book.magazine, magazine);
    }

    if (!magazine!.has(book.title)) {
      magazine!.set(book.title, book);
    }
  });

  return magazines;
}
