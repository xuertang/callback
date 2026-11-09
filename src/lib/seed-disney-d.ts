import type { Problem } from "./types";

// Disney software-engineer bank, part D: the two warm-ups that open the
// data-science screen. Judged in JavaScript.

export const disneyProblemsD: Problem[] = [
  {
    slug: "elementwise-matrix-sum",
    title: "Elementwise Matrix Sum",
    category: "algorithms",
    difficulty: "easy",
    companies: ["disney"],
    summary:
      "The warm-up of the data-science screen: add two same-shaped matrices entry by entry, empty included.",
    prompt: [
      "Return the elementwise sum of two matrices of the same shape, given as arrays of rows.",
      "",
      "```",
      "addMatrices([[1, 2], [3, 4]], [[5, 6], [7, 8]])  ->  [[6, 8], [10, 12]]",
      "addMatrices([], [])                              ->  []",
      "```",
      "",
      "This is the first of three warm-ups in a data-science screen; the others count name frequencies and find the longest run of consecutive integers.",
    ].join("\n"),
    hints: ["Two nested maps; the empty matrix falls out of them."],
    solution: [
      "## Approach",
      "",
      "`a.map((row, i) => row.map((x, j) => x + b[i][j]))`. O(rows × cols), and the empty matrix needs no special case.",
      "",
      "## Worth saying out loud",
      "",
      "- Validate the shapes if the inputs are untrusted; mismatched rows are the only way this fails.",
      "- In a numeric library this is a vectorised `a + b`; the interviewer may be checking you know that and can still write the loop.",
    ].join("\n"),
    judge: {
      starterCode: `/**
 * @param {number[][]} a
 * @param {number[][]} b - same shape as a
 * @returns {number[][]}
 */
function addMatrices(a, b) {
  // Your code here
  return [];
}
`,
      solutionCode: `function addMatrices(a, b) {
  return a.map((row, i) => row.map((x, j) => x + b[i][j]));
}
`,
      entry: "addMatrices",
      tests: [
        {
          name: "Prompt example",
          input: [
            [
              [1, 2],
              [3, 4],
            ],
            [
              [5, 6],
              [7, 8],
            ],
          ],
          expected: [
            [6, 8],
            [10, 12],
          ],
        },
        { name: "Empty matrices", input: [[], []], expected: [] },
        {
          name: "One row with negatives",
          input: [[[1, -2, 3]], [[-1, 2, -3]]],
          expected: [[0, 0, 0]],
        },
        {
          name: "Three by three",
          input: [
            [
              [1, 2, 3],
              [4, 5, 6],
              [7, 8, 9],
            ],
            [
              [9, 8, 7],
              [6, 5, 4],
              [3, 2, 1],
            ],
          ],
          expected: [
            [10, 10, 10],
            [10, 10, 10],
            [10, 10, 10],
          ],
        },
      ],
    },
  },
  {
    slug: "name-frequency-count",
    title: "Name Frequency Count",
    category: "algorithms",
    difficulty: "easy",
    companies: ["disney"],
    summary:
      "Map each name to how many times it appears; the second warm-up of the data-science screen.",
    prompt: [
      "Given a list of names, return an object mapping each name to the number of times it appears.",
      "",
      "```",
      'countNames(["Amy", "Bob", "Amy"])  ->  { Amy: 2, Bob: 1 }',
      "countNames([])                     ->  {}",
      "```",
      "",
      'Names are case-sensitive: `"amy"` and `"Amy"` are different names.',
    ].join("\n"),
    hints: [
      "One pass with a map from name to count; `(counts[name] ?? 0) + 1` handles the first sighting.",
    ],
    solution: [
      "## Approach",
      "",
      "One pass, incrementing a map entry per name: O(n) time and O(distinct names) space.",
      "",
      "## Worth saying out loud",
      "",
      "- A plain object as the map inherits keys such as `constructor`; a `Map` or `Object.create(null)` avoids surprises if the names are untrusted.",
      "- Follow-ups: the top k names (a heap of size k over the counts), and normalising case or whitespace before counting, which is a product decision, not a technical one.",
    ].join("\n"),
    judge: {
      starterCode: `/**
 * @param {string[]} names
 * @returns {Record<string, number>} name -> occurrences
 */
function countNames(names) {
  // Your code here
  return {};
}
`,
      solutionCode: `function countNames(names) {
  const counts = {};
  for (const name of names) counts[name] = (counts[name] ?? 0) + 1;
  return counts;
}
`,
      entry: "countNames",
      tests: [
        {
          name: "Prompt example",
          input: [["Amy", "Bob", "Amy"]],
          expected: { Amy: 2, Bob: 1 },
        },
        { name: "No names, no counts", input: [[]], expected: {} },
        {
          name: "Case matters",
          input: [["amy", "Amy", "AMY", "amy"]],
          expected: { amy: 2, Amy: 1, AMY: 1 },
        },
        {
          name: "One name many times",
          input: [["x", "x", "x", "x", "x"]],
          expected: { x: 5 },
        },
      ],
    },
  },
];
