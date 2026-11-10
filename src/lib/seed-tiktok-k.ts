import type { Problem } from "./types";

// TikTok and ByteDance bank, part K: three more coding questions — the
// heaviest set of non-adjacent nodes on a small graph, islands on a grid
// that wraps around, and reversing the order of k-groups in a linked list.
// Judged in JavaScript.

export const tiktokProblemsK: Problem[] = [
  {
    slug: "max-weight-independent-set",
    title: "Heaviest Set of Non-Adjacent Nodes",
    category: "algorithms",
    difficulty: "medium",
    companies: ["bytedance"],
    summary:
      "House Robber on an arbitrary small graph: with at most 20 nodes, a dynamic programme over subsets decides, for the lowest remaining node, take it and drop its neighbours or skip it.",
    prompt: [
      "You are given an undirected graph whose nodes carry positive weights. Choose a set of nodes such that no two chosen nodes are joined by an edge, and return the largest possible total weight.",
      "",
      "Nodes are numbered `0` to `n - 1`; node `i` weighs `weights[i]`, and `edges[j] = [u, v]` joins `u` and `v`. The graph may contain cycles and may be disconnected. The empty set is allowed.",
      "",
      "```",
      "weights = [5, 1, 2, 5], edges = [[0,1], [1,2], [2,3], [3,0]]  ->  7    // nodes 0 and 2",
      "weights = [4, 9, 4],    edges = [[0,1], [1,2]]                ->  9    // the middle node",
      "```",
      "",
      "`1 <= n <= 20`. The interviewer said only *a graph*; ask whether it is a path or a tree before reaching for the general method.",
    ].join("\n"),
    hints: [
      "On a path this is House Robber, and on a tree it is a two-state DFS. A general graph has no such ordering, which is why `n` is small.",
      "Take any remaining node `v`. Either it is not chosen, or it is chosen and none of its neighbours can be.",
      "Represent the set of remaining nodes as a bitmask and each node's neighbours as a bitmask. Then `best[mask]` depends only on smaller masks.",
    ],
    solution: [
      "## Approach",
      "",
      "Let `adj[v]` be the bitmask of `v`'s neighbours and `best[mask]` the heaviest valid set drawn from the nodes in `mask`. For a non-empty mask, let `v` be its lowest node. If `v` is skipped the answer is `best[mask without v]`; if it is taken the answer is `weights[v] + best[mask without v and without adj[v]]`. Both sub-masks are numerically smaller than `mask`, so filling the table in increasing order of mask works, and the answer is `best[all nodes]`.",
      "",
      "That is 2^n states with O(1) work each: about a million steps and eight megabytes for `n = 20`.",
      "",
      "## Worth saying out loud",
      "",
      "- Maximum-weight independent set is NP-hard in general; a polynomial answer exists only for special shapes. Name the shape you are assuming.",
      "- On a tree: `take[v] = w[v] + sum(skip[child])` and `skip[v] = sum(max(take[child], skip[child]))`, linear time.",
      "- For up to about 40 nodes, split the nodes in two halves and combine (meet in the middle), or branch on the highest-degree node with memoisation.",
    ].join("\n"),
    judge: {
      starterCode: `/**
 * @param {number[]} weights - positive weight of each node
 * @param {number[][]} edges - undirected [u, v] pairs
 * @returns {number} the largest total weight with no two chosen nodes adjacent
 */
function maxIndependentWeight(weights, edges) {
  // Your code here
  return 0;
}
`,
      solutionCode: `function maxIndependentWeight(weights, edges) {
  const n = weights.length;
  const adj = new Array(n).fill(0); // adj[v] = bitmask of v's neighbours
  for (const [u, v] of edges) {
    adj[u] |= 1 << v;
    adj[v] |= 1 << u;
  }

  // best[mask] = heaviest valid set using only the nodes in mask.
  const best = new Float64Array(1 << n);
  for (let mask = 1; mask < 1 << n; mask++) {
    const v = 31 - Math.clz32(mask & -mask); // lowest node in the mask
    const rest = mask & ~(1 << v);
    const skip = best[rest];
    const take = weights[v] + best[rest & ~adj[v]];
    best[mask] = Math.max(skip, take);
  }
  return best[(1 << n) - 1];
}
`,
      entry: "maxIndependentWeight",
      tests: [
        {
          name: "A four-cycle",
          input: [
            [5, 1, 2, 5],
            [
              [0, 1],
              [1, 2],
              [2, 3],
              [3, 0],
            ],
          ],
          expected: 7,
        },
        {
          name: "A path where the middle wins",
          input: [
            [4, 9, 4],
            [
              [0, 1],
              [1, 2],
            ],
          ],
          expected: 9,
        },
        {
          name: "No edges: take everything",
          input: [[3, 8, 2], []],
          expected: 13,
        },
        { name: "One node", input: [[6], []], expected: 6 },
        {
          name: "A triangle: only one node",
          input: [
            [2, 7, 5],
            [
              [0, 1],
              [1, 2],
              [0, 2],
            ],
          ],
          expected: 7,
        },
        {
          name: "A star: leaves against the centre",
          input: [
            [10, 3, 3, 3, 3],
            [
              [0, 1],
              [0, 2],
              [0, 3],
              [0, 4],
            ],
          ],
          expected: 12,
        },
        {
          name: "Two components",
          input: [
            [1, 2, 3, 10, 1],
            [
              [0, 1],
              [1, 2],
              [3, 4],
            ],
          ],
          expected: 14,
        },
        {
          name: "A five-cycle with a heavy chord",
          input: [
            [6, 5, 6, 5, 9],
            [
              [0, 1],
              [1, 2],
              [2, 3],
              [3, 4],
              [4, 0],
              [4, 2],
            ],
          ],
          expected: 14,
        },
      ],
    },
  },
  {
    slug: "islands-on-torus",
    title: "Count Islands on a Torus",
    category: "algorithms",
    difficulty: "medium",
    companies: ["tiktok"],
    summary:
      "Number of Islands where the top edge touches the bottom and the left edge touches the right: wrap the neighbour arithmetic, then discuss union-find and cell flips.",
    prompt: [
      "You are given a grid of `0` (water) and `1` (land) laid out on a **torus**: the top row is adjacent to the bottom row, and the leftmost column is adjacent to the rightmost column. Two land cells belong to the same island when they share a side, including across those wrapped edges.",
      "",
      "Return the number of islands.",
      "",
      "```",
      "[[1, 0, 1],",
      " [0, 0, 0],     ->  1    // the four corners touch through the edges",
      " [1, 0, 1]]",
      "",
      "[[1, 0, 0, 1],",
      " [0, 1, 0, 0]]  ->  2",
      "```",
      "",
      "Up to 300 rows and 300 columns. Follow-ups: give a second, different approach, analyse both, and then support a stream of single-cell flips, reporting the island count after each.",
    ].join("\n"),
    hints: [
      "The only change from the flat problem is how a neighbour is computed: `(r + dr + rows) % rows` and `(c + dc + cols) % cols`.",
      "Use an explicit stack or queue rather than recursion; 90,000 land cells in one island would overflow the call stack.",
      "For the second approach, union each land cell with its right and down neighbours, wrapping, and count the distinct roots.",
    ],
    solution: [
      "## Approach",
      "",
      "Scan the grid. Each unvisited land cell starts a new island: push it on a stack and flood outward, marking cells as visited, where the neighbours of `(r, c)` are computed modulo the grid size so that row `-1` is the last row and column `cols` is column `0`. Every cell is pushed once, so the cost is O(rows * cols) time and space.",
      "",
      "## Worth saying out loud",
      "",
      "- Second approach: union-find. Give every land cell its own set, union it with its right and down neighbours (wrapping), and the number of islands is the land count minus the successful unions. Same asymptotic cost, and it is the one that extends.",
      "- With one row or one column, a cell's wrapped neighbour can be itself or the same cell twice; the visited check makes that harmless, but test it.",
      "- Flips: turning water into land is easy with union-find, add a set and union with land neighbours. Turning land into water is a deletion, which union-find cannot undo. Options: recompute the affected component with a search, process the stream offline in reverse so that deletions become insertions, or use a dynamic-connectivity structure if the stream is large and online.",
    ].join("\n"),
    judge: {
      starterCode: `/**
 * @param {number[][]} grid - 0 = water, 1 = land, edges wrap around
 * @returns {number} number of islands
 */
function countTorusIslands(grid) {
  // Your code here
  return 0;
}
`,
      solutionCode: `function countTorusIslands(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  const seen = grid.map((row) => row.map(() => false));
  let islands = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== 1 || seen[r][c]) continue;
      islands++;
      const stack = [[r, c]];
      seen[r][c] = true;
      while (stack.length > 0) {
        const [cr, cc] = stack.pop();
        for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nr = (cr + dr + rows) % rows; // wrap top/bottom
          const nc = (cc + dc + cols) % cols; // wrap left/right
          if (grid[nr][nc] === 1 && !seen[nr][nc]) {
            seen[nr][nc] = true;
            stack.push([nr, nc]);
          }
        }
      }
    }
  }
  return islands;
}
`,
      entry: "countTorusIslands",
      tests: [
        {
          name: "Four corners are one island",
          input: [
            [
              [1, 0, 1],
              [0, 0, 0],
              [1, 0, 1],
            ],
          ],
          expected: 1,
        },
        {
          name: "A row wraps left to right",
          input: [
            [
              [1, 0, 0, 1],
              [0, 1, 0, 0],
            ],
          ],
          expected: 2,
        },
        {
          name: "No wrap involved",
          input: [
            [
              [0, 0, 0, 0],
              [0, 1, 1, 0],
              [0, 0, 0, 0],
              [0, 1, 0, 0],
            ],
          ],
          expected: 2,
        },
        {
          name: "A column wraps top to bottom",
          input: [
            [
              [0, 1, 0],
              [0, 0, 0],
              [0, 0, 0],
              [0, 1, 0],
            ],
          ],
          expected: 1,
        },
        {
          name: "All water",
          input: [
            [
              [0, 0],
              [0, 0],
            ],
          ],
          expected: 0,
        },
        { name: "One land cell", input: [[[1]]], expected: 1 },
        { name: "A single row", input: [[[1, 0, 1, 0, 1]]], expected: 2 },
        {
          name: "Diagonal neighbours do not connect",
          input: [
            [
              [1, 0, 0],
              [0, 1, 0],
              [0, 0, 1],
            ],
          ],
          expected: 3,
        },
        {
          name: "All land",
          input: [
            [
              [1, 1],
              [1, 1],
            ],
          ],
          expected: 1,
        },
      ],
    },
  },
  {
    slug: "reverse-k-group-order",
    title: "Reverse the Order of K-Groups",
    category: "algorithms",
    difficulty: "medium",
    companies: ["bytedance", "tiktok"],
    summary:
      "Not the usual reversal inside each group: the groups of k nodes change places while each keeps its internal order, done by prepending each group to the result.",
    prompt: [
      "Given the head of a singly linked list and an integer `k >= 1`, cut the list into consecutive groups of `k` nodes, starting from the head; the last group may be shorter. Reverse the **order of the groups** while keeping the nodes inside each group in their original order, and return the new head.",
      "",
      "```",
      "k = 3:  1 -> 2 -> 3 -> 4 -> 5 -> 6        becomes  4 -> 5 -> 6 -> 1 -> 2 -> 3",
      "k = 3:  1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7   becomes  7 -> 4 -> 5 -> 6 -> 1 -> 2 -> 3",
      "k = 1:  1 -> 2 -> 3                       becomes  3 -> 2 -> 1",
      "```",
      "",
      "Nodes are objects of the form `{ val, next }`, with `next` set to `null` at the end. Relink the existing nodes; use O(1) extra space. In the interview you build the list and the test scaffolding yourself.",
    ].join("\n"),
    hints: [
      "Clarify which reversal is wanted before writing anything. The well-known problem reverses the nodes inside every group; this one moves whole groups.",
      "You never need to touch the links inside a group. Only each group's last `next` pointer changes.",
      "Walk the list one group at a time, and attach everything collected so far *behind* the group you just cut off.",
    ],
    solution: [
      "## Approach",
      "",
      "Keep `result`, the head of the groups already processed, initially empty. Repeatedly take the next group: remember its first node, advance up to `k - 1` links to find its last node, and save the node after that as the start of the next group. Point the group's last node at `result`, and make the group's first node the new `result`. Each group is thereby placed in front of all earlier ones, which reverses the group order while every link inside a group is left alone.",
      "",
      "One pass, O(n) time, O(1) extra space.",
      "",
      "## Worth saying out loud",
      "",
      "- `k = 1` reverses the whole list and `k >= length` leaves it unchanged; both fall out of the loop without special cases, and both are worth a test.",
      "- The variants reported for the classic in-group reversal: reverse the short tail as well (drop the length check and reverse whatever remains), or implement a plain list reversal first as a warm-up.",
      "- The usual failure is a cycle from a stale `next` pointer. Here every group's tail is reassigned and the very first group's tail becomes `null`, so the list always terminates; a test driver with a step limit catches it if not.",
    ].join("\n"),
    judge: {
      starterCode: `/**
 * A node is { val: number, next: node | null }.
 *
 * @param {{val: number, next: object | null} | null} head
 * @param {number} k
 * @returns {{val: number, next: object | null} | null} the new head
 */
function reverseGroupOrder(head, k) {
  // Your code here
  return head;
}
`,
      solutionCode: `function reverseGroupOrder(head, k) {
  let result = null; // the groups processed so far, already in their final order
  let node = head;
  while (node !== null) {
    const groupHead = node;
    let groupTail = node;
    for (let i = 1; i < k && groupTail.next !== null; i++) groupTail = groupTail.next;
    node = groupTail.next; // where the next group starts
    groupTail.next = result; // this group goes in front of everything before it
    result = groupHead;
  }
  return result;
}
`,
      entry: "__runReverseGroupOrder",
      driverCode: `function __runReverseGroupOrder(items, k) {
  let head = null;
  for (let i = items.length - 1; i >= 0; i--) head = { val: items[i], next: head };
  const out = [];
  let node = reverseGroupOrder(head, k);
  while (node !== null && node !== undefined) {
    if (out.length > items.length) return "the list has a cycle or extra nodes";
    out.push(node.val);
    node = node.next;
  }
  return out;
}
`,
      tests: [
        {
          name: "Two full groups",
          input: [[1, 2, 3, 4, 5, 6], 3],
          expected: [4, 5, 6, 1, 2, 3],
        },
        {
          name: "A short last group moves to the front",
          input: [[1, 2, 3, 4, 5, 6, 7], 3],
          expected: [7, 4, 5, 6, 1, 2, 3],
        },
        {
          name: "k = 1 reverses the list",
          input: [[1, 2, 3], 1],
          expected: [3, 2, 1],
        },
        {
          name: "k equal to the length",
          input: [[1, 2, 3, 4], 4],
          expected: [1, 2, 3, 4],
        },
        {
          name: "k larger than the length",
          input: [[1, 2], 5],
          expected: [1, 2],
        },
        { name: "Empty list", input: [[], 2], expected: [] },
        { name: "One node", input: [[9], 2], expected: [9] },
        {
          name: "Pairs",
          input: [[1, 2, 3, 4, 5, 6, 7, 8], 2],
          expected: [7, 8, 5, 6, 3, 4, 1, 2],
        },
        {
          name: "Three groups with a remainder of two",
          input: [[5, 4, 3, 2, 1, 0, 9, 8], 3],
          expected: [9, 8, 2, 1, 0, 5, 4, 3],
        },
      ],
    },
  },
];
