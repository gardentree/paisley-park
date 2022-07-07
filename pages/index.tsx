import type {NextPage} from "next";
import type React from "react";
import {useState} from "react";
import Entry from "@/components/Entry";
import BookshelfContainer from "@/components/BookshelfContainer";

const Home: NextPage = () => {
  const [source, setSource] = useState<string | null>(null);

  const entry = (url: string) => {
    setSource(url);
  };

  let component;
  if (source) {
    return <BookshelfContainer url={source} />;
  } else {
    return <Entry entry={entry} />;
  }
};

export default Home;
