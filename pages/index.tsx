import type {NextPage} from "next";
import type React from "react";
import {useState} from "react";
import Entry from "../components/Entry";
import ComicList from "../components/ComicList";
import Progress from "../components/Progress";

const Home: NextPage = () => {
  const [comics, setComics] = useState<Map<string, Comic>>(new Map());
  const [progress, setProgress] = useState(0);
  const [source, setSource] = useState<string | null>(null);

  const load = (url: string) => {
    console.log(url);

    fetch(`api/comics/${encodeURIComponent(url)}`)
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(JSON.stringify(data));
        }

        return data;
      })
      .then((payload: Payload) => {
        setComics((previous) => {
          const newComics = new Map(previous);

          payload.comics.forEach((comic) => {
            if (!newComics.has(comic.title)) {
              newComics.set(comic.title, comic);
            }
          });

          return newComics;
        });

        if (payload.pagination.next) {
          setProgress(Math.ceil((payload.pagination.numerator * 100) / payload.pagination.denominator));

          setTimeout(() => {
            load(payload.pagination.next!);
          }, 500);
        } else {
          setProgress(100);
        }
      })
      .catch((error) => {
        alert(error);
      });
  };

  const entry = (url: string) => {
    setSource(url);
    setComics(new Map());
    setProgress(0);

    load(url);
  };

  let component;
  if (source) {
    component = (
      <>
        <ComicList comics={comics} />
        <Progress now={progress} />
      </>
    );
  } else {
    component = <Entry entry={entry} />;
  }

  return component;
};

export default Home;
