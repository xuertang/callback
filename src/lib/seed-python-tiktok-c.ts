import type { JudgeLanguage } from "./types";

// Python judges for the TikTok and ByteDance bank, part three: the board,
// grid and small-graph problems (seed-tiktok-g.ts, -h.ts and -k.ts). Keyed
// by slug and merged into judge.python by the seed script like
// seed-python.ts.

export const tiktokPythonJudgesC: Record<string, JudgeLanguage> = {
  "house-segments-after-demolitions": {
    entry: "segment_counts",
    starterCode: `def segment_counts(houses, queries):
    """houses: distinct positions; queries: positions demolished in order.
    Return the segment count after each demolition."""
    # Your code here
    return []
`,
    solutionCode: `def segment_counts(houses, queries):
    standing = set(houses)
    # Each segment has exactly one house with nothing to its left.
    segments = sum(1 for position in houses if position - 1 not in standing)
    result = []
    for position in queries:
        left = position - 1 in standing
        right = position + 1 in standing
        if left and right:
            segments += 1  # split in two
        elif not left and not right:
            segments -= 1  # a lone house
        standing.remove(position)
        result.append(segments)
    return result
`,
  },
  "sort-matrix-borders": {
    entry: "sort_matrix_borders",
    starterCode: `def sort_matrix_borders(matrix):
    """Return a new matrix with every border sorted clockwise."""
    # Your code here
    return [list(row) for row in matrix]
`,
    solutionCode: `def sort_matrix_borders(matrix):
    rows, cols = len(matrix), len(matrix[0])
    out = [list(row) for row in matrix]

    k = 0
    while k <= rows - 1 - k and k <= cols - 1 - k:
        top, bottom, left, right = k, rows - 1 - k, k, cols - 1 - k

        cells = [(top, c) for c in range(left, right + 1)]  # clockwise from the top-left cell
        cells += [(r, right) for r in range(top + 1, bottom + 1)]
        if bottom > top:
            cells += [(bottom, c) for c in range(right - 1, left - 1, -1)]
        if right > left:
            cells += [(r, left) for r in range(bottom - 1, top, -1)]

        values = sorted(matrix[r][c] for r, c in cells)
        for (r, c), value in zip(cells, values):
            out[r][c] = value
        k += 1
    return out
`,
  },
  "tic-tac-toe-game-over": {
    entry: "game_over",
    starterCode: `def game_over(board):
    """board: n x n, cells are "X", "O" or "". True when someone has won or the board is full."""
    # Your code here
    return False
`,
    solutionCode: `def game_over(board):
    n = len(board)
    lines = [list(row) for row in board]  # rows
    lines += [[board[r][c] for r in range(n)] for c in range(n)]  # columns
    lines.append([board[i][i] for i in range(n)])
    lines.append([board[i][n - 1 - i] for i in range(n)])
    if any(line[0] != "" and all(cell == line[0] for cell in line) for line in lines):
        return True
    return all(cell != "" for row in board for cell in row)  # full board: a draw
`,
  },
  "max-weight-independent-set": {
    entry: "max_independent_weight",
    starterCode: `def max_independent_weight(weights, edges):
    """weights: positive weight of each node; edges: undirected [u, v] pairs.
    Return the largest total weight with no two chosen nodes adjacent."""
    # Your code here
    return 0
`,
    solutionCode: `def max_independent_weight(weights, edges):
    n = len(weights)
    adj = [0] * n  # adj[v] = bitmask of v's neighbours
    for u, v in edges:
        adj[u] |= 1 << v
        adj[v] |= 1 << u

    # best[mask] = heaviest valid set using only the nodes in mask.
    best = [0] * (1 << n)
    for mask in range(1, 1 << n):
        low = mask & -mask
        v = low.bit_length() - 1  # lowest node in the mask
        rest = mask ^ low
        best[mask] = max(best[rest], weights[v] + best[rest & ~adj[v]])
    return best[-1]
`,
  },
  "longest-zigzag-grid-path": {
    entry: "longest_zigzag_path",
    starterCode: `def longest_zigzag_path(grid):
    """Return the number of cells on the longest zigzag path."""
    # Your code here
    return 0
`,
    solutionCode: `def longest_zigzag_path(grid):
    rows, cols = len(grid), len(grid[0])
    used = [[False] * cols for _ in range(rows)]

    # Longest path that starts at (r, c) when the next value must be larger (want_up) or smaller.
    def extend(r, c, want_up):
        used[r][c] = True
        best = 1
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if not (0 <= nr < rows and 0 <= nc < cols) or used[nr][nc]:
                continue
            fits = grid[nr][nc] > grid[r][c] if want_up else grid[nr][nc] < grid[r][c]
            if fits:
                best = max(best, 1 + extend(nr, nc, not want_up))
        used[r][c] = False
        return best

    return max(
        max(extend(r, c, True), extend(r, c, False))
        for r in range(rows)
        for c in range(cols)
    )
`,
  },
  "grid-path-fuel-recharge": {
    entry: "min_cost_with_fuel",
    starterCode: `def min_cost_with_fuel(cost, blocked, recharge, capacity):
    """cost: price of entering each cell (the start included); recharge: cells that
    refill the tank on arrival; capacity: fuel in a full tank, each move uses one unit.
    Return the minimum total cost to reach the bottom-right cell, or -1."""
    # Your code here
    return -1
`,
    solutionCode: `import heapq


def min_cost_with_fuel(cost, blocked, recharge, capacity):
    rows, cols = len(cost), len(cost[0])
    if blocked[0][0] or blocked[rows - 1][cols - 1]:
        return -1

    # Dijkstra over (row, column, fuel left).
    dist = {(0, 0, capacity): cost[0][0]}
    heap = [(cost[0][0], 0, 0, capacity)]
    while heap:
        d, r, c, fuel = heapq.heappop(heap)
        if d > dist.get((r, c, fuel), float("inf")):
            continue  # an outdated entry
        if (r, c) == (rows - 1, cols - 1):
            return d
        if fuel == 0:
            continue
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if not (0 <= nr < rows and 0 <= nc < cols) or blocked[nr][nc]:
                continue
            state = (nr, nc, capacity if recharge[nr][nc] else fuel - 1)
            nd = d + cost[nr][nc]
            if nd < dist.get(state, float("inf")):
                dist[state] = nd
                heapq.heappush(heap, (nd, *state))
    return -1
`,
  },
  "islands-on-torus": {
    entry: "count_torus_islands",
    starterCode: `def count_torus_islands(grid):
    """grid: 0 = water, 1 = land, edges wrap around. Return the number of islands."""
    # Your code here
    return 0
`,
    solutionCode: `def count_torus_islands(grid):
    rows, cols = len(grid), len(grid[0])
    seen = [[False] * cols for _ in range(rows)]
    islands = 0

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] != 1 or seen[r][c]:
                continue
            islands += 1
            stack = [(r, c)]
            seen[r][c] = True
            while stack:
                cr, cc = stack.pop()
                for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nr = (cr + dr) % rows  # wrap top/bottom
                    nc = (cc + dc) % cols  # wrap left/right
                    if grid[nr][nc] == 1 and not seen[nr][nc]:
                        seen[nr][nc] = True
                        stack.append((nr, nc))
    return islands
`,
  },
};
