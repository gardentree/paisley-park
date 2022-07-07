import type React from "react";
import {OverlayTrigger, Tooltip} from "react-bootstrap";
import styles from "@/styles/Book.module.css";

interface Props {
  attributes: Book;
}

export default function Book(props: Props) {
  const {attributes} = props;

  return (
    <a href={attributes.anchor} target="_blank" rel="noreferrer">
      <OverlayTrigger placement="bottom" overlay={<Tooltip id={`tooltip-bottom`}>{attributes.title}</Tooltip>}>
        <img className={styles.cover} src={attributes.image} alt={attributes.title}></img>
      </OverlayTrigger>
    </a>
  );
}
