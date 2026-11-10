import type { Problem } from "./types";

// TikTok and ByteDance bank, part A: the two scheduler questions from the
// phone screens and onsites — tier-weighted turns across sellers, and a
// timestamp-ordered scheduler with removal. Judged in JavaScript.

export const tiktokProblemsA: Problem[] = [
  {
    slug: "seller-task-scheduler",
    title: "Seller Task Scheduler",
    category: "algorithms",
    difficulty: "medium",
    companies: ["tiktok"],
    summary:
      "Per-seller priority with FIFO ties, sellers taking turns in activation order, and VIP sellers taking up to two tasks per turn; the turn state has to survive between calls.",
    prompt: [
      "An e-commerce platform processes tasks submitted by sellers. Tasks arrive one at a time, and the platform repeatedly asks for the next task to process. Implement `scheduleSellerTasks(operations)`, which replays a list of operations and returns one result per `process` operation.",
      "",
      '- `["receive", taskId, sellerId, tier, priority]` queues a task. `tier` is `"VIP"` or `"STANDARD"` and is the same for every task of a seller. `priority` is the string `"1"`, `"2"` or `"3"`; `"1"` is the most urgent.',
      '- `["process"]` returns `[sellerId, taskId]` for the next task, or `null` when nothing is pending.',
      "",
      "## Rules",
      "",
      "- **Within a seller**, a lower priority number runs first, and equal priorities run in the order they were received.",
      "- **Across sellers**, sellers with pending tasks take turns, in the order in which they became non-empty.",
      "- A `STANDARD` seller processes one task per turn. A `VIP` seller processes up to two consecutive tasks per turn.",
      "- A seller whose queue empties ends its turn and leaves the rotation. A seller that still has tasks after using its quota moves to the back. A seller that becomes non-empty again later rejoins at the back.",
      "",
      "```",
      "receive a1 A VIP 2      receive a2 A VIP 2      receive a3 A VIP 2",
      "receive b1 B STANDARD 2 receive b2 B STANDARD 2",
      "process x5  ->  [A,a1] [A,a2] [B,b1] [A,a3] [B,b2]",
      "```",
      "",
      "Up to 200,000 operations; task ids are unique. Both operations should cost O(1).",
    ].join("\n"),
    hints: [
      "Two structures: per seller, something ordered by (priority, arrival); across sellers, a queue of the sellers that currently have work.",
      "The turn is state, not a loop: remember which seller is mid-turn and how many tasks it may still take, because `receive` calls can arrive between the two tasks of a VIP turn.",
      "With only three priorities a heap is unnecessary: three FIFO queues per seller, scanned in order, give the next task in constant time.",
    ],
    solution: [
      "## Approach",
      "",
      "Each seller owns three FIFO queues, one per priority, so the next task is the head of the first non-empty queue and arrival order breaks ties for free. A rotation queue holds every seller that has pending work and is not currently mid-turn. Two variables carry the turn between calls: the current seller and how many tasks it may still take.",
      "",
      "`process` starts a turn when none is in progress by taking the seller at the front of the rotation and setting the quota to two for VIP or one otherwise. It then pops that seller's best task. If the seller is now empty, the turn ends and the seller simply leaves; if the quota is used up, the seller goes to the back; otherwise the turn stays open for the next call. `receive` appends to the seller's queue and, when the seller was empty, puts it at the back of the rotation. Both are O(1).",
      "",
      "## Worth saying out loud",
      "",
      "- The policies that are not in the prompt are the interview: what `process` returns when idle, where a re-activated seller goes, and whether a task that arrives mid-turn can be the second task of that turn. State each before coding.",
      "- A general priority range needs a heap keyed by `(priority, arrivalSequence)` per seller; the arrival sequence must be assigned by the scheduler, never derived from task ids.",
      "- A seller must never appear twice in the rotation; tying membership to the empty-to-non-empty transition is what guarantees it.",
      "- Test by tracing: two sellers of different tiers, equal-priority arrivals, a seller that drains mid-turn, and one that receives work again.",
    ].join("\n"),
    judge: {
      starterCode: `/**
 * @param {string[][]} operations - ["receive", taskId, sellerId, tier, priority] or ["process"]
 * @returns {(string[] | null)[]} one [sellerId, taskId] or null per "process"
 */
function scheduleSellerTasks(operations) {
  // Your code here
  return [];
}
`,
      solutionCode: `function scheduleSellerTasks(operations) {
  const sellers = new Map(); // sellerId -> { id, tier, queues, heads, size }
  const rotation = []; // sellers with work that are not mid-turn
  let front = 0;
  let current = null; // the seller whose turn is in progress
  let quota = 0; // tasks it may still take this turn
  const results = [];

  for (const op of operations) {
    if (op[0] === "receive") {
      const [, taskId, sellerId, tier, priority] = op;
      let seller = sellers.get(sellerId);
      if (!seller) {
        seller = { id: sellerId, tier, queues: [[], [], []], heads: [0, 0, 0], size: 0 };
        sellers.set(sellerId, seller);
      }
      seller.queues[Number(priority) - 1].push(taskId);
      if (seller.size === 0) rotation.push(seller); // became non-empty: back of the line
      seller.size++;
      continue;
    }

    if (current === null) {
      if (front === rotation.length) {
        results.push(null);
        continue;
      }
      current = rotation[front++];
      quota = current.tier === "VIP" ? 2 : 1;
    }
    let taskId = null;
    for (let p = 0; p < 3; p++) {
      if (current.heads[p] < current.queues[p].length) {
        taskId = current.queues[p][current.heads[p]++];
        break;
      }
    }
    current.size--;
    quota--;
    results.push([current.id, taskId]);
    if (current.size === 0) {
      current = null; // drained: the turn ends and the seller leaves the rotation
    } else if (quota === 0) {
      rotation.push(current);
      current = null;
    }
  }
  return results;
}
`,
      entry: "scheduleSellerTasks",
      tests: [
        { name: "Nothing pending", input: [[["process"]]], expected: [null] },
        {
          name: "One standard seller, then empty",
          input: [
            [["receive", "t1", "S", "STANDARD", "2"], ["process"], ["process"]],
          ],
          expected: [["S", "t1"], null],
        },
        {
          name: "Prompt example: VIP takes two per turn",
          input: [
            [
              ["receive", "a1", "A", "VIP", "2"],
              ["receive", "a2", "A", "VIP", "2"],
              ["receive", "a3", "A", "VIP", "2"],
              ["receive", "b1", "B", "STANDARD", "2"],
              ["receive", "b2", "B", "STANDARD", "2"],
              ["process"],
              ["process"],
              ["process"],
              ["process"],
              ["process"],
            ],
          ],
          expected: [
            ["A", "a1"],
            ["A", "a2"],
            ["B", "b1"],
            ["A", "a3"],
            ["B", "b2"],
          ],
        },
        {
          name: "Priority first, arrival order on ties",
          input: [
            [
              ["receive", "t1", "S", "STANDARD", "3"],
              ["receive", "t2", "S", "STANDARD", "1"],
              ["receive", "t3", "S", "STANDARD", "1"],
              ["receive", "t4", "S", "STANDARD", "2"],
              ["process"],
              ["process"],
              ["process"],
              ["process"],
            ],
          ],
          expected: [
            ["S", "t2"],
            ["S", "t3"],
            ["S", "t4"],
            ["S", "t1"],
          ],
        },
        {
          name: "A seller that drains mid-turn rejoins at the back",
          input: [
            [
              ["receive", "a1", "A", "VIP", "1"],
              ["receive", "b1", "B", "STANDARD", "1"],
              ["process"],
              ["receive", "a2", "A", "VIP", "1"],
              ["process"],
              ["process"],
              ["process"],
            ],
          ],
          expected: [["A", "a1"], ["B", "b1"], ["A", "a2"], null],
        },
        {
          name: "A task received mid-turn can be the second task of that turn",
          input: [
            [
              ["receive", "a1", "A", "VIP", "2"],
              ["receive", "a2", "A", "VIP", "3"],
              ["receive", "b1", "B", "STANDARD", "1"],
              ["process"],
              ["receive", "a3", "A", "VIP", "1"],
              ["process"],
              ["process"],
              ["process"],
            ],
          ],
          expected: [
            ["A", "a1"],
            ["A", "a3"],
            ["B", "b1"],
            ["A", "a2"],
          ],
        },
        {
          name: "Three sellers, mixed tiers",
          input: [
            [
              ["receive", "x1", "X", "STANDARD", "2"],
              ["receive", "y1", "Y", "VIP", "2"],
              ["receive", "z1", "Z", "STANDARD", "2"],
              ["receive", "x2", "X", "STANDARD", "2"],
              ["receive", "y2", "Y", "VIP", "2"],
              ["receive", "y3", "Y", "VIP", "2"],
              ["process"],
              ["process"],
              ["process"],
              ["process"],
              ["process"],
              ["process"],
              ["process"],
            ],
          ],
          expected: [
            ["X", "x1"],
            ["Y", "y1"],
            ["Y", "y2"],
            ["Z", "z1"],
            ["X", "x2"],
            ["Y", "y3"],
            null,
          ],
        },
      ],
    },
  },
  {
    slug: "removable-task-scheduler",
    title: "Task Scheduler With Removal",
    category: "algorithms",
    difficulty: "medium",
    companies: ["bytedance", "tiktok"],
    summary:
      "addTask, removeTask and a destructive popTask(num) in timestamp order: a heap with lazy deletion, and a version per task so stale heap entries are recognised.",
    prompt: [
      "Implement a scheduler that holds tasks until they are popped in timestamp order.",
      "",
      "- `addTask(taskId, timestamp)` schedules a task. If `taskId` is already scheduled, the call replaces its timestamp.",
      "- `removeTask(taskId)` cancels a scheduled task. Return `true` if it was scheduled and `false` otherwise.",
      "- `popTask(num)` removes and returns the ids of the first `num` tasks, earliest timestamp first. Tasks with equal timestamps come out in the order they were added (a replaced task counts as added at the moment of replacement). When fewer than `num` tasks remain, return all of them.",
      "",
      "```",
      'addTask("build", 30)   addTask("lint", 10)   addTask("test", 20)',
      'removeTask("test")     -> true',
      'popTask(2)             -> ["lint", "build"]',
      "popTask(1)             -> []",
      "```",
      "",
      "`addTask` and `removeTask` should not scan the scheduled tasks; aim for O(log n) per added or popped task.",
    ].join("\n"),
    hints: [
      "Ordered retrieval wants a min-heap keyed by `(timestamp, sequence)`; removal by id wants a hash map. The work is making them agree.",
      "Do not search the heap on removal. Delete the id from the map and leave the heap entry behind; when it reaches the top, recognise it as stale and skip it.",
      "A replaced timestamp leaves an old entry in the heap for the same id, so presence in the map is not enough. Store the sequence number of the live entry and compare.",
    ],
    solution: [
      "## Approach",
      "",
      "A binary min-heap orders entries by timestamp and then by a sequence number that the scheduler increments on every add, which makes equal timestamps come out in insertion order. A map from task id to the sequence number of its **live** entry is the source of truth for what is scheduled. `removeTask` deletes from the map only. `addTask` pushes a new entry and overwrites the map, so any earlier entry for that id becomes stale. `popTask` pops from the heap until it has `num` live entries: an entry is live when the map still points at its sequence number, and each live pop deletes the id from the map.",
      "",
      "Every heap entry is pushed once and popped at most once, so the cost is O(log n) amortised per operation and stale entries cost nothing until they surface.",
      "",
      "## Worth saying out loud",
      "",
      "- Confirm that `popTask` is destructive; a non-destructive read would favour a different structure.",
      "- Ask about ties, duplicate ids, removing a missing id and popping more than remain. The answers here are choices, and the code should make each one visible.",
      "- If removals dominate, stale entries can bloat the heap; rebuild it when stale entries outnumber live ones, or use an ordered map keyed by `(timestamp, sequence)` and delete directly.",
    ].join("\n"),
    judge: {
      starterCode: `class TaskScheduler {
  constructor() {
    // Your code here
  }

  /**
   * @param {string} taskId
   * @param {number} timestamp
   * @returns {void}
   */
  addTask(taskId, timestamp) {}

  /**
   * @param {string} taskId
   * @returns {boolean} whether the task was scheduled
   */
  removeTask(taskId) {
    return false;
  }

  /**
   * @param {number} num
   * @returns {string[]} up to num task ids, earliest first
   */
  popTask(num) {
    return [];
  }
}
`,
      solutionCode: `class TaskScheduler {
  constructor() {
    this.heap = []; // [timestamp, sequence, taskId], a binary min-heap
    this.live = new Map(); // taskId -> sequence of its current entry
    this.sequence = 0;
  }

  addTask(taskId, timestamp) {
    const entry = [timestamp, this.sequence++, taskId];
    this.live.set(taskId, entry[1]); // any older entry for this id is now stale
    this.heap.push(entry);
    this.siftUp(this.heap.length - 1);
  }

  removeTask(taskId) {
    return this.live.delete(taskId); // the heap entry is skipped when it surfaces
  }

  popTask(num) {
    const out = [];
    while (out.length < num && this.heap.length > 0) {
      const [, sequence, taskId] = this.popMin();
      if (this.live.get(taskId) !== sequence) continue; // removed or replaced
      this.live.delete(taskId);
      out.push(taskId);
    }
    return out;
  }

  less(i, j) {
    const a = this.heap[i];
    const b = this.heap[j];
    return a[0] !== b[0] ? a[0] < b[0] : a[1] < b[1];
  }

  siftUp(i) {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (!this.less(i, parent)) break;
      [this.heap[i], this.heap[parent]] = [this.heap[parent], this.heap[i]];
      i = parent;
    }
  }

  popMin() {
    const top = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      let i = 0;
      for (;;) {
        let smallest = i;
        const left = 2 * i + 1;
        const right = left + 1;
        if (left < this.heap.length && this.less(left, smallest)) smallest = left;
        if (right < this.heap.length && this.less(right, smallest)) smallest = right;
        if (smallest === i) break;
        [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
        i = smallest;
      }
    }
    return top;
  }
}
`,
      entry: "__runTaskScheduler",
      driverCode: `function __runTaskScheduler(operations) {
  const scheduler = new TaskScheduler();
  return operations.map(([name, ...args]) => {
    const result = scheduler[name](...args);
    return result === undefined ? null : result;
  });
}
`,
      tests: [
        {
          name: "Prompt example",
          input: [
            [
              ["addTask", "build", 30],
              ["addTask", "lint", 10],
              ["addTask", "test", 20],
              ["removeTask", "test"],
              ["popTask", 2],
              ["popTask", 1],
            ],
          ],
          expected: [null, null, null, true, ["lint", "build"], []],
        },
        {
          name: "Equal timestamps come out in the order added",
          input: [
            [
              ["addTask", "c", 5],
              ["addTask", "a", 5],
              ["addTask", "b", 5],
              ["addTask", "z", 1],
              ["popTask", 3],
              ["popTask", 3],
            ],
          ],
          expected: [null, null, null, null, ["z", "c", "a"], ["b"]],
        },
        {
          name: "Removing a missing task, and removing twice",
          input: [
            [
              ["removeTask", "ghost"],
              ["addTask", "a", 1],
              ["removeTask", "a"],
              ["removeTask", "a"],
              ["popTask", 5],
            ],
          ],
          expected: [false, null, true, false, []],
        },
        {
          name: "Adding a scheduled id replaces its timestamp",
          input: [
            [
              ["addTask", "a", 50],
              ["addTask", "b", 20],
              ["addTask", "a", 10],
              ["popTask", 1],
              ["popTask", 5],
            ],
          ],
          expected: [null, null, null, ["a"], ["b"]],
        },
        {
          name: "A removed task can be scheduled again; the stale entry is ignored",
          input: [
            [
              ["addTask", "a", 5],
              ["addTask", "b", 7],
              ["removeTask", "a"],
              ["addTask", "a", 9],
              ["popTask", 2],
              ["popTask", 2],
            ],
          ],
          expected: [null, null, true, null, ["b", "a"], []],
        },
        {
          name: "Replacement moves a task behind an equal timestamp",
          input: [
            [
              ["addTask", "a", 5],
              ["addTask", "b", 5],
              ["addTask", "a", 5],
              ["popTask", 0],
              ["popTask", 2],
            ],
          ],
          expected: [null, null, null, [], ["b", "a"]],
        },
      ],
    },
  },
];
