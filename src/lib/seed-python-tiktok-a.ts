import type { JudgeLanguage } from "./types";

// Python judges for the TikTok and ByteDance bank, part one: the class and
// parsing problems (seed-tiktok-a.ts, -b.ts, -c.ts and -j.ts). Keyed by slug
// and merged into judge.python by the seed script like seed-python.ts.

/** Replays [method, ...args] steps on a fresh instance, camelCase names mapped to snake_case. */
const stepsDriver = (
  entry: string,
  construct: string,
  params = "operations",
) => `import re


def ${entry}(${params}):
    target = ${construct}
    out = []
    for method, *args in operations:
        name = re.sub(r"(?<!^)(?=[A-Z])", "_", method).lower()
        out.append(getattr(target, name)(*args))
    return out
`;

export const tiktokPythonJudgesA: Record<string, JudgeLanguage> = {
  "seller-task-scheduler": {
    entry: "schedule_seller_tasks",
    starterCode: `def schedule_seller_tasks(operations):
    """operations: ["receive", task_id, seller_id, tier, priority] or ["process"].
    Return one [seller_id, task_id] or None per "process"."""
    # Your code here
    return []
`,
    solutionCode: `from collections import deque


def schedule_seller_tasks(operations):
    sellers = {}  # seller id -> {"id", "tier", "queues", "size"}
    rotation = deque()  # sellers with work that are not mid-turn
    current = None  # the seller whose turn is in progress
    quota = 0  # tasks it may still take this turn
    results = []

    for op in operations:
        if op[0] == "receive":
            _, task_id, seller_id, tier, priority = op
            seller = sellers.get(seller_id)
            if seller is None:
                seller = {"id": seller_id, "tier": tier, "queues": [deque(), deque(), deque()], "size": 0}
                sellers[seller_id] = seller
            seller["queues"][int(priority) - 1].append(task_id)
            if seller["size"] == 0:
                rotation.append(seller)  # became non-empty: back of the line
            seller["size"] += 1
            continue

        if current is None:
            if not rotation:
                results.append(None)
                continue
            current = rotation.popleft()
            quota = 2 if current["tier"] == "VIP" else 1
        queue = next(q for q in current["queues"] if q)  # highest priority with work
        task_id = queue.popleft()
        current["size"] -= 1
        quota -= 1
        results.append([current["id"], task_id])
        if current["size"] == 0:
            current = None  # drained: the turn ends and the seller leaves the rotation
        elif quota == 0:
            rotation.append(current)
            current = None
    return results
`,
  },
  "removable-task-scheduler": {
    entry: "__run_task_scheduler",
    starterCode: `class TaskScheduler:
    def __init__(self):
        # Your code here
        pass

    def add_task(self, task_id, timestamp):
        pass

    def remove_task(self, task_id):
        """Whether the task was scheduled."""
        return False

    def pop_task(self, num):
        """Up to num task ids, earliest first."""
        return []
`,
    solutionCode: `import heapq


class TaskScheduler:
    def __init__(self):
        self.heap = []  # (timestamp, sequence, task_id)
        self.live = {}  # task_id -> sequence of its current entry
        self.sequence = 0

    def add_task(self, task_id, timestamp):
        self.live[task_id] = self.sequence  # any older entry for this id is now stale
        heapq.heappush(self.heap, (timestamp, self.sequence, task_id))
        self.sequence += 1

    def remove_task(self, task_id):
        # The heap entry is skipped when it surfaces.
        return self.live.pop(task_id, None) is not None

    def pop_task(self, num):
        out = []
        while len(out) < num and self.heap:
            _, sequence, task_id = heapq.heappop(self.heap)
            if self.live.get(task_id) != sequence:
                continue  # removed or replaced
            del self.live[task_id]
            out.append(task_id)
        return out
`,
    driverCode: stepsDriver("__run_task_scheduler", "TaskScheduler()"),
  },
  "lru-cache-with-ttl": {
    entry: "__run_expiring_cache",
    starterCode: `class ExpiringCache:
    def __init__(self, capacity):
        # Your code here
        pass

    def get(self, key, now):
        """The value, or -1 on a miss."""
        return -1

    def put(self, key, value, ttl, now):
        """The entry expires at now + ttl."""
        pass
`,
    solutionCode: `import heapq
from collections import OrderedDict


class ExpiringCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.entries = OrderedDict()  # key -> [value, expires_at]; least recent first
        self.expiries = []  # min-heap of (expires_at, key); entries may be stale

    def get(self, key, now):
        entry = self.entries.get(key)
        if entry is None:
            return -1
        if entry[1] <= now:
            del self.entries[key]
            return -1
        self.entries.move_to_end(key)  # most recently used
        return entry[0]

    def put(self, key, value, ttl, now):
        self._purge(now)
        if key in self.entries:
            del self.entries[key]
        elif len(self.entries) == self.capacity:
            self.entries.popitem(last=False)  # the least recently used live entry
        expires_at = now + ttl
        self.entries[key] = [value, expires_at]
        heapq.heappush(self.expiries, (expires_at, key))

    def _purge(self, now):
        """Delete every entry that has expired by now."""
        while self.expiries and self.expiries[0][0] <= now:
            expires_at, key = heapq.heappop(self.expiries)
            entry = self.entries.get(key)
            if entry is not None and entry[1] == expires_at:
                del self.entries[key]
`,
    driverCode: stepsDriver(
      "__run_expiring_cache",
      "ExpiringCache(capacity)",
      "capacity, operations",
    ),
  },
  "order-validator-rule-dag": {
    entry: "__run_order_validator",
    starterCode: `class OrderValidator:
    def __init__(self):
        # Your code here
        pass

    def add_rule(self, name, rule):
        """rule: {"type": "prohibited", "items": [...]} or {"type": "price", "min": ..., "max": ...}."""
        return False

    def add_dependency(self, prerequisite, rule):
        return False

    def remove_rule(self, name):
        return False

    def validate(self, order):
        """order: {"items": [{"name": ..., "price": ...}, ...]}.
        Return {"valid": ..., "failed": [...], "skipped": [...]}."""
        return {"valid": True, "failed": [], "skipped": []}
`,
    solutionCode: `class OrderValidator:
    def __init__(self):
        self.rules = {}  # name -> {"rule", "prerequisites": set, "dependents": set}, in insertion order

    def add_rule(self, name, rule):
        if name in self.rules:
            return False
        self.rules[name] = {"rule": rule, "prerequisites": set(), "dependents": set()}
        return True

    def add_dependency(self, prerequisite, rule):
        if prerequisite not in self.rules or rule not in self.rules or prerequisite == rule:
            return False
        if prerequisite in self.rules[rule]["prerequisites"]:
            return False
        if self._reaches(rule, prerequisite):
            return False  # would close a cycle
        self.rules[rule]["prerequisites"].add(prerequisite)
        self.rules[prerequisite]["dependents"].add(rule)
        return True

    def _reaches(self, start, target):
        """Is target reachable from start by following dependents?"""
        stack = [start]
        seen = {start}
        while stack:
            name = stack.pop()
            if name == target:
                return True
            for following in self.rules[name]["dependents"]:
                if following not in seen:
                    seen.add(following)
                    stack.append(following)
        return False

    def remove_rule(self, name):
        record = self.rules.get(name)
        if record is None:
            return False
        for before in record["prerequisites"]:
            self.rules[before]["dependents"].discard(name)
        for after in record["dependents"]:
            self.rules[after]["prerequisites"].discard(name)
        for before in record["prerequisites"]:
            for after in record["dependents"]:
                self.rules[before]["dependents"].add(after)
                self.rules[after]["prerequisites"].add(before)
        del self.rules[name]
        return True

    def validate(self, order):
        status = {}  # name -> "passed" | "failed" | "skipped"

        def passes(rule):
            if rule["type"] == "prohibited":
                return not any(item["name"] in rule["items"] for item in order["items"])
            return all(rule["min"] <= item["price"] <= rule["max"] for item in order["items"])

        def resolve(name):
            if name in status:
                return status[name]
            record = self.rules[name]
            result = "passed"
            for before in record["prerequisites"]:
                if resolve(before) != "passed":
                    result = "skipped"
            if result == "passed" and not passes(record["rule"]):
                result = "failed"
            status[name] = result
            return result

        failed = [name for name in self.rules if resolve(name) == "failed"]
        skipped = [name for name in self.rules if resolve(name) == "skipped"]
        return {"valid": not failed and not skipped, "failed": failed, "skipped": skipped}
`,
    driverCode: stepsDriver("__run_order_validator", "OrderValidator()"),
  },
  "add-sub-calculator-validated": {
    entry: "evaluate_add_sub",
    starterCode: `def evaluate_add_sub(expression):
    """Return the value, or None when the expression is invalid."""
    # Your code here
    return None
`,
    solutionCode: `def evaluate_add_sub(expression):
    MAX, MIN = 2147483647, -2147483648
    total = 0
    sign = 1
    i = 0
    while True:
        # A number is required here.
        end = i
        while end < len(expression) and "0" <= expression[end] <= "9":
            end += 1
        text = expression[i:end]
        if not text:
            return None  # an operator, a foreign character, or the end
        if len(text) > 1 and text[0] == "0":
            return None  # leading zero
        if len(text) > 10 or int(text) > MAX:
            return None
        total += sign * int(text)
        i = end

        if i == len(expression):
            break
        if expression[i] == "+":
            sign = 1
        elif expression[i] == "-":
            sign = -1
        else:
            return None
        i += 1
    return None if total < MIN or total > MAX else total
`,
  },
  "kv-store-serialization": {
    entry: "__round_trip",
    starterCode: `def serialize(store):
    """store: dict of str -> str. Return one string."""
    # Your code here
    return ""


def deserialize(text):
    """text: the output of serialize. Return the original dict."""
    # Your code here
    return {}
`,
    solutionCode: `# Every field is written as <length>:<characters>; an entry is a key field then a value field.
def serialize(store):
    parts = []
    for key, value in store.items():
        parts.append(str(len(key)) + ":" + key + str(len(value)) + ":" + value)
    return "".join(parts)


def deserialize(text):
    store = {}
    i = 0

    def read_field():
        nonlocal i
        colon = text.find(":", i)
        if colon == -1:
            raise ValueError("malformed input: missing length")
        length = int(text[i:colon])
        start = colon + 1
        if start + length > len(text):
            raise ValueError("malformed input: bad length")
        i = start + length
        return text[start:i]

    while i < len(text):
        key = read_field()
        store[key] = read_field()
    return store
`,
    driverCode: `def __round_trip(pairs):
    store = {key: value for key, value in pairs}
    text = serialize(store)
    if not isinstance(text, str):
        return "serialize must return a string"
    back = deserialize(text)
    if not isinstance(back, dict):
        return "deserialize must return a dict"
    if len(back) != len(store):
        return "expected " + str(len(store)) + " keys, got " + str(len(back))
    for key, value in store.items():
        if key not in back:
            return "missing key " + repr(key)
        if back[key] != value:
            return "wrong value for key " + repr(key)
    return True
`,
  },
};
