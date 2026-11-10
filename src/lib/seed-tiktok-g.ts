import type { Problem } from "./types";

// TikTok and ByteDance bank, part G: two ByteDance online-assessment
// problems and the tic-tac-toe game-over check from the technical screens.
// Judged in JavaScript.

export const tiktokProblemsG: Problem[] = [
  {
    slug: "house-segments-after-demolitions",
    title: "House Segments After Demolitions",
    category: "algorithms",
    difficulty: "medium",
    companies: ["bytedance"],
    summary:
      "Houses on a number line form segments of consecutive positions; each demolition changes the segment count by +1, 0 or -1 depending only on the two neighbours.",
    prompt: [
      "Houses stand at distinct integer positions on a number line. Houses at consecutive positions belong to the same **segment**. The houses listed in `queries` are demolished one at a time, in order.",
      "",
      "Return an array with the number of segments that remain after each demolition.",
      "",
      "```",
      "houses  = [1, 2, 3, 6, 7, 9]",
      "queries = [6, 3, 7, 2, 9, 1]",
      "result  = [3, 3, 2, 2, 1, 0]",
      "```",
      "",
      "Initially there are three segments: 1-3, 6-7 and 9. Removing 6 trims a segment (still 3), removing 3 trims another (3), removing 7 deletes a lone house (2), and so on.",
      "",
      "Up to 200,000 houses at positions between -10^9 and 10^9. Every query is a distinct position that holds a house.",
    ].join("\n"),
    hints: [
      "Removing a house only affects its relationship with the positions one below and one above it.",
      "Three cases: both neighbours present (a segment splits), neither present (a segment disappears), exactly one present (a segment gets shorter).",
      "Count the initial segments as the houses whose left neighbour is absent.",
    ],
    solution: [
      "## Approach",
      "",
      "Put the positions in a hash set. The initial number of segments is the number of houses with no house at `position - 1`, since each segment has exactly one such left end. For each demolition, look at the two neighbours before removing the house: if both are standing, the segment is cut in two and the count rises by one; if neither is, a single-house segment vanishes and the count falls by one; otherwise an end is trimmed and the count is unchanged. Remove the position and record the count.",
      "",
      "O(n + q) expected time with the set, independent of how far apart the positions are.",
      "",
      "## Worth saying out loud",
      "",
      "- Positions up to 10^9 rule out an array indexed by position; a set costs memory proportional to the houses instead.",
      "- The reverse formulation, adding houses back and merging with union-find, also works and is the natural tool if the question changes to segment sizes.",
      "- Houses that are never queried stay standing for the whole run; a reverse solution must start from them.",
    ].join("\n"),
    judge: {
      starterCode: `/**
 * @param {number[]} houses - distinct positions
 * @param {number[]} queries - positions demolished in order
 * @returns {number[]} segment count after each demolition
 */
function segmentCounts(houses, queries) {
  // Your code here
  return [];
}
`,
      solutionCode: `function segmentCounts(houses, queries) {
  const standing = new Set(houses);
  let segments = 0;
  for (const position of houses) {
    if (!standing.has(position - 1)) segments++; // the left end of a segment
  }
  const result = [];
  for (const position of queries) {
    const left = standing.has(position - 1);
    const right = standing.has(position + 1);
    if (left && right) segments++; // split in two
    else if (!left && !right) segments--; // a lone house
    standing.delete(position);
    result.push(segments);
  }
  return result;
}
`,
      entry: "segmentCounts",
      tests: [
        {
          name: "Prompt example",
          input: [
            [1, 2, 3, 6, 7, 9],
            [6, 3, 7, 2, 9, 1],
          ],
          expected: [3, 3, 2, 2, 1, 0],
        },
        { name: "The only house", input: [[5], [5]], expected: [0] },
        {
          name: "Splitting a long run from the middle",
          input: [
            [1, 2, 3, 4, 5],
            [3, 2, 4],
          ],
          expected: [2, 2, 2],
        },
        {
          name: "Unsorted input and negative positions",
          input: [
            [0, -1, 10, -2, 11],
            [-1, 10, 11],
          ],
          expected: [3, 3, 2],
        },
        {
          name: "Houses that are never demolished",
          input: [[100, 101, 102, 200], [101]],
          expected: [3],
        },
        {
          name: "Far-apart positions",
          input: [
            [-1000000000, 1000000000, 0],
            [0, 1000000000],
          ],
          expected: [2, 1],
        },
        {
          name: "Trimming from both ends",
          input: [
            [4, 5, 6, 7],
            [4, 7, 5, 6],
          ],
          expected: [1, 1, 1, 0],
        },
      ],
    },
  },
  {
    slug: "sort-matrix-borders",
    title: "Sort Each Border of a Matrix",
    category: "algorithms",
    difficulty: "medium",
    companies: ["bytedance"],
    summary:
      "For every concentric ring, collect the values clockwise from the ring's top-left corner, sort them, and write them back in the same order; single-row and single-column centres are the trap.",
    prompt: [
      "A rectangular matrix is made of concentric borders: the outer ring, the ring inside it, and so on to the centre. For each border, sort its values in ascending order and write them back **clockwise, starting at the border's top-left cell**. Return the transformed matrix without mutating the input.",
      "",
      "Clockwise means: along the top row left to right, down the right column, along the bottom row right to left, then up the left column, visiting no cell twice. A centre that is a single row or a single column is one border, written left to right or top to bottom.",
      "",
      "```",
      "[[9, 8, 7],        [[1, 2, 3],",
      " [6, 5, 4],   ->    [9, 5, 4],",
      " [3, 2, 1]]         [8, 7, 6]]",
      "",
      "[[4, 3],           [[1, 2],",
      " [2, 1]]      ->    [4, 3]]",
      "```",
      "",
      "Up to 200 rows and 200 columns.",
    ].join("\n"),
    hints: [
      "Separate the two concerns: first produce the list of coordinates of one border in clockwise order, then sort values and assign them along that list.",
      "Border `k` spans rows `k` to `rows - 1 - k` and columns `k` to `cols - 1 - k`. Stop when either range is empty.",
      "When the border is a single row, do not walk the bottom row; when it is a single column, do not walk back up the left column.",
    ],
    solution: [
      "## Approach",
      "",
      "For ring `k`, with `top = k`, `bottom = rows - 1 - k`, `left = k` and `right = cols - 1 - k`, list the cells clockwise: the whole top row; the right column from `top + 1` to `bottom`; if `bottom > top`, the bottom row from `right - 1` down to `left`; and if `right > left`, the left column from `bottom - 1` up to `top + 1`. The two guards are what keep a single-row or single-column ring from visiting cells twice. Read the values along that list, sort them numerically, and write them back along the same list into a copy of the matrix.",
      "",
      "Every cell belongs to one ring, so the cost is the sorting: O(rows * cols * log(rows + cols)) overall.",
      "",
      "## Worth saying out loud",
      "",
      "- Generating coordinates once and using them for both the read and the write removes the chance that the two traversals disagree.",
      "- JavaScript's default sort compares strings; pass a numeric comparator.",
      "- Test shapes, not values: 1 x n, n x 1, an odd square with a centre cell, and a rectangle whose centre is a short row.",
    ].join("\n"),
    judge: {
      starterCode: `/**
 * @param {number[][]} matrix
 * @returns {number[][]} a new matrix with every border sorted clockwise
 */
function sortMatrixBorders(matrix) {
  // Your code here
  return matrix.map((row) => [...row]);
}
`,
      solutionCode: `function sortMatrixBorders(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const out = matrix.map((row) => [...row]);

  for (let k = 0; k <= rows - 1 - k && k <= cols - 1 - k; k++) {
    const top = k;
    const bottom = rows - 1 - k;
    const left = k;
    const right = cols - 1 - k;

    const cells = []; // the ring, clockwise from its top-left cell
    for (let c = left; c <= right; c++) cells.push([top, c]);
    for (let r = top + 1; r <= bottom; r++) cells.push([r, right]);
    if (bottom > top) for (let c = right - 1; c >= left; c--) cells.push([bottom, c]);
    if (right > left) for (let r = bottom - 1; r > top; r--) cells.push([r, left]);

    const values = cells.map(([r, c]) => matrix[r][c]).sort((a, b) => a - b);
    cells.forEach(([r, c], i) => {
      out[r][c] = values[i];
    });
  }
  return out;
}
`,
      entry: "sortMatrixBorders",
      tests: [
        {
          name: "Three by three with a centre cell",
          input: [
            [
              [9, 8, 7],
              [6, 5, 4],
              [3, 2, 1],
            ],
          ],
          expected: [
            [1, 2, 3],
            [9, 5, 4],
            [8, 7, 6],
          ],
        },
        {
          name: "Two by two",
          input: [
            [
              [4, 3],
              [2, 1],
            ],
          ],
          expected: [
            [1, 2],
            [4, 3],
          ],
        },
        {
          name: "A single row",
          input: [[[5, 1, 4, 2]]],
          expected: [[1, 2, 4, 5]],
        },
        {
          name: "A single column",
          input: [[[3], [1], [2]]],
          expected: [[1], [2], [3]],
        },
        { name: "One cell", input: [[[7]]], expected: [[7]] },
        {
          name: "A rectangle whose centre is a short row",
          input: [
            [
              [12, 11, 10, 9],
              [8, 2, 1, 7],
              [6, 5, 4, 3],
            ],
          ],
          expected: [
            [3, 4, 5, 6],
            [12, 1, 2, 7],
            [11, 10, 9, 8],
          ],
        },
        {
          name: "A tall rectangle whose centre is a column, with duplicates and negatives",
          input: [
            [
              [0, -1, 0],
              [5, 9, 5],
              [4, 3, 4],
              [-2, 8, -2],
            ],
          ],
          expected: [
            [-2, -2, -1],
            [8, 3, 0],
            [5, 9, 0],
            [5, 4, 4],
          ],
        },
      ],
    },
  },
  {
    slug: "tic-tac-toe-game-over",
    title: "Is the Tic-Tac-Toe Game Over?",
    category: "algorithms",
    difficulty: "easy",
    companies: ["bytedance", "tiktok"],
    summary:
      "Given an n by n board, decide whether a player has completed a row, column or diagonal, or the board is full; then make it constant time per move.",
    prompt: [
      'You are given the current state of an `n x n` Tic-Tac-Toe board. Each cell is `"X"`, `"O"` or `""` (empty). Implement `gameOver(board)`, which returns `true` when the game has ended and `false` when it is still in progress.',
      "",
      "The game has ended when either player has filled an entire row, an entire column, or one of the two main diagonals with their mark, or when the board is full with no winner.",
      "",
      "```",
      '[["X", "O", ""],',
      ' ["O", "X", ""],     ->  true    // X holds the main diagonal',
      ' ["",  "",  "X"]]',
      "",
      '[["X", "O", ""],',
      ' ["",  "X", ""],     ->  false',
      ' ["",  "",  "O"]]',
      "```",
      "",
      "The result is a boolean, not the winner. You are expected to write and run a test for each situation. The follow-up asks for a faster check when moves arrive one at a time.",
    ].join("\n"),
    hints: [
      "A line is won when its first cell is not empty and every other cell in the line equals it.",
      "There are `2n + 2` lines. Check them all, then check whether any cell is still empty.",
      "For the follow-up, keep one counter per row, per column and per diagonal: add 1 for an X and subtract 1 for an O. A move wins when a counter it touches reaches `n` or `-n`.",
    ],
    solution: [
      "## Approach",
      "",
      "Describe every line as a list of `n` cells: each row, each column, and the two diagonals. A line is complete when its first cell is non-empty and all its cells match. If any line is complete the game is over. Otherwise the game is over exactly when no cell is empty. The scan is O(n^2), which is optimal for a board handed over cold, because every cell may matter.",
      "",
      "## Worth saying out loud",
      "",
      "- The constant-time follow-up changes the interface: you need to see each move as it happens. Keep `rows[n]`, `cols[n]`, a diagonal and an anti-diagonal counter, adding `+1` for one player and `-1` for the other, plus a count of moves made. After a move at `(r, c)`, the game is over if any of the up-to-four counters it touched has absolute value `n`, or the move count is `n * n`. That is O(1) per move and O(n) memory.",
      "- Ask how cells are encoded and whether the board is guaranteed to be a reachable position; this function does not validate that.",
      "- One test per branch: a row, a column, each diagonal, a full board with no winner, an empty board, and a nearly full board still in play.",
    ].join("\n"),
    judge: {
      starterCode: `/**
 * @param {string[][]} board - n x n, cells are "X", "O" or ""
 * @returns {boolean} true when someone has won or the board is full
 */
function gameOver(board) {
  // Your code here
  return false;
}
`,
      solutionCode: `function gameOver(board) {
  const n = board.length;
  const index = Array.from({ length: n }, (_, i) => i);
  const lines = [
    ...index.map((r) => index.map((c) => board[r][c])), // rows
    ...index.map((c) => index.map((r) => board[r][c])), // columns
    index.map((i) => board[i][i]),
    index.map((i) => board[i][n - 1 - i]),
  ];
  if (lines.some((line) => line[0] !== "" && line.every((cell) => cell === line[0]))) return true;
  return board.every((row) => row.every((cell) => cell !== "")); // full board: a draw
}
`,
      entry: "gameOver",
      tests: [
        {
          name: "Main diagonal",
          input: [
            [
              ["X", "O", ""],
              ["O", "X", ""],
              ["", "", "X"],
            ],
          ],
          expected: true,
        },
        {
          name: "Still in progress",
          input: [
            [
              ["X", "O", ""],
              ["", "X", ""],
              ["", "", "O"],
            ],
          ],
          expected: false,
        },
        {
          name: "A row",
          input: [
            [
              ["X", "X", ""],
              ["O", "O", "O"],
              ["X", "", ""],
            ],
          ],
          expected: true,
        },
        {
          name: "A column",
          input: [
            [
              ["O", "X", ""],
              ["", "X", "O"],
              ["", "X", ""],
            ],
          ],
          expected: true,
        },
        {
          name: "Anti-diagonal",
          input: [
            [
              ["X", "X", "O"],
              ["", "O", ""],
              ["O", "", "X"],
            ],
          ],
          expected: true,
        },
        {
          name: "Full board, no winner",
          input: [
            [
              ["X", "O", "X"],
              ["X", "O", "O"],
              ["O", "X", "X"],
            ],
          ],
          expected: true,
        },
        {
          name: "Empty board",
          input: [
            [
              ["", "", ""],
              ["", "", ""],
              ["", "", ""],
            ],
          ],
          expected: false,
        },
        {
          name: "Four by four: three in a row is not enough",
          input: [
            [
              ["X", "X", "X", ""],
              ["O", "O", "", ""],
              ["", "", "", ""],
              ["", "", "", "O"],
            ],
          ],
          expected: false,
        },
        {
          name: "Four by four anti-diagonal",
          input: [
            [
              ["X", "X", "", "O"],
              ["X", "", "O", ""],
              ["", "O", "", ""],
              ["O", "", "", "X"],
            ],
          ],
          expected: true,
        },
        { name: "One cell, empty", input: [[[""]]], expected: false },
        { name: "One cell, taken", input: [[["O"]]], expected: true },
      ],
    },
  },
];
