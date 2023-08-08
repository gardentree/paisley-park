import {renderHook} from "@testing-library/react";
import useRemainingTime from "@/hooks/RemainingTime";

describe(useRemainingTime, () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  it("when 1% in 1 second", () => {
    jest.setSystemTime(0);

    const result = renderHook((progress) => useRemainingTime(progress), {initialProps: 0});
    expect(result.result.current).toBe(Number.NaN);

    jest.setSystemTime(1000);
    result.rerender(1);
    expect(result.result.current).toBe(99);
  });

  afterEach(() => {
    jest.useRealTimers();
  });
});
