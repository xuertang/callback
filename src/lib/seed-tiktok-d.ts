import type { Problem } from "./types";

// TikTok and ByteDance bank, part D: four array and number questions from
// the phone screens — a digit-construction task, the min-plus-max subarray,
// fishing from ponds that decay, and the n/3 majority in a sorted array.
// Judged in JavaScript.

export const tiktokProblemsD: Problem[] = [
  {
    slug: "largest-number-below-limit",
    title: "Largest Number Below a Limit From Allowed Digits",
    category: "algorithms",
    difficulty: "medium",
    companies: ["bytedance"],
    summary:
      "Keep the limit's prefix as long as possible, step one digit down, then fill with the largest allowed digit; fall back to a shorter number, and mind leading zeros.",
    prompt: [
      "Given a positive integer `limit` and a set of allowed decimal digits, build the largest integer that is **strictly smaller** than `limit` and is written using only allowed digits. Digits may be reused any number of times.",
      "",
      '`limit` is passed as a decimal string (up to 100 digits, no leading zeros). Return the answer as a decimal string, or `"-1"` when no such number exists. The answer must be written canonically: no leading zeros, except that the number zero is `"0"`.',
      "",
      "```",
      'largestBelow("23415", [2, 4, 9])  ->  "22999"',
      'largestBelow("1000", [9])         ->  "999"',
      'largestBelow("10", [0, 1])        ->  "1"',
      'largestBelow("1", [1])            ->  "-1"',
      "```",
      "",
      "The screen leaves this problem under twenty minutes, so settle the two unspecified points first: leading zeros, and what to return when nothing fits.",
    ].join("\n"),
    hints: [
      "A number with as many digits as `limit` is smaller exactly when it agrees with `limit` on some prefix and then has a smaller digit. After that position every digit is free.",
      "The longer the shared prefix, the larger the result. So look for the **last** position where the prefix before it is made of allowed digits and an allowed digit smaller than the limit's digit exists.",
      "If no position works, the answer has one digit fewer: the largest allowed digit repeated. Zero needs care in both branches.",
    ],
    solution: [
      "## Approach",
      "",
      "Call the limit's length `n`. A same-length candidate copies the first `i` digits of `limit`, places the largest allowed digit that is smaller than `limit[i]` at position `i`, and fills the remaining `n - i - 1` positions with the largest allowed digit. It is valid only if the copied prefix consists of allowed digits, and it is larger the later `i` is, because it then agrees with the limit for longer. So compute how many leading digits of the limit are allowed, and scan `i` from that point back to zero, returning the first candidate that exists. At `i = 0` a zero is not a legal leading digit unless the number has one digit.",
      "",
      'If no same-length candidate exists, every number with `n - 1` digits is below the limit, so the answer is the largest allowed digit repeated `n - 1` times; when the only allowed digit is zero that collapses to `"0"`, and when `n` is one there is nothing shorter and the answer is `"-1"`.',
      "",
      "The scan is O(n) with at most ten digits tried per position.",
      "",
      "## Worth saying out loud",
      "",
      "- This is a greedy with one backtrack, the same shape as digit DP with a tight flag: positions before `i` are tight, position `i` goes loose, the rest is unconstrained.",
      "- Treating the limit as a string removes the overflow question and makes the 100-digit case free.",
      "- Test the edges, not the middle: a limit of `1`, a digit set of `{0}`, a limit whose own digits are all allowed, and a power of ten.",
    ].join("\n"),
    judge: {
      starterCode: `/**
 * @param {string} limit - a positive integer as a decimal string
 * @param {number[]} digits - allowed digits, 0-9
 * @returns {string} the largest allowed number below limit, or "-1"
 */
function largestBelow(limit, digits) {
  // Your code here
  return "-1";
}
`,
      solutionCode: `function largestBelow(limit, digits) {
  const allowed = [...new Set(digits)].sort((a, b) => a - b);
  const has = new Set(allowed);
  const top = String(allowed[allowed.length - 1]);
  const n = limit.length;

  // How many leading digits of the limit can be copied as they are.
  let copyable = 0;
  while (copyable < n && has.has(Number(limit[copyable]))) copyable++;

  // Same length: share the longest possible prefix, then step down once.
  for (let i = Math.min(copyable, n - 1); i >= 0; i--) {
    let smaller = -1;
    for (const d of allowed) if (d < Number(limit[i])) smaller = d;
    if (smaller === -1) continue;
    if (i === 0 && smaller === 0 && n > 1) continue; // a leading zero
    return limit.slice(0, i) + smaller + top.repeat(n - i - 1);
  }

  // One digit fewer: everything that short is below the limit.
  if (n === 1) return "-1";
  return top === "0" ? "0" : top.repeat(n - 1);
}
`,
      entry: "largestBelow",
      tests: [
        {
          name: "Prompt example",
          input: ["23415", [2, 4, 9]],
          expected: "22999",
        },
        {
          name: "Falls back to a shorter number",
          input: ["1000", [9]],
          expected: "999",
        },
        {
          name: "A leading zero is not allowed",
          input: ["10", [0, 1]],
          expected: "1",
        },
        { name: "Nothing below one", input: ["1", [1]], expected: "-1" },
        { name: "Zero is a valid answer", input: ["5", [0, 7]], expected: "0" },
        { name: "Only zero is allowed", input: ["100", [0]], expected: "0" },
        {
          name: "The limit itself is made of allowed digits",
          input: ["2222", [2]],
          expected: "222",
        },
        {
          name: "Steps down at the last digit",
          input: ["2493", [2, 4, 9, 3, 1]],
          expected: "2492",
        },
        {
          name: "Backtracks past a digit with nothing smaller",
          input: ["24000", [2, 4, 9]],
          expected: "22999",
        },
        {
          name: "Unsorted digits with duplicates",
          input: ["771", [7, 3, 7, 3]],
          expected: "737",
        },
        {
          name: "A thirty-digit limit",
          input: ["500000000000000000000000000000", [5, 8]],
          expected: "88888888888888888888888888888",
        },
      ],
    },
  },
  {
    slug: "largest-min-plus-max-subarray",
    title: "Subarray With the Largest Min Plus Max",
    category: "algorithms",
    difficulty: "easy",
    companies: ["tiktok"],
    summary:
      "It looks like a sliding-window problem and is not one: the best subarray of length two or more is always an adjacent pair.",
    prompt: [
      "Given an array of positive integers, consider every contiguous subarray that contains **at least two** elements. For each, add its smallest element to its largest. Return the largest such sum.",
      "",
      "```",
      "largestMinMaxSum([5, 12, 9, 6, 4])  ->  21   // [12, 9]: min 9 + max 12",
      "largestMinMaxSum([3, 3])            ->  6",
      "```",
      "",
      "The array has between 2 and 200,000 elements. You have thirty minutes; most of them should go on explaining why your answer is right.",
    ].join("\n"),
    hints: [
      "Write down a few subarrays of length three and compare each with the pairs inside it.",
      "In any subarray, look at the largest element and the neighbour next to it inside the subarray. How does that pair's sum compare with the subarray's min plus max?",
    ],
    solution: [
      "## Approach",
      "",
      "Take any subarray of length at least two, with minimum `m` and maximum `M`. The maximum has a neighbour inside the subarray, and that neighbour is at least `m`. The adjacent pair made of the maximum and that neighbour therefore scores `M + neighbour >= M + m`. So some adjacent pair always does at least as well as the whole subarray, and the answer is the largest sum of two adjacent elements: one pass, O(n) time, O(1) space.",
      "",
      "## Worth saying out loud",
      "",
      "- The word *contiguous* pulls candidates toward two pointers or a monotonic deque. The cost function is what matters here: widening a window can only lower the minimum.",
      "- The length-two requirement is the whole problem. With single elements allowed the answer would be twice the maximum.",
      "- State the exchange argument before coding; a one-line loop with no proof reads as a guess.",
    ].join("\n"),
    judge: {
      starterCode: `/**
 * @param {number[]} nums - positive integers, length >= 2
 * @returns {number}
 */
function largestMinMaxSum(nums) {
  // Your code here
  return 0;
}
`,
      solutionCode: `function largestMinMaxSum(nums) {
  // Some adjacent pair always matches or beats any longer subarray.
  let best = 0;
  for (let i = 0; i + 1 < nums.length; i++) {
    best = Math.max(best, nums[i] + nums[i + 1]);
  }
  return best;
}
`,
      entry: "largestMinMaxSum",
      tests: [
        { name: "Prompt example", input: [[5, 12, 9, 6, 4]], expected: 21 },
        { name: "Two equal elements", input: [[3, 3]], expected: 6 },
        {
          name: "The maximum sits at the edge",
          input: [[1, 2, 3, 100]],
          expected: 103,
        },
        {
          name: "The two largest are not adjacent",
          input: [[10, 1, 10, 1, 9, 9]],
          expected: 18,
        },
        { name: "Strictly decreasing", input: [[9, 7, 5, 3, 1]], expected: 16 },
        {
          name: "A peak between small values",
          input: [[1, 50, 1, 20, 21]],
          expected: 51,
        },
      ],
    },
  },
  {
    slug: "fish-from-decaying-ponds",
    title: "Fish From Decaying Ponds",
    category: "algorithms",
    difficulty: "medium",
    companies: ["bytedance"],
    summary:
      "Each hour fished lowers a pond's next yield by one. The heap greedy is the first answer; the accepted one finds the water line all ponds are fished down to and sums arithmetic series.",
    prompt: [
      "There are `n` ponds. Pond `i` currently yields `yields[i]` fish for one hour of fishing, and every hour you spend at a pond lowers that pond's next yield by one, down to zero. You fish for `hours` hours in total, choosing any one pond each hour.",
      "",
      "Return the largest total number of fish you can catch.",
      "",
      "```",
      "maxFish([90, 100], 100)  ->  7075",
      "maxFish([3, 1], 100)     ->  7      // 3 + 2 + 1 + 1, then every pond is empty",
      "```",
      "",
      "Up to 100,000 ponds, each yield up to 100,000, and `hours` up to 10,000,000,000. A solution that simulates hour by hour will not finish.",
    ].join("\n"),
    hints: [
      "The greedy is right: always fish the pond with the highest current yield. A max-heap does it in O(hours log n), which is the answer the interviewer rejects.",
      "Picture the yields as bars. The greedy shaves the tallest bars down level by level. After all the hours, every bar taller than some level `T` has been cut down to `T` or `T + 1`.",
      "Binary-search the smallest `T` for which cutting everything down to `T` takes at most `hours` hours. Sum each bar's catch as an arithmetic series, then spend any leftover hours at yield `T`.",
    ],
    solution: [
      "## Approach",
      "",
      "Fishing the best pond each hour is optimal, and it has a simple shape: the catches taken are exactly the `hours` largest numbers in the multiset that contains `y, y - 1, ..., 1` for every pond yield `y`. So find the water line. Let `cost(T)` be the hours needed to bring every pond down to `T`, the sum of `max(0, y - T)`. It falls as `T` rises, so binary-search the smallest `T >= 0` with `cost(T) <= hours`.",
      "",
      "Every pond above `T` then contributes the series `y + (y - 1) + ... + (T + 1)`, which is `(y + T + 1) * (y - T) / 2`. Any hours left over are spent on catches of exactly `T` each; minimality of `T` guarantees enough ponds are sitting at that level, and when `T` is zero the leftover hours catch nothing.",
      "",
      "The search is O(n log maxYield) and the totals stay below 2^53 under the stated limits.",
      "",
      "## Worth saying out loud",
      "",
      "- Lead with the heap version and its cost, then say why it is too slow; the interviewer expects to prompt for the second step.",
      "- Ask whether a yield can go below zero and whether `hours` can exceed the fish available. Both change the summation.",
      "- Sorting the yields and sweeping levels from the top gives the same answer in O(n log n) without a binary search.",
    ].join("\n"),
    judge: {
      starterCode: `/**
 * @param {number[]} yields - fish each pond gives in its next hour
 * @param {number} hours
 * @returns {number} the most fish that can be caught
 */
function maxFish(yields, hours) {
  // Your code here
  return 0;
}
`,
      solutionCode: `function maxFish(yields, hours) {
  // Hours needed to fish every pond down to yield T.
  const cost = (T) => yields.reduce((sum, y) => sum + Math.max(0, y - T), 0);

  // The lowest water line that the hours can pay for.
  let low = 0;
  let high = Math.max(0, ...yields);
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (cost(mid) <= hours) high = mid;
    else low = mid + 1;
  }
  const line = low;

  let total = 0;
  let used = 0;
  for (const y of yields) {
    if (y > line) {
      total += ((y + line + 1) * (y - line)) / 2; // y + (y-1) + ... + (line+1)
      used += y - line;
    }
  }
  return total + (hours - used) * line * (line > 0 ? 1 : 0);
}
`,
      entry: "maxFish",
      tests: [
        { name: "Prompt example", input: [[90, 100], 100], expected: 7075 },
        { name: "More hours than fish", input: [[3, 1], 100], expected: 7 },
        { name: "No time at all", input: [[5, 9], 0], expected: 0 },
        { name: "One pond", input: [[5], 3], expected: 12 },
        {
          name: "Equal ponds share the leftover hour",
          input: [[4, 4, 4], 4],
          expected: 15,
        },
        {
          name: "Only the tallest pond is touched",
          input: [[10, 2, 2], 3],
          expected: 27,
        },
        {
          name: "An empty pond among the others",
          input: [[0, 6, 0], 4],
          expected: 18,
        },
        {
          name: "Ten billion hours: every pond is fished out",
          input: [[100000, 99999, 50000], 10000000000],
          expected: 11250025000,
        },
        {
          name: "Hours in the hundreds of thousands",
          input: [[100000, 100000, 100000, 100000, 100000], 400000],
          expected: 24000200000,
        },
      ],
    },
  },
  {
    slug: "third-majority-in-sorted-array",
    title: "More Than a Third in a Sorted Array",
    category: "algorithms",
    difficulty: "medium",
    companies: ["bytedance", "tiktok"],
    summary:
      "In a sorted array a value that fills more than a third must cover the index at n/3 or at 2n/3, so two probes and four binary searches replace the scan.",
    prompt: [
      "Given an array `nums` sorted in non-decreasing order, return every value that appears **more than** `nums.length / 3` times, in increasing order.",
      "",
      "```",
      "frequentInSorted([1, 2, 3])              ->  []",
      "frequentInSorted([1, 1, 2, 3, 4])        ->  [1]",
      "frequentInSorted([1, 1, 2, 4, 4])        ->  [1, 4]",
      "frequentInSorted([1, 2, 3, 4, 5, 6, 7])  ->  []",
      "```",
      "",
      "A linear scan is the baseline. The follow-up asks for better than O(n) by using the fact that the array is sorted.",
    ].join("\n"),
    hints: [
      "Equal values are contiguous, so a value that qualifies is one run longer than `n / 3`.",
      "A run that long cannot fit strictly before index `floor(n / 3)`, strictly between that index and `floor(2n / 3)`, or strictly after it. So it contains one of those two indices.",
      "For each of the two candidate values, binary-search its first and last position and compare the run length with `n / 3`.",
    ],
    solution: [
      "## Approach",
      "",
      "A qualifying value occupies a run of more than `n / 3` consecutive positions. The indices `floor(n / 3)` and `floor(2n / 3)` cut the array into three stretches, each with at most `floor(n / 3)` positions that avoid both indices, so no such run fits inside a stretch: it must cover one of the two probes. The values at the probes are therefore the only candidates.",
      "",
      "For each candidate, a lower-bound binary search finds its first index and an upper-bound search the index after its last; the difference is its count. Keep the candidate when `count * 3 > n`, and skip the second probe when it holds the same value as the first. Two probes and four searches: O(log n) time, O(1) space.",
      "",
      "## Worth saying out loud",
      "",
      "- Compare with `count * 3 > n` rather than dividing, so integer division cannot change the meaning of *more than a third*.",
      "- At most two values can qualify, which is also why Boyer-Moore voting with two counters solves the unsorted version in O(n) time and O(1) space.",
      "- The same probing generalises: for more than `n / k`, test the values at every multiple of `n / k`.",
    ].join("\n"),
    judge: {
      starterCode: `/**
 * @param {number[]} nums - sorted in non-decreasing order
 * @returns {number[]} values appearing more than nums.length / 3 times, ascending
 */
function frequentInSorted(nums) {
  // Your code here
  return [];
}
`,
      solutionCode: `function frequentInSorted(nums) {
  const n = nums.length;
  // First index whose value is >= target (strict = false) or > target (strict = true).
  const bound = (target, strict) => {
    let low = 0;
    let high = n;
    while (low < high) {
      const mid = (low + high) >> 1;
      if (nums[mid] < target || (strict && nums[mid] === target)) low = mid + 1;
      else high = mid;
    }
    return low;
  };

  const result = [];
  for (const probe of [Math.floor(n / 3), Math.floor((2 * n) / 3)]) {
    if (probe >= n) continue;
    const value = nums[probe];
    if (result.length > 0 && result[result.length - 1] === value) continue;
    const count = bound(value, true) - bound(value, false);
    if (count * 3 > n) result.push(value);
  }
  return result;
}
`,
      entry: "frequentInSorted",
      tests: [
        { name: "Three distinct values", input: [[1, 2, 3]], expected: [] },
        {
          name: "One value qualifies",
          input: [[1, 1, 2, 3, 4]],
          expected: [1],
        },
        {
          name: "Two values qualify",
          input: [[1, 1, 2, 4, 4]],
          expected: [1, 4],
        },
        {
          name: "Seven distinct values",
          input: [[1, 2, 3, 4, 5, 6, 7]],
          expected: [],
        },
        {
          name: "Exactly a third is not enough",
          input: [[2, 2, 5, 5, 8, 8]],
          expected: [],
        },
        {
          name: "One value fills the array",
          input: [[7, 7, 7, 7]],
          expected: [7],
        },
        { name: "A single element", input: [[4]], expected: [4] },
        {
          name: "The run sits in the middle",
          input: [[1, 3, 3, 3, 9, 10, 11, 12]],
          expected: [3],
        },
        {
          name: "Negative values, run at the end",
          input: [[-5, -4, -1, 0, 0, 0, 0]],
          expected: [0],
        },
        { name: "Two elements", input: [[1, 2]], expected: [1, 2] },
      ],
    },
  },
];
