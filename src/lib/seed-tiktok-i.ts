import type { Problem } from "./types";

// TikTok and ByteDance bank, part I: tree questions — path sums on an n-ary
// tree, equalising root-to-leaf sums, and the maximum path sum with the path
// itself. Judged in JavaScript; trees arrive as parent or child index arrays.

export const tiktokProblemsI: Problem[] = [
  {
    slug: "nary-tree-path-sum-count",
    title: "Count Path Sums in an N-ary Tree",
    category: "algorithms",
    difficulty: "medium",
    companies: ["bytedance", "tiktok"],
    summary:
      "Count downward paths that add up to a target when a node can have any number of children: a prefix-sum counter that is scoped to the current root-to-node path.",
    prompt: [
      "A rooted tree has `n` nodes numbered `0` to `n - 1`. Node `i` holds `values[i]`, and `parents[i]` is its parent; the root is node `0` with `parents[0] = -1`. A node may have any number of children.",
      "",
      "Count the **downward paths** whose values add up to `target`. A downward path starts at any node and follows parent-to-child links to any descendant; a single node is a path.",
      "",
      "```",
      "values  = [10, 5, -3, 3, 2, 11, 3, -2, 1]",
      "parents = [-1, 0,  0, 1, 1,  2, 3,  3, 4]",
      "target  = 8",
      "answer  = 3      // 5 -> 3,  5 -> 2 -> 1,  -3 -> 11",
      "```",
      "",
      "Up to 200,000 nodes, values may be negative, and the tree may be a single long chain. Starting a search from every node is too slow, and so is deep recursion.",
    ].join("\n"),
    hints: [
      "For an array, the number of subarrays summing to `target` comes from prefix sums and a hash map. A root-to-node path is an array.",
      "At a node with running sum `S`, every ancestor prefix equal to `S - target` marks the start of a path that ends here.",
      "The map must describe only the current root-to-node path: add the node's prefix when you enter it and remove it when you leave, so siblings do not see each other.",
    ],
    solution: [
      "## Approach",
      "",
      "Walk the tree depth-first, carrying the sum `S` of the values from the root to the current node and a map from prefix sum to how many times it occurs on the current root-to-node path, seeded with `{0: 1}` for the empty prefix. On entering a node, add `count[S - target]` to the answer, since each such prefix is the point just above the start of a path ending here, then increment `count[S]`. On leaving the node, decrement `count[S]`. The number of children does not matter; they are simply iterated.",
      "",
      "With an explicit stack of enter and leave events the walk handles a 200,000-node chain without recursion. O(n) time and O(n) space.",
      "",
      "## Worth saying out loud",
      "",
      "- The brute force, a search from every node, is O(n * h), which is quadratic on a chain; say it and move on.",
      "- A sliding window does not work: values can be negative, and a tree has many paths sharing a prefix.",
      "- Forgetting to undo the map on the way out is the standard bug; it counts paths that jump between branches.",
      "- Ask how the tree is represented. With node objects and a `children` list the algorithm is unchanged.",
    ].join("\n"),
    judge: {
      starterCode: `/**
 * @param {number[]} values - values[i] is the value of node i
 * @param {number[]} parents - parents[i] is the parent of node i; parents[0] = -1
 * @param {number} target
 * @returns {number} number of downward paths whose values sum to target
 */
function countPathSums(values, parents, target) {
  // Your code here
  return 0;
}
`,
      solutionCode: `function countPathSums(values, parents, target) {
  const n = values.length;
  const children = Array.from({ length: n }, () => []);
  for (let i = 1; i < n; i++) children[parents[i]].push(i);

  const onPath = new Map([[0, 1]]); // prefix sum -> occurrences on the current root-to-node path
  let count = 0;
  // Stack of [node, prefix sum above the node, leaving?].
  const stack = [[0, 0, false]];
  while (stack.length > 0) {
    const [node, above, leaving] = stack.pop();
    const sum = above + values[node];
    if (leaving) {
      onPath.set(sum, onPath.get(sum) - 1);
      continue;
    }
    count += onPath.get(sum - target) || 0;
    onPath.set(sum, (onPath.get(sum) || 0) + 1);
    stack.push([node, above, true]); // undo after the subtree is done
    for (const child of children[node]) stack.push([child, sum, false]);
  }
  return count;
}
`,
      entry: "countPathSums",
      tests: [
        {
          name: "Prompt example",
          input: [
            [10, 5, -3, 3, 2, 11, 3, -2, 1],
            [-1, 0, 0, 1, 1, 2, 3, 3, 4],
            8,
          ],
          expected: 3,
        },
        {
          name: "A single node that matches",
          input: [[7], [-1], 7],
          expected: 1,
        },
        {
          name: "A single node that does not",
          input: [[7], [-1], 1],
          expected: 0,
        },
        {
          name: "A chain with zeros: many paths",
          input: [[0, 0, 0], [-1, 0, 1], 0],
          expected: 6,
        },
        {
          name: "A wide node",
          input: [[1, 2, 2, 2, 2], [-1, 0, 0, 0, 0], 3],
          expected: 4,
        },
        {
          name: "Siblings never combine",
          input: [[0, 4, 4], [-1, 0, 0], 8],
          expected: 0,
        },
        {
          name: "Negative values cancel",
          input: [[1, -1, 1, -1, 1], [-1, 0, 1, 2, 3], 0],
          expected: 6,
        },
        {
          name: "Children listed before their parents",
          input: [[5, 1, 2, 3], [-1, 3, 3, 0], 8],
          expected: 1,
        },
      ],
    },
  },
  {
    slug: "equalize-nary-path-sums",
    title: "Equalize Root-to-Leaf Sums in an N-ary Tree",
    category: "algorithms",
    difficulty: "medium",
    companies: ["bytedance"],
    summary:
      "Raise node values by one at a time until every root-to-leaf path has the same sum, using the fewest increments: lift each shortfall as high in the tree as it can go.",
    prompt: [
      "A rooted tree has `n` nodes numbered `0` to `n - 1`. Node `i` holds the non-negative value `values[i]`, and `parents[i]` is its parent; the root is node `0` with `parents[0] = -1`. A node may have any number of children.",
      "",
      "In one operation you may increase the value of any single node by 1. Return the minimum number of operations needed to make the sum of values along **every root-to-leaf path** equal.",
      "",
      "```",
      "values = [2, 3, 4],             parents = [-1, 0, 0]              ->  1",
      "// raise the 3 to 4",
      "",
      "values = [1, 2, 3, 2, 2, 3, 3], parents = [-1, 0, 0, 1, 1, 2, 2]  ->  2",
      "// paths sum to 5, 5, 7, 7: raise node 1 twice, which fixes both of its leaves",
      "```",
      "",
      "Up to 200,000 nodes with values up to 1,000,000; the tree may be a long chain. The round asks you to write and run your own test cases.",
    ].join("\n"),
    hints: [
      "Paths can only get longer, so every path must reach the largest path sum that already exists below each node.",
      "Look at one node and its children. If the children's subtrees have already been equalised internally, each child subtree has a single path sum. What is the cheapest way to make those sums agree?",
      "Raising a child by `d` raises every path through it by `d` at a cost of `d`. Raising its leaves instead would cost `d` per leaf.",
    ],
    solution: [
      "## Approach",
      "",
      "Work bottom-up. For each node compute `best[v]`, the common path sum from `v` down to its leaves once its subtree has been equalised. A leaf has `best = values[v]`. For an internal node, the children's subtrees currently reach `best[c]` each; they must all match the largest one, `m`, because sums can only go up. A child that falls short by `m - best[c]` is fixed by raising that child itself, which lifts every path beneath it at the cost of exactly the shortfall, and no cheaper fix exists because each of those paths needs that much added somewhere in the child's subtree. Add the shortfalls to the answer and set `best[v] = values[v] + m`.",
      "",
      "Process nodes in reverse breadth-first order so every child is finished before its parent; no recursion is needed. O(n) time and space.",
      "",
      "## Worth saying out loud",
      "",
      "- Confirm whether internal nodes may be raised. If only leaves may change, the answer is the sum over leaves of (largest path sum - that leaf's path sum), which is larger: 4 instead of 2 in the second example.",
      "- The same greedy solves the binary version of this question; the n-ary change is only that the maximum is taken over a list.",
      "- With 200,000 values of up to a million the path sums exceed 32 bits; use a wide integer type.",
    ].join("\n"),
    judge: {
      starterCode: `/**
 * @param {number[]} values - values[i] is the value of node i
 * @param {number[]} parents - parents[i] is the parent of node i; parents[0] = -1
 * @returns {number} fewest +1 operations that make all root-to-leaf sums equal
 */
function minPathSumIncrements(values, parents) {
  // Your code here
  return 0;
}
`,
      solutionCode: `function minPathSumIncrements(values, parents) {
  const n = values.length;
  const children = Array.from({ length: n }, () => []);
  for (let i = 1; i < n; i++) children[parents[i]].push(i);

  // Breadth-first order from the root; reversed, it visits children before parents.
  const order = [0];
  for (let i = 0; i < order.length; i++) order.push(...children[order[i]]);

  const best = new Array(n).fill(0); // equalised path sum from the node down
  let operations = 0;
  for (let i = n - 1; i >= 0; i--) {
    const node = order[i];
    let tallest = 0;
    for (const child of children[node]) tallest = Math.max(tallest, best[child]);
    for (const child of children[node]) operations += tallest - best[child]; // raise the child itself
    best[node] = values[node] + tallest;
  }
  return operations;
}
`,
      entry: "minPathSumIncrements",
      tests: [
        {
          name: "Two leaves",
          input: [
            [2, 3, 4],
            [-1, 0, 0],
          ],
          expected: 1,
        },
        {
          name: "Prompt example: one raise fixes two leaves",
          input: [
            [1, 2, 3, 2, 2, 3, 3],
            [-1, 0, 0, 1, 1, 2, 2],
          ],
          expected: 2,
        },
        { name: "A single node", input: [[9], [-1]], expected: 0 },
        {
          name: "A chain has one path",
          input: [
            [4, 0, 7, 1],
            [-1, 0, 1, 2],
          ],
          expected: 0,
        },
        {
          name: "A wide root",
          input: [
            [0, 5, 1, 3, 5],
            [-1, 0, 0, 0, 0],
          ],
          expected: 6,
        },
        {
          name: "Leaves at different depths",
          input: [
            [1, 10, 1, 1, 1],
            [-1, 0, 0, 2, 3],
          ],
          expected: 7,
        },
        {
          name: "Shortfalls at two levels",
          input: [
            [0, 1, 1, 4, 2, 6],
            [-1, 0, 0, 1, 1, 2],
          ],
          expected: 4,
        },
        {
          name: "Children listed before their parents",
          input: [
            [3, 2, 8, 1],
            [-1, 3, 3, 0],
          ],
          expected: 6,
        },
      ],
    },
  },
  {
    slug: "max-path-sum-with-path",
    title: "Binary Tree Maximum Path Sum, With the Path",
    category: "algorithms",
    difficulty: "hard",
    companies: ["bytedance", "tiktok"],
    summary:
      "The maximum path sum is the warm-up; the follow-up wants the nodes on the path, which means recording which arm each node extends and stitching two arms together at the best bend.",
    prompt: [
      "A binary tree has `n` nodes numbered `0` to `n - 1`, with the root at node `0`. Node `i` has value `values[i]` (possibly negative), left child `left[i]` and right child `right[i]`, where `-1` means no child.",
      "",
      "A **path** is a sequence of distinct nodes in which each consecutive pair is joined by a parent-child edge. It may start and end anywhere and does not have to pass through the root, but it must contain at least one node. Return a path with the largest possible sum of values, as the list of node indices in order from one end to the other.",
      "",
      "```",
      "values = [-10, 9, 20, 15, 7]",
      "left   = [  1, -1,  3, -1, -1]",
      "right  = [  2, -1,  4, -1, -1]",
      "answer = [3, 2, 4]          // 15 + 20 + 7 = 42; [4, 2, 3] is equally good",
      "```",
      "",
      "If several paths tie, return any of them: the grader checks that your list is a real path and compares its sum with the optimum. Up to 10,000 nodes.",
    ].join("\n"),
    hints: [
      "First solve for the sum. For each node compute `down[v]`, the best sum of a path that starts at `v` and goes only downward; a negative arm is dropped.",
      "The best path that bends at `v` is `values[v]` plus the positive left arm plus the positive right arm.",
      "To recover the nodes, remember for each node which child its best downward arm continues into. The answer is the left arm reversed, the bend node, then the right arm.",
    ],
    solution: [
      "## Approach",
      "",
      "Process nodes children-first. `down[v] = values[v] + max(0, down[left], down[right])` is the best path that starts at `v` and descends, and `next[v]` records which child that arm continues into, or `-1` when stopping at `v` is best. The best path whose highest node is `v` has sum `values[v] + max(0, down[left]) + max(0, down[right])`; track the node `b` where this is largest.",
      "",
      "Rebuild the path at `b`: if the left arm is positive, follow `next` pointers from the left child to list that arm top-down, and reverse it; append `b`; if the right arm is positive, append the right arm top-down. O(n) time and space.",
      "",
      "## Worth saying out loud",
      "",
      "- Arms are clamped at zero, the path itself is not: a tree of all-negative values still returns its single largest node.",
      "- Returning whole path lists from every recursive call costs O(n * h) copying. Pointers plus one reconstruction at the end keep it linear.",
      "- Variants the interviewers add: downward-only paths, a target-sum check, or a path that must not use the root. Each one changes which of `down` and the bend formula you read the answer from, so restate the contract of the helper before adapting it.",
    ].join("\n"),
    judge: {
      starterCode: `/**
 * @param {number[]} values - values[i] is the value of node i; node 0 is the root
 * @param {number[]} left - left[i] is the left child of node i, or -1
 * @param {number[]} right - right[i] is the right child of node i, or -1
 * @returns {number[]} node indices along a maximum-sum path, end to end
 */
function maxPathNodes(values, left, right) {
  // Your code here
  return [];
}
`,
      solutionCode: `function maxPathNodes(values, left, right) {
  const n = values.length;
  // Breadth-first order from the root; reversed, it visits children before parents.
  const order = [0];
  for (let i = 0; i < order.length; i++) {
    const node = order[i];
    if (left[node] !== -1) order.push(left[node]);
    if (right[node] !== -1) order.push(right[node]);
  }

  const down = new Array(n).fill(0); // best sum of a path starting at the node and descending
  const next = new Array(n).fill(-1); // the child that arm continues into, or -1
  const arm = (child) => (child === -1 ? 0 : Math.max(0, down[child]));
  let bestSum = -Infinity;
  let bend = 0;
  for (let i = order.length - 1; i >= 0; i--) {
    const node = order[i];
    const l = arm(left[node]);
    const r = arm(right[node]);
    down[node] = values[node] + Math.max(l, r);
    if (Math.max(l, r) > 0) next[node] = l >= r ? left[node] : right[node];
    if (values[node] + l + r > bestSum) {
      bestSum = values[node] + l + r;
      bend = node;
    }
  }

  const descend = (start) => {
    const nodes = [];
    for (let node = start; node !== -1; node = next[node]) nodes.push(node);
    return nodes;
  };
  const path = [];
  if (arm(left[bend]) > 0) path.push(...descend(left[bend]).reverse());
  path.push(bend);
  if (arm(right[bend]) > 0) path.push(...descend(right[bend]));
  return path;
}
`,
      entry: "__pathSum",
      // Any maximum path is accepted: the driver checks that the list is a
      // real path and reports its sum, which the tests compare to the optimum.
      driverCode: `function __pathSum(values, left, right) {
  const path = maxPathNodes(values, left, right);
  if (!Array.isArray(path) || path.length === 0) return "not a path: empty";
  const n = values.length;
  const seen = new Set();
  let sum = 0;
  for (let i = 0; i < path.length; i++) {
    const node = path[i];
    if (!Number.isInteger(node) || node < 0 || node >= n) return "not a path: bad node " + node;
    if (seen.has(node)) return "not a path: node " + node + " repeats";
    seen.add(node);
    if (i > 0) {
      const prev = path[i - 1];
      const joined = left[prev] === node || right[prev] === node || left[node] === prev || right[node] === prev;
      if (!joined) return "not a path: " + prev + " and " + node + " are not joined";
    }
    sum += values[node];
  }
  return sum;
}
`,
      tests: [
        {
          name: "Prompt example: the path avoids the root",
          input: [
            [-10, 9, 20, 15, 7],
            [1, -1, 3, -1, -1],
            [2, -1, 4, -1, -1],
          ],
          expected: 42,
        },
        { name: "A single node", input: [[5], [-1], [-1]], expected: 5 },
        {
          name: "A single negative node",
          input: [[-3], [-1], [-1]],
          expected: -3,
        },
        {
          name: "Both arms through the root",
          input: [
            [1, 2, 3],
            [1, -1, -1],
            [2, -1, -1],
          ],
          expected: 6,
        },
        {
          name: "All negative: the largest single node",
          input: [
            [-5, -2, -9, -1],
            [1, 3, -1, -1],
            [2, -1, -1, -1],
          ],
          expected: -1,
        },
        {
          name: "A negative node worth crossing",
          input: [
            [-1, 10, 10],
            [1, -1, -1],
            [2, -1, -1],
          ],
          expected: 19,
        },
        {
          name: "A long arm on one side only",
          input: [
            [2, 3, -8, 4, -1, 5],
            [1, 3, -1, 5, -1, -1],
            [2, 4, -1, -1, -1, -1],
          ],
          expected: 14,
        },
        {
          name: "The bend is deep in the tree",
          input: [
            [1, -20, 2, 6, 7, -3, 8, 9],
            [1, 3, 5, 6, -1, -1, -1, -1],
            [2, 4, -1, 7, -1, -1, -1, -1],
          ],
          expected: 23,
        },
      ],
    },
  },
];
