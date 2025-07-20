import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Pagination from "./Pagination";

describe("Pagination component", () => {
  const mockPaginate = vi.fn();

  test("should render pagination links correctly based on the total number of pages", () => {
    render(
      <Pagination
        currentPageNumber={1}
        totalNumberOfPages={5}
        paginate={mockPaginate}
      />
    );

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.queryByText("Previous")).not.toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();
  });

  test("should call `paginate` function when a page number is clicked", async () => {
    render(
      <Pagination
        currentPageNumber={1}
        totalNumberOfPages={5}
        paginate={mockPaginate}
      />
    );

    const page2 = screen.getByText("2");
    await userEvent.click(page2);

    expect(mockPaginate).toHaveBeenCalledWith("Change", 2);
  });

  test("should call `paginate` with 'Previous' when the Previous button is clicked", async () => {
    render(
      <Pagination
        currentPageNumber={2}
        totalNumberOfPages={5}
        paginate={mockPaginate}
      />
    );

    const previousButton = screen.getByText("Previous");
    await userEvent.click(previousButton);

    expect(mockPaginate).toHaveBeenCalledWith("Previous", 0);
  });

  test("should call `paginate` with 'Next' when the Next button is clicked", async () => {
    render(
      <Pagination
        currentPageNumber={3}
        totalNumberOfPages={5}
        paginate={mockPaginate}
      />
    );

    const nextButton = screen.getByText("Next");
    await userEvent.click(nextButton);

    expect(mockPaginate).toHaveBeenCalledWith("Next", 0);
  });

  test("should not render Next button when on the last page", () => {
    render(
      <Pagination
        currentPageNumber={5}
        totalNumberOfPages={5}
        paginate={mockPaginate}
      />
    );

    expect(screen.queryByText("Next")).not.toBeInTheDocument();
  });

  test("should handle edge cases with pagination range correctly", () => {
    const paginateMock = vi.fn();
    render(
      <Pagination
        currentPageNumber={10}
        totalNumberOfPages={5}
        paginate={paginateMock}
      />
    );

    expect(paginateMock).toHaveBeenCalledWith("Change", 5);
  });

  test("should display ellipses (...) when necessary for large pagination ranges", () => {
    render(
      <Pagination
        currentPageNumber={10}
        totalNumberOfPages={20}
        paginate={mockPaginate}
      />
    );

    expect(screen.getAllByText("...").length).toBeGreaterThan(0);
  });
});
