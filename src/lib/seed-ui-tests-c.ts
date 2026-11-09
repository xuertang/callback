import { HEADER } from "./seed-ui-tests-b";

// More shipped test files (see seed-ui-tests.ts): the Disney movie list.

const movieList = `import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

${HEADER}
// The fake endpoint answers after 500 ms, so the clock is faked and advanced.
beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
});

const load = async () => {
  render(<App />);
  await act(() => vi.advanceTimersByTimeAsync(600));
  return userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
};
const rows = () =>
  within(screen.getByRole("table")).queryAllByRole("row").slice(1); // minus the header row
const names = () =>
  rows().map((row) => within(row).getAllByRole("cell")[0].textContent);
const header = (name) => screen.getByRole("button", { name }).closest("th");
const search = () => screen.getByRole("searchbox", { name: "Search movies" });

test("shows a loading message, then one row per movie", async () => {
  render(<App />);
  expect(screen.getByText("Loading movies…")).toBeInTheDocument();
  expect(rows()).toHaveLength(0);
  await act(() => vi.advanceTimersByTimeAsync(600));
  expect(screen.queryByText("Loading movies…")).toBeNull();
  expect(rows()).toHaveLength(16);
});

test("starts sorted by name ascending", async () => {
  await load();
  expect(header("Name")).toHaveAttribute("aria-sort", "ascending");
  expect(names().slice(0, 3)).toEqual(["Big Hero 6", "Coco", "Encanto"]);
});

test("search matches anywhere in the name, ignoring case", async () => {
  const user = await load();
  await user.type(search(), "TO");
  expect(names()).toEqual(["Encanto", "Ratatouille", "Toy Story"]);
});

test("shows an empty state when nothing matches", async () => {
  const user = await load();
  await user.type(search(), "zzz");
  expect(rows()).toHaveLength(0);
  expect(screen.getByText("No movies match.")).toBeInTheDocument();
});

test("clicking Year sorts ascending, then descending", async () => {
  const user = await load();
  await user.click(screen.getByRole("button", { name: "Year" }));
  expect(header("Year")).toHaveAttribute("aria-sort", "ascending");
  expect(header("Name")).toHaveAttribute("aria-sort", "none");
  expect(names().slice(0, 2)).toEqual(["The Lion King", "Toy Story"]);
  await user.click(screen.getByRole("button", { name: "Year" }));
  expect(header("Year")).toHaveAttribute("aria-sort", "descending");
  expect(names().slice(0, 2)).toEqual(["Turning Red", "Encanto"]);
});

test("search and sort combine", async () => {
  const user = await load();
  await user.type(search(), "the");
  await user.click(screen.getByRole("button", { name: "Year" }));
  expect(names()).toEqual(["The Lion King", "The Incredibles"]);
});
`;

export const uiTestsC: Record<string, string> = {
  "movie-list-sort-search": movieList,
};
