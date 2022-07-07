import {fetchWithRetry} from "@/libraries/utility";

describe(fetchWithRetry, () => {
  let fetchSpy: jest.SpyInstance;
  beforeEach(() => {
    fetchSpy = jest.spyOn(global, "fetch");
  });
  it("when 200", async () => {
    fetchSpy.mockReturnValueOnce(Promise.resolve(new Response("OK", {status: 200})));

    const actual = await fetchWithRetry("http://localhost", 3);
    return expect(actual.text()).resolves.toBe("OK");
  });
  it("when 404", async () => {
    fetchSpy.mockReturnValue(Promise.resolve(new Response("Not Found", {status: 404})));

    const actual = await fetchWithRetry("http://localhost", 3);
    return expect(actual.text()).resolves.toBe("Not Found");
  });
  it("when 503,200", async () => {
    fetchSpy.mockReturnValueOnce(Promise.resolve(new Response("Service Unavailable", {status: 503})));
    fetchSpy.mockReturnValueOnce(Promise.resolve(new Response("OK", {status: 200})));

    const actual = await fetchWithRetry("http://localhost", 3);
    return expect(actual.text()).resolves.toBe("OK");
  });
  it("when 503,503,503,503", async () => {
    fetchSpy.mockReturnValueOnce(Promise.resolve(new Response("Service Unavailable", {status: 503})));
    fetchSpy.mockReturnValueOnce(Promise.resolve(new Response("Service Unavailable", {status: 503})));
    fetchSpy.mockReturnValueOnce(Promise.resolve(new Response("Service Unavailable", {status: 503})));
    fetchSpy.mockReturnValueOnce(Promise.resolve(new Response("Service Unavailable", {status: 503})));

    const actual = await fetchWithRetry("http://localhost", 3);
    return expect(actual.text()).resolves.toBe("Service Unavailable");
  });
  afterEach(() => {
    fetchSpy.mockClear();
  });
});
