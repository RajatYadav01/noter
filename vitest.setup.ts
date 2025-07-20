import "@testing-library/jest-dom/vitest";
import { beforeAll, beforeEach, afterEach, afterAll, vi } from "vitest";
import { server } from "./src/__mocks__/server";

// Reset all mock function calls and instances before each test to ensure test isolation.
beforeEach(() => {
  vi.clearAllMocks();
});

// Establish API mocking before all tests.
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

// Reset any request handlers that we may add during the tests, so they don't affect other tests.
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished.
afterAll(() => server.close());
