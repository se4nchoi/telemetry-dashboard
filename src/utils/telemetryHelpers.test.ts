import { expect, test, describe } from "vitest";
import { getStats } from "./telemetryHelpers";

describe("Telemetry Math Helpers", () => {
  test("getStats calculates min, max, and average for normal numbers", () => {
    const data = [10, 20, 30, 40, 50];
    const stats = getStats(data);

    expect(stats.min).toBe(10);
    expect(stats.max).toBe(50);
    expect(stats.avg).toBe(30);
  });

  test("getStats handles empty buffer gracefully", () => {
    const stats = getStats([]);
    expect(stats).toEqual({ min: 0, max: 0, avg: 0 });
  });

  test("getStats filters out NaN values from calculation", () => {
    const data = [10, NaN, 20, NaN, 30];
    const stats = getStats(data);

    expect(stats.min).toBe(10);
    expect(stats.max).toBe(30);
    expect(stats.avg).toBe(20);
  });
});
