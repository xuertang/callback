import type { Problem } from "./types";

// TikTok and ByteDance bank, part B: the LRU cache with per-entry expiry
// that follows the plain LRU in the coding rounds, and a calculator that
// validates before it evaluates. Judged in JavaScript.

export const tiktokProblemsB: Problem[] = [
  {
    slug: "lru-cache-with-ttl",
    title: "LRU Cache With Expiry",
    category: "algorithms",
    difficulty: "medium",
    companies: ["bytedance", "tiktok"],
    summary:
      "The LRU follow-up: every entry carries a time-to-live, an expired entry is a miss, and expired entries must not take up capacity when something has to be evicted.",
    prompt: [
      "Extend an LRU cache so that every entry expires. The clock is passed in: each call carries the current time `now`, and `now` never decreases from one call to the next.",
      "",
      "- `new ExpiringCache(capacity)` creates a cache that holds at most `capacity` live entries (`capacity >= 1`).",
      "- `put(key, value, ttl, now)` inserts or updates `key`. The entry expires at `now + ttl`; from that moment on it behaves as if it were not there.",
      "- `get(key, now)` returns the value when the key is present and has not expired, and `-1` otherwise.",
      "",
      "## Rules",
      "",
      "- A successful `get`, and any `put`, makes that key the most recently used.",
      "- A `put` on a live key updates its value, its expiry and its recency. A `put` on a missing or expired key is a fresh insert.",
      "- **Expired entries do not occupy capacity.** When a fresh insert finds `capacity` live entries, evict the least recently used live entry; an expired entry is never the reason a live one is evicted.",
      "",
      "```",
      "cache = new ExpiringCache(2)",
      'put("a", 1, 100, 0)   put("b", 2, 5, 0)',
      'put("c", 3, 100, 10)  // b expired at 5, so nothing live is evicted',
      'get("a", 10) -> 1     get("b", 10) -> -1     get("c", 10) -> 3',
      "```",
      "",
      "Be ready to explain what you would do when the cache's miss rate is high.",
    ].join("\n"),
    hints: [
      "Start from the plain LRU: a hash map plus recency order (a doubly linked list, or a `Map` whose insertion order you maintain by deleting and re-inserting).",
      "Lazy expiry handles `get`: check the entry's expiry when it is read, and delete it if it is past.",
      "Lazy expiry alone gets eviction wrong. In the example, the least recently used entry is `a`, but the entry that should make room is the expired `b`. Something has to find expired entries without scanning: a min-heap ordered by expiry time.",
    ],
    solution: [
      "## Approach",
      "",
      "Keep the LRU as it was: a `Map` from key to `{ value, expiresAt }`, with recency expressed by re-inserting a key whenever it is used, so the first key in iteration order is the least recently used. `get` adds one check: an entry whose `expiresAt` is at or before `now` is deleted and reported as a miss.",
      "",
      "Eviction needs to know which entries are already dead, wherever they sit in the recency order. A min-heap of `[expiresAt, key]` gives that: before a `put` decides anything, it pops every heap entry that is due and deletes the corresponding key if the stored expiry still matches (the entry may have been refreshed since, in which case the heap entry is stale and is dropped). After the purge every remaining entry is live, so the usual rule applies: if the key is new and the cache is full, evict the first key in the map.",
      "",
      "`get` is O(1). `put` is O(log n) amortised: each heap entry is pushed once and popped once.",
      "",
      "## Worth saying out loud",
      "",
      "- Lazy expiry on read is what most interviewers want first. The capacity rule is the part that forces the second structure; say which behaviour you are implementing before choosing.",
      "- Coarser alternatives to the heap: expiry buckets (a timer wheel) when times are coarse, or a periodic sweeper thread when a little dead weight is acceptable.",
      "- High miss rate: measure why first (capacity too small, TTL too short, keys too unique), then grow the cache, change the policy (LFU, or an admission filter such as TinyLFU so one-hit wonders do not evict regulars), add a second tier, or prefetch.",
      "- Concurrency: one lock is correct and simple; striped locks by key hash scale reads; the recency update on `get` is the write that makes a pure read lock impossible.",
    ].join("\n"),
    judge: {
      starterCode: `class ExpiringCache {
  /** @param {number} capacity */
  constructor(capacity) {
    // Your code here
  }

  /**
   * @param {string} key
   * @param {number} now
   * @returns {number} the value, or -1 on a miss
   */
  get(key, now) {
    return -1;
  }

  /**
   * @param {string} key
   * @param {number} value
   * @param {number} ttl - the entry expires at now + ttl
   * @param {number} now
   * @returns {void}
   */
  put(key, value, ttl, now) {}
}
`,
      solutionCode: `class ExpiringCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.entries = new Map(); // key -> { value, expiresAt }; iteration order = least recent first
    this.expiries = []; // min-heap of [expiresAt, key]; entries may be stale
  }

  get(key, now) {
    const entry = this.entries.get(key);
    if (!entry) return -1;
    if (entry.expiresAt <= now) {
      this.entries.delete(key);
      return -1;
    }
    this.entries.delete(key); // re-insert to mark as most recently used
    this.entries.set(key, entry);
    return entry.value;
  }

  put(key, value, ttl, now) {
    this.purge(now);
    if (this.entries.has(key)) {
      this.entries.delete(key);
    } else if (this.entries.size === this.capacity) {
      const oldest = this.entries.keys().next().value;
      this.entries.delete(oldest);
    }
    const expiresAt = now + ttl;
    this.entries.set(key, { value, expiresAt });
    this.push([expiresAt, key]);
  }

  /** Delete every entry that has expired by \`now\`. */
  purge(now) {
    while (this.expiries.length > 0 && this.expiries[0][0] <= now) {
      const [expiresAt, key] = this.pop();
      const entry = this.entries.get(key);
      if (entry && entry.expiresAt === expiresAt) this.entries.delete(key);
    }
  }

  push(item) {
    const heap = this.expiries;
    heap.push(item);
    let i = heap.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (heap[parent][0] <= heap[i][0]) break;
      [heap[i], heap[parent]] = [heap[parent], heap[i]];
      i = parent;
    }
  }

  pop() {
    const heap = this.expiries;
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
  }
}
`,
      entry: "__runExpiringCache",
      driverCode: `function __runExpiringCache(capacity, operations) {
  const cache = new ExpiringCache(capacity);
  return operations.map(([name, ...args]) => {
    const result = cache[name](...args);
    return result === undefined ? null : result;
  });
}
`,
      tests: [
        {
          name: "Prompt example: an expired entry makes the room",
          input: [
            2,
            [
              ["put", "a", 1, 100, 0],
              ["put", "b", 2, 5, 0],
              ["put", "c", 3, 100, 10],
              ["get", "a", 10],
              ["get", "b", 10],
              ["get", "c", 10],
            ],
          ],
          expected: [null, null, null, 1, -1, 3],
        },
        {
          name: "Plain LRU when nothing expires",
          input: [
            2,
            [
              ["put", "a", 1, 1000, 0],
              ["put", "b", 2, 1000, 1],
              ["get", "a", 2],
              ["put", "c", 3, 1000, 3],
              ["get", "b", 4],
              ["get", "a", 4],
              ["get", "c", 4],
            ],
          ],
          expected: [null, null, 1, null, -1, 1, 3],
        },
        {
          name: "An entry is gone at exactly now + ttl",
          input: [
            1,
            [
              ["put", "a", 7, 10, 5],
              ["get", "a", 14],
              ["get", "a", 15],
              ["get", "a", 16],
            ],
          ],
          expected: [null, 7, -1, -1],
        },
        {
          name: "put on a live key refreshes value, expiry and recency",
          input: [
            2,
            [
              ["put", "a", 1, 10, 0],
              ["put", "b", 2, 100, 1],
              ["put", "a", 9, 100, 5],
              ["get", "a", 50],
              ["put", "c", 3, 100, 51],
              ["get", "b", 52],
              ["get", "a", 52],
            ],
          ],
          expected: [null, null, null, 9, null, -1, 9],
        },
        {
          name: "An expired key put again is a fresh, most-recent entry",
          input: [
            2,
            [
              ["put", "a", 1, 5, 0],
              ["put", "b", 2, 100, 1],
              ["put", "a", 4, 100, 20],
              ["put", "c", 3, 100, 21],
              ["get", "b", 22],
              ["get", "a", 22],
              ["get", "c", 22],
            ],
          ],
          expected: [null, null, null, null, -1, 4, 3],
        },
        {
          name: "Several expired entries, none of them least recently used",
          input: [
            3,
            [
              ["put", "keep", 1, 1000, 0],
              ["put", "x", 2, 3, 1],
              ["put", "y", 3, 4, 2],
              ["put", "new1", 4, 1000, 10],
              ["put", "new2", 5, 1000, 11],
              ["get", "keep", 12],
              ["get", "x", 12],
              ["get", "new1", 12],
              ["get", "new2", 12],
            ],
          ],
          expected: [null, null, null, null, null, 1, -1, 4, 5],
        },
      ],
    },
  },
  {
    slug: "add-sub-calculator-validated",
    title: "Validated Add-Subtract Calculator",
    category: "algorithms",
    difficulty: "medium",
    companies: ["bytedance"],
    summary:
      "Evaluate digits joined by + and - only after proving the string is well formed: no stray characters, no leading zeros, no doubled operators, and everything inside 32 bits.",
    prompt: [
      "Write a function that validates an arithmetic expression and, if it is valid, evaluates it. Return the result as a number, or `null` when the expression is invalid.",
      "",
      "A valid expression:",
      "",
      "- contains only digits, `+` and `-`: no spaces, parentheses or other characters;",
      "- is a sequence of numbers separated by single binary operators, so it cannot be empty, cannot start or end with an operator, and cannot have two operators in a row;",
      "- has no number with a leading zero, except the number `0` itself;",
      "- has every number, and the final result, within the 32-bit signed range, `-2147483648` to `2147483647`.",
      "",
      "```",
      'evaluateAddSub("12-3+4")  ->  13',
      'evaluateAddSub("0")       ->  0',
      'evaluateAddSub("01+2")    ->  null   // leading zero',
      'evaluateAddSub("1++2")    ->  null   // adjacent operators',
      'evaluateAddSub("+1-2")    ->  null   // starts with an operator',
      'evaluateAddSub("12a-3")   ->  null   // invalid character',
      "```",
    ].join("\n"),
    hints: [
      "Parse it as a tiny state machine: expect a number, then either the end or an operator, then a number again.",
      "Check the leading-zero rule on each number's text, before converting it.",
      "A number with more than ten digits is out of range without converting it at all; that also keeps the conversion exact.",
    ],
    solution: [
      "## Approach",
      "",
      "Walk the string with an index. At each step read a maximal run of digits; an empty run means an operator or a foreign character stood where a number was required, which covers a leading operator, a trailing operator, doubled operators and an empty string. Reject the run if it has more than one digit and starts with `0`, or if it is longer than ten digits or larger than 2147483647. Add or subtract it according to the pending operator. After a number, the string must either end or continue with `+` or `-`, which becomes the pending operator; anything else is invalid. At the end, reject a total outside the 32-bit range.",
      "",
      "One pass, O(n) time, O(1) space.",
      "",
      "## Worth saying out loud",
      "",
      "- Validation and evaluation in one pass is fine, but nothing may be returned until the whole string has been accepted.",
      "- Only the final result is range-checked here. In a language with fixed-width integers the running total needs a wider type or a check before each step.",
      "- `-2147483648` is reachable only as a result (`0-2147483647-1`), never as a literal, because literals are unsigned.",
      "- A regular expression such as `^(0|[1-9]\\d*)([+-](0|[1-9]\\d*))*$` validates the shape in one line; the range checks still need code.",
    ].join("\n"),
    judge: {
      starterCode: `/**
 * @param {string} expression
 * @returns {number | null} the value, or null when the expression is invalid
 */
function evaluateAddSub(expression) {
  // Your code here
  return null;
}
`,
      solutionCode: `function evaluateAddSub(expression) {
  const MAX = 2147483647;
  const MIN = -2147483648;
  let total = 0;
  let sign = 1;
  let i = 0;
  for (;;) {
    // A number is required here.
    let end = i;
    while (end < expression.length && expression[end] >= "0" && expression[end] <= "9") end++;
    const text = expression.slice(i, end);
    if (text.length === 0) return null; // operator, foreign character, or the end
    if (text.length > 1 && text[0] === "0") return null; // leading zero
    if (text.length > 10 || Number(text) > MAX) return null;
    total += sign * Number(text);
    i = end;

    if (i === expression.length) break;
    if (expression[i] === "+") sign = 1;
    else if (expression[i] === "-") sign = -1;
    else return null;
    i++;
  }
  return total < MIN || total > MAX ? null : total;
}
`,
      entry: "evaluateAddSub",
      tests: [
        { name: "Mixed operators", input: ["12-3+4"], expected: 13 },
        { name: "The standalone zero", input: ["0"], expected: 0 },
        { name: "Zero as an operand", input: ["7+0-5"], expected: 2 },
        { name: "Leading zero", input: ["01+2"], expected: null },
        { name: "Adjacent operators", input: ["1++2"], expected: null },
        { name: "Starts with an operator", input: ["+1-2"], expected: null },
        { name: "Invalid character", input: ["12a-3"], expected: null },
        { name: "Empty string", input: [""], expected: null },
        { name: "Ends with an operator", input: ["5-"], expected: null },
        { name: "Spaces are not allowed", input: ["1 + 2"], expected: null },
        { name: "Double zero", input: ["00"], expected: null },
        {
          name: "A number above the 32-bit range",
          input: ["2147483648"],
          expected: null,
        },
        {
          name: "The result overflows",
          input: ["2147483647+1"],
          expected: null,
        },
        {
          name: "The most negative result is allowed",
          input: ["0-2147483647-1"],
          expected: -2147483648,
        },
        {
          name: "One below the range",
          input: ["0-2147483647-2"],
          expected: null,
        },
        { name: "A negative result", input: ["3-10"], expected: -7 },
      ],
    },
  },
];
