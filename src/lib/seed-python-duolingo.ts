import type { JudgeLanguage } from "./types";

// Python judges for the Duolingo bank (seed-duolingo-a.ts, -b.ts and
// -chess.ts), keyed by slug and merged into judge.python by the seed script
// like seed-python.ts.

const CHESS_SHARED_PY = `RANK = {"Elephant": 8, "Lion": 7, "Tiger": 6, "Leopard": 5, "Wolf": 4, "Dog": 3, "Cat": 2, "Rat": 1}
LETTER = {"Elephant": "E", "Lion": "L", "Tiger": "T", "Leopard": "P", "Wolf": "W", "Dog": "D", "Cat": "C", "Rat": "R"}
DENS = {"A": (0, 3), "B": (8, 3)}
TRAPS = {"A": [(0, 2), (0, 4), (1, 3)], "B": [(8, 2), (8, 4), (7, 3)]}
SETUP = {
    "A": [("Lion", 0, 0), ("Tiger", 0, 6), ("Dog", 1, 1), ("Cat", 1, 5),
          ("Rat", 2, 0), ("Leopard", 2, 2), ("Wolf", 2, 4), ("Elephant", 2, 6)],
    "B": [("Elephant", 6, 0), ("Wolf", 6, 2), ("Leopard", 6, 4), ("Rat", 6, 6),
          ("Cat", 7, 1), ("Dog", 7, 5), ("Tiger", 8, 0), ("Lion", 8, 6)],
}


def is_river(r, c):
    return 3 <= r <= 5 and c in (1, 2, 4, 5)


def in_bounds(r, c):
    return 0 <= r < 9 and 0 <= c < 7


def other(owner):
    return "B" if owner == "A" else "A"
`;

export const duolingoPythonJudges: Record<string, JudgeLanguage> = {
  "decrypt-to-dictionary-words": {
    entry: "decrypt_words",
    starterCode: `def decrypt_words(keys, values, dictionary, word):
    """keys are distinct lowercase letters; values[i] is the 2-character encryption
    of keys[i]; word is the ciphertext. Return the distinct dictionary words that
    encrypt to word, sorted."""
    # Your code here
    return []
`,
    solutionCode: `def decrypt_words(keys, values, dictionary, word):
    keys_for = {}  # value -> keys that produce it
    for key, value in zip(keys, values):
        keys_for.setdefault(value, []).append(key)
    allowed = set(dictionary)
    found = set()
    prefix = []

    def dfs(position):
        if position == len(word):
            candidate = "".join(prefix)
            if candidate in allowed:
                found.add(candidate)
            return
        for key in keys_for.get(word[position : position + 2], []):
            prefix.append(key)
            dfs(position + 2)
            prefix.pop()  # backtrack: undo the last character only

    if len(word) % 2 == 0:
        dfs(0)
    return sorted(found)
`,
  },
  "count-cells-reaching-global-max": {
    entry: "count_reaching_max",
    starterCode: `def count_reaching_max(heights):
    """heights: R x C integers. Return how many starting cells have a walk
    that ends on a global maximum."""
    # Your code here
    return 0
`,
    solutionCode: `def count_reaching_max(heights):
    rows, cols = len(heights), len(heights[0])
    highest = max(max(row) for row in heights)

    UNKNOWN, SINK = -2, -1
    successor = [UNKNOWN] * (rows * cols)
    reaches = [None] * (rows * cols)  # None unknown, else True / False

    def step(r, c):
        best = SINK
        best_height = heights[r][c]
        for dr in (-1, 0, 1):
            for dc in (-1, 0, 1):
                if dr == 0 and dc == 0:
                    continue
                nr, nc = r + dr, c + dc
                if not (0 <= nr < rows and 0 <= nc < cols):
                    continue
                # Equal heights: the row-major scan reaches the smaller row and
                # column first, so the first one seen keeps the tie.
                if heights[nr][nc] > best_height:
                    best_height = heights[nr][nc]
                    best = nr * cols + nc
        return best

    count = 0
    for start in range(rows * cols):
        path = []
        cell = start
        while reaches[cell] is None:
            path.append(cell)
            if successor[cell] == UNKNOWN:
                successor[cell] = step(cell // cols, cell % cols)
            if successor[cell] == SINK:
                reaches[cell] = heights[cell // cols][cell % cols] == highest
                break
            cell = successor[cell]
        result = reaches[cell]
        for visited in path:
            reaches[visited] = result
        if reaches[start]:
            count += 1
    return count
`,
  },
  "access-log-transition-graph": {
    entry: "__rounded_graph",
    starterCode: `def transition_graph(logs):
    """logs: [timestamp, user_id, resource_id] entries, unsorted.
    Return a dict: source -> next -> probability."""
    # Your code here
    return {}
`,
    solutionCode: `def transition_graph(logs):
    by_user = {}
    for time, user, resource in logs:
        by_user.setdefault(user, []).append((float(time), resource))

    counts = {}
    totals = {}
    for accesses in by_user.values():
        accesses.sort(key=lambda access: access[0])
        path = ["START"] + [resource for _, resource in accesses] + ["END"]
        for source, target in zip(path, path[1:]):
            row = counts.setdefault(source, {})
            row[target] = row.get(target, 0) + 1
            totals[source] = totals.get(source, 0) + 1

    return {
        source: {target: n / totals[source] for target, n in row.items()}
        for source, row in counts.items()
    }
`,
    driverCode: `import math


def __rounded_graph(logs):
    graph = transition_graph(logs)
    return {
        source: {target: math.floor(p * 1e6 + 0.5) / 1e6 for target, p in row.items()}
        for source, row in graph.items()
    }
`,
  },
  "interleave-front-and-back": {
    entry: "interleave",
    starterCode: `def interleave(numbers):
    """Return front, back, front, back..."""
    # Your code here
    return []
`,
    solutionCode: `def interleave(numbers):
    out = []
    left, right = 0, len(numbers) - 1
    while left <= right:
        out.append(numbers[left])
        left += 1
        if left <= right:
            out.append(numbers[right])
            right -= 1
    return out
`,
  },
  "replace-nth-consonant": {
    entry: "shift_every_nth_consonant",
    starterCode: `def shift_every_nth_consonant(message, n):
    # Your code here
    return message
`,
    solutionCode: `def shift_every_nth_consonant(message, n):
    vowels = set("aeiou")
    count = 0
    out = []
    for ch in message:
        lower = ch.lower()
        is_letter = ch.isascii() and ch.isalpha()
        if not is_letter or lower in vowels:
            out.append(ch)
            continue
        count += 1
        if count % n != 0:
            out.append(ch)
            continue
        code = ord(lower)
        while True:
            code = ord("a") if code == ord("z") else code + 1  # wrap z -> a
            if chr(code) not in vowels:
                break
        shifted = chr(code)
        out.append(shifted if ch == lower else shifted.upper())
    return "".join(out)
`,
  },
  "longest-divisible-period": {
    entry: "longest_stable_period",
    starterCode: `def longest_stable_period(transactions, k):
    """Length of the longest run whose sum is divisible by k, or 0."""
    # Your code here
    return 0
`,
    solutionCode: `def longest_stable_period(transactions, k):
    first_seen = {0: 0}  # remainder -> first prefix length with it
    remainder = 0
    best = 0
    for j, amount in enumerate(transactions):
        remainder = (remainder + amount) % k  # never negative in Python for k > 0
        if remainder in first_seen:
            best = max(best, j + 1 - first_seen[remainder])
        else:
            first_seen[remainder] = j + 1
    return best
`,
  },
  "animal-chess-engine": {
    entry: "__run_animal_chess",
    starterCode: `${CHESS_SHARED_PY}

class AnimalChess:
    def __init__(self):
        self.clear()

    def clear(self):
        """Empty board, player A to move, no winner. Returns True."""
        # Your code here
        return True

    def init(self):
        """The standard setup from SETUP. Returns True."""
        # Your code here
        return True

    def place(self, owner, piece_name, r, c):
        """False when out of bounds, occupied, the owner's own den, or a non-Rat on a river cell."""
        # Your code here
        return False

    def move(self, owner, r1, c1, r2, c2):
        """Whether the move was legal and applied."""
        # Your code here
        return False

    def piece(self, r, c):
        """The piece code at (r, c), e.g. "AL", or None."""
        # Your code here
        return None

    def snapshot(self):
        """Every piece as [row, col, code], row-major."""
        # Your code here
        return []

    def display(self):
        """9 rows of 7 codes or "__"."""
        # Your code here
        return []

    def turn(self):
        """ "A" or "B". """
        # Your code here
        return "A"

    def winner(self):
        """ "A", "B" or None. """
        # Your code here
        return None
`,
    solutionCode: `${CHESS_SHARED_PY}

class AnimalChess:
    # A piece is an (owner, name) tuple; the board is 9 rows of 7 cells.
    def __init__(self):
        self.clear()

    def clear(self):
        self.board = [[None] * 7 for _ in range(9)]
        self.current = "A"
        self.won = None
        return True

    def init(self):
        self.clear()
        for owner in ("A", "B"):
            for name, r, c in SETUP[owner]:
                self.board[r][c] = (owner, name)
        return True

    def is_den_of(self, owner, r, c):
        return DENS[owner] == (r, c)

    def is_trap_of(self, owner, r, c):
        return (r, c) in TRAPS[owner]

    def place(self, owner, piece_name, r, c):
        if not in_bounds(r, c) or piece_name not in RANK or self.board[r][c]:
            return False
        if self.is_den_of(owner, r, c):
            return False
        if is_river(r, c) and piece_name != "Rat":
            return False
        self.board[r][c] = (owner, piece_name)
        return True

    def effective_rank(self, piece, r, c):
        """A piece standing in the enemy's trap has rank 0."""
        owner, name = piece
        return 0 if self.is_trap_of(other(owner), r, c) else RANK[name]

    def can_capture(self, attacker, r1, c1, defender, r2, c2):
        if defender[0] == attacker[0]:
            return False
        if self.is_trap_of(attacker[0], r2, c2):
            return True  # the defender sits in the attacker's trap
        if attacker[1] == "Rat" and defender[1] == "Elephant":
            return True
        if attacker[1] == "Elephant" and defender[1] == "Rat":
            return False
        return self.effective_rank(attacker, r1, c1) >= self.effective_rank(defender, r2, c2)

    def can_reach(self, piece, r1, c1, r2, c2):
        """One orthogonal step, or a Lion/Tiger jump straight across one river section."""
        name = piece[1]
        dr, dc = r2 - r1, c2 - c1
        if abs(dr) + abs(dc) == 1:
            return not (is_river(r2, c2) and name != "Rat")
        if name not in ("Lion", "Tiger"):
            return False
        if (dr != 0 and dc != 0) or is_river(r1, c1) or is_river(r2, c2):
            return False
        step_r = (dr > 0) - (dr < 0)
        step_c = (dc > 0) - (dc < 0)
        r, c = r1 + step_r, c1 + step_c
        crossed = 0
        while (r, c) != (r2, c2):
            if not is_river(r, c):
                return False  # a jump covers river cells only
            occupant = self.board[r][c]
            if occupant and occupant[1] == "Rat":
                return False  # a Rat blocks the jump
            crossed += 1
            r += step_r
            c += step_c
        return crossed > 0

    def has_pieces(self, owner):
        return any(p and p[0] == owner for row in self.board for p in row)

    def move(self, owner, r1, c1, r2, c2):
        if self.won or owner != self.current:
            return False
        if not in_bounds(r1, c1) or not in_bounds(r2, c2):
            return False
        piece = self.board[r1][c1]
        if not piece or piece[0] != owner:
            return False
        if self.is_den_of(owner, r2, c2):
            return False
        if not self.can_reach(piece, r1, c1, r2, c2):
            return False
        target = self.board[r2][c2]
        if target and not self.can_capture(piece, r1, c1, target, r2, c2):
            return False
        self.board[r2][c2] = piece
        self.board[r1][c1] = None
        enemy = other(owner)
        if self.is_den_of(enemy, r2, c2) or not self.has_pieces(enemy):
            self.won = owner
        self.current = enemy
        return True

    @staticmethod
    def code(piece):
        return piece[0] + LETTER[piece[1]]

    def piece(self, r, c):
        p = self.board[r][c] if in_bounds(r, c) else None
        return self.code(p) if p else None

    def snapshot(self):
        return [
            [r, c, self.code(p)]
            for r, row in enumerate(self.board)
            for c, p in enumerate(row)
            if p
        ]

    def display(self):
        return [[self.code(p) if p else "__" for p in row] for row in self.board]

    def turn(self):
        return self.current

    def winner(self):
        return self.won
`,
    driverCode: `def __run_animal_chess(actions):
    game = AnimalChess()
    return [getattr(game, method)(*args) for method, *args in actions]
`,
  },
};
