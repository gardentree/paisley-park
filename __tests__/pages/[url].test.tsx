import {render, screen} from "@testing-library/react";
import {crawlComics, extractMagazine, crawlPagination} from "@/pages/api/comics/[url]";

describe(crawlComics, () => {
  it("when success", () => {
    document.body.innerHTML = `
      <div class="s-main-slot">
        <div class="s-result-item">
          <div>
            <img src="1.jpg"/>
          </div>
          <div>
            <h2>鋼の錬金術師 1巻 (デジタル版ガンガンコミックス)</h2>
            <div>
              <a href="/1">「鋼の錬金術師」全27巻中の1巻</a>
            </div>
          </div>
        </div>
        <div class="s-result-item">
          <div>
            <img src="2.jpg"/>
          </div>
          <div>
            <h2>ARMS（１） (少年サンデーコミックス)</h2>
            <div>
              <a href="/2">「ＡＲＭＳ」全22巻中の1巻 </a>
            </div>
          </div>
        </div>
      </div>
    `;

    const actual = crawlComics(document);
    expect(actual).toStrictEqual([
      {
        title: "鋼の錬金術師",
        magazine: "デジタル版ガンガンコミックス",
        anchor: "http://localhost/1",
        image: "http://localhost/1.jpg",
      },
      {
        title: "ＡＲＭＳ",
        magazine: "少年サンデーコミックス",
        anchor: "http://localhost/2",
        image: "http://localhost/2.jpg",
      },
    ]);
  });
});

describe(extractMagazine, () => {
  it("when magazine is present", () => {
    const section = document.createElement("div");
    section.innerHTML = "<h2>鋼の錬金術師 1巻 (デジタル版ガンガンコミックス)</h2>";

    const actual = extractMagazine(section);
    expect(actual).toBe("デジタル版ガンガンコミックス");
  });
  it("when magazine is not present", () => {
    const section = document.createElement("div");
    section.innerHTML = "<h2>鋼の錬金術師 1巻</h2>";

    const actual = extractMagazine(section);
    expect(actual).toBe("");
  });
  it("when magazine is not present with parentheses", () => {
    const section = document.createElement("div");
    section.innerHTML = "<h2>鋼の(錬金)術師 1巻</h2>";

    const actual = extractMagazine(section);
    expect(actual).toBe("");
  });
});

describe(crawlPagination, () => {
  it("when middle page", () => {
    document.body.innerHTML = `
      <div class="s-main-slot">
        <div class="s-result-item">
          <div>
            <div class="s-pagination-container">
              <span class="s-pagination-strip">
                <a href="?page=1" class="s-pagination-item">前へ</a>
                <a href="?page=1" class="s-pagination-item">1</a>
                <span class="s-pagination-item">2</span>
                <a href="?page=3" class="s-pagination-item">3</a>
                <span class="s-pagination-item"></span>
                <span class="s-pagination-item">400</span>
                <a href="?page=3" class="s-pagination-item">次へ</a>
              </span>
            </div>
          </div>
        </div>
      </div>
    `;

    jsdom.reconfigure({url: "http://localhost/?page=2"});

    const actual = crawlPagination(document);
    expect(actual).toStrictEqual({next: "http://localhost/?page=3", numerator: 2, denominator: 400});
  });
});
