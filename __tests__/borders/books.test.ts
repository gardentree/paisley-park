import read from "@/borders/books";
import {faker} from "@faker-js/faker";

interface Plan {
  payload: Payload;
  expected: {books: Comic[]; progress: number};
}

function fakeBook(): Comic {
  return {
    title: faker.unique(faker.music.songName),
    magazine: faker.music.genre(),
    anchor: faker.internet.url(),
    image: faker.internet.avatar(),
  };
}
describe(read, () => {
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
              comics: plan.payload.comics,
              pagination: plan.payload.pagination,
            }),
            {status: 200}
          )
        )
      );
    }
  }

  it("when success", () => {
    const book1 = fakeBook();
    const book2 = fakeBook();
    const plans: Plan[] = [
      {
        payload: {
          comics: [book1],
          pagination: {
            next: "http://localhost",
            numerator: 1,
            denominator: 2,
          },
        },
        expected: {books: [book1], progress: 50},
      },
      {
        payload: {
          comics: [book2],
          pagination: {
            next: null,
            numerator: 2,
            denominator: 2,
          },
        },
        expected: {books: [book1, book2], progress: 100},
      },
    ];
    planFetchSpy(plans);

    const callback = jest.fn();
    return read("http://localhost", callback).then(() => {
      expect(callback.mock.calls.length).toBe(plans.length);

      for (let i = 0; plans.length > i; i++) {
        const [comics, progress] = callback.mock.calls[i];
        const plan = plans[i];

        expect(Array.from(comics.values())).toStrictEqual(plan.expected.books);

        expect(progress).toBe(plan.expected.progress);
      }
    });
  });

  it("when raise 504 in fetch", () => {
    fetchSpy.mockReturnValueOnce(Promise.resolve(new Response("504", {status: 504})));

    const callback = jest.fn();
    return expect(
      read("http://localhost", callback).then(() => {
        expect(callback.mock.calls.length).toBe(0);
      })
    ).rejects.toThrowError("504");
  });

  it("when raise 504 in second fetch", () => {
    const book1 = fakeBook();
    const plans: Plan[] = [
      {
        payload: {
          comics: [book1],
          pagination: {
            next: "http://localhost",
            numerator: 1,
            denominator: 2,
          },
        },
        expected: {books: [book1], progress: 50},
      },
    ];
    planFetchSpy(plans);
    fetchSpy.mockReturnValueOnce(Promise.resolve(new Response("504", {status: 504})));

    const callback = jest.fn();
    return expect(
      read("http://localhost", callback).then(() => {
        expect(callback.mock.calls.length).toBe(plans.length);

        const [comics, progress] = callback.mock.calls[0];
        const plan = plans[0];
        expect(Array.from(comics.values())).toStrictEqual(plan.expected.books);
        expect(progress).toBe(plan.expected.progress);
      })
    ).rejects.toThrowError("504");
  });

  afterEach(() => {
    fetchSpy.mockClear();
  });
});
