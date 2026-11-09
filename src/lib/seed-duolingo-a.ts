import type { Problem } from "./types";

// Duolingo software-engineer bank, part A: the coding questions from the
// Karat screens and phone screens — the decrypt-to-words variant, the
// hill-climb count and the access-log transition graph. Judged in
// JavaScript; one question each.

export const duolingoProblemsA: Problem[] = [
  {
    slug: "decrypt-to-dictionary-words",
    title: "Decrypt to Dictionary Words",
    category: "algorithms",
    difficulty: "medium",
    companies: ["duolingo"],
    summary:
      "The Encrypt and Decrypt Strings variant the phone screen asks: return the dictionary words a ciphertext can decode to, not how many, by DFS with backtracking.",
    prompt: [
      "An encrypter maps each character in `keys` (distinct lowercase letters) to the two-character string at the same index of `values`; several keys may share a value. A word is encrypted by replacing every character with its value and concatenating.",
      "",
      "Given `keys`, `values`, a `dictionary` of candidate words and a ciphertext `word`, return every **distinct** dictionary word whose encryption is exactly `word`, sorted alphabetically. A dictionary word containing a character outside `keys` can never match.",
      "",
      "```",
      'keys = ["a", "b", "c", "d"], values = ["ei", "zf", "ei", "am"]',
      'dictionary = ["abcd", "acbd", "adbc", "badc", "dacb", "cadb", "cbda", "abad"]',
      'word = "eizfeiam"  ->  ["abad", "abcd"]     // a and c both encrypt to "ei"',
      'word = "eiam"      ->  []',
      "```",
      "",
      "The interviewer asked for depth-first search with backtracking over the two-character chunks, and then why DFS fits and what exactly is undone on the way back. Up to 26 keys, 100 dictionary words of length up to 100, and a ciphertext of even length up to 200.",
    ].join("\n"),
    hints: [
      "Build the reverse map from each two-character value to the list of keys that produce it. Decoding is a walk over the ciphertext two characters at a time, branching on that list.",
      "Backtracking: push a key, recurse on the rest of the ciphertext, pop. Prune when a chunk has no keys, and only check the dictionary at the end, with a `Set` for the lookup.",
      "The branching can explode on adversarial inputs; encrypting each dictionary word once and comparing to the ciphertext is the linear alternative, and a good thing to mention after the DFS.",
    ],
    solution: [
      "## Approach",
      "",
      "Reverse the mapping: `value -> [keys]`. Then DFS over the ciphertext from position 0: take the next two characters, look up their keys, and for each key append it to the current prefix and recurse from position + 2; when the position reaches the end, the prefix is a full decoding, kept if it is in the dictionary (a `Set`) and not seen before. Backtracking is the pop after each recursive call, which restores the prefix for the next key. A chunk with no keys ends that branch. Sort the survivors.",
      "",
      "## Worth saying out loud",
      "",
      "- Why DFS: the decodings form a tree whose depth is the ciphertext length over two and whose branching is the number of keys sharing a value; DFS enumerates it with memory proportional to the depth.",
      "- What backtracking undoes: only the last appended character; the position advances by the recursion itself.",
      "- The dictionary bound is what makes the other direction better in the worst case: encrypt each of the 100 words once, O(total length), and compare. The original LeetCode problem counts matches that way; this variant returns the words themselves, and the interviewer wanted the search.",
      "- Follow-up: adding and removing dictionary words at runtime is a `Set` update either way; with the encrypt-and-compare approach, cache each word's encryption.",
    ].join("\n"),
    judge: {
      starterCode: `/**
 * @param {string[]} keys - distinct lowercase letters
 * @param {string[]} values - values[i] is the 2-character encryption of keys[i]
 * @param {string[]} dictionary
 * @param {string} word - the ciphertext
 * @returns {string[]} distinct dictionary words that encrypt to word, sorted
 */
function decryptWords(keys, values, dictionary, word) {
  // Your code here
  return [];
}
`,
      solutionCode: `function decryptWords(keys, values, dictionary, word) {
  const keysFor = new Map(); // value -> keys that produce it
  keys.forEach((k, i) => keysFor.set(values[i], [...(keysFor.get(values[i]) ?? []), k]));
  const allowed = new Set(dictionary);
  const found = new Set();
  const prefix = [];

  function dfs(position) {
    if (position === word.length) {
      const candidate = prefix.join("");
      if (allowed.has(candidate)) found.add(candidate);
      return;
    }
    for (const key of keysFor.get(word.slice(position, position + 2)) ?? []) {
      prefix.push(key);
      dfs(position + 2);
      prefix.pop(); // backtrack: undo the last character only
    }
  }

  if (word.length % 2 === 0) dfs(0);
  return [...found].sort();
}
`,
      entry: "decryptWords",
      tests: [
        {
          name: "Prompt example: two words share the ciphertext",
          input: [
            ["a", "b", "c", "d"],
            ["ei", "zf", "ei", "am"],
            ["abcd", "acbd", "adbc", "badc", "dacb", "cadb", "cbda", "abad"],
            "eizfeiam",
          ],
          expected: ["abad", "abcd"],
        },
        {
          name: "No dictionary word decodes to it",
          input: [
            ["a", "b", "c", "d"],
            ["ei", "zf", "ei", "am"],
            ["abcd", "acbd", "adbc", "badc", "dacb", "cadb", "cbda", "abad"],
            "eiam",
          ],
          expected: [],
        },
        {
          name: "Duplicates in the dictionary appear once",
          input: [["a", "b"], ["xy", "xy"], ["a", "b", "ab", "ab"], "xyxy"],
          expected: ["ab"],
        },
        {
          name: "A word with an unmapped letter never matches",
          input: [["a"], ["zz"], ["a", "c", "aa"], "zzzz"],
          expected: ["aa"],
        },
        {
          name: "An unknown chunk prunes every branch",
          input: [["a", "b"], ["xy", "yz"], ["ab", "ba"], "xyqq"],
          expected: [],
        },
        {
          name: "Odd-length ciphertext has no decoding",
          input: [["a"], ["xy"], ["a"], "xyx"],
          expected: [],
        },
        {
          name: "Sorted output",
          input: [
            ["a", "b", "c"],
            ["qq", "qq", "qq"],
            ["cb", "ab", "bc", "ca", "zz"],
            "qqqq",
          ],
          expected: ["ab", "bc", "ca", "cb"],
        },
      ],
    },
  },
  {
    slug: "count-cells-reaching-global-max",
    title: "Count Cells That Climb to the Global Maximum",
    category: "algorithms",
    difficulty: "medium",
    companies: ["duolingo"],
    summary:
      "A deterministic greedy walk uphill from every cell with a fixed tie-break; memoise where each walk ends, since strictly increasing heights cannot cycle.",
    prompt: [
      "`heights` is an `R x C` matrix of integers. From any starting cell, walk by these rules until you stop:",
      "",
      "- Look at all 8 neighbours (orthogonal and diagonal), ignoring positions outside the matrix.",
      "- Only neighbours **strictly higher** than the current cell are eligible.",
      "- Move to the eligible neighbour with the greatest height. If several share it, choose the smallest row index, then the smallest column index.",
      "- Stop when no neighbour is strictly higher.",
      "",
      "Return how many starting cells end their walk on a cell holding the matrix's global maximum. Starting on a global maximum counts; if several cells share the maximum, reaching any of them counts.",
      "",
      "```",
      "[[1, 2],      ->  4     (every cell climbs to 4)",
      " [3, 4]]",
      "",
      "[[5, 1, 2, 1, 5]]  ->  4   (the 2 in the middle has no higher neighbour)",
      "",
      "[[1, 5, 0],",
      " [5, 0, 0],   ->  4     (from (0,0) the tie between the two 5s goes to (0,1), which is stuck)",
      " [9, 0, 0]]",
      "```",
      "",
      "`1 <= R, C <= 500`, `R * C <= 200000`.",
    ].join("\n"),
    hints: [
      "The walk from a cell is fully determined, so every cell has exactly one successor (or none). That makes the matrix a forest of trees pointing uphill.",
      "Heights strictly increase along a walk, so there are no cycles; memoise, per cell, whether its walk reaches the maximum, and each cell is resolved once.",
      "Find the global maximum first; a cell with no higher neighbour succeeds only if it holds that value.",
    ],
    solution: [
      "## Approach",
      "",
      "Compute the global maximum in one pass. For each cell compute its successor: scan the 8 neighbours, keep the strictly higher ones, and pick the greatest height with the row-then-column tie-break. A cell with no successor is a sink: it succeeds if its height is the maximum. Every other cell succeeds exactly when its successor does, so resolve cells with memoisation, following successors until a resolved cell or a sink and writing the answer back along the path. Each cell's successor is computed once (8 comparisons) and each cell is resolved once, so the whole thing is O(R × C).",
      "",
      "## Worth saying out loud",
      "",
      "- Heights strictly increase along a walk, so the successor graph is acyclic and the memoisation cannot loop; say that before relying on it.",
      "- Recursion depth can reach R × C on a long ramp; iterate with an explicit path, or raise the recursion limit and mention it.",
      "- The tie-break is the part people get wrong: it applies among neighbours sharing the greatest height, not among all higher neighbours.",
      "- Follow-ups: counting the walk length per cell (the same memo with a distance), or allowing equal heights (then cycles are possible and you need visited-marking).",
    ].join("\n"),
    judge: {
      starterCode: `/**
 * @param {number[][]} heights - R x C integers
 * @returns {number} starting cells whose walk ends on a global maximum
 */
function countReachingMax(heights) {
  // Your code here
  return 0;
}
`,
      solutionCode: `function countReachingMax(heights) {
  const rows = heights.length;
  const cols = heights[0].length;
  let max = -Infinity;
  for (const row of heights) for (const h of row) if (h > max) max = h;

  const successor = new Int32Array(rows * cols).fill(-2); // -2 unknown, -1 sink
  const reaches = new Int8Array(rows * cols).fill(-1); // -1 unknown, 0 no, 1 yes

  function next(r, c) {
    let best = -1;
    let bestHeight = heights[r][c];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
        const h = heights[nr][nc];
        if (h > bestHeight) {
          bestHeight = h;
          best = nr * cols + nc;
        }
        // Equal heights: the row-major scan reaches the smaller row and
        // column first, so the first one seen keeps the tie.
      }
    }
    return best;
  }

  let count = 0;
  for (let start = 0; start < rows * cols; start++) {
    const path = [];
    let cell = start;
    while (reaches[cell] === -1) {
      path.push(cell);
      if (successor[cell] === -2) successor[cell] = next(Math.floor(cell / cols), cell % cols);
      if (successor[cell] === -1) {
        reaches[cell] = heights[Math.floor(cell / cols)][cell % cols] === max ? 1 : 0;
        break;
      }
      cell = successor[cell];
    }
    const result = reaches[cell];
    for (const p of path) reaches[p] = result;
    if (reaches[start] === 1) count++;
  }
  return count;
}
`,
      entry: "countReachingMax",
      tests: [
        {
          name: "Every cell climbs to 4",
          input: [
            [
              [1, 2],
              [3, 4],
            ],
          ],
          expected: 4,
        },
        {
          name: "A local bump is stuck",
          input: [[[5, 1, 2, 1, 5]]],
          expected: 4,
        },
        {
          name: "The tie-break sends (0,0) the wrong way",
          input: [
            [
              [1, 5, 0],
              [5, 0, 0],
              [9, 0, 0],
            ],
          ],
          expected: 4,
        },
        { name: "A single cell", input: [[[7]]], expected: 1 },
        {
          name: "All equal: every cell is a global maximum",
          input: [
            [
              [2, 2],
              [2, 2],
            ],
          ],
          expected: 4,
        },
        {
          name: "A long diagonal ramp",
          input: [
            [
              [1, 2, 3],
              [2, 3, 4],
              [3, 4, 5],
            ],
          ],
          expected: 9,
        },
        {
          name: "Two peaks, one lower",
          input: [
            [
              [9, 1, 1, 1, 8],
              [1, 0, 0, 0, 1],
              [1, 0, 0, 0, 1],
            ],
          ],
          expected: 6,
        },
      ],
    },
  },
  {
    slug: "access-log-transition-graph",
    title: "Transition Graph From Access Logs",
    category: "algorithms",
    difficulty: "medium",
    companies: ["duolingo"],
    summary:
      "Sort each user's accesses into a path from START to END, count transitions per source, and turn the counts into probabilities.",
    prompt: [
      "You have an unsorted list of web-resource access logs. Each entry is `[timestamp, userId, resourceId]`, with the timestamp in seconds since midnight; all entries are from one day, and a user's timestamps are distinct.",
      "",
      "Order each user's accesses by time to form their path. Every path starts at a virtual `START` state and ends with a transition from its last resource to a virtual `END` state. Build the transition graph as an adjacency map: for every source state, including `START` and excluding `END`, map each possible next state to its probability, `count(source -> next) / total transitions out of source`.",
      "",
      "```",
      'logs = [["357", "u", "r2"], ["1262", "u", "r1"], ["1462", "u", "r2"],',
      '        ["1060", "u", "r1"], ["756", "u", "r3"], ["1090", "u", "r3"]]',
      "",
      "path: START -> r2 -> r3 -> r1 -> r3 -> r1 -> r2 -> END",
      "->  { START: { r2: 1 }, r2: { r3: 0.5, END: 0.5 }, r3: { r1: 1 }, r1: { r3: 0.5, r2: 0.5 } }",
      "```",
      "",
      "Consecutive accesses to the same resource are valid transitions. Timestamps arrive as strings; compare them numerically.",
    ].join("\n"),
    hints: [
      "Group by user, sort each group by numeric timestamp, and walk each path with a sliding pair `(previous, current)` starting from `START` and finishing with `(last, END)`.",
      "Count transitions in a map of maps, `source -> next -> count`, keeping a total per source; the second pass divides.",
      'Parsing `"58523"` as a string would sort it before `"620"`; convert first.',
    ],
    solution: [
      "## Approach",
      "",
      "Group the entries by user and sort each group by `Number(timestamp)`. For each user, prepend `START` and append `END`, then count every consecutive pair in `counts[source][next]` while accumulating `totals[source]`. Finally divide each count by its source's total. Sorting dominates at O(n log n); everything else is linear in the number of entries.",
      "",
      "## Worth saying out loud",
      "",
      "- Self-transitions (`r3 -> r3`) are ordinary transitions here; some interviewers want them collapsed, so ask.",
      "- `END` is terminal by definition, so it never appears as a key; `START` always does, with one outgoing transition per user.",
      "- Floating-point division gives repeating decimals such as `0.7142857142857143`; keep full precision internally and round only for display.",
      "- Follow-ups: the most likely next resource per state (argmax of each row), the probability of a whole path (product along it), and streaming logs where the per-user last resource is the only state to keep.",
    ].join("\n"),
    judge: {
      starterCode: `/**
 * @param {string[][]} logs - [timestamp, userId, resourceId] entries, unsorted
 * @returns {Record<string, Record<string, number>>} source -> next -> probability
 */
function transitionGraph(logs) {
  // Your code here
  return {};
}
`,
      solutionCode: `function transitionGraph(logs) {
  const byUser = new Map();
  for (const [time, user, resource] of logs) {
    if (!byUser.has(user)) byUser.set(user, []);
    byUser.get(user).push([Number(time), resource]);
  }

  const counts = {};
  const totals = {};
  const record = (from, to) => {
    counts[from] ??= {};
    counts[from][to] = (counts[from][to] ?? 0) + 1;
    totals[from] = (totals[from] ?? 0) + 1;
  };

  for (const accesses of byUser.values()) {
    accesses.sort((a, b) => a[0] - b[0]);
    const path = ["START", ...accesses.map(([, resource]) => resource), "END"];
    for (let i = 1; i < path.length; i++) record(path[i - 1], path[i]);
  }

  const graph = {};
  for (const from in counts) {
    graph[from] = {};
    for (const to in counts[from]) graph[from][to] = counts[from][to] / totals[from];
  }
  return graph;
}
`,
      entry: "__roundedGraph",
      // Probabilities are rounded to six decimals so that counting the same
      // transitions in a different order still matches.
      driverCode: `function __roundedGraph(logs) {
  const graph = transitionGraph(logs);
  const out = {};
  for (const from of Object.keys(graph)) {
    out[from] = {};
    for (const to of Object.keys(graph[from])) {
      out[from][to] = Math.round(graph[from][to] * 1e6) / 1e6;
    }
  }
  return out;
}
`,
      tests: [
        {
          name: "Prompt example: one user, repeated resources",
          input: [
            [
              ["357", "u", "r2"],
              ["1262", "u", "r1"],
              ["1462", "u", "r2"],
              ["1060", "u", "r1"],
              ["756", "u", "r3"],
              ["1090", "u", "r3"],
            ],
          ],
          expected: {
            START: { r2: 1 },
            r2: { r3: 0.5, END: 0.5 },
            r3: { r1: 1 },
            r1: { r3: 0.5, r2: 0.5 },
          },
        },
        {
          name: "Several users with numeric-string timestamps",
          input: [
            [
              ["200", "user_1", "resource_5"],
              ["3", "user_1", "resource_1"],
              ["620", "user_1", "resource_1"],
              ["620", "user_3", "resource_1"],
              ["34", "user_6", "resource_2"],
              ["95", "user_9", "resource_1"],
              ["416", "user_6", "resource_1"],
              ["58523", "user_3", "resource_1"],
              ["53760", "user_3", "resource_3"],
              ["58522", "user_22", "resource_1"],
              ["100", "user_3", "resource_6"],
              ["400", "user_6", "resource_2"],
            ],
          ],
          expected: {
            START: { resource_1: 0.6, resource_2: 0.2, resource_6: 0.2 },
            resource_1: {
              END: 0.714286,
              resource_3: 0.142857,
              resource_5: 0.142857,
            },
            resource_2: { resource_1: 0.5, resource_2: 0.5 },
            resource_3: { resource_1: 1 },
            resource_5: { resource_1: 1 },
            resource_6: { resource_1: 1 },
          },
        },
        {
          name: "A single access",
          input: [[["300", "user_10", "resource_5"]]],
          expected: { START: { resource_5: 1 }, resource_5: { END: 1 } },
        },
        {
          name: "Everyone visits the same page once",
          input: [
            [
              ["1", "a", "home"],
              ["1", "b", "home"],
              ["301", "c", "home"],
            ],
          ],
          expected: { START: { home: 1 }, home: { END: 1 } },
        },
        {
          name: "Self-transitions count",
          input: [
            [
              ["10", "a", "x"],
              ["20", "a", "x"],
              ["30", "a", "x"],
              ["40", "a", "y"],
            ],
          ],
          expected: {
            START: { x: 1 },
            x: { x: 0.666667, y: 0.333333 },
            y: { END: 1 },
          },
        },
      ],
    },
  },
];
