import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Sort from "./Sort";

describe("Sort component", () => {
  test("renders the Sort button with text", () => {
    const mockSetter = vi.fn();
    render(<Sort setNotesSorted={mockSetter} />);

    expect(screen.getByRole("button", { name: /sort/i })).toBeInTheDocument();
    expect(screen.getByText(/sort/i)).toBeVisible();
  });

  test("calls setNotesSorted with toggled value when clicked", () => {
    const mockSetter = vi.fn();
    render(<Sort setNotesSorted={mockSetter} />);

    const button = screen.getByRole("button", { name: /sort/i });
    fireEvent.click(button);

    expect(mockSetter).toHaveBeenCalledTimes(1);
    expect(typeof mockSetter.mock.calls[0][0]).toBe("function");

    const toggleFn = mockSetter.mock.calls[0][0];
    expect(toggleFn(false)).toBe(true);
    expect(toggleFn(true)).toBe(false);
  });
});
