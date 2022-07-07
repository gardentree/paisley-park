import type React from "react";
import {Container, Card, Row, Col, Spinner} from "react-bootstrap";
import Book from "./Book";
import styles from "@/styles/Bookshelf.module.css";

interface Props {
  books: Map<string, Book>;
}

function groupByMagazine(books: Map<string, Book>): Map<string, Map<string, Book>> {
  const magazines = new Map<string, Map<string, Book>>();

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

export default function Bookshelf(props: Props) {
  const {books: books} = props;

  if (books.size <= 0) {
    return (
      <div className={styles.spinner}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  const entries = Array.from(groupByMagazine(books).entries());

  return (
    <Container fluid="md">
      <div className={styles.list}>
        {entries.map(([name, magazine]) => {
          return (
            <Card className={styles.magazine} key={name}>
              <Card.Header>{name}</Card.Header>
              <Card.Body>
                <Row className={styles.books}>
                  {Array.from(magazine.values()).map((book) => {
                    return (
                      <Col className={styles.book} md={2} key={book.title}>
                        <Book attributes={book} />
                      </Col>
                    );
                  })}
                </Row>
              </Card.Body>
            </Card>
          );
        })}
      </div>
    </Container>
  );
}
