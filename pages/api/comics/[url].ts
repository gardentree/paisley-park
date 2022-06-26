import type {NextApiRequest, NextApiResponse} from "next";
import jsdom from "jsdom";

const TITLE_PATTRN = /「(.+)」\s*全\d+[巻話]中の\d+[巻話]/;
const HEAD_PATTRN = /.+\((.+)\)/;

function crawlComics(document: Document): Comic[] {
  const comics: Map<string, Comic> = new Map();

  document.querySelectorAll(".s-main-slot > .s-result-item").forEach((section) => {
    try {
      const anchor: HTMLAnchorElement | null = section.querySelector("h2 + div a:first-child");
      if (!anchor) {
        return;
      }

      const title = TITLE_PATTRN.exec(anchor.textContent!.trim())![1];
      if (!comics.has(title)) {
        const magazine = extractMagazine(section);

        comics.set(title, {
          title: title,
          magazine: magazine,
          anchor: new URL(anchor.href, "https://www.amazon.co.jp").toString(),
          image: section.querySelector("img")!.src,
        });
      }
    } catch (error) {
      console.error(error);

      throw new Error(section.innerHTML);
    }
  });

  return Array.from(comics.values());
}
function extractMagazine(section: Element): string {
  const head = section.querySelector("h2")!;
  const matcher = HEAD_PATTRN.exec(head.textContent!.trim());

  return matcher ? matcher[1] : "";
}

function crawlPagination(document: Document): Pagination {
  const paginations = document.querySelectorAll(".s-main-slot > .s-result-item .s-pagination-container > .s-pagination-strip > *");
  const next = paginations[paginations.length - 1] as HTMLSpanElement | HTMLAnchorElement;
  const numerator = parseInt(new URL(document.location.href).searchParams.get("page") || "1");
  const denominator = paginations[paginations.length - 2].textContent!;

  return {
    next: (next as HTMLAnchorElement).href,
    numerator: numerator,
    denominator: parseInt(denominator),
  };
}

export default function handler(request: NextApiRequest, response: NextApiResponse) {
  const {url} = request.query as {url: string};

  return fetch(new URL(url, "https://www.amazon.co.jp"))
    .then(async (response) => {
      const dom = new jsdom.JSDOM(await response.text(), {contentType: "text/html"});
      dom.reconfigure({url: response.url});
      return dom.window.document;
    })
    .then((document) => {
      const comics = crawlComics(document);
      const pagination = crawlPagination(document);

      response.status(200).json({comics, pagination});
    })
    .catch((error) => {
      console.error(error);

      response.status(500).json({
        message: error.message,
      });
    });
}
