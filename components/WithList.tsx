import type React from "react";
import {cloneElement, ReactElement, ReactNode, useState} from "react";
import {ListGroup} from "react-bootstrap";
import styles from "@/styles/WithList.module.css";
import Link from "next/link";

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
        <ListGroup.Item onClick={() => onClick(key)} action key={key}>
          {title}
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
