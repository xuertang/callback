import type { Problem } from "./types";

// Disney software-engineer bank, part A: the practical coding questions
// from the Streaming and Experiences phone screens — a rule-based ad filter
// and a set without hashing. Judged in JavaScript; one question each.

export const disneyProblemsA: Problem[] = [
  {
    slug: "filter-ads-by-rule",
    title: "Filter Ads by a Single Rule",
    category: "algorithms",
    difficulty: "easy",
    companies: ["disney"],
    summary:
      "Optional location, minimum-age and maximum-age constraints combined with AND or OR; an absent constraint is ignored, and no constraint matches everything.",
    prompt: [
      "When a viewer starts a stream, the ad server filters its pool down to the ads that match **one targeting rule**.",
      "",
      'Each ad is described by three parallel arrays: `adIds[i]` is the ad\'s id, `adLocations[i]` is the list of locations it targets (for example `["US", "CA"]`) and `adAges[i]` is the viewer age it is meant for.',
      "",
      'The rule is `ruleLocations` (a list of required locations; empty means the location constraint is absent), `ruleMinAge` and `ruleMaxAge` (`-1` means that constraint is absent) and an `operator`, `"AND"` or `"OR"`.',
      "",
      "- The location constraint, when present, is satisfied when every required location is among the ad's locations. Compare locations case-insensitively.",
      "- The minimum-age constraint, when present, is satisfied when `adAge >= ruleMinAge`; the maximum-age one when `adAge <= ruleMaxAge`.",
      "- `AND` requires every present constraint; `OR` requires at least one. An absent constraint is ignored, and when no constraint is present every ad matches.",
      "",
      "Return the matching ad ids in their original order.",
      "",
      "```",
      'adIds       = ["A", "B", "C"]',
      'adLocations = [["US", "CA"], ["US"], ["CA"]]',
      "adAges      = [21, 13, 25]",
      'rule: ruleLocations = ["US"], ruleMinAge = 21, ruleMaxAge = -1',
      "",
      'operator "AND"  ->  ["A"]            (B fails the age, C the location)',
      'operator "OR"   ->  ["A", "B", "C"]  (B passes location, C passes age)',
      "```",
      "",
      "The pool can be large; keep the work per ad proportional to its number of locations.",
    ].join("\n"),
    hints: [
      "Build the list of *present* constraints first, each as a predicate over one ad. The operator then reduces to `every` or `some` over that list, and an empty list means every ad matches.",
      "Normalise locations to one case once, and put the ad's locations in a `Set` so each required location is a constant-time lookup.",
    ],
    solution: [
      "## Approach",
      "",
      'Translate the rule into a list of predicates, one per constraint that is actually present: a subset check on upper-cased locations, `age >= min`, `age <= max`. With the list in hand, `AND` is `every` and `OR` is `some`; an empty list makes both return true, which is the "no constraint present" rule for free. Each ad\'s locations go into a `Set` once, so the subset check costs one lookup per required location, and a single pass over the pool in order gives the answer in input order.',
      "",
      "## Worth saying out loud",
      "",
      "- The trap is treating an absent constraint as a failing one under `OR` (nothing matches) or a passing one under `AND` (everything matches). Dropping absent constraints before combining avoids both.",
      '- Ask whether an empty `ruleLocations` means "absent" or "no location may match"; the prompt says absent, and the answer changes if it does not.',
      "- Follow-ups: several rules at once (apply each and union or intersect the id sets), excluded locations, and age *ranges* on the ad rather than one intended age.",
    ].join("\n"),
    judge: {
      starterCode: `/**
 * @param {string[]} adIds
 * @param {string[][]} adLocations
 * @param {number[]} adAges
 * @param {string[]} ruleLocations - empty = constraint absent
 * @param {number} ruleMinAge - -1 = absent
 * @param {number} ruleMaxAge - -1 = absent
 * @param {"AND" | "OR"} operator
 * @returns {string[]} matching ad ids, in input order
 */
function filterAds(adIds, adLocations, adAges, ruleLocations, ruleMinAge, ruleMaxAge, operator) {
  // Your code here
  return [];
}
`,
      solutionCode: `function filterAds(adIds, adLocations, adAges, ruleLocations, ruleMinAge, ruleMaxAge, operator) {
  const required = ruleLocations.map((l) => l.toUpperCase());
  const checks = []; // one predicate per constraint that is present
  if (required.length > 0) {
    checks.push((i) => {
      const have = new Set(adLocations[i].map((l) => l.toUpperCase()));
      return required.every((l) => have.has(l));
    });
  }
  if (ruleMinAge >= 0) checks.push((i) => adAges[i] >= ruleMinAge);
  if (ruleMaxAge >= 0) checks.push((i) => adAges[i] <= ruleMaxAge);

  const matches =
    operator === "AND"
      ? (i) => checks.every((check) => check(i))
      : (i) => checks.length === 0 || checks.some((check) => check(i));
  return adIds.filter((_, i) => matches(i));
}
`,
      entry: "filterAds",
      tests: [
        {
          name: "Prompt example, AND",
          input: [
            ["A", "B", "C"],
            [["US", "CA"], ["US"], ["CA"]],
            [21, 13, 25],
            ["US"],
            21,
            -1,
            "AND",
          ],
          expected: ["A"],
        },
        {
          name: "Prompt example, OR",
          input: [
            ["A", "B", "C"],
            [["US", "CA"], ["US"], ["CA"]],
            [21, 13, 25],
            ["US"],
            21,
            -1,
            "OR",
          ],
          expected: ["A", "B", "C"],
        },
        {
          name: "No constraint present matches every ad",
          input: [["A", "B"], [["US"], ["CA"]], [10, 60], [], -1, -1, "OR"],
          expected: ["A", "B"],
        },
        {
          name: "Locations compare case-insensitively",
          input: [
            ["A", "B"],
            [["us", "ca"], ["Ca"]],
            [30, 30],
            ["US"],
            -1,
            -1,
            "AND",
          ],
          expected: ["A"],
        },
        {
          name: "Maximum age alone",
          input: [
            ["A", "B", "C"],
            [["US"], ["US"], ["US"]],
            [21, 13, 25],
            [],
            -1,
            20,
            "AND",
          ],
          expected: ["B"],
        },
        {
          name: "Every required location must be present",
          input: [
            ["A", "B", "C"],
            [["US", "CA", "MX"], ["US"], ["CA", "US"]],
            [40, 40, 40],
            ["US", "CA"],
            -1,
            -1,
            "AND",
          ],
          expected: ["A", "C"],
        },
        {
          name: "OR with a single present constraint",
          input: [
            ["A", "B", "C"],
            [["US"], ["CA"], ["US"]],
            [18, 18, 65],
            [],
            21,
            -1,
            "OR",
          ],
          expected: ["C"],
        },
        {
          name: "Age range with both bounds, AND",
          input: [
            ["A", "B", "C", "D"],
            [["US"], ["US"], ["US"], ["US"]],
            [17, 18, 34, 35],
            [],
            18,
            34,
            "AND",
          ],
          expected: ["B", "C"],
        },
      ],
    },
  },
  {
    slug: "set-without-hashing",
    title: "Set Without a Hash Function",
    category: "algorithms",
    difficulty: "medium",
    companies: ["disney"],
    summary:
      "add, remove, contains and size on a fixed-length array you allocate yourself, growing and shrinking it; then how hashing values to indices would change the costs.",
    prompt: [
      "Implement a set of integers from scratch. It stores distinct values and supports `add(x)` (returns whether `x` was inserted), `remove(x)` (returns whether `x` was present), `contains(x)` and `size()`.",
      "",
      "Do not use the language's built-in `Set`, `Map` or an object used as a dictionary, and do not hash. The backing storage is an array of a fixed length that you allocate yourself (`new Array(capacity)`); when the number of stored elements grows or shrinks enough, allocate an array of a different length and move the elements across.",
      "",
      "```",
      "s = new ArraySet()",
      "s.add(3)       ->  true",
      "s.add(3)       ->  false     // already present",
      "s.contains(3)  ->  true",
      "s.remove(7)    ->  false     // absent",
      "s.remove(3)    ->  true",
      "s.size()       ->  0",
      "```",
      "",
      "Explain your growth and shrink policy and the cost of each operation. Then be ready to discuss how hashing a value to an index would improve it, and what changes if several threads use the set at once.",
    ].join("\n"),
    hints: [
      "Keep the live elements packed at the front of the array and track the count yourself. `remove` can swap the last element into the hole, so nothing shifts.",
      "Grow by doubling when the array is full, and shrink when it is a quarter full rather than half: a gap between the two thresholds stops an add/remove pair at the boundary from reallocating every time.",
      "Without hashing, `contains` is a linear scan, so `add` and `remove` are O(n) too. With a hash, the scan becomes a lookup in one bucket or a short probe sequence.",
    ],
    solution: [
      "## Approach",
      "",
      "The array holds the live elements packed at indices `0..count-1`. `contains` scans them. `add` scans, then appends when absent, doubling the array first if it is full. `remove` scans, then moves the last element into the vacated slot and decrements the count, so removal is a swap rather than a shift. When the count falls to a quarter of the capacity and the capacity is above a floor, the array halves. Scans are O(n); the appends and the resizes amortise to O(1) per operation because each resize moves at most as many elements as were added or removed since the last one.",
      "",
      "## Worth saying out loud",
      "",
      "- Shrinking at a quarter, not a half, is the point of the policy: shrinking at a half means one add then one remove at the boundary reallocates twice.",
      "- The slow part is the scan. Hashing the value to an index gives O(1) average `contains`, `add` and `remove`: buckets with chaining or open addressing with a probe sequence, resized by the same doubling policy, keyed on the load factor instead of the count.",
      "- Thread safety: a single lock makes every operation correct and serialises them; striped locks per bucket or a lock-free scheme recover concurrency, at the cost of a far subtler `size`.",
      "- Order is not promised, and the swap-remove changes it; say so before anyone iterates the set.",
    ].join("\n"),
    judge: {
      starterCode: `class ArraySet {
  constructor() {
    // Your storage here: a fixed-length array you resize yourself.
    // No Set, Map, object-as-dictionary or hashing.
  }

  /** @returns {boolean} true if x was inserted, false if already present */
  add(x) {
    // Your code here
    return false;
  }

  /** @returns {boolean} true if x was removed, false if absent */
  remove(x) {
    // Your code here
    return false;
  }

  /** @returns {boolean} */
  contains(x) {
    // Your code here
    return false;
  }

  /** @returns {number} */
  size() {
    // Your code here
    return 0;
  }
}
`,
      solutionCode: `class ArraySet {
  constructor() {
    this.items = new Array(8);
    this.count = 0;
  }

  indexOf(x) {
    for (let i = 0; i < this.count; i++) if (this.items[i] === x) return i;
    return -1;
  }

  resize(capacity) {
    const next = new Array(capacity);
    for (let i = 0; i < this.count; i++) next[i] = this.items[i];
    this.items = next;
  }

  add(x) {
    if (this.indexOf(x) !== -1) return false;
    if (this.count === this.items.length) this.resize(this.items.length * 2);
    this.items[this.count++] = x;
    return true;
  }

  remove(x) {
    const i = this.indexOf(x);
    if (i === -1) return false;
    this.items[i] = this.items[this.count - 1]; // swap the last element in
    this.count--;
    // Shrink at a quarter full, never below the initial capacity.
    if (this.items.length > 8 && this.count * 4 <= this.items.length) {
      this.resize(this.items.length / 2);
    }
    return true;
  }

  contains(x) {
    return this.indexOf(x) !== -1;
  }

  size() {
    return this.count;
  }
}
`,
      entry: "__runSetOperations",
      // "fill a b" adds every integer in [a, b] and reports how many were new;
      // "drain a b" removes them and reports how many were present; "check a b"
      // counts how many of them the set contains.
      driverCode: `function __runSetOperations(operations, args) {
  let set = null;
  const out = [];
  for (let i = 0; i < operations.length; i++) {
    const op = operations[i];
    const a = args[i];
    if (op === "ArraySet") {
      set = new ArraySet();
      out.push(null);
    } else if (op === "fill" || op === "drain" || op === "check") {
      let n = 0;
      for (let x = a[0]; x <= a[1]; x++) {
        const hit = op === "fill" ? set.add(x) : op === "drain" ? set.remove(x) : set.contains(x);
        if (hit) n++;
      }
      out.push(n);
    } else {
      out.push(set[op](...a));
    }
  }
  return out;
}
`,
      tests: [
        {
          name: "Prompt example",
          input: [
            ["ArraySet", "add", "add", "contains", "remove", "remove", "size"],
            [[], [3], [3], [3], [7], [3], []],
          ],
          expected: [null, true, false, true, false, true, 0],
        },
        {
          name: "Empty set",
          input: [
            ["ArraySet", "size", "contains", "remove"],
            [[], [], [1], [1]],
          ],
          expected: [null, 0, false, false],
        },
        {
          name: "Grows past its initial capacity",
          input: [
            ["ArraySet", "fill", "size", "check", "contains", "fill"],
            [[], [1, 100], [], [1, 100], [101], [50, 150]],
          ],
          expected: [null, 100, 100, 100, false, 50],
        },
        {
          name: "Shrinks and keeps working",
          input: [
            [
              "ArraySet",
              "fill",
              "drain",
              "size",
              "check",
              "check",
              "add",
              "size",
            ],
            [[], [1, 1000], [1, 990], [], [991, 1000], [1, 990], [5], []],
          ],
          expected: [null, 1000, 990, 10, 10, 0, true, 11],
        },
        {
          name: "Negative numbers and zero",
          input: [
            ["ArraySet", "add", "add", "add", "contains", "contains", "size"],
            [[], [-1], [0], [-1], [-1], [1], []],
          ],
          expected: [null, true, true, false, true, false, 2],
        },
      ],
    },
  },
];
