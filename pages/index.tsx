import type {NextPage} from "next";
import type React from "react";
import {useRouter} from "next/router";
import {Form, FormControl} from "react-bootstrap";
import styles from "@/styles/Entry.module.css";

const Home: NextPage = () => {
  const router = useRouter();

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    router.push(`/bookshelves/${encodeURIComponent(event.currentTarget.url.value)}`);
  };

  return (
    <div className={styles.container}>
      <Form onSubmit={handleSubmit} className="d-flex">
        <FormControl name="url" type="url" placeholder="Enter url" defaultValue="https://www.amazon.co.jp/s?rh=n%3A8486051051&fs=true" />
      </Form>
    </div>
  );
};

export default Home;
