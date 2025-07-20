import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SearchBar from "./SearchBar";

describe("SearchBar component", () => {
  const mockSetSearchBarQuery = vi.fn();
  
  test("should render correctly", () => {
    render(<SearchBar setSearchBarQuery={mockSetSearchBarQuery} />);

    expect(screen.getByPlaceholderText("Search")).toBeInTheDocument();
    expect(document.querySelector("i.bi-search")).toBeInTheDocument();
  });

  test("should call setSearchBarQuery when input changes", async () => {
    render(<SearchBar setSearchBarQuery={mockSetSearchBarQuery} />);

    const inputElement = screen.getByPlaceholderText("Search");

    fireEvent.change(inputElement, {
      target: { value: "New Search Query" },
    });

    expect(mockSetSearchBarQuery).toHaveBeenCalledWith("New Search Query");
  });

  test("should not call setSearchBarQuery if input is empty", () => {
    render(<SearchBar setSearchBarQuery={mockSetSearchBarQuery} />);

    const inputElement = screen.getByPlaceholderText("Search");

    fireEvent.change(inputElement, { target: { value: "" } });
    expect(mockSetSearchBarQuery).toHaveBeenCalledTimes(0);
  });
});
