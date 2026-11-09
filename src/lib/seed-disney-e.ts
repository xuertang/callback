import type { Problem } from "./types";

// Disney software-engineer bank, part E: the files-and-folders workspace,
// class-based with an operations driver. Judged in JavaScript.

export const disneyProblemsE: Problem[] = [
  {
    slug: "workspace-resource-tree",
    title: "Files and Folders Workspace",
    category: "algorithms",
    difficulty: "medium",
    companies: ["disney"],
    summary:
      "Create, list, delete and move resources in an in-memory tree: parent pointers for the upward checks, ordered child lists for the downward ones.",
    prompt: [
      'Build an in-memory workspace of files and folders. Every resource has a generated id (`"r1"`, `"r2"`, ... in creation order, never reused), a name, a type (`"FILE"` or `"FOLDER"`) and a parent folder; `null` as a parent means the home level.',
      "",
      "- `createResource(name, type, parentId)`: returns the new id, or `null` when the parent does not exist or is a file. Names need not be unique.",
      "- `listResources(folderId)`: the ids of the folder's direct children in insertion order (`null` for the home level), or `null` when the folder does not exist or is a file.",
      "- `deleteResource(id)`: deletes the resource and, for a folder, everything under it; returns whether the id existed.",
      "- `moveResource(id, newParentId)`: moves the resource to the end of the new parent's children; returns `false` when either id is unknown, the target is a file, or the target is the resource itself or anything under it.",
      "",
      "```",
      "ws = new Workspace()",
      'ws.createResource("docs", "FOLDER", null)     ->  "r1"',
      'ws.createResource("a.txt", "FILE", "r1")     ->  "r2"',
      'ws.createResource("b.txt", "FILE", "r2")     ->  null    // a file cannot be a parent',
      'ws.listResources("r1")                       ->  ["r2"]',
      'ws.moveResource("r1", "r1")                  ->  false   // into itself',
      'ws.deleteResource("r1")                      ->  true    // takes r2 with it',
      "ws.listResources(null)                       ->  []",
      "```",
      "",
      "Up to 100,000 resources and operations.",
    ].join("\n"),
    hints: [
      "Keep two structures that answer different questions: a map from id to its record with a parent pointer for walking up, and a list of child ids per folder for listing in order.",
      "The subtree check on a move is a walk up from the target through parent pointers looking for the moved id: O(depth), not a traversal of the moved subtree.",
      "On delete, remove the id from its parent's list too, and drop the deleted folder's own children entry, or a later list or move sees a ghost.",
    ],
    solution: [
      "## Approach",
      "",
      "A map from id to `{ name, type, parentId }` and a map from folder id (with the home level as its own key) to an array of child ids. `createResource` checks the parent is a folder, assigns the next id and appends to the parent's list. `listResources` returns the list. `deleteResource` removes the id from its parent's list, then deletes the subtree depth-first through the children lists, removing each record and each folder's list. `moveResource` checks both ids, that the target is a folder, and that walking up from the target through parent pointers never meets the moved id (which also catches moving into itself); then it splices the id out of the old parent's list and appends it to the new one.",
      "",
      "## Worth saying out loud",
      "",
      "- The walk up costs O(depth) where a subtree traversal costs O(size); on a deep, wide tree that is the difference between passing and timing out.",
      "- Insertion order wants arrays, not sets; removing from the middle of a parent's list is O(children), fine here and fixable with a linked list or an index map if it is not.",
      "- Treat the home level as a folder with the id `null`, so no operation needs a special case for it.",
      "- Follow-ups: full paths (walk up and join names), sorting children by name on demand, renaming, and a reader-writer lock when several threads share the workspace.",
    ].join("\n"),
    judge: {
      starterCode: `class Workspace {
  constructor() {
    // Your code here
  }

  /** @returns {string | null} the new id ("r1", "r2", ...), or null for a bad parent */
  createResource(name, type, parentId) {
    // Your code here
    return null;
  }

  /** @returns {string[] | null} direct children in insertion order; null for the home level */
  listResources(folderId) {
    // Your code here
    return null;
  }

  /** @returns {boolean} */
  deleteResource(id) {
    // Your code here
    return false;
  }

  /** @returns {boolean} */
  moveResource(id, newParentId) {
    // Your code here
    return false;
  }
}
`,
      solutionCode: `class Workspace {
  constructor() {
    this.records = new Map(); // id -> { name, type, parentId }
    this.children = new Map([[null, []]]); // folder id -> child ids, in order
    this.nextId = 1;
  }

  isFolder(id) {
    return id === null || this.records.get(id)?.type === "FOLDER";
  }

  createResource(name, type, parentId) {
    if (!this.isFolder(parentId)) return null;
    const id = "r" + this.nextId++;
    this.records.set(id, { name, type, parentId });
    if (type === "FOLDER") this.children.set(id, []);
    this.children.get(parentId).push(id);
    return id;
  }

  listResources(folderId) {
    return this.isFolder(folderId) ? [...this.children.get(folderId)] : null;
  }

  detach(id) {
    const siblings = this.children.get(this.records.get(id).parentId);
    siblings.splice(siblings.indexOf(id), 1);
  }

  deleteResource(id) {
    if (!this.records.has(id)) return false;
    this.detach(id);
    const stack = [id];
    while (stack.length) {
      const current = stack.pop();
      for (const child of this.children.get(current) ?? []) stack.push(child);
      this.children.delete(current);
      this.records.delete(current);
    }
    return true;
  }

  moveResource(id, newParentId) {
    if (!this.records.has(id) || !this.isFolder(newParentId)) return false;
    // Walk up from the target: meeting id means the target is inside it.
    for (let cursor = newParentId; cursor !== null; cursor = this.records.get(cursor).parentId) {
      if (cursor === id) return false;
    }
    this.detach(id);
    this.records.get(id).parentId = newParentId;
    this.children.get(newParentId).push(id);
    return true;
  }
}
`,
      entry: "__runWorkspace",
      driverCode: `function __runWorkspace(steps) {
  const ws = new Workspace();
  return steps.map(([method, ...args]) => ws[method](...args));
}
`,
      tests: [
        {
          name: "Prompt example",
          input: [
            [
              ["createResource", "docs", "FOLDER", null],
              ["createResource", "a.txt", "FILE", "r1"],
              ["createResource", "b.txt", "FILE", "r2"],
              ["listResources", "r1"],
              ["moveResource", "r1", "r1"],
              ["deleteResource", "r1"],
              ["listResources", null],
            ],
          ],
          expected: ["r1", "r2", null, ["r2"], false, true, []],
        },
        {
          name: "Insertion order, duplicate names, and ids are never reused",
          input: [
            [
              ["createResource", "x", "FILE", null],
              ["createResource", "x", "FILE", null],
              ["createResource", "f", "FOLDER", null],
              ["deleteResource", "r2"],
              ["createResource", "y", "FILE", "r3"],
              ["listResources", null],
              ["listResources", "r3"],
              ["listResources", "r1"],
            ],
          ],
          expected: ["r1", "r2", "r3", true, "r4", ["r1", "r3"], ["r4"], null],
        },
        {
          name: "A move appends to the destination and refuses the subtree",
          input: [
            [
              ["createResource", "a", "FOLDER", null],
              ["createResource", "b", "FOLDER", "r1"],
              ["createResource", "c", "FOLDER", "r2"],
              ["createResource", "d", "FILE", null],
              ["moveResource", "r1", "r3"],
              ["moveResource", "r1", "r2"],
              ["moveResource", "r4", "r3"],
              ["listResources", "r3"],
              ["listResources", null],
              ["moveResource", "r3", null],
              ["listResources", null],
              ["listResources", "r2"],
            ],
          ],
          expected: [
            "r1",
            "r2",
            "r3",
            "r4",
            false,
            false,
            true,
            ["r4"],
            ["r1"],
            true,
            ["r1", "r3"],
            [],
          ],
        },
        {
          name: "Deleting a folder removes its descendants and nothing else",
          input: [
            [
              ["createResource", "a", "FOLDER", null],
              ["createResource", "b", "FOLDER", "r1"],
              ["createResource", "c", "FILE", "r2"],
              ["createResource", "e", "FILE", "r1"],
              ["createResource", "z", "FILE", null],
              ["deleteResource", "r2"],
              ["listResources", "r1"],
              ["deleteResource", "r3"],
              ["moveResource", "r5", "r2"],
              ["listResources", null],
              ["deleteResource", "r1"],
              ["listResources", null],
              ["deleteResource", "r4"],
            ],
          ],
          expected: [
            "r1",
            "r2",
            "r3",
            "r4",
            "r5",
            true,
            ["r4"],
            false,
            false,
            ["r1", "r5"],
            true,
            ["r5"],
            false,
          ],
        },
        {
          name: "Unknown ids and files as targets",
          input: [
            [
              ["createResource", "f", "FILE", null],
              ["createResource", "g", "FOLDER", "r9"],
              ["moveResource", "r9", null],
              ["moveResource", "r1", "r1"],
              ["moveResource", "r1", "r9"],
              ["listResources", "r9"],
              ["moveResource", "r1", null],
              ["listResources", null],
            ],
          ],
          expected: ["r1", null, false, false, false, null, true, ["r1"]],
        },
      ],
    },
  },
];
