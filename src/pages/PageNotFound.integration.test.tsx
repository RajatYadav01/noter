import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Outlet, Routes, Route } from "react-router-dom";
import PageNotFound from "./PageNotFound";

function BackPage() {
  return <div>Back Page</div>;
}

describe("PageNotFound page", () => {
  test("renders the 404 heading", () => {
    render(
      <MemoryRouter>
        <PageNotFound />
      </MemoryRouter>
    );

    expect(screen.getByText("404 Error")).toBeInTheDocument();
  });

  test("renders the 'Page not found' message", () => {
    render(
      <MemoryRouter>
        <PageNotFound />
      </MemoryRouter>
    );

    expect(screen.getByText("Page not found")).toBeInTheDocument();
  });

  test("renders the 'Click here to go back' message with a link", () => {
    render(
      <MemoryRouter initialEntries={["/some/nested/route"]}>
        <Routes>
          <Route path="some/nested" element={<Outlet />}>
            <Route path="route" element={<PageNotFound />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    const link = screen.getByRole("link", { name: /here/i });
    expect(link).toHaveAttribute("href", "/some/nested");
  });

  test("navigates back to parent route when link is clicked", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/some/nested/route"]}>
        <Routes>
          <Route path="some/nested" element={<Outlet />}>
            <Route index element={<BackPage />} />
            <Route path="route" element={<PageNotFound />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("404 Error")).toBeInTheDocument();

    const link = screen.getByRole("link", { name: /here/i });
    await user.click(link);

    expect(screen.getByText("Back Page")).toBeInTheDocument();
  });
});
