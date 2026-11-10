import type { Problem } from "./types";

// TikTok and ByteDance bank, part F: a simulation from the CodeSignal
// assessment and two string questions from the coding rounds, each a
// familiar problem with the follow-up that the interviewers actually ask.
// Judged in JavaScript.

export const tiktokProblemsF: Problem[] = [
  {
    slug: "aligned-memory-allocator",
    title: "Aligned Memory Allocator",
    category: "algorithms",
    difficulty: "medium",
    companies: ["tiktok"],
    summary:
      "Simulate alloc and erase over a bit array where blocks must start on an 8-cell boundary; the care is in ids, bounds and erasing something twice.",
    prompt: [
      "Memory is an array of cells, `0` for free and `1` for occupied. Process a list of queries against it and return one result per query.",
      "",
      "- `[0, x]` **alloc**: find the leftmost block of `x` consecutive free cells whose starting index is a multiple of 8. Mark the block occupied and return its starting index. Each successful alloc is given the next id, counting from 1. If no block fits, return `-1` (and no id is used).",
      "- `[1, id]` **erase**: free every cell of the block that alloc number `id` created and return how many cells were freed. If that id was never issued, or its block has already been erased, return `-1`.",
      "",
      "Cells that are occupied in the initial array belong to no id and are never freed.",
      "",
      "```",
      "memory  = [0,0,0,0,0,0,0,0, 1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0]",
      "queries = [[0, 3], [0, 6], [0, 2], [1, 1], [0, 4], [1, 9]]",
      "result  = [0, 16, -1, 3, 0, -1]",
      "```",
      "",
      "The first alloc takes cells 0-2 (id 1). Six cells do not fit after index 0 or at index 8, so the second takes 16-21 (id 2). Nothing aligned is left for two cells. Erasing id 1 frees 3 cells, and the next alloc reuses index 0 (id 3). Id 9 was never issued.",
    ].join("\n"),
    hints: [
      "Only indices 0, 8, 16, ... can start a block, but a block may extend past the next boundary if the cells are free.",
      "Remember, per id, where its block starts and how long it is. Erase then needs no search.",
      "An erased id must answer `-1` the second time: delete the record when you erase.",
    ],
    solution: [
      "## Approach",
      "",
      "Copy the memory so the input is not mutated. For an alloc, try each aligned start in increasing order and check that the next `x` cells exist and are free; the first start that passes wins, its cells are marked occupied, and a record `id -> [start, length]` is stored under the next id. For an erase, look the id up: if there is no record return `-1`; otherwise clear those cells, delete the record and return the length.",
      "",
      "Each alloc costs O((n / 8) * x) in the worst case, which is comfortably fast for assessment limits.",
      "",
      "## Worth saying out loud",
      "",
      "- The traps are all at the edges: a block that would run past the end, a failed alloc that must not consume an id, and an erase of an id that was already erased.",
      "- For large memories, keep the free runs in an ordered structure keyed by start, or a segment tree of longest free run, so an alloc does not rescan.",
      "- On CodeSignal the tests are hidden; write the two helpers separately and exercise each before combining.",
    ].join("\n"),
    judge: {
      starterCode: `/**
 * @param {number[]} memory - 0 = free, 1 = occupied
 * @param {number[][]} queries - [0, x] alloc x cells, [1, id] erase block id
 * @returns {number[]} one result per query
 */
function runAllocator(memory, queries) {
  // Your code here
  return [];
}
`,
      solutionCode: `function runAllocator(memory, queries) {
  const cells = [...memory];
  const blocks = new Map(); // id -> [start, length]
  let nextId = 1;
  const results = [];

  for (const [kind, value] of queries) {
    if (kind === 0) {
      let placed = -1;
      for (let start = 0; start + value <= cells.length; start += 8) {
        let free = true;
        for (let i = start; i < start + value; i++) {
          if (cells[i] !== 0) {
            free = false;
            break;
          }
        }
        if (free) {
          placed = start;
          break;
        }
      }
      if (placed !== -1) {
        for (let i = placed; i < placed + value; i++) cells[i] = 1;
        blocks.set(nextId++, [placed, value]);
      }
      results.push(placed);
    } else {
      const block = blocks.get(value);
      if (!block) {
        results.push(-1);
        continue;
      }
      for (let i = block[0]; i < block[0] + block[1]; i++) cells[i] = 0;
      blocks.delete(value);
      results.push(block[1]);
    }
  }
  return results;
}
`,
      entry: "runAllocator",
      tests: [
        {
          name: "Prompt example",
          input: [
            [
              0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              0, 0,
            ],
            [
              [0, 3],
              [0, 6],
              [0, 2],
              [1, 1],
              [0, 4],
              [1, 9],
            ],
          ],
          expected: [0, 16, -1, 3, 0, -1],
        },
        {
          name: "A block may cross an 8-cell boundary",
          input: [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [
              [0, 12],
              [0, 4],
              [0, 1],
            ],
          ],
          expected: [0, -1, -1],
        },
        {
          name: "Erasing twice, and a failed alloc uses no id",
          input: [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [
              [0, 9],
              [0, 8],
              [1, 1],
              [1, 1],
              [0, 2],
              [1, 2],
            ],
          ],
          expected: [-1, 0, 8, -1, 0, 2],
        },
        {
          name: "Initially occupied cells are never freed",
          input: [
            [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [
              [0, 1],
              [1, 1],
              [0, 8],
              [0, 1],
            ],
          ],
          expected: [8, 1, 8, -1],
        },
        {
          name: "The block must fit before the end",
          input: [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [
              [0, 3],
              [0, 4],
              [0, 3],
              [1, 2],
            ],
          ],
          expected: [0, -1, 8, 3],
        },
        {
          name: "Freed space is reused leftmost-first",
          input: [
            [
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              0, 0,
            ],
            [
              [0, 8],
              [0, 8],
              [0, 8],
              [1, 2],
              [1, 1],
              [0, 5],
              [0, 5],
              [0, 5],
            ],
          ],
          expected: [0, 8, 16, 8, 8, 0, 8, -1],
        },
      ],
    },
  },
  {
    slug: "reverse-words-preserve-spaces",
    title: "Reverse Words, Keeping the Spacing",
    category: "algorithms",
    difficulty: "easy",
    companies: ["bytedance", "tiktok"],
    summary:
      "Reverse the order of the words while every run of spaces stays exactly where it was, including leading and trailing runs.",
    prompt: [
      "Given a string `s` made of words and spaces, reverse the order of the words. A word is a maximal run of non-space characters.",
      "",
      "The spacing must be preserved exactly: the string keeps its leading spaces, its trailing spaces, and the number of spaces in each gap, in their original positions. Only the words change places.",
      "",
      "```",
      '"the sky is blue"       ->  "blue is sky the"',
      '"  hello   world "      ->  "  world   hello "',
      '"a  bb   ccc"           ->  "ccc  bb   a"',
      "```",
      "",
      "The round starts with the plain version, asks you to write and run your own test cases, then adds the spacing rule and asks about the complexity and about doing it in place.",
    ].join("\n"),
    hints: [
      "Think of the string as alternating tokens: space runs and words. The space runs stay; the words are dealt back in reverse order.",
      "Collect the words in one pass. In a second pass, copy each space run as it is and replace the i-th word with the i-th word from the end.",
    ],
    solution: [
      "## Approach",
      "",
      "Split the string into its words, then walk it again: every run of spaces is copied through untouched, and every word slot is filled with the next word taken from the end of the list. With a regular expression that is one `match` to collect the words and one `replace` over the same pattern. O(n) time and O(n) extra space.",
      "",
      "## Worth saying out loud",
      "",
      "- Agree the spacing policy before writing anything. The textbook version trims and collapses spaces; this one keeps them, and the two need different tests.",
      "- The classic in-place trick, reverse the whole buffer and then reverse each word, also keeps every space, but it mirrors the gaps: the first gap becomes the last. If the interviewer accepts that reading it is O(1) extra space on a mutable buffer. Keeping gaps in their original order while words of different lengths swap cannot be done with that trick; say so rather than claiming it.",
      "- Tests worth running: empty string, only spaces, one word, leading and trailing runs, and words of very different lengths.",
    ].join("\n"),
    judge: {
      starterCode: `/**
 * @param {string} s
 * @returns {string} the words in reverse order, every space run unchanged
 */
function reverseWordsKeepSpaces(s) {
  // Your code here
  return s;
}
`,
      solutionCode: `function reverseWordsKeepSpaces(s) {
  const words = s.match(/[^ ]+/g) || [];
  let next = words.length;
  // Each word slot, left to right, receives the next word from the end.
  return s.replace(/[^ ]+/g, () => words[--next]);
}
`,
      entry: "reverseWordsKeepSpaces",
      tests: [
        {
          name: "Single spaces",
          input: ["the sky is blue"],
          expected: "blue is sky the",
        },
        {
          name: "Leading, trailing and wide gaps",
          input: ["  hello   world "],
          expected: "  world   hello ",
        },
        {
          name: "Gaps of different widths stay in place",
          input: ["a  bb   ccc"],
          expected: "ccc  bb   a",
        },
        { name: "Empty string", input: [""], expected: "" },
        { name: "Only spaces", input: ["    "], expected: "    " },
        {
          name: "One word with padding",
          input: ["  solo "],
          expected: "  solo ",
        },
        {
          name: "An odd number of words",
          input: ["one  two three   four five"],
          expected: "five  four three   two one",
        },
        {
          name: "Punctuation belongs to its word",
          input: ["Hi, there!  ok"],
          expected: "ok there!  Hi,",
        },
      ],
    },
  },
  {
    slug: "wildcard-parentheses-expansions",
    title: "All Valid Expansions of Wildcard Parentheses",
    category: "algorithms",
    difficulty: "medium",
    companies: ["bytedance", "tiktok"],
    summary:
      "The follow-up to the wildcard validity check: enumerate every distinct balanced string the stars can produce, pruning on the running balance.",
    prompt: [
      "A string contains only `(`, `)` and `*`. Each `*` may be replaced by `(`, by `)`, or by nothing. A result is **valid** when its parentheses are balanced: every prefix has at least as many `(` as `)`, and the totals are equal.",
      "",
      "Return every distinct valid string that the input can produce, sorted in ascending lexicographic order (`(` sorts before `)`). The empty string is a valid result. If none exists, return an empty array.",
      "",
      "```",
      'validExpansions("(**)")  ->  ["(())", "()", "()()"]',
      'validExpansions("*")     ->  [""]',
      'validExpansions(")*")    ->  []',
      "```",
      "",
      "The input has at most 16 characters and at most 10 stars. The first part of the round is the yes-or-no check; be ready to give it in O(n) as well.",
    ].join("\n"),
    hints: [
      "Branch on each star three ways and carry the running balance, the number of unmatched `(` so far.",
      "Prune early: a negative balance can never recover, and a balance larger than the number of characters left can never be closed.",
      "Different choices can produce the same string, for example `**` gives `()` only one way but the empty string one way too; collect results in a set.",
    ],
    solution: [
      "## Approach",
      "",
      "Depth-first search over the positions, carrying the string built so far and its balance. A fixed character is appended and adjusts the balance; a star tries all three options. Two cuts keep the search small: abandon a branch when the balance goes negative, and when the balance exceeds the number of characters still to come, since even turning everything into `)` could not close it. At the end, a balance of zero is a valid string. Results go into a set, because distinct choices can build the same string, and are sorted before returning.",
      "",
      "The search is exponential in the number of stars, at most 3^10 leaves before pruning; say so, and that the pruning is the only optimisation expected.",
      "",
      "## Worth saying out loud",
      "",
      "- The validity check alone is linear: track the lowest and highest possible balance, drop out when the highest goes negative, clamp the lowest at zero, and accept when the lowest ends at zero. Forgetting the clamp rejects valid strings such as `(*))`.",
      "- The input is valid exactly when this function's result is non-empty, which is a useful cross-check for your own tests.",
      "- Sorting gives a deterministic answer; ask whether order matters before paying for it.",
    ].join("\n"),
    judge: {
      starterCode: `/**
 * @param {string} s - only "(", ")" and "*"
 * @returns {string[]} every distinct valid expansion, sorted ascending
 */
function validExpansions(s) {
  // Your code here
  return [];
}
`,
      solutionCode: `function validExpansions(s) {
  const found = new Set();
  const walk = (i, built, balance) => {
    if (balance < 0 || balance > s.length - i) return; // cannot be repaired
    if (i === s.length) {
      found.add(built); // balance is 0 here because of the check above
      return;
    }
    const ch = s[i];
    if (ch === "(" || ch === "*") walk(i + 1, built + "(", balance + 1);
    if (ch === ")" || ch === "*") walk(i + 1, built + ")", balance - 1);
    if (ch === "*") walk(i + 1, built, balance);
  };
  walk(0, "", 0);
  return [...found].sort();
}
`,
      entry: "validExpansions",
      tests: [
        {
          name: "Two stars between a pair",
          input: ["(**)"],
          expected: ["(())", "()", "()()"],
        },
        {
          name: "One star between a pair can only vanish",
          input: ["(*)"],
          expected: ["()"],
        },
        { name: "A star must open", input: ["(*))"], expected: ["(())"] },
        { name: "A lone star", input: ["*"], expected: [""] },
        { name: "Cannot start with a closer", input: [")*"], expected: [] },
        { name: "Empty input", input: [""], expected: [""] },
        {
          name: "No stars, already valid",
          input: ["(())()"],
          expected: ["(())()"],
        },
        { name: "No stars, invalid", input: ["(()"], expected: [] },
        { name: "Two stars", input: ["**"], expected: ["", "()"] },
        { name: "A star must close", input: ["((*"], expected: [] },
        { name: "Stars on both sides", input: ["*(*"], expected: ["()"] },
        {
          name: "Three stars",
          input: ["*()*)*"],
          expected: ["(()())", "(())", "()()"],
        },
      ],
    },
  },
];
