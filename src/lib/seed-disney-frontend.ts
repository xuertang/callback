import type { Problem, UiFile } from "./types";

// Disney front-end bank: the movie list with sort and search that the
// Streaming front-end screens use, as a React workspace, and the code
// review round for lead candidates, as a prompt to answer.

const movieCss: UiFile = {
  name: "styles.css",
  contents: `body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #18181b;
  background: #f4f4f5;
}

.movies {
  padding: 16px;
  max-width: 640px;
}

.movies__search {
  width: 100%;
  box-sizing: border-box;
  padding: 8px 10px;
  margin-bottom: 12px;
  border: 1px solid #d4d4d8;
  border-radius: 6px;
  background: white;
  color: inherit;
  font: inherit;
}

.movies__status {
  margin: 12px 0;
  color: #52525b;
}

.movies__status--error {
  color: #b91c1c;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

th,
td {
  text-align: left;
  padding: 8px 10px;
  border-bottom: 1px solid #e4e4e7;
}

th button {
  all: unset;
  cursor: pointer;
  font-weight: 600;
}

th button::after {
  content: " ↕";
  color: #a1a1aa;
}

th[aria-sort="ascending"] button::after {
  content: " ↑";
  color: inherit;
}

th[aria-sort="descending"] button::after {
  content: " ↓";
  color: inherit;
}
`,
};

const movieApi: UiFile = {
  name: "api.js",
  contents: `// Pretend this is fetch("/db.json"): it answers with the movie array after
// a short delay. Pass { fail: true } to see the request fail instead.
const MOVIES = [
  { id: 1, name: "The Lion King", year: 1994 },
  { id: 2, name: "Toy Story", year: 1995 },
  { id: 3, name: "Mulan", year: 1998 },
  { id: 4, name: "Finding Nemo", year: 2003 },
  { id: 5, name: "The Incredibles", year: 2004 },
  { id: 6, name: "Ratatouille", year: 2007 },
  { id: 7, name: "WALL-E", year: 2008 },
  { id: 8, name: "Up", year: 2009 },
  { id: 9, name: "Tangled", year: 2010 },
  { id: 10, name: "Frozen", year: 2013 },
  { id: 11, name: "Big Hero 6", year: 2014 },
  { id: 12, name: "Inside Out", year: 2015 },
  { id: 13, name: "Moana", year: 2016 },
  { id: 14, name: "Coco", year: 2017 },
  { id: 15, name: "Encanto", year: 2021 },
  { id: 16, name: "Turning Red", year: 2022 },
];

export function fetchMovies({ fail = false } = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (fail) reject(new Error("The movie service is unavailable."));
      else resolve(MOVIES.map((movie) => ({ ...movie })));
    }, 500);
  });
}
`,
};

const movieStarter = `import { useEffect, useState } from "react";
import { fetchMovies } from "./api.js";

export default function App() {
  // Your code here: load the movies, filter them by the search box, and sort
  // them by the column headers. The markup below is the contract.
  const movies = [];

  return (
    <div className="movies">
      <input
        className="movies__search"
        type="search"
        placeholder="Search by name"
        aria-label="Search movies"
      />
      <p className="movies__status">Loading movies…</p>
      <table>
        <thead>
          <tr>
            <th scope="col">
              <button type="button">Name</button>
            </th>
            <th scope="col">
              <button type="button">Year</button>
            </th>
          </tr>
        </thead>
        <tbody>
          {movies.map((movie) => (
            <tr key={movie.id}>
              <td>{movie.name}</td>
              <td>{movie.year}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
`;

const movieSolution = `import { useEffect, useMemo, useState } from "react";
import { fetchMovies } from "./api.js";

export default function App() {
  const [movies, setMovies] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState({ key: "name", direction: "ascending" });

  useEffect(() => {
    let cancelled = false; // a result that lands after unmount is ignored
    fetchMovies()
      .then((data) => {
        if (cancelled) return;
        setMovies(data);
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Filtering and sorting are derived, and memoised so typing in the search
  // box does not re-sort thousands of rows on every render.
  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matching = needle
      ? movies.filter((movie) => movie.name.toLowerCase().includes(needle))
      : movies;
    const factor = sort.direction === "ascending" ? 1 : -1;
    return [...matching].sort((a, b) => {
      const result =
        sort.key === "year" ? a.year - b.year : a.name.localeCompare(b.name);
      return result * factor;
    });
  }, [movies, query, sort]);

  const toggleSort = (key) =>
    setSort((current) => ({
      key,
      direction:
        current.key === key && current.direction === "ascending"
          ? "descending"
          : "ascending",
    }));

  const sortFor = (key) => (sort.key === key ? sort.direction : "none");

  return (
    <div className="movies">
      <input
        className="movies__search"
        type="search"
        placeholder="Search by name"
        aria-label="Search movies"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      {status === "loading" && (
        <p className="movies__status">Loading movies…</p>
      )}
      {status === "error" && (
        <p className="movies__status movies__status--error" role="alert">
          Could not load movies: {error}
        </p>
      )}
      {status === "ready" && shown.length === 0 && (
        <p className="movies__status">No movies match.</p>
      )}
      <table>
        <thead>
          <tr>
            <th scope="col" aria-sort={sortFor("name")}>
              <button type="button" onClick={() => toggleSort("name")}>
                Name
              </button>
            </th>
            <th scope="col" aria-sort={sortFor("year")}>
              <button type="button" onClick={() => toggleSort("year")}>
                Year
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {shown.map((movie) => (
            <tr key={movie.id}>
              <td>{movie.name}</td>
              <td>{movie.year}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
`;

export const disneyFrontendProblems: Problem[] = [
  {
    slug: "movie-list-sort-search",
    title: "Movie List With Sort and Search",
    category: "frontend",
    difficulty: "easy",
    companies: ["disney"],
    summary:
      "Load a list from a fake endpoint with loading and error states, filter it by name as you type, and sort it by column with aria-sort; derive, do not store.",
    prompt: [
      "Build a small UI that lists movies loaded from a JSON endpoint. The starter's `api.js` provides `fetchMovies()`, a stand-in for fetching `db.json`: it resolves with an array of `{ id, name, year }` after a short delay, and `fetchMovies({ fail: true })` rejects, so you can see the error path.",
      "",
      "## Requirements",
      "",
      "- Load the movies when the component mounts. Show `Loading movies…` while the request is in flight and an error message if it fails.",
      "- Display each movie's name and year as a table row.",
      "- The search box filters by name: case-insensitive, matching anywhere in the name. Show `No movies match.` when nothing does.",
      "- The **Name** and **Year** headers sort the list. Clicking a header sorts ascending; clicking it again flips to descending. Start sorted by name ascending, and keep `aria-sort` on the active header (`ascending` or `descending`, `none` elsewhere).",
      "- Keep the starter's markup: the search box labelled `Search movies`, header buttons named `Name` and `Year`, and one `<tr>` per movie in the body.",
      "",
      "Be ready to explain how the component would cope with thousands of movies.",
    ].join("\n"),
    hints: [
      "Three pieces of state: the loaded movies, a status (`loading`, `ready`, `error`), and the query and sort. Everything shown is derived from them, so nothing is stored twice.",
      "Fetch in a `useEffect` with an empty dependency list, and ignore a result that arrives after the component unmounted (a `cancelled` flag in the cleanup).",
      "Sort a copy: `[...filtered].sort(...)`. Sorting in place mutates the loaded array and breaks the next filter.",
    ],
    solution: [
      "## Approach",
      "",
      "The component holds the loaded movies, a status with its error, the query and a `{ key, direction }` sort. A `useEffect` fetches once on mount and guards against a late result after unmount. The visible rows are derived in a `useMemo`: filter by the lower-cased query, then sort a copy by the active key with `localeCompare` for names and subtraction for years, negated for descending. Clicking a header toggles the direction when it is already active and otherwise selects it ascending; `aria-sort` on the `<th>` reports the state to assistive tech and drives the arrow in CSS.",
      "",
      "## Worth saying out loud",
      "",
      "- Why derive rather than store a `filteredMovies` array: two sources of truth drift the moment a second input changes them.",
      "- Thousands of rows: the filter and sort are O(n log n) per change and fine; the DOM is the problem, so virtualise the table body (render only the visible window) and debounce the search input.",
      "- The empty state is a product decision: `No movies match.` versus clearing the query; both need copy.",
      "- A real `fetch` wants an `AbortController` in the cleanup and a retry affordance on the error state.",
    ].join("\n"),
    ui: {
      framework: "react",
      files: [{ name: "App.jsx", contents: movieStarter }, movieApi, movieCss],
      solution: [
        { name: "App.jsx", contents: movieSolution },
        movieApi,
        movieCss,
      ],
    },
  },
  {
    slug: "react-code-review-mentoring",
    title: "Code Review: A Junior's React Change",
    category: "frontend",
    difficulty: "medium",
    companies: ["disney"],
    summary:
      "A working but fragile component to review out loud: what you flag first, how you say it so the author learns, what you would refactor, and what tests you ask for.",
    prompt: [
      "A junior engineer on your team opened this pull request. It works in the happy path. Review it as you would in the real round: list the issues you would raise, prioritised by impact (correctness, security, performance, accessibility, maintainability); say how you would deliver the feedback so the author learns rather than just complies; outline the refactors you would suggest; name the tests you would add or request; and describe how you would follow up after the review.",
      "",
      "```jsx",
      "export default function UserList(props: any) {",
      "  const [users, setUsers] = useState([]);",
      '  const [q, setQ] = useState("");',
      "",
      "  fetch(`/api/users?team=${props.team}`)",
      "    .then((r) => r.json())",
      "    .then((data) => setUsers(data));",
      "",
      "  function handleDelete(id) {",
      "    users.splice(users.findIndex((u) => u.id == id), 1);",
      "    setUsers(users);",
      '    fetch(`/api/users/${id}`, { method: "DELETE" });',
      "  }",
      "",
      "  return (",
      "    <div>",
      "      <input onChange={(e) => setQ(e.target.value)} />",
      "      {users",
      "        .filter((u) => u.name.includes(q))",
      "        .map((u, i) => (",
      '          <div key={i} onClick={() => handleDelete(u.id)} style={{ cursor: "pointer" }}>',
      "            {u.name} - {u.email}",
      "            <span dangerouslySetInnerHTML={{ __html: u.bio }} />",
      "          </div>",
      "        ))}",
      "    </div>",
      "  );",
      "}",
      "```",
      "",
      "Assume you may ask clarifying questions about requirements. The interviewers afterwards ask about your experience mentoring.",
    ].join("\n"),
    hints: [
      "Order by blast radius: a request on every render and an injection vector come before naming and typing.",
      "Separate *what* is wrong from *why it matters* and *how to fix it*; the second part is what the author keeps.",
      "Ask before telling where the intent is unclear (is `bio` trusted HTML? is a click really meant to delete?); questions model the review habit you want them to pick up.",
    ],
    solution: [
      "## Issues, in priority order",
      "",
      "1. **Fetch in render** — runs on every render and each response triggers another render: an infinite loop of requests. Move it into `useEffect` keyed on `props.team`, with an `AbortController` in the cleanup so a stale team's response cannot overwrite a newer one.",
      "2. **`dangerouslySetInnerHTML` on `bio`** — stored XSS if bios are user-authored. Render as text, or sanitise server-side and justify in a comment why HTML is needed.",
      "3. **Mutating state** — `splice` on the state array then `setUsers(users)` passes the same reference, so React may not re-render, and it loses the user before the server confirms. Use `setUsers(prev => prev.filter(...))`, and either do it after the `DELETE` succeeds or revert on failure; also handle the fetch's errors, which are currently swallowed.",
      "4. **Click to delete on a `div`** — not keyboard reachable, no role, no confirmation, and a mis-click destroys data. A `<button>` with a clear label and a confirm step.",
      "5. **Index keys** — deleting an item shifts every index, so React reuses the wrong rows. Key by `u.id`.",
      "6. **No loading or error state**, and `==` where `===` is meant, `props: any` losing the type contract, an unlabelled input, a case-sensitive filter, and unmemoised filtering (fine now, say so, and when it would matter).",
      "",
      "## Delivering it",
      "",
      'Open with what is good (clear structure, small component). Group comments by severity and mark which block the merge. For each blocker explain the failure a user would see, not just the rule. Ask questions where intent matters ("Is `bio` trusted HTML? If not, what should it render as?"). Offer to pair on the effect and the delete flow rather than rewriting them in the review.',
      "",
      "## Refactor shape",
      "",
      "A `useUsers(team)` hook owning fetch, loading and error state; a `UserRow` component with a delete button; a typed `User` and `Props`; the filter in a `useMemo` with the query lower-cased once.",
      "",
      "## Tests",
      "",
      "Unit: renders loading, then rows; filter is case-insensitive; delete removes the right row by id and calls the endpoint once; delete failure restores the row. Integration: switching `team` cancels the old request. Accessibility: the delete control is reachable by keyboard and has a name.",
      "",
      "## Follow-up",
      "",
      "A short pairing session on effects and immutability, a team convention written down (no `dangerouslySetInnerHTML` without a sanitiser; keys from ids), lint rules that catch the mechanical ones (`react-hooks/exhaustive-deps`, `eqeqeq`, `no-array-index-key`), and a check-in on their next review to see what stuck.",
    ].join("\n"),
  },
];
