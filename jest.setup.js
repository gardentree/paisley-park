import "@testing-library/jest-dom/extend-expect";

if (typeof global.TextEncoder === "undefined") {
  global.TextEncoder = require("util").TextEncoder;
}
if (typeof global.TextDecoder === "undefined") {
  global.TextDecoder = require("util").TextDecoder;
}

if (typeof global.fetch === "undefined") {
  const whatwg = require("whatwg-fetch");

  global.fetch = whatwg.fetch;
  global.Request = whatwg.Request;
  global.Headers = whatwg.Headers;
  global.Response = whatwg.Response;
}

jest.mock("@/libraries/utility", () => {
  const originalModule = jest.requireActual("@/libraries/utility");

  return {
    __esModule: true,
    ...originalModule,
    sleep: () => Promise.resolve(),
  };
});
