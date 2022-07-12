import type React from "react";
import {Container, Row, Col, Spinner, Accordion} from "react-bootstrap";
import Book from "./Book";
import {useSetWithLocalStorage} from "@/hooks/LocalStorage";
import styles from "@/styles/Bookshelf.module.css";

interface Props {
  books: Map<string, BookWithState>;
}

export default function Bookshelf(props: Props) {
  const {books: books} = props;
  const [exclusions, toggleExclustion] = useSetWithLocalStorage<string>("exclusions");

  if (books.size <= 0) {
    return (
      <div className={styles.spinner}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  const entries = Array.from(groupByMagazine(books).entries());

  const action = (event: React.MouseEvent) => {
    const magazine = event.currentTarget.closest(".accordion-header")!.textContent!;

    toggleExclustion(magazine);
  };

  return (
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
  );
}

function groupByMagazine(books: Map<string, BookWithState>): Map<string, Map<string, BookWithState>> {
  const magazines = new Map<string, Map<string, BookWithState>>();

  Array.from(books.values()).forEach((book) => {
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
