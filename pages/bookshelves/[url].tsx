import type {NextPage} from "next";
import type React from "react";
import {useRouter} from "next/router";

import dynamic from "next/dynamic";
const BookshelfContainer = dynamic(() => import("@/components/BookshelfContainer"), {ssr: false});

const Bookshelves: NextPage = () => {
  const router = useRouter();
  const {url} = router.query;

  if (!router.isReady) {
    return null;
  }

  return <BookshelfContainer url={url as string} />;
};

export default Bookshelves;
