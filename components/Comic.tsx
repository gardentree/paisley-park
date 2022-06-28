import type React from "react";
import {OverlayTrigger, Tooltip} from "react-bootstrap";
import styles from "../styles/Comic.module.css";

interface Props {
  attributes: Comic;
}

export default function Comic(props: Props) {
  const {attributes} = props;

  return (
    <a href={attributes.anchor} target="_blank">
      <OverlayTrigger placement="bottom" overlay={<Tooltip id={`tooltip-bottom`}>{attributes.title}</Tooltip>}>
        <img className={styles.cover} src={attributes.image} alt={attributes.title}></img>
      </OverlayTrigger>
    </a>
  );
}
