import type React from "react";
import {OverlayTrigger, Tooltip, Image} from "react-bootstrap";
import styles from "@/styles/Book.module.css";

interface Props {
  attributes: BookWithState;
}

export default function Book(props: Props) {
  const {attributes} = props;

  return (
    <a href={attributes.anchor} target="_blank" rel="noreferrer">
      <OverlayTrigger
        placement="bottom"
        overlay={
          <Tooltip id={`tooltip-bottom`}>
            {attributes.title}
          </Tooltip>
        }
      >
        <Image className={styles.cover} src={attributes.image} alt={attributes.title} thumbnail={attributes.newArrival} loading="lazy" />
      </OverlayTrigger>
    </a>
  );
}
