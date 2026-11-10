import type { Problem } from "./types";

// TikTok and ByteDance bank, part E: a prefix-sum phone-screen question and
// three problems from the CodeSignal online assessments. Judged in
// JavaScript.

export const tiktokProblemsE: Problem[] = [
  {
    slug: "balanced-after-block-deletion",
    title: "Earliest Block Removal That Balances the Array",
    category: "algorithms",
    difficulty: "medium",
    companies: ["bytedance"],
    summary:
      "Delete k consecutive elements so the even-indexed and odd-indexed sums of what remains are equal; an alternating prefix sum handles the parity flip of the shifted suffix.",
    prompt: [
      "You are given an integer array `nums` and an integer `k` with `1 <= k <= nums.length`. Delete one block of `k` consecutive elements. The remaining elements close up and are re-indexed from zero.",
      "",
      "The result is **balanced** when the sum of its even-indexed elements equals the sum of its odd-indexed elements (an empty array is balanced). Return the smallest starting index of a block whose removal leaves a balanced array, or `-1` if no block does.",
      "",
      "```",
      "earliestBalancedRemoval([2, 1, 6, 4], 1)  ->  1   // [2, 6, 4]: 2 + 4 = 6",
      "earliestBalancedRemoval([1, 2, 3], 2)     ->  -1",
      "```",
      "",
      "Up to 200,000 elements; values may be negative. Checking every block from scratch is too slow.",
    ].join("\n"),
    hints: [
      "Work with one number instead of two: the even-indexed sum minus the odd-indexed sum. Balanced means that difference is zero.",
      "Elements before the block keep their index. Elements after it move left by `k`, so their parity flips exactly when `k` is odd.",
      "Precompute `B[t]`, the even-minus-odd difference of the first `t` elements. The suffix after the block contributes `B[n] - B[l + k]`, negated when `k` is odd.",
    ],
    solution: [
      "## Approach",
      "",
      "Let `B[t]` be the sum of the first `t` elements with even indices counted positively and odd indices negatively. For a block starting at `l`, the prefix `nums[0..l-1]` is untouched and contributes `B[l]`. The suffix starting at `l + k` originally contributed `B[n] - B[l + k]`; after the deletion each of its elements has moved left by `k`, which keeps its parity when `k` is even and flips it when `k` is odd. The difference of the remaining array is therefore `B[l] + s * (B[n] - B[l + k])` with `s = 1` for even `k` and `-1` for odd `k`.",
      "",
      "Build `B` once, then scan `l` from `0` to `n - k` and return the first `l` where the expression is zero. O(n) time and space.",
      "",
      "## Worth saying out loud",
      "",
      "- The single-deletion version of this question counts the valid positions; this one asks for the smallest starting index. Confirm which is wanted, and the convention when nothing works.",
      "- Whether the whole array may be removed (`k = n`) is an interface question; here it may, and the empty result is balanced.",
      "- The same signed prefix answers any query about parity sums after a shift, which is the reusable idea.",
    ].join("\n"),
    judge: {
      starterCode: `/**
 * @param {number[]} nums
 * @param {number} k - block length, 1 <= k <= nums.length
 * @returns {number} smallest start index that leaves a balanced array, or -1
 */
function earliestBalancedRemoval(nums, k) {
  // Your code here
  return -1;
}
`,
      solutionCode: `function earliestBalancedRemoval(nums, k) {
  const n = nums.length;
  // B[t] = (even-indexed sum) - (odd-indexed sum) of the first t elements.
  const B = new Array(n + 1).fill(0);
  for (let t = 0; t < n; t++) B[t + 1] = B[t] + (t % 2 === 0 ? nums[t] : -nums[t]);

  const sign = k % 2 === 0 ? 1 : -1; // the suffix flips parity when k is odd
  for (let l = 0; l + k <= n; l++) {
    if (B[l] + sign * (B[n] - B[l + k]) === 0) return l;
  }
  return -1;
}
`,
      entry: "earliestBalancedRemoval",
      tests: [
        { name: "Prompt example", input: [[2, 1, 6, 4], 1], expected: 1 },
        { name: "No block works", input: [[1, 2, 3], 2], expected: -1 },
        {
          name: "Removing everything leaves an empty, balanced array",
          input: [[5, 9, 2], 3],
          expected: 0,
        },
        {
          name: "Every single removal works; return the first",
          input: [[1, 1, 1], 1],
          expected: 0,
        },
        {
          name: "An even block keeps the suffix parity",
          input: [[2, 9, 4, 4, 7, 5], 2],
          expected: 1,
        },
        {
          name: "The only valid block is the last one",
          input: [[4, 4, 9, 9, 1], 3],
          expected: 2,
        },
        {
          name: "Negative values",
          input: [[-1, 2, -3, 4, 0], 1],
          expected: -1,
        },
        {
          name: "Zeros balance wherever the block is",
          input: [[0, 0, 0, 0], 2],
          expected: 0,
        },
        { name: "A single element removed", input: [[6], 1], expected: 0 },
      ],
    },
  },
  {
    slug: "docstring-naming-conversion",
    title: "Docstring Naming Conversion",
    category: "algorithms",
    difficulty: "easy",
    companies: ["bytedance", "tiktok"],
    summary:
      "Inside backticks, snake_case identifiers become camelCase and UPPER_CASE constants stay; everything else, including every space, is copied through.",
    prompt: [
      "A line of documentation refers to code inside backticks. A pair of backticks encloses one or more identifiers separated by spaces. Function and variable names are written in `snake_case` (lowercase words joined by underscores); constants are written in `UPPER_CASE`.",
      "",
      "Convert every snake_case identifier inside backticks to camelCase: keep the first word as it is, capitalise the first letter of each later word, and drop the underscores. Leave constants unchanged, and leave everything outside backticks exactly as it is, including the backticks and the spaces between identifiers.",
      "",
      "```",
      "Input:  Function `some_function` has two arguments `short_arg very_long_argument`.",
      "        The `very_long_argument` has a default value of `CONSTANT_VALUE`.",
      "Output: Function `someFunction` has two arguments `shortArg veryLongArgument`.",
      "        The `veryLongArgument` has a default value of `CONSTANT_VALUE`.",
      "```",
      "",
      "The line is 1 to 2,000 characters long and its backticks are always paired. Words inside an identifier may contain digits.",
    ].join("\n"),
    hints: [
      "Track one bit of state while scanning: whether you are inside a backtick span. Text outside is copied; text inside is processed identifier by identifier.",
      "An identifier is a constant when it contains no lowercase letter. Otherwise split it on underscores and capitalise every word after the first.",
      "Do not split the span on whitespace and re-join with single spaces: several spaces in a row have to survive.",
    ],
    solution: [
      "## Approach",
      "",
      "Scan the line once. Outside a backtick span, copy characters through. Inside a span, collect maximal runs of non-space characters; each run is one identifier, and the spaces between runs are copied unchanged. An identifier that equals its own upper-cased form is a constant and is left alone. Any other identifier is split on underscores: the first word is kept and each later word has its first character upper-cased before the words are joined.",
      "",
      "A regular expression expresses the same thing compactly: match each backtick span, and within it replace every run of non-space characters with its converted form. Either way the work is O(n).",
      "",
      "## Worth saying out loud",
      "",
      "- The hidden tests are about preservation: text outside spans that looks like snake_case, multiple spaces inside a span, and a constant next to a variable in the same span.",
      "- A one-word identifier and a constant with digits (`MAX_2`) both fall out of the two rules without special cases; check them anyway.",
      "- On an assessment with hidden cases, write the helper for one identifier first and test it alone.",
    ].join("\n"),
    judge: {
      starterCode: `/**
 * @param {string} docstring
 * @returns {string}
 */
function convertDocstring(docstring) {
  // Your code here
  return docstring;
}
`,
      solutionCode: `function convertDocstring(docstring) {
  const convert = (identifier) => {
    if (identifier === identifier.toUpperCase()) return identifier; // a constant
    const [first, ...rest] = identifier.split("_");
    return first + rest.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join("");
  };
  // Each backtick span; inside it, each run of non-space characters is one identifier.
  return docstring.replace(/\`([^\`]*)\`/g, (_, inner) => "\`" + inner.replace(/[^ ]+/g, convert) + "\`");
}
`,
      entry: "convertDocstring",
      tests: [
        {
          name: "Prompt example",
          input: [
            "Function `some_function` has two arguments `short_arg very_long_argument`. The `very_long_argument` has a default value of `CONSTANT_VALUE`.",
          ],
          expected:
            "Function `someFunction` has two arguments `shortArg veryLongArgument`. The `veryLongArgument` has a default value of `CONSTANT_VALUE`.",
        },
        {
          name: "No backticks: nothing changes",
          input: ["plain_text stays as_it_is"],
          expected: "plain_text stays as_it_is",
        },
        {
          name: "Snake case outside backticks is left alone",
          input: ["Call `get_user_id` not get_user_id."],
          expected: "Call `getUserId` not get_user_id.",
        },
        {
          name: "Several spaces inside a span survive",
          input: ["`first_arg   second_arg  MAX_SIZE`"],
          expected: "`firstArg   secondArg  MAX_SIZE`",
        },
        {
          name: "One-word identifiers",
          input: ["`x` and `count` and `N`"],
          expected: "`x` and `count` and `N`",
        },
        {
          name: "Digits inside words",
          input: ["Use `http_2_client` with `MAX_2_RETRIES` and `v2_api_key`."],
          expected: "Use `http2Client` with `MAX_2_RETRIES` and `v2ApiKey`.",
        },
        {
          name: "A constant and a variable in the same span",
          input: ["`DEFAULT_TIMEOUT timeout_ms`"],
          expected: "`DEFAULT_TIMEOUT timeoutMs`",
        },
      ],
    },
  },
  {
    slug: "cyclic-number-pairs",
    title: "Cyclic Number Pairs",
    category: "algorithms",
    difficulty: "medium",
    companies: ["bytedance", "tiktok"],
    summary:
      "Count pairs of numbers that are digit rotations of each other: give every number a canonical rotation and count equal keys instead of comparing pairs.",
    prompt: [
      "A **cyclic rotation** of a number moves some of its trailing digits to the front, keeping the order of the rest: `5604` rotates to `4560`, `456` rotates to `645` and `564`. Moving zero digits leaves the number unchanged.",
      "",
      "Given an array `a` of positive integers, count the pairs of indices `i < j` such that `a[i]` and `a[j]` have the same number of digits and one is a cyclic rotation of the other. Equal values at different indices form a pair.",
      "",
      "```",
      "countCyclicPairs([13, 5604, 31, 2, 13, 4560, 546, 654, 456])  ->  5",
      "// (13, 31), (13, 13), (31, 13), (5604, 4560), (546, 654)",
      "// 546 and 456 are not rotations; 4560 and 456 differ in length",
      "```",
      "",
      "Up to 100,000 numbers, each at most 1,000,000,000.",
    ].join("\n"),
    hints: [
      "Comparing every pair is 5 * 10^9 comparisons. Find something to compute per number so that rotations of each other get the same result.",
      "All rotations of a string form one set. Pick a representative of that set, for example the lexicographically smallest rotation.",
      "Keep rotations as strings of the original length. `4560` rotates to `0456`, which is not the number `456`.",
    ],
    solution: [
      "## Approach",
      "",
      "Two numbers of equal length are rotations of each other exactly when their sets of rotations are the same, so map each number to a canonical key: write it as a decimal string, generate its rotations (at most ten), and keep the lexicographically smallest. Because every key keeps the original width, numbers of different lengths can never collide, and a rotation that starts with zero is handled correctly.",
      "",
      "Count pairs as you go with a hash map from key to how many numbers have produced it so far: for each number, add the current count for its key to the answer, then increment the count. Each pair is counted once, when its later element arrives. The cost is O(n * d^2) for `d <= 10` digits.",
      "",
      "## Worth saying out loud",
      "",
      "- Converting a rotation back to an integer drops leading zeros and silently merges `4560` with `456`; this is the case the hidden tests are built around.",
      "- The answer can reach about 5 * 10^9, which overflows a 32-bit integer in languages that have one.",
      "- For long strings, Booth's algorithm finds the smallest rotation in O(d); with ten digits it is not worth the code.",
    ].join("\n"),
    judge: {
      starterCode: `/**
 * @param {number[]} a - positive integers
 * @returns {number} pairs i < j that are cyclic rotations of each other
 */
function countCyclicPairs(a) {
  // Your code here
  return 0;
}
`,
      solutionCode: `function countCyclicPairs(a) {
  const seen = new Map(); // canonical rotation -> how many numbers so far
  let pairs = 0;
  for (const value of a) {
    const digits = String(value);
    let key = digits;
    for (let shift = 1; shift < digits.length; shift++) {
      const rotated = digits.slice(shift) + digits.slice(0, shift);
      if (rotated < key) key = rotated; // same width, so string order is enough
    }
    const before = seen.get(key) || 0;
    pairs += before;
    seen.set(key, before + 1);
  }
  return pairs;
}
`,
      entry: "countCyclicPairs",
      tests: [
        {
          name: "Prompt example",
          input: [[13, 5604, 31, 2, 13, 4560, 546, 654, 456]],
          expected: 5,
        },
        { name: "A single number has no pair", input: [[77]], expected: 0 },
        {
          name: "Equal values pair with each other",
          input: [[9, 9, 9, 9]],
          expected: 6,
        },
        {
          name: "Different lengths never pair",
          input: [[12, 120, 1200, 21]],
          expected: 1,
        },
        {
          name: "A rotation with a leading zero keeps its width",
          input: [[100, 10, 1, 1000]],
          expected: 0,
        },
        {
          name: "Zeros inside the rotation",
          input: [[1020, 2010, 201, 102, 210]],
          expected: 2,
        },
        {
          name: "Repeated-digit numbers",
          input: [[1212, 2121, 1221, 2112, 1122]],
          expected: 4,
        },
        {
          name: "Nine-digit values",
          input: [[123456789, 912345678, 234567891, 987654321]],
          expected: 3,
        },
      ],
    },
  },
  {
    slug: "alternating-parity-subarrays",
    title: "Count Alternating-Parity Subarrays",
    category: "algorithms",
    difficulty: "easy",
    companies: ["tiktok"],
    summary:
      "Count the subarrays in which neighbours always differ in parity: the number ending at each index is the length of the current alternating streak.",
    prompt: [
      "A contiguous subarray is **alternating** when every pair of adjacent elements in it has different parity, one odd and one even. A subarray with a single element is alternating.",
      "",
      "Given an integer array, return the number of alternating subarrays.",
      "",
      "```",
      "countAlternating([1, 2, 3])     ->  6   // every subarray alternates",
      "countAlternating([2, 4, 6])     ->  3   // only the single elements",
      "countAlternating([1, 2, 4, 5])  ->  6   // 4 singles, [1,2], [4,5]",
      "```",
      "",
      "Up to 200,000 elements, which may be negative. Enumerating every subarray is too slow.",
    ].join("\n"),
    hints: [
      "Count subarrays by where they end. How many alternating subarrays end at index `i`?",
      "If the longest alternating stretch ending at `i` has length `L`, exactly `L` alternating subarrays end there. `L` is one more than the previous `L` when the parity changes, and one otherwise.",
    ],
    solution: [
      "## Approach",
      "",
      "Keep `streak`, the length of the longest alternating subarray that ends at the current index. When the current element's parity differs from the previous one the streak grows by one; otherwise it resets to one. Every alternating subarray ending here is a suffix of that streak, so there are exactly `streak` of them: add it to the total. One pass, O(n) time and O(1) space.",
      "",
      "## Worth saying out loud",
      "",
      "- The O(n^2) enumeration is the trap on an assessment with hidden large cases.",
      "- In languages where `%` keeps the sign, `-3 % 2` is `-1`; compare parities with `Math.abs` or a bit mask.",
      "- The total can reach n(n + 1) / 2, about 2 * 10^10 here, beyond a 32-bit integer.",
    ].join("\n"),
    judge: {
      starterCode: `/**
 * @param {number[]} nums
 * @returns {number} how many contiguous subarrays alternate in parity
 */
function countAlternating(nums) {
  // Your code here
  return 0;
}
`,
      solutionCode: `function countAlternating(nums) {
  let total = 0;
  let streak = 0; // longest alternating subarray ending at the current index
  for (let i = 0; i < nums.length; i++) {
    const alternates = i > 0 && Math.abs(nums[i] % 2) !== Math.abs(nums[i - 1] % 2);
    streak = alternates ? streak + 1 : 1;
    total += streak;
  }
  return total;
}
`,
      entry: "countAlternating",
      tests: [
        { name: "Everything alternates", input: [[1, 2, 3]], expected: 6 },
        { name: "Nothing alternates", input: [[2, 4, 6]], expected: 3 },
        { name: "Two stretches", input: [[1, 2, 4, 5]], expected: 6 },
        { name: "Empty array", input: [[]], expected: 0 },
        { name: "One element", input: [[7]], expected: 1 },
        {
          name: "Negative odd numbers",
          input: [[-3, 2, -5, -7, 4]],
          expected: 9,
        },
        { name: "Zero counts as even", input: [[0, 1, 0, 0, 1]], expected: 9 },
        {
          name: "A long alternating run",
          input: [[1, 2, 3, 4, 5, 6, 7, 8]],
          expected: 36,
        },
      ],
    },
  },
];
