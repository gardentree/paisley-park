import type React from "react";
import {Container, Card, Row, Col, Spinner} from "react-bootstrap";
import styles from "../styles/ComicList.module.css";

interface Props {
  comics: Map<string, Comic>;
}

function groupByMagazine(comics: Map<string, Comic>): Map<string, Map<string, Comic>> {
  const magazines = new Map<string, Map<string, Comic>>();

  Array.from(comics.values()).forEach((comic) => {
    let magazine;
    if (magazines.has(comic.magazine)) {
      magazine = magazines.get(comic.magazine);
    } else {
      magazine = new Map();
      magazines.set(comic.magazine, magazine);
    }

    if (!magazine!.has(comic.title)) {
      magazine!.set(comic.title, comic);
    }
  });

  return magazines;
}

export default function ComicList(props: Props) {
  const {comics} = props;

  if (comics.size <= 0) {
    return (
      <div className={styles.spinner}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  const entries = Array.from(groupByMagazine(comics).entries());

  return (
    <Container fluid="md">
      <div className={styles.comics}>
        {entries.map(([name, magazine]) => {
          return (
            <Card className={styles.comic} key={name}>
              <Card.Header>{name}</Card.Header>
              <Card.Body>
                <Row>
                  {Array.from(magazine.values()).map((comic) => {
                    return (
                      <Col key={comic.title}>
                        <a href={comic.anchor}>
                          <img className={styles.cover} src={comic.image} alt={comic.title}></img>
                        </a>
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
