import type {NextApiRequest, NextApiResponse} from "next";
import jsdom from "jsdom";

const TITLE_PATTRN = /「(.+)」\s*全\d+[巻話]中の\d+[巻話]/;
const HEAD_PATTRN = /^.+\((.{3,})\)$/;

export function crawlBooks(document: Document): Book[] {
  const books: Map<string, Book> = new Map();

  document.querySelectorAll(".s-main-slot > .s-result-item").forEach((section) => {
    try {
      const anchor: HTMLAnchorElement | null = section.querySelector("h2 + div a:first-child");
      if (!anchor) {
        return;
      }

      const title = TITLE_PATTRN.exec(anchor.textContent!.trim())![1];
      if (!books.has(title)) {
        const magazine = extractMagazine(section);

        books.set(title, {
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

  return Array.from(books.values());
}
export function extractMagazine(section: Element): string {
  const head = section.querySelector("h2")!;
  const matcher = HEAD_PATTRN.exec(head.textContent!.trim());

  return matcher ? matcher[1] : "(その他)";
}

export function crawlPagination(document: Document): Pagination {
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

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  const {url} = request.query as {url: string};

  try {
    const amazon = await fetchWithRetry(new URL(url, "https://www.amazon.co.jp"), 3);
    if (!amazon.ok) {
      throw new Error(JSON.stringify({status: response.status, url: amazon.url}));
    }

    const dom = new jsdom.JSDOM(await amazon.text(), {contentType: "text/html"});
    dom.reconfigure({url: amazon.url});
    const document = dom.window.document;

    const books = crawlBooks(document);
    const pagination = crawlPagination(document);

    response.status(200).json({books, pagination});
  } catch (error) {
    console.error(error);

    const message = error instanceof Error ? error.message : error;
    response.status(500).json({
      message,
    });
  }
}

export async function fetchWithRetry(url: URL | string, retry: number): Promise<Response> {
  const response = await fetch(url);
  if (![503].includes(response.status) || retry <= 0) {
    return response;
  }

  console.error(`${response.status}: ${url}`);
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return fetchWithRetry(url, --retry);
}
