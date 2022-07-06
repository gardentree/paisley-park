import type React from "react";
import ComicList from "./ComicList";
import Progress from "./Progress";
import readBooks from "@/borders/books";
import {useState, useEffect} from "react";

interface Props {
  url: string;
}

export default function BookshelfContainer(props: Props) {
  const {url} = props;
  const [comics, setComics] = useState(new Map());
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    readBooks(url, (newComics, newProgress) => {
      setComics(newComics);
      setProgress(newProgress);
    });
  }, [url]);

  return (
    <>
      <ComicList comics={comics} />
      <Progress now={progress} />
    </>
  );
}
