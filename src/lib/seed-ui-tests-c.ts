import { HEADER } from "./seed-ui-tests-b";

// More shipped test files (see seed-ui-tests.ts): the Disney movie list and
// the TikTok comment thread.

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

const commentThread = `import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

${HEADER}
// The <li> of the comment with this text.
const item = (text) => screen.getByText(text).closest("li");
// A comment's own Reply button comes before the ones of its replies.
const replyButton = (text) =>
  within(item(text)).getAllByRole("button", { name: "Reply" })[0];
const topLevel = () =>
  screen.getByRole("list", { name: "Comments" }).querySelectorAll(":scope > li");

test("renders each reply inside the comment it answers", () => {
  render(<App />);
  const root = item("Loved the ending.");
  const reply = item("Same, watched it twice.");
  expect(root).toContainElement(reply);
  expect(reply).toContainElement(item("Better the second time."));
  expect(root).toContainElement(item("Agreed!"));
  expect(root).not.toContainElement(item("What song is this?"));
  expect(topLevel()).toHaveLength(2);
});

test("posts a reply under the right comment and closes the form", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(replyButton("What song is this?"));
  await user.type(
    screen.getByRole("textbox", { name: "Reply to Jo" }),
    "Shazam says Daylight",
  );
  await user.click(screen.getByRole("button", { name: "Post" }));
  const posted = item("Shazam says Daylight");
  expect(item("What song is this?")).toContainElement(posted);
  expect(within(posted).getByText("You")).toBeInTheDocument();
  expect(screen.queryByRole("textbox", { name: "Reply to Jo" })).toBeNull();
  expect(topLevel()).toHaveLength(2);
});

test("Post stays disabled for blank text, and Cancel closes the form", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(replyButton("What song is this?"));
  const box = screen.getByRole("textbox", { name: "Reply to Jo" });
  const post = screen.getByRole("button", { name: "Post" });
  expect(post).toBeDisabled();
  await user.type(box, "   ");
  expect(post).toBeDisabled();
  await user.type(box, "hi");
  expect(post).toBeEnabled();
  await user.click(screen.getByRole("button", { name: "Cancel" }));
  expect(screen.queryByRole("textbox", { name: "Reply to Jo" })).toBeNull();
  expect(screen.queryByText("hi")).toBeNull();
});

test("hides and shows replies, with the number of direct replies", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole("button", { name: "Hide replies (2)" }));
  expect(screen.queryByText("Same, watched it twice.")).toBeNull();
  expect(screen.queryByText("Agreed!")).toBeNull();
  expect(screen.getByText("What song is this?")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Show replies (2)" }));
  expect(screen.getByText("Same, watched it twice.")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Hide replies (1)" })).toBeInTheDocument();
});

test("adds a top-level comment at the end and clears the box", async () => {
  const user = userEvent.setup();
  render(<App />);
  const box = screen.getByRole("textbox", { name: "Add a comment" });
  await user.type(box, "First time here");
  await user.click(screen.getByRole("button", { name: "Comment" }));
  const items = topLevel();
  expect(items).toHaveLength(3);
  expect(items[2]).toHaveTextContent("First time here");
  expect(within(items[2]).getByText("You")).toBeInTheDocument();
  expect(box).toHaveValue("");
});

test("a reply to a reply nests two levels down", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(replyButton("Same, watched it twice."));
  await user.type(
    screen.getByRole("textbox", { name: "Reply to Ravi" }),
    "Three times now",
  );
  await user.click(screen.getByRole("button", { name: "Post" }));
  const posted = item("Three times now");
  expect(item("Same, watched it twice.")).toContainElement(posted);
  expect(item("Loved the ending.")).toContainElement(posted);
  expect(
    within(item("Same, watched it twice.")).getByRole("button", {
      name: "Hide replies (2)",
    }),
  ).toBeInTheDocument();
});
`;

export const uiTestsC: Record<string, string> = {
  "movie-list-sort-search": movieList,
  "comment-thread": commentThread,
};
