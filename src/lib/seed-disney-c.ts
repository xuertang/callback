import type { Problem } from "./types";

// Disney software-engineer bank, part C: the smaller coding questions from
// the data-science and ML screens — runway assignment with a heap, cosine
// ranking and the chasing-points simulation. Judged in JavaScript.

export const disneyProblemsC: Problem[] = [
  {
    slug: "runway-assignment",
    title: "Assign Each Flight a Runway",
    category: "algorithms",
    difficulty: "medium",
    companies: ["disney"],
    summary:
      "Runways are workers and flights are tasks: a heap of free times hands each flight, in start order, to the runway that frees up first.",
    prompt: [
      "An airport has `n` runways and `m` flights. Flight `i` wants the runway from `start_i` to `end_i`. Model the controller as a scheduler: runways are workers, flights are tasks, and each flight goes to the runway that becomes free soonest.",
      "",
      "Process flights in order of start time (ties by index). A runway that is already free when the flight's start arrives takes it and is busy until `end_i`. If every runway is still busy, the flight waits for the one that frees up first and occupies it for the flight's full duration from that moment, so the runway is next free at `freeTime + (end_i - start_i)`. Among runways free at the same time, pick the lowest index.",
      "",
      "Return an array of length `m` whose `i`-th element is the runway assigned to flight `i`, in the input order.",
      "",
      "```",
      "n = 2, flights = [[1, 2], [2, 3], [3, 5]]  ->  [0, 1, 0]",
      "n = 1, flights = [[0, 10], [1, 2], [2, 3]] ->  [0, 0, 0]   (flights 1 and 2 wait)",
      "```",
      "",
      "`1 <= n, m <= 100` and `0 <= start < end <= 1000`.",
    ].join("\n"),
    hints: [
      "Sort flight indices by start time; the greedy only works chronologically.",
      "Keep the runways in a min-heap (or, at this size, a scan) keyed by `(freeTime, index)`. Pop the earliest free runway, assign, and push it back with its new free time.",
      "The delayed case is the one to get right: the new free time is `max(freeTime, start) + (end - start)`, not `end`.",
    ],
    solution: [
      "## Approach",
      "",
      "Sort the flights by start time, breaking ties by index. Keep every runway's next free time, initially 0. For each flight take the runway with the smallest free time (lowest index on ties), record it, and set its free time to `max(freeTime, start) + duration`: a runway that was idle starts at `start` and finishes at `end`; a busy one starts the moment it frees up and keeps the flight's full duration. A heap keyed by `(freeTime, index)` makes each assignment O(log n); with n at most 100 a linear scan over the runways is just as acceptable, and the sort dominates either way: O(m log m + m log n).",
      "",
      "## Worth saying out loud",
      "",
      "- Why the greedy is optimal for total delay: giving the flight any later runway delays it more and ties up a runway a later flight could have used sooner.",
      '- "Efficient" is ambiguous. Minimising total delay, the latest finish, or the number of delayed flights leads to slightly different rules; say which one you are optimising.',
      "- Flights that cannot be delayed at all turn the problem into interval scheduling: report the infeasible ones instead of pushing them back.",
      "- Follow-ups: weights or priorities (a weighted greedy may no longer be optimal), maintenance windows per runway (the heap key needs per-runway availability), and a segment tree over time when n is huge.",
    ].join("\n"),
    judge: {
      starterCode: `/**
 * @param {number} n - number of runways, indexed 0..n-1
 * @param {number[][]} flights - [start, end] per flight
 * @returns {number[]} the runway assigned to each flight, in input order
 */
function assignRunways(n, flights) {
  // Your code here
  return [];
}
`,
      solutionCode: `function assignRunways(n, flights) {
  const order = flights.map((_, i) => i).sort((a, b) => flights[a][0] - flights[b][0] || a - b);
  const freeAt = new Array(n).fill(0);
  const assigned = new Array(flights.length);
  for (const i of order) {
    const [start, end] = flights[i];
    let best = 0; // earliest free runway, lowest index on ties
    for (let r = 1; r < n; r++) if (freeAt[r] < freeAt[best]) best = r;
    assigned[i] = best;
    freeAt[best] = Math.max(freeAt[best], start) + (end - start);
  }
  return assigned;
}
`,
      entry: "assignRunways",
      tests: [
        {
          name: "Prompt example",
          input: [
            2,
            [
              [1, 2],
              [2, 3],
              [3, 5],
            ],
          ],
          expected: [0, 1, 0],
        },
        {
          name: "One runway, later flights wait their turn",
          input: [
            1,
            [
              [0, 10],
              [1, 2],
              [2, 3],
            ],
          ],
          expected: [0, 0, 0],
        },
        {
          name: "A waiting flight keeps its full duration",
          input: [
            2,
            [
              [0, 10],
              [0, 10],
              [1, 4],
              [5, 6],
            ],
          ],
          expected: [0, 1, 0, 1],
        },
        {
          name: "Unsorted input keeps its indices",
          input: [
            2,
            [
              [5, 6],
              [0, 3],
              [3, 4],
              [1, 2],
            ],
          ],
          expected: [0, 0, 1, 1],
        },
        {
          name: "Ties on free time go to the lowest runway",
          input: [
            3,
            [
              [0, 1],
              [0, 1],
              [0, 1],
              [1, 2],
              [1, 2],
            ],
          ],
          expected: [0, 1, 2, 0, 1],
        },
        {
          name: "More runways than flights",
          input: [
            5,
            [
              [2, 9],
              [2, 9],
            ],
          ],
          expected: [0, 1],
        },
      ],
    },
  },
  {
    slug: "rank-by-cosine-similarity",
    title: "Rank Vectors by Cosine Similarity",
    category: "algorithms",
    difficulty: "easy",
    companies: ["disney"],
    summary:
      "Score every candidate against the query, keep the indices with the scores, sort descending; the zero vector needs a defined answer.",
    prompt: [
      "Given a query vector and a list of candidate vectors of the same dimension, rank the candidates by cosine similarity to the query, most similar first. Return the candidates' **indices** in that order; break ties by the smaller index.",
      "",
      "Cosine similarity is `dot(a, b) / (|a| |b|)`. Define the similarity to a zero-length vector (all components `0`) as `0`.",
      "",
      "```",
      "query = [1, 0]",
      "vectors = [[0, 1], [2, 0], [1, 1], [-1, 0]]",
      "->  [1, 2, 0, 3]      // similarities 1, 0.707, 0, -1",
      "```",
      "",
      "The sort is part of the task: do not rely on a library's top-k.",
    ].join("\n"),
    hints: [
      "Compute the query's magnitude once; recomputing it per candidate is the classic wasted work here.",
      "Score as `(similarity, index)` pairs so the sort keeps the mapping back to the inputs, then sort by similarity descending and index ascending.",
    ],
    solution: [
      "## Approach",
      "",
      "Precompute the query's magnitude. For each candidate compute the dot product and its own magnitude in one pass over the components; the similarity is their quotient, or `0` when either magnitude is zero. Keep `(similarity, index)` pairs and sort them by similarity descending, index ascending. Scoring is O(n d) for n vectors of dimension d and the sort is O(n log n), which dominates once n is large.",
      "",
      "## Worth saying out loud",
      "",
      "- The zero vector is the degenerate case: its direction is undefined, so pick a value and say so rather than dividing by zero.",
      "- If the vectors are already unit length the magnitudes are 1 and a dot product alone ranks them; the sort is still O(n log n), but a partial sort or a heap gives the top k in O(n log k).",
      "- At embedding scale this becomes approximate nearest neighbour search: an index such as HNSW trades exactness for sublinear queries.",
      "- A different metric changes the sort direction: Euclidean distance ranks ascending, dot product descending.",
    ].join("\n"),
    judge: {
      starterCode: `/**
 * @param {number[]} query
 * @param {number[][]} vectors
 * @returns {number[]} candidate indices, most similar first; ties by index
 */
function rankByCosine(query, vectors) {
  // Your code here
  return [];
}
`,
      solutionCode: `function rankByCosine(query, vectors) {
  const magnitude = (v) => Math.sqrt(v.reduce((s, x) => s + x * x, 0));
  const q = magnitude(query);
  const scored = vectors.map((v, index) => {
    const m = magnitude(v);
    const dot = v.reduce((s, x, i) => s + x * query[i], 0);
    return { index, score: q === 0 || m === 0 ? 0 : dot / (q * m) };
  });
  scored.sort((a, b) => b.score - a.score || a.index - b.index);
  return scored.map((s) => s.index);
}
`,
      entry: "rankByCosine",
      tests: [
        {
          name: "Prompt example",
          input: [
            [1, 0],
            [
              [0, 1],
              [2, 0],
              [1, 1],
              [-1, 0],
            ],
          ],
          expected: [1, 2, 0, 3],
        },
        {
          name: "Scale does not matter, direction does",
          input: [
            [3, 4],
            [
              [30, 40],
              [4, 3],
              [0.3, 0.4],
              [-3, -4],
            ],
          ],
          expected: [0, 2, 1, 3],
        },
        {
          name: "The zero vector scores 0 and sits between positive and negative",
          input: [
            [1, 1],
            [
              [0, 0],
              [1, 2],
              [-1, -1],
            ],
          ],
          expected: [1, 0, 2],
        },
        {
          name: "Ties keep input order",
          input: [
            [1, 0, 0],
            [
              [0, 1, 0],
              [0, 0, 1],
              [0, 1, 1],
            ],
          ],
          expected: [0, 1, 2],
        },
        {
          name: "Three dimensions",
          input: [
            [1, 2, 3],
            [
              [1, 2, 3],
              [3, 2, 1],
              [-1, -2, -3],
              [2, 4, 5],
            ],
          ],
          expected: [0, 3, 1, 2],
        },
      ],
    },
  },
  {
    slug: "chasing-points-meeting",
    title: "When Do the Chasing Points Meet?",
    category: "algorithms",
    difficulty: "medium",
    companies: ["disney"],
    summary:
      "N points in a cycle each move at unit speed toward the next one; simulate with a step small enough that the meeting time is right to the hundredth.",
    prompt: [
      "`N` points sit in the plane, indexed `0..N-1` in a cycle: at every instant point `i` moves at speed `1` straight toward the current position of point `(i + 1) mod N`. All points move at the same time and continuously.",
      "",
      "Return `[T, X, Y]`: the time `T` at which the points all meet, and where. Each case carries a reference answer, and the grader accepts a result within `0.02` of it on every component, so a careful simulation passes; aim for `1e-4` anyway. Numerical simulation is acceptable as long as it is accurate and fast.",
      "",
      "```",
      "points = [[0, 0], [10, 0]]",
      "->  [5, 5, 0]      // two points walk straight at each other",
      "",
      "points = [[0, 0], [2, 0], [2, 2], [0, 2]]",
      "->  [2, 1, 1]      // a square spirals into its centre",
      "```",
      "",
      "`2 <= N <= 200`; coordinates are real numbers with absolute value at most `1000`. The interviewer's version also allowed the answer `NEVER`; be ready to argue whether it can ever come up.",
    ].join("\n"),
    hints: [
      "Time-step: for each point compute the unit vector toward its target from the *current* positions, then move every point by `speed * dt` at once. Updating points one at a time inside a step biases the result.",
      "A fixed `dt` is either too slow or too coarse. Shrink the step as the points close in, for example `dt = min(0.001, minDistance / 10)`, and stop when every point is within a small tolerance of every other.",
      "For N = 2 the answer is the midpoint at `distance / 2`; for a regular polygon with side `s`, `T = s / (1 - cos(2π / N))`. Use these to check your simulation.",
    ],
    solution: [
      "## Approach",
      "",
      "Simulate. Each step computes, from the positions at the start of the step, the unit direction from every point to its target, then advances all points by `dt` along those directions; the meeting is detected when the largest distance between any point and its target drops under a tolerance such as `1e-5`, and the answer is the time and the centroid at that moment. The step shrinks as the points close in: `dt = min(1e-3, minGap / 10)` keeps the error small near the end, where the directions change fastest, without wasting steps at the start.",
      "",
      "## Why NEVER cannot happen",
      "",
      "The distance from a point to its target shrinks at rate `1 - cos θ`, where θ is the angle between the target's velocity and the line between them. That is never negative, and it is zero only when every target moves directly away from its chaser along the chasing line. Around a closed cycle that would make every point move in the same direction along one line while the last chases the first from the front, which is impossible. So the total of the gaps strictly decreases and the points meet in finite time; the only edge case is points that already coincide, which meet at `T = 0`.",
      "",
      "## Worth saying out loud",
      "",
      "- Regular polygons have a closed form, `T = s / (1 - cos(2π / N))`, and they are the test cases that catch a too-coarse step.",
      "- Simultaneous update matters: moving point 0 and then aiming point `N-1` at its new position is a different system.",
      "- Cost is `O(N × steps)`; the adaptive step keeps the count manageable, and a higher-order integrator would buy accuracy per step if the limit bit.",
    ].join("\n"),
    judge: {
      starterCode: `/**
 * @param {number[][]} points - [x, y] per point, in cycle order
 * @returns {number[]} [T, X, Y]: when and where the points meet
 */
function meetingPoint(points) {
  // Your code here
  return [0, 0, 0];
}
`,
      solutionCode: `function meetingPoint(points) {
  const n = points.length;
  const pos = points.map(([x, y]) => [x, y]);
  let t = 0;
  for (let step = 0; step < 5_000_000; step++) {
    const dirs = new Array(n);
    let minGap = Infinity;
    let maxGap = 0;
    for (let i = 0; i < n; i++) {
      const target = pos[(i + 1) % n];
      const dx = target[0] - pos[i][0];
      const dy = target[1] - pos[i][1];
      const d = Math.hypot(dx, dy);
      dirs[i] = d === 0 ? [0, 0] : [dx / d, dy / d];
      if (d < minGap) minGap = d;
      if (d > maxGap) maxGap = d;
    }
    if (maxGap < 1e-5) break; // everyone is on top of their target
    const dt = Math.min(1e-3, Math.max(minGap, 1e-7) / 10); // shrink the step as they close in
    for (let i = 0; i < n; i++) {
      pos[i][0] += dirs[i][0] * dt;
      pos[i][1] += dirs[i][1] * dt;
    }
    t += dt;
  }
  const cx = pos.reduce((s, p) => s + p[0], 0) / n;
  const cy = pos.reduce((s, p) => s + p[1], 0) / n;
  return [t, cx, cy];
}
`,
      entry: "__checkMeeting",
      // Each case carries its reference answer (from a fourth-order
      // integration at a tiny step); a result within 0.02 of it on every
      // component is reported as the reference, anything else as itself.
      driverCode: `function __checkMeeting(points, reference) {
  const got = meetingPoint(points);
  const close =
    Array.isArray(got) &&
    got.length === 3 &&
    got.every((v, i) => typeof v === "number" && Math.abs(v - reference[i]) <= 0.02);
  return close ? reference : got;
}
`,
      tests: [
        {
          name: "Two points meet halfway",
          input: [
            [
              [0, 0],
              [10, 0],
            ],
            [5, 5, 0],
          ],
          expected: [5, 5, 0],
        },
        {
          name: "A square spirals into its centre",
          input: [
            [
              [0, 0],
              [2, 0],
              [2, 2],
              [0, 2],
            ],
            [2, 1, 1],
          ],
          expected: [2, 1, 1],
        },
        {
          name: "An equilateral triangle: T = s / 1.5",
          input: [
            [
              [0, 0],
              [3, 0],
              [1.5, 2.598076211353316],
            ],
            [2, 1.5, 0.866],
          ],
          expected: [2, 1.5, 0.866],
        },
        {
          name: "Points that already coincide meet at once",
          input: [
            [
              [4, -1],
              [4, -1],
              [4, -1],
            ],
            [0, 4, -1],
          ],
          expected: [0, 4, -1],
        },
        {
          name: "A right triangle (no closed form)",
          input: [
            [
              [0, 0],
              [4, 0],
              [0, 3],
            ],
            [2.8066, 1.5514, 0.999],
          ],
          expected: [2.8066, 1.5514, 0.999],
        },
      ],
    },
  },
];
