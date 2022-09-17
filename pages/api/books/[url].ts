import type {NextApiRequest, NextApiResponse} from "next";
import jsdom from "jsdom";
import fs from "fs";
import pathname from "path";
import {IncomingHttpHeaders} from "http";

const TITLE_PATTRN = /^(?:第\s*\d+\s*[巻章]\s*\(全\s*\d+\s*[巻章]\):\s*(.+)|「(.+)」\s*全\d+[巻話]中の\d+[巻話])$/;
const HEAD_PATTRN = /^.+\((.{3,})\)$/;
const REVIEW_PATTEN = /5つ星のうち(\d\.\d)\s+([\d,]+)/;

const DEVELOPMENT = process.env.NODE_ENV === "development";

export function crawlBooks(document: Document): Book[] {
  const books: Map<string, Book> = new Map();

  document.querySelectorAll(".s-main-slot > .s-result-item").forEach((section) => {
    try {
      const anchor: HTMLAnchorElement | null = section.querySelector("h2 + div a:first-child");
      if (!anchor) {
        return;
      }

      const title = extractTitle(anchor);
      if (!books.has(title)) {
        const magazine = extractMagazine(section);

        books.set(title, {
          title: title,
          magazine: magazine,
          anchor: new URL(anchor.href, "https://www.amazon.co.jp").toString(),
          image: section.querySelector("img")!.src,
          review: extractReview(section),
        });
      }
    } catch (error) {
      console.error(error);

      throw new Error(section.innerHTML);
    }
  });

  return Array.from(books.values());
}
export function extractTitle(section: Element) {
  const content = section.textContent!.trim();
  const matcher = TITLE_PATTRN.exec(content);

  if (matcher) {
    return matcher[1] || matcher[2];
  } else {
    return content;
  }
}
export function extractMagazine(section: Element): string {
  const head = section.querySelector("h2")!;
  const matcher = HEAD_PATTRN.exec(head.textContent!.trim());

  return matcher ? matcher[1] : "(その他)";
}
export function extractReview(section: Element): Review {
  const matcher = REVIEW_PATTEN.exec(section.textContent!)!;
  if (matcher) {
    const star = matcher[1];
    const count = matcher[2];

    return {
      star: Number.parseFloat(star),
      count: Number.parseInt(count.replaceAll(/,/g, "")),
    };
  } else {
    return {
      star: 0,
      count: 0,
    };
  }
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
    const amazon = await fetch(new URL(url, "https://www.amazon.co.jp"), {headers: relayRequestHeaders(request.headers)});
    if (!amazon.ok) {
      return response.status(amazon.status).json({
        message: amazon.url,
      });
    }

    const dom = new jsdom.JSDOM(await amazon.text(), {contentType: "text/html"});
    dom.reconfigure({url: amazon.url});
    const document = dom.window.document;

    try {
      const books = crawlBooks(document);
      const pagination = crawlPagination(document);

      response.status(200).json({books, pagination});
    } catch (error) {
      console.info(amazon.url);
      console.info(error);

      if (DEVELOPMENT) {
        const temporary = "tmp";
        if (!fs.existsSync(temporary)) {
          await fs.promises.mkdir(temporary);
        }
        fs.writeFile(pathname.join(temporary, encodeURIComponent(amazon.url)), dom.serialize(), (error) => {
          console.error(error);
        });
      }

      return response.status(503).json({
        message: amazon.url,
      });
    }
  } catch (error) {
    console.error(error);

    const message = error instanceof Error ? error.message : error;
    response.status(500).json({
      message,
    });
  }
}
function relayRequestHeaders(original: IncomingHttpHeaders): Record<string, string> {
  const headers: Record<string, string> = {};

  Object.keys(original)
    .filter((key) => !["host", "set-cookie"].includes(key))
    .forEach((key) => {
      headers[key] = original[key] as string;
    });
  headers.host = "www.amazon.co.jp";

  return headers;
}
