import type React from "react";
import {Form, FormControl} from "react-bootstrap";
import styles from "../styles/Entry.module.css";

interface Props {
  entry(url: string): void;
}

export default function Entry(props: Props) {
  const {entry} = props;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    entry(event.currentTarget.url.value);
  };

  return (
    <div className={styles.container}>
      <Form onSubmit={handleSubmit} className="d-flex">
        <FormControl name="url" type="url" placeholder="Enter url" defaultValue="https://www.amazon.co.jp/s?rh=n%3A8486051051&fs=true" />
      </Form>
    </div>
  );
}
