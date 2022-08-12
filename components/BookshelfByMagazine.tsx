import type React from "react";
import {Container, Row, Col, Spinner, Accordion, Nav} from "react-bootstrap";
import Book from "./Book";
import {useSetWithLocalStorage} from "@/hooks/LocalStorage";
import * as Scroll from "react-scroll";
import styles from "@/styles/BookshelfByMagazine.module.css";

interface Props {
  books: BookWithState[];
  mode: DisplayMode;
}

export default function BookshelfByMagazine(props: Props) {
  const {books, mode} = props;
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
    <Container>
      <Row>
        <Col md={2}>
          <Nav className={styles.sidebar}>
            <ul className="list-unstyled">
              {entries.map(([magazine]) => {
                return (
                  <li key={magazine}>
                    <Scroll.Link to={magazine} className={exclusions.has(magazine) ? "link-secondary" : "link-light"} offset={-72}>
                      {magazine}
                    </Scroll.Link>
                  </li>
                );
              })}
            </ul>
          </Nav>
        </Col>
        <Col md={10}>
          <Container fluid="md">
            <main className={styles.list}>
              {entries.map(([magazine, books]) => {
                return (
                  <Accordion id={magazine} defaultActiveKey={exclusions.has(magazine) ? null : "0"} flush className={styles.magazine} key={magazine}>
                    <Accordion.Item eventKey="0">
                      <Accordion.Header onClick={action}>{magazine}</Accordion.Header>
                      <Accordion.Body>
                        <Row className={styles.books}>
                          {Array.from(books.values()).map((book) => {
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
            </main>
          </Container>
        </Col>
      </Row>
    </Container>
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
