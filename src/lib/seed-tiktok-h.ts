import type { Problem } from "./types";

// TikTok and ByteDance bank, part H: two grid questions — the longest
// zigzag path from the Ads phone screen and the weighted shortest path with
// a fuel tank and recharge cells. Judged in JavaScript.

export const tiktokProblemsH: Problem[] = [
  {
    slug: "longest-zigzag-grid-path",
    title: "Longest Zigzag Path in a Grid",
    category: "algorithms",
    difficulty: "medium",
    companies: ["bytedance", "tiktok"],
    summary:
      "A path whose value comparisons strictly alternate up and down. Unlike the longest increasing path, it can turn back on itself, so it needs backtracking with a visited set rather than memoisation.",
    prompt: [
      "Given a grid of integers, find the longest **zigzag path**. A path starts at any cell, moves one step at a time to a cell directly above, below, left or right, and never visits a cell twice. Along the path the comparisons between consecutive values must strictly alternate:",
      "",
      "```",
      "a < b > c < d > ...     or     a > b < c > d < ...",
      "```",
      "",
      "Two equal neighbours can never be consecutive on a path. Return the number of cells on the longest zigzag path; a single cell is a path of length 1.",
      "",
      "```",
      "[[1, 5, 2],",
      " [9, 3, 8]]     ->  6      // 1 < 9 > 3 < 5 > 2 < 8",
      "",
      "[[4, 4],",
      " [4, 4]]        ->  1",
      "```",
      "",
      "The grid has at most 5 rows and 5 columns. The screen opens with a long resume discussion, so get a working search down early and optimise afterwards.",
    ].join("\n"),
    hints: [
      "The state of a partial path is its last cell, whether the next step must go up or down in value, and which cells are already used.",
      "Run a depth-first search from every cell, once starting with an upward step and once with a downward step, marking cells on the way in and unmarking on the way out.",
      "Be careful with memoising on `(cell, direction)` the way the longest-increasing-path problem does. There, values only rise, so a path can never return to a cell. Here `1 < 9 > 1` would reuse a cell unless the visited set is part of the state.",
    ],
    solution: [
      "## Approach",
      "",
      "Backtracking. `extend(r, c, wantUp)` returns the longest continuation from `(r, c)` when the next comparison must be upward (`wantUp`) or downward. It marks the cell as used, tries each of the four neighbours that is in bounds, unused, and strictly larger (or strictly smaller) as required, recursing with the requirement flipped, then unmarks the cell. The answer is the best of `extend` over every start cell and both initial directions.",
      "",
      "The search is exponential in the worst case, which is why the grid is small; the alternation requirement prunes heavily on ordinary inputs.",
      "",
      "## Worth saying out loud",
      "",
      "- Say why the increasing-path trick does not transfer: with strictly increasing values the graph of legal moves is acyclic, so the best continuation from a cell is independent of how you arrived. Zigzag moves go both up and down, so legal moves form cycles, and without the visited set the answer is unbounded.",
      "- Strictness matters: equal neighbours break the path, so the comparisons must be `<` and `>`, never `<=`.",
      "- If the interviewer allows revisiting cells, ask what stops the path from bouncing between two cells forever; the question only makes sense with a rule against it.",
    ].join("\n"),
    judge: {
      starterCode: `/**
 * @param {number[][]} grid
 * @returns {number} number of cells on the longest zigzag path
 */
function longestZigzagPath(grid) {
  // Your code here
  return 0;
}
`,
      solutionCode: `function longestZigzagPath(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  const used = grid.map((row) => row.map(() => false));
  const steps = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  // Longest path that starts at (r, c) when the next value must be larger (wantUp) or smaller.
  const extend = (r, c, wantUp) => {
    used[r][c] = true;
    let best = 1;
    for (const [dr, dc] of steps) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || used[nr][nc]) continue;
      const fits = wantUp ? grid[nr][nc] > grid[r][c] : grid[nr][nc] < grid[r][c];
      if (fits) best = Math.max(best, 1 + extend(nr, nc, !wantUp));
    }
    used[r][c] = false;
    return best;
  };

  let longest = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      longest = Math.max(longest, extend(r, c, true), extend(r, c, false));
    }
  }
  return longest;
}
`,
      entry: "longestZigzagPath",
      tests: [
        {
          name: "Prompt example: every cell is used",
          input: [
            [
              [1, 5, 2],
              [9, 3, 8],
            ],
          ],
          expected: 6,
        },
        {
          name: "All equal",
          input: [
            [
              [4, 4],
              [4, 4],
            ],
          ],
          expected: 1,
        },
        { name: "One cell", input: [[[7]]], expected: 1 },
        {
          name: "A strictly increasing row allows only one step",
          input: [[[1, 2, 3, 4]]],
          expected: 2,
        },
        { name: "An alternating row", input: [[[1, 9, 2, 8, 3]]], expected: 5 },
        {
          name: "A path that turns back toward its start",
          input: [
            [
              [1, 9, 1],
              [9, 1, 9],
            ],
          ],
          expected: 6,
        },
        {
          name: "Equal neighbours break the path",
          input: [
            [
              [5, 5, 1],
              [2, 5, 6],
              [9, 3, 6],
            ],
          ],
          expected: 5,
        },
        {
          name: "Negative values",
          input: [
            [
              [-3, 0],
              [-1, -2],
            ],
          ],
          expected: 4,
        },
      ],
    },
  },
  {
    slug: "grid-path-fuel-recharge",
    title: "Cheapest Grid Path With a Fuel Tank",
    category: "algorithms",
    difficulty: "hard",
    companies: ["bytedance", "tiktok"],
    summary:
      "Each cell has an entry cost, each step burns a unit of fuel, and marked cells refill the tank: Dijkstra over (row, column, fuel left), then the follow-up for a very large tank.",
    prompt: [
      "You drive across an `m x n` grid from the top-left cell to the bottom-right cell, moving up, down, left or right.",
      "",
      "- `cost[r][c]` is the price paid every time you enter cell `(r, c)`. You also pay `cost[0][0]` for the starting cell.",
      "- `blocked[r][c]` is `true` for cells that cannot be entered.",
      "- You start with a full tank of `capacity` units of fuel. Every move needs one unit and uses it.",
      "- `recharge[r][c]` is `true` for cells that refill the tank to `capacity` when you arrive on them.",
      "",
      "Return the minimum total cost of reaching the bottom-right cell, or `-1` if it cannot be reached. Arriving with an empty tank is fine.",
      "",
      "```",
      "cost     = [[1, 1, 1],       blocked: none       capacity = 2",
      "            [1, 9, 1],       recharge: only (0, 2)",
      "            [1, 1, 1]]",
      "answer   = 5    // right, right (refill), down, down",
      "```",
      "",
      "Without the refill at `(0, 2)` the four moves would need four units of fuel. Up to 40 rows and columns, costs from 0 to 1,000, `capacity` up to 80. The follow-up: what changes if `capacity` is enormous?",
    ].join("\n"),
    hints: [
      "The costs differ from cell to cell, so breadth-first search is not enough; this is a shortest-path problem with non-negative weights.",
      "Two arrivals at the same cell are not equivalent if they have different fuel left. Make fuel part of the node: `(row, column, fuel)`.",
      "Entering a recharge cell always leaves you in the state `(row, column, capacity)`, whatever you had before.",
    ],
    solution: [
      "## Approach",
      "",
      "Run Dijkstra's algorithm on states `(r, c, fuel)`. The start state is `(0, 0, capacity)` with distance `cost[0][0]`. From a state with at least one unit of fuel, each open neighbour is reachable at an extra cost equal to that neighbour's entry cost, and the new fuel is `capacity` if the neighbour is a recharge cell and `fuel - 1` otherwise. The first time the goal cell is popped from the heap, in any fuel state, its distance is the answer; if the heap empties first, the answer is `-1`. A blocked start or goal is unreachable by definition.",
      "",
      "There are `m * n * (capacity + 1)` states with four edges each, so the cost is O(m n K log(m n K)).",
      "",
      "## Worth saying out loud",
      "",
      "- Using breadth-first search because the grid looks unweighted is the common bug; the entry costs make the edges unequal.",
      "- For the large-tank follow-up: once `capacity >= m * n` fuel can never run out on a simple path, so drop the fuel dimension and run plain Dijkstra. In between, build a graph whose nodes are the start, the goal and the recharge cells, with an edge wherever one can reach another within `capacity` steps (weights from a bounded search), and run Dijkstra on that.",
      "- A cheaper state space: for each cell keep only the non-dominated pairs of (cost so far, fuel left), since more fuel at no more cost is never worse.",
      "- Confirm the accounting before coding: is the start cell paid for, and does stepping onto a recharge cell need fuel? Here both are yes.",
    ].join("\n"),
    judge: {
      starterCode: `/**
 * @param {number[][]} cost - price of entering each cell (the start included)
 * @param {boolean[][]} blocked
 * @param {boolean[][]} recharge - cells that refill the tank on arrival
 * @param {number} capacity - fuel in a full tank; each move uses one unit
 * @returns {number} minimum total cost to reach the bottom-right cell, or -1
 */
function minCostWithFuel(cost, blocked, recharge, capacity) {
  // Your code here
  return -1;
}
`,
      solutionCode: `function minCostWithFuel(cost, blocked, recharge, capacity) {
  const rows = cost.length;
  const cols = cost[0].length;
  if (blocked[0][0] || blocked[rows - 1][cols - 1]) return -1;

  const width = capacity + 1;
  const id = (r, c, fuel) => (r * cols + c) * width + fuel;
  const dist = new Float64Array(rows * cols * width).fill(Infinity);

  // Binary min-heap of [distance, r, c, fuel].
  const heap = [];
  const push = (item) => {
    heap.push(item);
    let i = heap.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (heap[parent][0] <= heap[i][0]) break;
      [heap[i], heap[parent]] = [heap[parent], heap[i]];
      i = parent;
    }
  };
  const pop = () => {
    const top = heap[0];
    const last = heap.pop();
    if (heap.length > 0) {
      heap[0] = last;
      let i = 0;
      for (;;) {
        let smallest = i;
        const left = 2 * i + 1;
        const right = left + 1;
        if (left < heap.length && heap[left][0] < heap[smallest][0]) smallest = left;
        if (right < heap.length && heap[right][0] < heap[smallest][0]) smallest = right;
        if (smallest === i) break;
        [heap[i], heap[smallest]] = [heap[smallest], heap[i]];
        i = smallest;
      }
    }
    return top;
  };

  dist[id(0, 0, capacity)] = cost[0][0];
  push([cost[0][0], 0, 0, capacity]);
  const steps = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  while (heap.length > 0) {
    const [d, r, c, fuel] = pop();
    if (d > dist[id(r, c, fuel)]) continue; // an outdated entry
    if (r === rows - 1 && c === cols - 1) return d;
    if (fuel === 0) continue;
    for (const [dr, dc] of steps) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || blocked[nr][nc]) continue;
      const nextFuel = recharge[nr][nc] ? capacity : fuel - 1;
      const nd = d + cost[nr][nc];
      if (nd < dist[id(nr, nc, nextFuel)]) {
        dist[id(nr, nc, nextFuel)] = nd;
        push([nd, nr, nc, nextFuel]);
      }
    }
  }
  return -1;
}
`,
      entry: "minCostWithFuel",
      tests: [
        {
          name: "Prompt example: the refill makes the trip possible",
          input: [
            [
              [1, 1, 1],
              [1, 9, 1],
              [1, 1, 1],
            ],
            [
              [false, false, false],
              [false, false, false],
              [false, false, false],
            ],
            [
              [false, false, true],
              [false, false, false],
              [false, false, false],
            ],
            2,
          ],
          expected: 5,
        },
        {
          name: "Not enough fuel and nowhere to refill",
          input: [
            [
              [1, 1, 1],
              [1, 1, 1],
              [1, 1, 1],
            ],
            [
              [false, false, false],
              [false, false, false],
              [false, false, false],
            ],
            [
              [false, false, false],
              [false, false, false],
              [false, false, false],
            ],
            3,
          ],
          expected: -1,
        },
        {
          name: "Plenty of fuel: the cheapest route, not the shortest",
          input: [
            [
              [1, 50, 1],
              [1, 50, 1],
              [1, 1, 1],
            ],
            [
              [false, false, false],
              [false, false, false],
              [false, false, false],
            ],
            [
              [false, false, false],
              [false, false, false],
              [false, false, false],
            ],
            10,
          ],
          expected: 5,
        },
        {
          name: "A detour to refill costs more but is the only way",
          input: [
            [
              [0, 1, 1, 1],
              [7, 9, 9, 1],
            ],
            [
              [false, false, false, false],
              [false, false, false, false],
            ],
            [
              [false, false, false, false],
              [true, false, false, false],
            ],
            3,
          ],
          expected: 26,
        },
        {
          name: "A single cell",
          input: [[[4]], [[false]], [[false]], 0],
          expected: 4,
        },
        {
          name: "The goal is blocked",
          input: [
            [
              [1, 1],
              [1, 1],
            ],
            [
              [false, false],
              [false, true],
            ],
            [
              [false, false],
              [false, false],
            ],
            5,
          ],
          expected: -1,
        },
        {
          name: "Blocked cells force the expensive corridor",
          input: [
            [
              [2, 3, 8],
              [1, 1, 8],
              [1, 1, 2],
            ],
            [
              [false, false, false],
              [true, true, false],
              [false, false, false],
            ],
            [
              [false, false, false],
              [false, false, false],
              [false, false, false],
            ],
            4,
          ],
          expected: 23,
        },
        {
          name: "Arriving with an empty tank",
          input: [
            [[1, 2, 3]],
            [[false, false, false]],
            [[false, false, false]],
            2,
          ],
          expected: 6,
        },
      ],
    },
  },
];
