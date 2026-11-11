import type { JudgeLanguage } from "./types";

// Python judges for the TikTok and ByteDance bank, part two: the array,
// number and string problems (seed-tiktok-d.ts, -e.ts and -f.ts). Keyed by
// slug and merged into judge.python by the seed script like seed-python.ts.

export const tiktokPythonJudgesB: Record<string, JudgeLanguage> = {
  "largest-number-below-limit": {
    entry: "largest_below",
    starterCode: `def largest_below(limit, digits):
    """limit: a positive integer as a decimal string; digits: allowed digits 0-9.
    Return the largest allowed number below limit as a string, or "-1"."""
    # Your code here
    return "-1"
`,
    solutionCode: `def largest_below(limit, digits):
    allowed = sorted(set(digits))
    top = str(allowed[-1])
    n = len(limit)

    # How many leading digits of the limit can be copied as they are.
    copyable = 0
    while copyable < n and int(limit[copyable]) in allowed:
        copyable += 1

    # Same length: share the longest possible prefix, then step down once.
    for i in range(min(copyable, n - 1), -1, -1):
        smaller = [d for d in allowed if d < int(limit[i])]
        if not smaller:
            continue
        pick = smaller[-1]
        if i == 0 and pick == 0 and n > 1:
            continue  # a leading zero
        return limit[:i] + str(pick) + top * (n - i - 1)

    # One digit fewer: everything that short is below the limit.
    if n == 1:
        return "-1"
    return "0" if top == "0" else top * (n - 1)
`,
  },
  "largest-min-plus-max-subarray": {
    entry: "largest_min_max_sum",
    starterCode: `def largest_min_max_sum(nums):
    """nums: positive integers, length >= 2."""
    # Your code here
    return 0
`,
    solutionCode: `def largest_min_max_sum(nums):
    # Some adjacent pair always matches or beats any longer subarray.
    return max(a + b for a, b in zip(nums, nums[1:]))
`,
  },
  "fish-from-decaying-ponds": {
    entry: "max_fish",
    starterCode: `def max_fish(yields, hours):
    """yields: fish each pond gives in its next hour. Return the most fish that can be caught."""
    # Your code here
    return 0
`,
    solutionCode: `def max_fish(yields, hours):
    # Hours needed to fish every pond down to yield \`line\`.
    def cost(line):
        return sum(max(0, y - line) for y in yields)

    # The lowest water line that the hours can pay for.
    low, high = 0, max(yields, default=0)
    while low < high:
        mid = (low + high) // 2
        if cost(mid) <= hours:
            high = mid
        else:
            low = mid + 1
    line = low

    total = 0
    used = 0
    for y in yields:
        if y > line:
            total += (y + line + 1) * (y - line) // 2  # y + (y-1) + ... + (line+1)
            used += y - line
    return total + (hours - used) * line  # leftover hours catch \`line\` each
`,
  },
  "third-majority-in-sorted-array": {
    entry: "frequent_in_sorted",
    starterCode: `def frequent_in_sorted(nums):
    """nums is sorted in non-decreasing order. Return the values that appear
    more than len(nums) / 3 times, ascending."""
    # Your code here
    return []
`,
    solutionCode: `from bisect import bisect_left, bisect_right


def frequent_in_sorted(nums):
    n = len(nums)
    result = []
    # A run longer than n / 3 must cover one of these two indices.
    for probe in (n // 3, 2 * n // 3):
        if probe >= n:
            continue
        value = nums[probe]
        if result and result[-1] == value:
            continue
        count = bisect_right(nums, value) - bisect_left(nums, value)
        if count * 3 > n:
            result.append(value)
    return result
`,
  },
  "balanced-after-block-deletion": {
    entry: "earliest_balanced_removal",
    starterCode: `def earliest_balanced_removal(nums, k):
    """k: block length, 1 <= k <= len(nums). Return the smallest start index
    that leaves a balanced array, or -1."""
    # Your code here
    return -1
`,
    solutionCode: `def earliest_balanced_removal(nums, k):
    n = len(nums)
    # B[t] = (even-indexed sum) - (odd-indexed sum) of the first t elements.
    B = [0] * (n + 1)
    for t, value in enumerate(nums):
        B[t + 1] = B[t] + (value if t % 2 == 0 else -value)

    sign = 1 if k % 2 == 0 else -1  # the suffix flips parity when k is odd
    for l in range(n - k + 1):
        if B[l] + sign * (B[n] - B[l + k]) == 0:
            return l
    return -1
`,
  },
  "docstring-naming-conversion": {
    entry: "convert_docstring",
    starterCode: `def convert_docstring(docstring):
    # Your code here
    return docstring
`,
    solutionCode: `import re


def convert_docstring(docstring):
    def convert(match):
        identifier = match.group()
        if identifier == identifier.upper():
            return identifier  # a constant
        first, *rest = identifier.split("_")
        return first + "".join(word[:1].upper() + word[1:] for word in rest)

    # Each backtick span; inside it, each run of non-space characters is one identifier.
    def convert_span(match):
        return "\`" + re.sub(r"[^ ]+", convert, match.group(1)) + "\`"

    return re.sub(r"\`([^\`]*)\`", convert_span, docstring)
`,
  },
  "cyclic-number-pairs": {
    entry: "count_cyclic_pairs",
    starterCode: `def count_cyclic_pairs(a):
    """a: positive integers. Return the pairs i < j that are cyclic rotations of each other."""
    # Your code here
    return 0
`,
    solutionCode: `def count_cyclic_pairs(a):
    seen = {}  # canonical rotation -> how many numbers so far
    pairs = 0
    for value in a:
        digits = str(value)
        # The smallest rotation, kept at the same width, identifies the whole rotation set.
        key = min(digits[shift:] + digits[:shift] for shift in range(len(digits)))
        before = seen.get(key, 0)
        pairs += before
        seen[key] = before + 1
    return pairs
`,
  },
  "alternating-parity-subarrays": {
    entry: "count_alternating",
    starterCode: `def count_alternating(nums):
    """How many contiguous subarrays alternate in parity."""
    # Your code here
    return 0
`,
    solutionCode: `def count_alternating(nums):
    total = 0
    streak = 0  # longest alternating subarray ending at the current index
    for i, value in enumerate(nums):
        alternates = i > 0 and value % 2 != nums[i - 1] % 2  # % is never negative here
        streak = streak + 1 if alternates else 1
        total += streak
    return total
`,
  },
  "aligned-memory-allocator": {
    entry: "run_allocator",
    starterCode: `def run_allocator(memory, queries):
    """memory: 0 = free, 1 = occupied. queries: [0, x] alloc x cells, [1, id] erase block id.
    Return one result per query."""
    # Your code here
    return []
`,
    solutionCode: `def run_allocator(memory, queries):
    cells = list(memory)
    blocks = {}  # id -> (start, length)
    next_id = 1
    results = []

    for kind, value in queries:
        if kind == 0:
            placed = -1
            for start in range(0, len(cells) - value + 1, 8):
                if all(cell == 0 for cell in cells[start : start + value]):
                    placed = start
                    break
            if placed != -1:
                cells[placed : placed + value] = [1] * value
                blocks[next_id] = (placed, value)
                next_id += 1
            results.append(placed)
        else:
            block = blocks.pop(value, None)
            if block is None:
                results.append(-1)
                continue
            start, length = block
            cells[start : start + length] = [0] * length
            results.append(length)
    return results
`,
  },
  "reverse-words-preserve-spaces": {
    entry: "reverse_words_keep_spaces",
    starterCode: `def reverse_words_keep_spaces(s):
    """The words in reverse order, every space run unchanged."""
    # Your code here
    return s
`,
    solutionCode: `import re


def reverse_words_keep_spaces(s):
    words = re.findall(r"[^ ]+", s)
    # Each word slot, left to right, receives the next word from the end.
    return re.sub(r"[^ ]+", lambda _: words.pop(), s)
`,
  },
  "wildcard-parentheses-expansions": {
    entry: "valid_expansions",
    starterCode: `def valid_expansions(s):
    """s holds only "(", ")" and "*". Return every distinct valid expansion, sorted ascending."""
    # Your code here
    return []
`,
    solutionCode: `def valid_expansions(s):
    found = set()

    def walk(i, built, balance):
        if balance < 0 or balance > len(s) - i:
            return  # cannot be repaired
        if i == len(s):
            found.add(built)  # the balance is 0 here because of the check above
            return
        ch = s[i]
        if ch in "(*":
            walk(i + 1, built + "(", balance + 1)
        if ch in ")*":
            walk(i + 1, built + ")", balance - 1)
        if ch == "*":
            walk(i + 1, built, balance)

    walk(0, "", 0)
    return sorted(found)
`,
  },
};
