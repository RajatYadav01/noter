import { describe, test, expect } from "vitest";
import isJSONData from "./isJSONData";

describe("isJSONData function", () => {
  test("returns true for valid JSON strings", () => {
    const jsonStr = '{"key":"value"}';
    expect(isJSONData(jsonStr)).toBe(true);
  });

  test("returns false for invalid JSON strings", () => {
    const invalidStr = '{"key": value}';
    expect(isJSONData(invalidStr)).toBe(false);
  });

  test("returns false for non-JSON plain text", () => {
    expect(isJSONData("hello world")).toBe(false);
  });

  test("returns true for JSON arrays", () => {
    expect(isJSONData("[1, 2, 3]")).toBe(true);
  });
});
