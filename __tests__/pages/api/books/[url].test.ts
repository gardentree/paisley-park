import {testApiHandler} from "next-test-api-route-handler";
import handler, {crawlBooks, extractMagazine, crawlPagination, extractReview} from "@/pages/api/books/[url]";

describe(handler, () => {
  let fetchSpy: jest.SpyInstance;
  beforeEach(() => {
    fetchSpy = jest.spyOn(global, "fetch");
  });

  it("when sucess", async () => {
    const response = new Response(
      `
      <div class="s-main-slot">
        <div class="s-result-item">
          <div>
            <img src="1.jpg"/>
          </div>
          <div>
            <h2>鋼の錬金術師 1 (デジタル版ガンガンコミックス)</h2>
            <div>
              <a href="/1">第 1 巻 (全 27 巻): 鋼の錬金術師</a>
            </div>
          </div>
          <div>
            <span>5つ星のうち4.7</span>
            <span>2,588</span>
          </div>
        </div>
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
    `,
      {status: 200}
    );
    Object.defineProperty(response, "url", {value: "http://localhost"});

    fetchSpy.mockReturnValue(Promise.resolve(response as unknown as Response));

    await testApiHandler({
      handler,
      url: "api/books",
      params: {url: "/?page=2"},
      test: async ({fetch}) => {
        const response = await fetch({headers: {"user-agent": "Mozilla"}});
        await expect(response.json()).resolves.toStrictEqual({
          books: [
            {
              title: "鋼の錬金術師",
              magazine: "デジタル版ガンガンコミックス",
              anchor: "http://localhost/1",
              image: "http://localhost/1.jpg",
              review: {
                star: 4.7,
                count: 2588,
              },
            },
          ],
          pagination: {
            next: "http://localhost/?page=3",
            numerator: 1,
            denominator: 400,
          },
        });
      },
    });

    expect(fetchSpy).toHaveBeenCalledWith(new URL("https://www.amazon.co.jp/?page=2"), {
      headers: expect.objectContaining({
        host: "www.amazon.co.jp",
        "user-agent": "Mozilla",
      }),
    });
  });

  it("when 503", async () => {
    const response = new Response("503", {status: 503});
    Object.defineProperty(response, "url", {value: "http://localhost"});

    fetchSpy.mockReturnValue(Promise.resolve(response as unknown as Response));

    await testApiHandler({
      handler,
      url: "api/books",
      params: {url: "/?page=2"},
      test: async ({fetch}) => {
        const response = await fetch({headers: {"user-agent": "Mozilla"}});
        expect(response.status).toBe(503);
      },
    });

    expect(fetchSpy).toHaveBeenCalledWith(new URL("https://www.amazon.co.jp/?page=2"), {
      headers: expect.objectContaining({
        host: "www.amazon.co.jp",
        "user-agent": "Mozilla",
      }),
    });
  });

  it("when contents is empty", async () => {
    const response = new Response(`<body><div>empty</div></body>`, {status: 200});
    Object.defineProperty(response, "url", {value: "http://localhost"});

    fetchSpy.mockReturnValue(Promise.resolve(response as unknown as Response));

    await testApiHandler({
      handler,
      url: "api/books",
      params: {url: "/?page=2"},
      test: async ({fetch}) => {
        const response = await fetch({headers: {"user-agent": "Mozilla"}});
        expect(response.status).toBe(503);
      },
    });

    expect(fetchSpy).toHaveBeenCalledWith(new URL("https://www.amazon.co.jp/?page=2"), {
      headers: expect.objectContaining({
        host: "www.amazon.co.jp",
        "user-agent": "Mozilla",
      }),
    });
  });

  afterEach(() => {
    fetchSpy.mockClear();
  });
});

describe(crawlBooks, () => {
  it("when success", () => {
    document.body.innerHTML = `
      <div class="s-main-slot">
        <div class="s-result-item">
          <div>
            <img src="1.jpg"/>
          </div>
          <div>
            <h2>鋼の錬金術師 1 (デジタル版ガンガンコミックス)</h2>
            <div>
              <a href="/1">第 1 巻 (全 27 巻): 鋼の錬金術師</a>
            </div>
            <div>
              <span>5つ星のうち5.0</span>
              <span>2,588</span>
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
            <div>
              <span>5つ星のうち4.7</span>
              <span>588</span>
            </div>
          </div>
        </div>
      </div>
    `;

    const actual = crawlBooks(document);
    expect(actual).toStrictEqual([
      {
        title: "鋼の錬金術師",
        magazine: "デジタル版ガンガンコミックス",
        anchor: "http://localhost/1",
        image: "http://localhost/1.jpg",
        review: {
          star: 5.0,
          count: 2588,
        },
      },
      {
        title: "ＡＲＭＳ",
        magazine: "少年サンデーコミックス",
        anchor: "http://localhost/2",
        image: "http://localhost/2.jpg",
        review: {
          star: 4.7,
          count: 588,
        },
      },
    ]);
  });
  it("when number of volumes is not present", () => {
    document.body.innerHTML = `
      <div class="s-main-slot">
        <div class="s-result-item">
          <div>
            <img src="1.jpg"/>
          </div>
          <div>
            <h2>鋼の錬金術師 1巻 (デジタル版ガンガンコミックス)</h2>
            <div>
              <a href="/1">鋼の錬金術師</a>
            </div>
            <div>
              <span>5つ星のうち5.0</span>
              <span>2,588</span>
            </div>
          </div>
        </div>
      </div>
    `;

    const actual = crawlBooks(document);
    expect(actual).toStrictEqual([
      {
        title: "鋼の錬金術師",
        magazine: "デジタル版ガンガンコミックス",
        anchor: "http://localhost/1",
        image: "http://localhost/1.jpg",
        review: {
          star: 5.0,
          count: 2588,
        },
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
    expect(actual).toBe("(その他)");
  });
  it("when magazine is not present with parentheses", () => {
    const section = document.createElement("div");
    section.innerHTML = "<h2>鋼の(錬金)術師 1巻</h2>";

    const actual = extractMagazine(section);
    expect(actual).toBe("(その他)");
  });
  it("when magazine is not present with short text", () => {
    const section = document.createElement("div");
    section.innerHTML = "<h2>鋼の錬金術師 (1巻)</h2>";

    const actual = extractMagazine(section);
    expect(actual).toBe("(その他)");
  });
});

describe(extractReview, () => {
  it("when preview is present", () => {
    const section = document.createElement("div");
    section.innerHTML = "5つ星のうち4.0 123";

    const actual = extractReview(section);
    expect(actual).toStrictEqual({star: 4.0, count: 123});
  });
  it("when preview is not present", () => {
    const section = document.createElement("div");

    const actual = extractReview(section);
    expect(actual).toStrictEqual({star: 0, count: 0});
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
