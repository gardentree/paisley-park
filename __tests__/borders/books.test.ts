import buildBookReader from "@/borders/books";
import {faker} from "@faker-js/faker";
import {UniqueEnforcer} from "enforce-unique";

interface Plan {
  payload: Payload;
  expected: {books: Book[]; progress: number; next: string | null};
}

const unique = new UniqueEnforcer();
function fakeBook(): Book {
  return {
    title: unique.enforce(faker.music.songName),
    magazine: faker.music.genre(),
    anchor: faker.internet.url(),
    image: faker.internet.avatar(),
    review: {star: 0, count: 0},
  };
}
describe(buildBookReader, () => {
  let fetchSpy: jest.SpyInstance;
  beforeEach(() => {
    fetchSpy = jest.spyOn(global, "fetch");
  });

  function planFetchSpy(plans: Plan[]) {
    for (const plan of plans) {
      fetchSpy.mockReturnValueOnce(
        Promise.resolve(
          new Response(
            JSON.stringify({
              books: plan.payload.books,
              pagination: plan.payload.pagination,
            }),
            {status: 200}
          )
        )
      );
    }
  }

  it("when success", async () => {
    const book1 = fakeBook();
    const book2 = fakeBook();
    const plans: Plan[] = [
      {
        payload: {
          books: [book1],
          pagination: {
            next: "https://test.com/1",
            numerator: 1,
            denominator: 2,
          },
        },
        expected: {books: [book1], progress: 50, next: "https://test.com/1"},
      },
      {
        payload: {
          books: [book2],
          pagination: {
            next: null,
            numerator: 2,
            denominator: 2,
          },
        },
        expected: {books: [book2], progress: 100, next: null},
      },
    ];
    planFetchSpy(plans);

    const signal = new AbortController().signal;

    const reader = buildBookReader(faker.internet.url(), signal);
    await expect(reader.next()).resolves.toStrictEqual({value: plans[0].expected, done: false});
    await expect(reader.next()).resolves.toStrictEqual({value: plans[1].expected, done: false});
    await expect(reader.next()).resolves.toStrictEqual({value: undefined, done: true});
  });

  it("when raise 504 in fetch", async () => {
    fetchSpy.mockReturnValueOnce(Promise.resolve(new Response("504", {status: 504})));

    const signal = new AbortController().signal;

    const url = faker.internet.url();
    const reader = buildBookReader(url, signal);
    await expect(reader.next()).rejects.toThrowError(new Error(`504: ${url}`));
  });

  it("when raise 504 in second fetch", async () => {
    const book1 = fakeBook();
    const first = faker.internet.url();
    const second = faker.internet.url();

    const plans: Plan[] = [
      {
        payload: {
          books: [book1],
          pagination: {
            next: second,
            numerator: 1,
            denominator: 2,
          },
        },
        expected: {books: [book1], progress: 50, next: second},
      },
    ];
    planFetchSpy(plans);
    fetchSpy.mockReturnValueOnce(Promise.resolve(new Response("504", {status: 504})));

    const signal = new AbortController().signal;

    const reader = buildBookReader(first, signal);
    await expect(reader.next()).resolves.toStrictEqual({value: plans[0].expected, done: false});
    await expect(reader.next()).rejects.toThrowError(new Error(`504: ${second}`));
  });

  afterEach(() => {
    fetchSpy.mockClear();
  });
});
