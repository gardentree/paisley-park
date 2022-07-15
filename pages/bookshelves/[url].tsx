import type {NextPage} from "next";
import type React from "react";
import {useRouter} from "next/router";
import BookshelfContainer from "@/components/BookshelfContainer";

const Bookshelves: NextPage = () => {
  const router = useRouter();
  const {url} = router.query;

  return <BookshelfContainer url={url as string} />;
};

export default Bookshelves;
