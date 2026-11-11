import type { JudgeLanguage } from "./types";

// Python judges for the TikTok and ByteDance bank, part four: the tree and
// linked-list problems (seed-tiktok-i.ts and -k.ts). Keyed by slug and
// merged into judge.python by the seed script like seed-python.ts.

export const tiktokPythonJudgesD: Record<string, JudgeLanguage> = {
  "nary-tree-path-sum-count": {
    entry: "count_path_sums",
    starterCode: `def count_path_sums(values, parents, target):
    """values[i] is the value of node i; parents[i] is its parent, and parents[0] is -1.
    Return the number of downward paths whose values sum to target."""
    # Your code here
    return 0
`,
    solutionCode: `def count_path_sums(values, parents, target):
    n = len(values)
    children = [[] for _ in range(n)]
    for i in range(1, n):
        children[parents[i]].append(i)

    on_path = {0: 1}  # prefix sum -> occurrences on the current root-to-node path
    count = 0
    stack = [(0, 0, False)]  # (node, prefix sum above the node, leaving?)
    while stack:
        node, above, leaving = stack.pop()
        total = above + values[node]
        if leaving:
            on_path[total] -= 1
            continue
        count += on_path.get(total - target, 0)
        on_path[total] = on_path.get(total, 0) + 1
        stack.append((node, above, True))  # undo after the subtree is done
        for child in children[node]:
            stack.append((child, total, False))
    return count
`,
  },
  "equalize-nary-path-sums": {
    entry: "min_path_sum_increments",
    starterCode: `def min_path_sum_increments(values, parents):
    """values[i] is the value of node i; parents[i] is its parent, and parents[0] is -1.
    Return the fewest +1 operations that make all root-to-leaf sums equal."""
    # Your code here
    return 0
`,
    solutionCode: `def min_path_sum_increments(values, parents):
    n = len(values)
    children = [[] for _ in range(n)]
    for i in range(1, n):
        children[parents[i]].append(i)

    # Breadth-first order from the root; reversed, it visits children before parents.
    order = [0]
    for node in order:
        order.extend(children[node])

    best = [0] * n  # equalised path sum from the node down
    operations = 0
    for node in reversed(order):
        tallest = max((best[child] for child in children[node]), default=0)
        operations += sum(tallest - best[child] for child in children[node])  # raise the child itself
        best[node] = values[node] + tallest
    return operations
`,
  },
  "max-path-sum-with-path": {
    entry: "__path_sum",
    starterCode: `def max_path_nodes(values, left, right):
    """values[i] is the value of node i (node 0 is the root); left[i] and right[i]
    are its children, or -1. Return the node indices along a maximum-sum path, end to end."""
    # Your code here
    return []
`,
    solutionCode: `def max_path_nodes(values, left, right):
    n = len(values)
    # Breadth-first order from the root; reversed, it visits children before parents.
    order = [0]
    for node in order:
        for child in (left[node], right[node]):
            if child != -1:
                order.append(child)

    down = [0] * n  # best sum of a path starting at the node and descending
    follow = [-1] * n  # the child that arm continues into, or -1

    def arm(child):
        return 0 if child == -1 else max(0, down[child])

    best_sum = float("-inf")
    bend = 0
    for node in reversed(order):
        l, r = arm(left[node]), arm(right[node])
        down[node] = values[node] + max(l, r)
        if max(l, r) > 0:
            follow[node] = left[node] if l >= r else right[node]
        if values[node] + l + r > best_sum:
            best_sum = values[node] + l + r
            bend = node

    def descend(start):
        nodes = []
        node = start
        while node != -1:
            nodes.append(node)
            node = follow[node]
        return nodes

    path = []
    if arm(left[bend]) > 0:
        path.extend(reversed(descend(left[bend])))
    path.append(bend)
    if arm(right[bend]) > 0:
        path.extend(descend(right[bend]))
    return path
`,
    // Any maximum path is accepted: the driver checks that the list is a real
    // path and reports its sum, which the tests compare to the optimum.
    driverCode: `def __path_sum(values, left, right):
    path = max_path_nodes(values, left, right)
    if not isinstance(path, (list, tuple)) or len(path) == 0:
        return "not a path: empty"
    n = len(values)
    seen = set()
    total = 0
    for i, node in enumerate(path):
        if not isinstance(node, int) or isinstance(node, bool) or node < 0 or node >= n:
            return "not a path: bad node " + str(node)
        if node in seen:
            return "not a path: node " + str(node) + " repeats"
        seen.add(node)
        if i > 0:
            prev = path[i - 1]
            joined = left[prev] == node or right[prev] == node or left[node] == prev or right[node] == prev
            if not joined:
                return "not a path: " + str(prev) + " and " + str(node) + " are not joined"
        total += values[node]
    return total
`,
  },
  "reverse-k-group-order": {
    entry: "__run_reverse_group_order",
    starterCode: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


def reverse_group_order(head, k):
    """Return the new head."""
    # Your code here
    return head
`,
    solutionCode: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


def reverse_group_order(head, k):
    result = None  # the groups processed so far, already in their final order
    node = head
    while node is not None:
        group_head = group_tail = node
        for _ in range(k - 1):
            if group_tail.next is None:
                break
            group_tail = group_tail.next
        node = group_tail.next  # where the next group starts
        group_tail.next = result  # this group goes in front of everything before it
        result = group_head
    return result
`,
    driverCode: `def __run_reverse_group_order(items, k):
    head = None
    for value in reversed(items):
        head = ListNode(value, head)
    out = []
    node = reverse_group_order(head, k)
    while node is not None:
        if len(out) > len(items):
            return "the list has a cycle or extra nodes"
        out.append(node.val)
        node = node.next
    return out
`,
  },
};
