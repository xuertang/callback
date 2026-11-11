import type { JudgeLanguage } from "./types";

// Python judges for the Disney bank (seed-disney-a..e.ts), keyed by slug and
// merged into judge.python by the seed script like seed-python.ts.

export const disneyPythonJudges: Record<string, JudgeLanguage> = {
  "filter-ads-by-rule": {
    entry: "filter_ads",
    starterCode: `def filter_ads(ad_ids, ad_locations, ad_ages, rule_locations, rule_min_age, rule_max_age, operator):
    """rule_locations empty = constraint absent; rule_min_age / rule_max_age -1 = absent;
    operator is "AND" or "OR". Return the matching ad ids in input order."""
    # Your code here
    return []
`,
    solutionCode: `def filter_ads(ad_ids, ad_locations, ad_ages, rule_locations, rule_min_age, rule_max_age, operator):
    required = [location.upper() for location in rule_locations]
    checks = []  # one predicate per constraint that is present
    if required:
        def has_locations(i):
            have = {location.upper() for location in ad_locations[i]}
            return all(location in have for location in required)

        checks.append(has_locations)
    if rule_min_age >= 0:
        checks.append(lambda i: ad_ages[i] >= rule_min_age)
    if rule_max_age >= 0:
        checks.append(lambda i: ad_ages[i] <= rule_max_age)

    def matches(i):
        if operator == "AND":
            return all(check(i) for check in checks)
        return not checks or any(check(i) for check in checks)

    return [ad_id for i, ad_id in enumerate(ad_ids) if matches(i)]
`,
  },
  "set-without-hashing": {
    entry: "__run_set_operations",
    starterCode: `class ArraySet:
    def __init__(self):
        # Your storage here: a fixed-length list you resize yourself.
        # No set, dict or hashing.
        pass

    def add(self, x):
        """True if x was inserted, False if already present."""
        # Your code here
        return False

    def remove(self, x):
        """True if x was removed, False if absent."""
        # Your code here
        return False

    def contains(self, x):
        # Your code here
        return False

    def size(self):
        # Your code here
        return 0
`,
    solutionCode: `class ArraySet:
    def __init__(self):
        self.items = [None] * 8
        self.count = 0

    def index_of(self, x):
        for i in range(self.count):
            if self.items[i] == x:
                return i
        return -1

    def resize(self, capacity):
        bigger = [None] * capacity
        for i in range(self.count):
            bigger[i] = self.items[i]
        self.items = bigger

    def add(self, x):
        if self.index_of(x) != -1:
            return False
        if self.count == len(self.items):
            self.resize(len(self.items) * 2)
        self.items[self.count] = x
        self.count += 1
        return True

    def remove(self, x):
        i = self.index_of(x)
        if i == -1:
            return False
        self.items[i] = self.items[self.count - 1]  # swap the last element in
        self.count -= 1
        # Shrink at a quarter full, never below the initial capacity.
        if len(self.items) > 8 and self.count * 4 <= len(self.items):
            self.resize(len(self.items) // 2)
        return True

    def contains(self, x):
        return self.index_of(x) != -1

    def size(self):
        return self.count
`,
    driverCode: `def __run_set_operations(operations, args):
    target = None
    out = []
    for op, a in zip(operations, args):
        if op == "ArraySet":
            target = ArraySet()
            out.append(None)
        elif op in ("fill", "drain", "check"):
            hits = 0
            for x in range(a[0], a[1] + 1):
                if op == "fill":
                    hit = target.add(x)
                elif op == "drain":
                    hit = target.remove(x)
                else:
                    hit = target.contains(x)
                if hit:
                    hits += 1
            out.append(hits)
        else:
            out.append(getattr(target, op)(*a))
    return out
`,
  },
  "session-manager-sliding-expiry": {
    entry: "__run_sessions",
    starterCode: `class SessionManager:
    def __init__(self, ttl):
        """ttl: seconds a session lives after its last use."""
        # Your code here
        pass

    def create_session(self, user_id, now):
        """Return a token unique among every token ever issued."""
        # Your code here
        return ""

    def validate(self, token, now):
        """The user id, or None when missing or expired; resets the expiry."""
        # Your code here
        return None

    def invalidate(self, token):
        """Whether the token existed."""
        # Your code here
        return False

    def cleanup(self, now):
        """How many expired sessions were removed."""
        # Your code here
        return 0
`,
    solutionCode: `class SessionManager:
    def __init__(self, ttl):
        self.ttl = ttl
        self.sessions = {}  # token -> [user_id, expires_at]
        self.next_id = 1

    def create_session(self, user_id, now):
        token = "s" + str(self.next_id)  # unique by construction
        self.next_id += 1
        self.sessions[token] = [user_id, now + self.ttl]
        return token

    def validate(self, token, now):
        session = self.sessions.get(token)
        if session is None:
            return None
        if now >= session[1]:
            del self.sessions[token]  # expire lazily
            return None
        session[1] = now + self.ttl  # sliding window
        return session[0]

    def invalidate(self, token):
        return self.sessions.pop(token, None) is not None

    def cleanup(self, now):
        expired = [token for token, session in self.sessions.items() if now >= session[1]]
        for token in expired:
            del self.sessions[token]
        return len(expired)
`,
    driverCode: `def __run_sessions(ttl, steps):
    manager = SessionManager(ttl)
    tokens = []
    out = []
    for method, *raw in steps:
        args = [
            tokens[int(a[1:])] if isinstance(a, str) and a.startswith("$") else a
            for a in raw
        ]
        if method == "createSession":
            token = manager.create_session(*args)
            tokens.append(token)
            out.append("token" if isinstance(token, str) and token else token)
        else:
            out.append(getattr(manager, method)(*args))
    out.append("all tokens distinct" if len(set(tokens)) == len(tokens) else "duplicate token")
    return out
`,
  },
  "runway-assignment": {
    entry: "assign_runways",
    starterCode: `def assign_runways(n, flights):
    """n runways indexed 0..n-1; flights are [start, end] pairs.
    Return the runway assigned to each flight, in input order."""
    # Your code here
    return []
`,
    solutionCode: `def assign_runways(n, flights):
    order = sorted(range(len(flights)), key=lambda i: (flights[i][0], i))
    free_at = [0] * n
    assigned = [0] * len(flights)
    for i in order:
        start, end = flights[i]
        best = min(range(n), key=lambda r: (free_at[r], r))  # earliest free, lowest index on ties
        assigned[i] = best
        free_at[best] = max(free_at[best], start) + (end - start)
    return assigned
`,
  },
  "rank-by-cosine-similarity": {
    entry: "rank_by_cosine",
    starterCode: `def rank_by_cosine(query, vectors):
    """Return the candidate indices, most similar first; ties by index."""
    # Your code here
    return []
`,
    solutionCode: `import math


def rank_by_cosine(query, vectors):
    def magnitude(v):
        total = 0.0
        for x in v:
            total += x * x
        return math.sqrt(total)

    q = magnitude(query)
    scored = []
    for index, v in enumerate(vectors):
        m = magnitude(v)
        dot = 0.0
        for x, y in zip(v, query):
            dot += x * y
        score = 0.0 if q == 0 or m == 0 else dot / (q * m)
        scored.append((-score, index))
    scored.sort()  # highest score first, then the lower index
    return [index for _, index in scored]
`,
  },
  "chasing-points-meeting": {
    entry: "__check_meeting",
    starterCode: `def meeting_point(points):
    """points: [x, y] per point, in cycle order.
    Return [T, X, Y]: when and where the points meet."""
    # Your code here
    return [0, 0, 0]
`,
    solutionCode: `import math


def meeting_point(points):
    n = len(points)
    pos = [[x, y] for x, y in points]
    t = 0.0
    for _ in range(5_000_000):
        dirs = []
        min_gap = math.inf
        max_gap = 0.0
        for i in range(n):
            target = pos[(i + 1) % n]
            dx = target[0] - pos[i][0]
            dy = target[1] - pos[i][1]
            d = math.hypot(dx, dy)
            dirs.append((0.0, 0.0) if d == 0 else (dx / d, dy / d))
            min_gap = min(min_gap, d)
            max_gap = max(max_gap, d)
        if max_gap < 1e-5:
            break  # everyone is on top of their target
        dt = min(1e-3, max(min_gap, 1e-7) / 10)  # shrink the step as they close in
        for i in range(n):
            pos[i][0] += dirs[i][0] * dt
            pos[i][1] += dirs[i][1] * dt
        t += dt
    cx = sum(p[0] for p in pos) / n
    cy = sum(p[1] for p in pos) / n
    return [t, cx, cy]
`,
    driverCode: `def __check_meeting(points, reference):
    got = meeting_point(points)
    close = (
        isinstance(got, (list, tuple))
        and len(got) == 3
        and all(
            isinstance(v, (int, float)) and not isinstance(v, bool) and abs(v - reference[i]) <= 0.02
            for i, v in enumerate(got)
        )
    )
    return reference if close else got
`,
  },
  "elementwise-matrix-sum": {
    entry: "add_matrices",
    starterCode: `def add_matrices(a, b):
    """a and b have the same shape. Return their elementwise sum."""
    # Your code here
    return []
`,
    solutionCode: `def add_matrices(a, b):
    return [[x + y for x, y in zip(row_a, row_b)] for row_a, row_b in zip(a, b)]
`,
  },
  "name-frequency-count": {
    entry: "count_names",
    starterCode: `def count_names(names):
    """Return a dict of name -> occurrences."""
    # Your code here
    return {}
`,
    solutionCode: `def count_names(names):
    counts = {}
    for name in names:
        counts[name] = counts.get(name, 0) + 1
    return counts
`,
  },
  "workspace-resource-tree": {
    entry: "__run_workspace",
    starterCode: `class Workspace:
    def __init__(self):
        # Your code here
        pass

    def create_resource(self, name, type, parent_id):
        """The new id ("r1", "r2", ...), or None for a bad parent.
        parent_id None is the home level."""
        # Your code here
        return None

    def list_resources(self, folder_id):
        """Direct children in insertion order (folder_id None is the home level);
        None when folder_id is not a folder."""
        # Your code here
        return None

    def delete_resource(self, id):
        # Your code here
        return False

    def move_resource(self, id, new_parent_id):
        # Your code here
        return False
`,
    solutionCode: `class Workspace:
    def __init__(self):
        self.records = {}  # id -> {"name", "type", "parent"}
        self.children = {None: []}  # folder id -> child ids, in order
        self.next_id = 1

    def is_folder(self, id):
        return id is None or (id in self.records and self.records[id]["type"] == "FOLDER")

    def create_resource(self, name, type, parent_id):
        if not self.is_folder(parent_id):
            return None
        id = "r" + str(self.next_id)
        self.next_id += 1
        self.records[id] = {"name": name, "type": type, "parent": parent_id}
        if type == "FOLDER":
            self.children[id] = []
        self.children[parent_id].append(id)
        return id

    def list_resources(self, folder_id):
        return list(self.children[folder_id]) if self.is_folder(folder_id) else None

    def detach(self, id):
        self.children[self.records[id]["parent"]].remove(id)

    def delete_resource(self, id):
        if id not in self.records:
            return False
        self.detach(id)
        stack = [id]
        while stack:
            current = stack.pop()
            stack.extend(self.children.pop(current, []))
            del self.records[current]
        return True

    def move_resource(self, id, new_parent_id):
        if id not in self.records or not self.is_folder(new_parent_id):
            return False
        # Walk up from the target: meeting id means the target is inside it.
        cursor = new_parent_id
        while cursor is not None:
            if cursor == id:
                return False
            cursor = self.records[cursor]["parent"]
        self.detach(id)
        self.records[id]["parent"] = new_parent_id
        self.children[new_parent_id].append(id)
        return True
`,
    driverCode: `import re


def __run_workspace(steps):
    workspace = Workspace()
    out = []
    for method, *args in steps:
        name = re.sub(r"(?<!^)(?=[A-Z])", "_", method).lower()
        out.append(getattr(workspace, name)(*args))
    return out
`,
  },
};
