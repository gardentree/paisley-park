import type React from "react";
import {OverlayTrigger, Tooltip, Image} from "react-bootstrap";
import styles from "@/styles/Book.module.css";
import {Heat} from "@/libraries/heat";

interface Props {
  attributes: BookWithState;
}

const HEAT = new Heat(1024);

export default function Book(props: Props) {
  const {attributes} = props;

  return (
    <a href={attributes.anchor} target="_blank" rel="noreferrer">
      <OverlayTrigger
        placement="bottom"
        overlay={
          <Tooltip id={`tooltip-bottom`}>
            {attributes.title}
            <br />☆{attributes.review.star}({attributes.review.count})
          </Tooltip>
        }
      >
        <Image style={{border: `solid 2px #${HEAT.measure(attributes.review.count)}`}} className={styles.cover} src={attributes.image} alt={attributes.title} thumbnail={attributes.newArrival} loading="lazy" />
      </OverlayTrigger>
    </a>
  );
}
