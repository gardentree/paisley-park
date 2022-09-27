import {fetchWithRetry} from "@/libraries/utility";
import {faker} from "@faker-js/faker";

describe(fetchWithRetry, () => {
  let fetchSpy: jest.SpyInstance;
  beforeEach(() => {
    fetchSpy = jest.spyOn(global, "fetch");
  });
  it("when 200", async () => {
    fetchSpy.mockReturnValueOnce(Promise.resolve(new Response("OK", {status: 200})));
    const signal = new AbortController().signal;

    const actual = await fetchWithRetry(faker.internet.url(), 3, signal);
    return expect(actual.text()).resolves.toBe("OK");
  });
  it("when 404", async () => {
    fetchSpy.mockReturnValue(Promise.resolve(new Response("Not Found", {status: 404})));
    const signal = new AbortController().signal;

    const actual = await fetchWithRetry(faker.internet.url(), 3, signal);
    return expect(actual.text()).resolves.toBe("Not Found");
  });
  it("when 503,200", async () => {
    fetchSpy.mockReturnValueOnce(Promise.resolve(new Response("Service Unavailable", {status: 503})));
    fetchSpy.mockReturnValueOnce(Promise.resolve(new Response("OK", {status: 200})));
    const signal = new AbortController().signal;

    const actual = await fetchWithRetry(faker.internet.url(), 3, signal);
    return expect(actual.text()).resolves.toBe("OK");
  });
  it("when 503,503,503,503", async () => {
    fetchSpy.mockReturnValueOnce(Promise.resolve(new Response("Service Unavailable", {status: 503})));
    fetchSpy.mockReturnValueOnce(Promise.resolve(new Response("Service Unavailable", {status: 503})));
    fetchSpy.mockReturnValueOnce(Promise.resolve(new Response("Service Unavailable", {status: 503})));
    fetchSpy.mockReturnValueOnce(Promise.resolve(new Response("Service Unavailable", {status: 503})));
    const signal = new AbortController().signal;

    const actual = await fetchWithRetry(faker.internet.url(), 3, signal);
    return expect(actual.text()).resolves.toBe("Service Unavailable");
  });

  it("when abort", async () => {
    const abort = new AbortController();
    fetchSpy.mockReturnValueOnce(
      new Promise((resolve, reject) => {
        abort.signal.addEventListener("abort", () => {
          reject(new DOMException("abort", "AbortError"));
        });
      })
    );

    setTimeout(() => abort.abort(), 0);
    return expect(fetchWithRetry(faker.internet.url(), 3, abort.signal)).rejects.toThrow();
  });

  afterEach(() => {
    fetchSpy.mockClear();
  });
});
