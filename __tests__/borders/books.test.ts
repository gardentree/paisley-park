import buildBookReader from "@/borders/books";
import {faker} from "@faker-js/faker";

interface Plan {
  payload: Payload;
  expected: {books: Book[]; progress: number};
}

function fakeBook(): Book {
  return {
    title: faker.unique(faker.music.songName),
    magazine: faker.music.genre(),
    anchor: faker.internet.url(),
    image: faker.internet.avatar(),
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
            next: faker.internet.url(),
            numerator: 1,
            denominator: 2,
          },
        },
        expected: {books: [book1], progress: 50},
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
        expected: {books: [book2], progress: 100},
      },
    ];
    planFetchSpy(plans);

    const reader = buildBookReader(faker.internet.url());
    await expect(reader.next()).resolves.toStrictEqual({value: plans[0].expected, done: false});
    await expect(reader.next()).resolves.toStrictEqual({value: plans[1].expected, done: false});
    await expect(reader.next()).resolves.toStrictEqual({value: undefined, done: true});
  });

  it("when raise 504 in fetch", async () => {
    fetchSpy.mockReturnValueOnce(Promise.resolve(new Response("504", {status: 504})));

    const reader = buildBookReader(faker.internet.url());
    await expect(reader.next()).rejects.toThrowError("504");
  });

  it("when raise 504 in second fetch", async () => {
    const book1 = fakeBook();
    const plans: Plan[] = [
      {
        payload: {
          books: [book1],
          pagination: {
            next: faker.internet.url(),
            numerator: 1,
            denominator: 2,
          },
        },
        expected: {books: [book1], progress: 50},
      },
    ];
    planFetchSpy(plans);
    fetchSpy.mockReturnValueOnce(Promise.resolve(new Response("504", {status: 504})));

    const reader = buildBookReader(faker.internet.url());
    await expect(reader.next()).resolves.toStrictEqual({value: plans[0].expected, done: false});
    await expect(reader.next()).rejects.toThrowError("504");
  });

  afterEach(() => {
    fetchSpy.mockClear();
  });
});
