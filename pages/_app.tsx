import type {AppProps} from "next/app";
import Head from "next/head";
import "../styles/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";

function PaisleyPark({Component, pageProps}: AppProps) {
  return (
    <>
      <Head>
        <title>Paisley Park</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default PaisleyPark;
