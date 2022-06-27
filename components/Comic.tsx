import type React from "react";
import styles from "../styles/Comic.module.css";

interface Props {
  attributes: Comic;
}

export default function Comic(props: Props) {
  const {attributes} = props;

  return (
    <a href={attributes.anchor}>
      <img className={styles.cover} src={attributes.image} alt={attributes.title}></img>
    </a>
  );
}
