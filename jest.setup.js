import "@testing-library/jest-dom";

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

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
