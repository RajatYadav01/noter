import { describe, test, expect } from "vitest";
import formatTimestamp from "./formatTimestamp";

describe("formatTimestamp function", () => {
  test("formats timestamp with short month by default", () => {
    const result = formatTimestamp("2023-07-04T14:30:00Z");
    expect(result).toContain("Jul");
    expect(result).toContain("2023");
    expect(result).toMatch(/, \d{2}:\d{2} (AM|PM)$/);
  });

  test("formats timestamp with long month when specified", () => {
    const result = formatTimestamp("2023-07-04T14:30:00Z", "long");
    expect(result).toContain("July");
    expect(result).toContain("2023");
  });

  test("handles invalid date strings gracefully", () => {
    const result = formatTimestamp("invalid-date");
    expect(result).toBe("Invalid Date");
  });
});
