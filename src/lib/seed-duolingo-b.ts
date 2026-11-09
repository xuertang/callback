import type { Problem } from "./types";

// Duolingo software-engineer bank, part B: the three online-assessment
// warm-ups — interleaving an array from both ends, shifting every nth
// consonant, and the longest run divisible by k. Judged in JavaScript.

export const duolingoProblemsB: Problem[] = [
  {
    slug: "interleave-front-and-back",
    title: "Interleave Front and Back",
    category: "algorithms",
    difficulty: "easy",
    companies: ["duolingo"],
    summary:
      "First, last, second, second-to-last: two pointers walking inward build the new array in one pass.",
    prompt: [
      "Build a new array from `numbers` by taking elements alternately from the front and the back: the first, then the last, then the second, then the second-to-last, and so on until every element has been placed.",
      "",
      "```",
      "[0, 4, 3, 2, 1]  ->  [0, 1, 4, 2, 3]",
      "[1, 2, 3, 4]     ->  [1, 4, 2, 3]",
      "[7]              ->  [7]",
      "```",
      "",
      "`1 <= numbers.length <= 100000`.",
    ].join("\n"),
    hints: [
      "Two indices, `left` and `right`, and a flag for whose turn it is; stop when they cross. The middle element of an odd-length array is taken by whichever pointer reaches it.",
    ],
    solution: [
      "## Approach",
      "",
      "Keep `left = 0` and `right = n - 1`. Append `numbers[left++]`, then `numbers[right--]`, alternating while `left <= right`; for odd lengths the last iteration appends the middle element once and the `left <= right` check stops the second append. O(n) time, O(n) for the output.",
      "",
      "## Worth saying out loud",
      "",
      "- The off-by-one is the odd middle: a loop that always appends a pair duplicates it.",
      "- In place is possible with rotations but O(n²); the interviewer is after the clean two-pointer version.",
    ].join("\n"),
    judge: {
      starterCode: `/**
 * @param {number[]} numbers
 * @returns {number[]} front, back, front, back...
 */
function interleave(numbers) {
  // Your code here
  return [];
}
`,
      solutionCode: `function interleave(numbers) {
  const out = [];
  let left = 0;
  let right = numbers.length - 1;
  while (left <= right) {
    out.push(numbers[left++]);
    if (left <= right) out.push(numbers[right--]);
  }
  return out;
}
`,
      entry: "interleave",
      tests: [
        {
          name: "Prompt example",
          input: [[0, 4, 3, 2, 1]],
          expected: [0, 1, 4, 2, 3],
        },
        { name: "Even length", input: [[1, 2, 3, 4]], expected: [1, 4, 2, 3] },
        { name: "One element", input: [[7]], expected: [7] },
        { name: "Two elements", input: [[1, 2]], expected: [1, 2] },
        { name: "Three elements", input: [[1, 2, 3]], expected: [1, 3, 2] },
        {
          name: "Negative and repeated values",
          input: [[-1, -1, 5, 5, 0, 9]],
          expected: [-1, 9, -1, 0, 5, 5],
        },
      ],
    },
  },
  {
    slug: "replace-nth-consonant",
    title: "Shift Every Nth Consonant",
    category: "algorithms",
    difficulty: "easy",
    companies: ["duolingo"],
    summary:
      "Count consonants as you scan, advance every nth one to the next consonant with wrap-around, and keep its case.",
    prompt: [
      "Scan `message` and count its consonants (letters other than `a e i o u`, in either case). Replace every `n`-th consonant with the **next consonant** in the alphabet, keeping its case: `b` becomes `c`, `d` becomes `f` (skipping the vowel `e`), `x` becomes `y`, and `z` wraps around to `b` (`Z` to `B`). Leave every other character as it is.",
      "",
      "```",
      'shiftEveryNthConsonant("Codesignal", 3)  ->  "Codetignam"',
      "// consonants: C d s g n l; the 3rd (s) and 6th (l) move on: s -> t, l -> m",
      'shiftEveryNthConsonant("zZ", 1)          ->  "bB"',
      "```",
      "",
      "`y` counts as a consonant. `n >= 1`.",
    ].join("\n"),
    hints: [
      "Work with the lowercase alphabet and a set of vowels; the next consonant after a letter is found by stepping forward (wrapping past `z` to `a`) until a non-vowel appears.",
      "Keep a running consonant count; the character changes only when `count % n === 0`.",
    ],
    solution: [
      "## Approach",
      "",
      "One pass. For each letter that is not a vowel, increment the consonant count; when the count is a multiple of `n`, step forward through the alphabet from the lowercase letter, wrapping `z` to `a`, until a consonant appears, and restore the original case. `z` steps to `a` (a vowel), then to `b`, which gives the wrap the prompt describes. O(length) time.",
      "",
      "## Worth saying out loud",
      "",
      "- Digits, spaces and punctuation are neither vowels nor consonants; they must not advance the count.",
      "- Ask whether `y` is a consonant; here it is, and the answer changes the count.",
      "- The step loop runs at most twice, since no two vowels are adjacent in the alphabet.",
    ].join("\n"),
    judge: {
      starterCode: `/**
 * @param {string} message
 * @param {number} n
 * @returns {string}
 */
function shiftEveryNthConsonant(message, n) {
  // Your code here
  return message;
}
`,
      solutionCode: `function shiftEveryNthConsonant(message, n) {
  const vowels = new Set("aeiou");
  const isLetter = (ch) => /[a-z]/i.test(ch);
  let count = 0;
  let out = "";
  for (const ch of message) {
    const lower = ch.toLowerCase();
    if (!isLetter(ch) || vowels.has(lower)) {
      out += ch;
      continue;
    }
    count++;
    if (count % n !== 0) {
      out += ch;
      continue;
    }
    let code = lower.charCodeAt(0);
    do {
      code = code === 122 ? 97 : code + 1; // wrap z -> a
    } while (vowels.has(String.fromCharCode(code)));
    const next = String.fromCharCode(code);
    out += ch === lower ? next : next.toUpperCase();
  }
  return out;
}
`,
      entry: "shiftEveryNthConsonant",
      tests: [
        {
          name: "Prompt example",
          input: ["Codesignal", 3],
          expected: "Codetignam",
        },
        { name: "Wrap-around keeps case", input: ["zZ", 1], expected: "bB" },
        { name: "Skipping a vowel", input: ["dd", 2], expected: "df" },
        {
          name: "No consonants",
          input: ["aeiou AEIOU", 1],
          expected: "aeiou AEIOU",
        },
        {
          name: "Spaces and digits do not count",
          input: ["b 1 c, d!", 2],
          expected: "b 1 d, d!",
        },
        { name: "y is a consonant", input: ["yay", 1], expected: "zaz" },
      ],
    },
  },
  {
    slug: "longest-divisible-period",
    title: "Longest Stable Transaction Period",
    category: "algorithms",
    difficulty: "medium",
    companies: ["duolingo"],
    summary:
      "The longest run of consecutive days whose total is divisible by k: prefix sums modulo k and the first index each remainder appeared.",
    prompt: [
      "Each day's net transaction value is recorded in `transactions`. A period of consecutive days is **stable** when the sum of its values is divisible by the stability factor `k`. Return the length of the longest stable period, or `0` if there is none.",
      "",
      "```",
      "transactions = [2, 3, 1, 4, 1, 5, 9], k = 3  ->  4   // days 2..5: 3 + 1 + 4 + 1 = 9",
      "transactions = [1, 1], k = 3                 ->  0",
      "transactions = [-3, 6, 2], k = 3             ->  2   // -3 + 6 = 3",
      "```",
      "",
      "Values may be negative; `k >= 1`.",
    ].join("\n"),
    hints: [
      "A period `i..j` is divisible by `k` exactly when the prefix sums before `i` and after `j` have the same remainder modulo `k`.",
      "Record the first index at which each remainder appears (remainder 0 appears at index 0, before any day). The longest period ending at `j` reaches back to that first index.",
      "JavaScript's `%` keeps the sign of the dividend; normalise with `((x % k) + k) % k` so negative sums land in `0..k-1`.",
    ],
    solution: [
      "## Approach",
      "",
      "Scan once keeping the running prefix sum modulo `k`, normalised to `0..k-1`. A map remembers the first position where each remainder was seen, seeded with remainder `0` at position `0`. At each day `j` (prefix length `j + 1`), if the current remainder was seen first at position `p`, the days `p..j` sum to a multiple of `k`, so the candidate length is `j + 1 - p`; keep the maximum, and only insert a remainder the first time it appears so the earliest start is kept. O(n) time, O(k) space.",
      "",
      "## Worth saying out loud",
      "",
      "- Counting all stable periods instead of the longest is the same scan with a count per remainder (LeetCode's Subarray Sums Divisible by K); say which the interviewer wants.",
      "- `k = 1` makes every period stable, so the answer is the whole array; the seed at position 0 handles it.",
      "- Negative values are why the remainder must be normalised; forgetting it is the common bug.",
    ].join("\n"),
    judge: {
      starterCode: `/**
 * @param {number[]} transactions
 * @param {number} k
 * @returns {number} length of the longest run whose sum is divisible by k, or 0
 */
function longestStablePeriod(transactions, k) {
  // Your code here
  return 0;
}
`,
      solutionCode: `function longestStablePeriod(transactions, k) {
  const firstSeen = new Map([[0, 0]]); // remainder -> first prefix length with it
  let remainder = 0;
  let best = 0;
  for (let j = 0; j < transactions.length; j++) {
    remainder = (((remainder + transactions[j]) % k) + k) % k;
    if (firstSeen.has(remainder)) best = Math.max(best, j + 1 - firstSeen.get(remainder));
    else firstSeen.set(remainder, j + 1);
  }
  return best;
}
`,
      entry: "longestStablePeriod",
      tests: [
        {
          name: "Prompt example",
          input: [[2, 3, 1, 4, 1, 5, 9], 3],
          expected: 4,
        },
        { name: "No stable period", input: [[1, 1], 3], expected: 0 },
        { name: "Negative values", input: [[-3, 6, 2], 3], expected: 2 },
        { name: "The whole array", input: [[4, 2, 6], 4], expected: 3 },
        {
          name: "k = 1 makes everything stable",
          input: [[5, 7, 11], 1],
          expected: 3,
        },
        {
          name: "A run that is not the whole array",
          input: [[1, 5, -5, 2, 8], 10],
          expected: 4,
        },
        { name: "Single day divisible", input: [[9], 3], expected: 1 },
      ],
    },
  },
];
