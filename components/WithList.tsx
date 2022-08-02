import type React from "react";
import {cloneElement, ReactElement, useState} from "react";
import {Badge, ListGroup} from "react-bootstrap";
import styles from "@/styles/WithList.module.css";

interface Props {
  children: ReactElement;
  items: Record<string, string>;
  onClick(key: string): void;
}

export default function WithList(props: Props) {
  const {children, items, onClick} = props;
  const [focus, setFocus] = useState(false);

  const child = cloneElement(children, {
    onFocus: () => {
      setFocus(true);
    },
    onBlur: () => {
      setTimeout(() => {
        setFocus(false);
      }, 500);
    },
  });

  let selectItems;
  if (focus) {
    selectItems = Object.entries(items).map(([key, title]) => {
      return (
        <ListGroup.Item
          onClick={(event) => {
            event.preventDefault();
            onClick(key);
          }}
          className="d-flex align-items-start"
          action
          key={key}
        >
          <div className="me-auto">{key}</div>
          {key !== title && (
            <Badge bg="primary" pill>
              {title}
            </Badge>
          )}
        </ListGroup.Item>
      );
    });
  }

  return (
    <>
      {child}
      <div className={styles.container}>
        <ListGroup className={styles.list}>{selectItems}</ListGroup>
      </div>
    </>
  );
}
