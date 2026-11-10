import type { Problem } from "./types";

// TikTok and ByteDance bank, part C: the AI-assisted first round — an order
// validator whose rules depend on one another. Judged in JavaScript.

export const tiktokProblemsC: Problem[] = [
  {
    slug: "order-validator-rule-dag",
    title: "Order Validator With Rule Dependencies",
    category: "algorithms",
    difficulty: "medium",
    companies: ["bytedance"],
    summary:
      "Validation rules form a DAG: a rule is skipped when a prerequisite did not pass, a dependency that would close a cycle is refused, and removing a rule reconnects its prerequisites to its dependents.",
    prompt: [
      "Build an `OrderValidator` that checks orders against a changing set of rules. An order is `{ items: [{ name, price }, ...] }`.",
      "",
      "A rule is one of:",
      "",
      '- `{ type: "prohibited", items: [names] }` fails when the order contains any listed item.',
      '- `{ type: "price", min, max }` fails when any item\'s price is below `min` or above `max`.',
      "",
      "## Operations",
      "",
      "- `addRule(name, rule)` registers a rule. Return `false` if the name is taken.",
      "- `addDependency(prerequisite, rule)` declares that `rule` is only meaningful once `prerequisite` has passed. Return `false`, changing nothing, if either name is unknown, the two are the same, the dependency already exists, or it would create a cycle.",
      "- `removeRule(name)` deletes a rule; return `false` if it does not exist. So that no ordering is lost, every prerequisite of the removed rule becomes a prerequisite of every rule that depended on it.",
      "- `validate(order)` evaluates the rules. A rule is **skipped** when any of its prerequisites failed or was skipped; otherwise it runs and passes or fails. Return `{ valid, failed, skipped }`: `failed` and `skipped` list rule names in the order the rules were added, and `valid` is `true` when both are empty.",
      "",
      "```",
      'addRule("no-weapons", { type: "prohibited", items: ["knife"] })',
      'addRule("price-range", { type: "price", min: 1, max: 500 })',
      'addDependency("no-weapons", "price-range")',
      'validate({ items: [{ name: "knife", price: 9000 }] })',
      '  -> { valid: false, failed: ["no-weapons"], skipped: ["price-range"] }',
      "```",
      "",
      "The round is AI-assisted and grades your tests as much as the code: after implementing, write a case for each branch.",
    ].join("\n"),
    hints: [
      "Store each rule once, with two sets: the rules it depends on and the rules that depend on it. Keeping both directions makes removal local.",
      "A new edge `prerequisite -> rule` closes a cycle exactly when `prerequisite` is already reachable from `rule`. One depth-first search over dependents answers that.",
      "For `validate`, compute each rule's status from its prerequisites' statuses with memoised recursion; the DAG guarantees it terminates.",
    ],
    solution: [
      "## Approach",
      "",
      "Each rule record holds the rule, a set of prerequisites and a set of dependents; a `Map` keeps the records in insertion order. `addDependency` rejects unknown names, self-edges and duplicates, then walks dependents from `rule`: if it reaches `prerequisite`, the new edge would close a cycle and is refused. Otherwise both sets are updated.",
      "",
      "`removeRule` contracts the node. It snapshots the rule's prerequisites and dependents, detaches the rule from each, and adds an edge from every prerequisite to every dependent. Paths that used to run through the removed rule still exist, and no cycle can appear because every new edge follows a path that was already there.",
      "",
      "`validate` assigns each rule a status by memoised recursion: `skipped` if any prerequisite is not `passed`, otherwise the result of the rule's own check. Reading the statuses back in insertion order gives `failed` and `skipped`. The work is O(V + E) plus the cost of the checks.",
      "",
      "## Worth saying out loud",
      "",
      "- The prompt in the room is thin on purpose: the order schema, what a failed prerequisite means for dependents and the return shape are yours to pin down before coding.",
      "- Removing a rule with `p` prerequisites and `d` dependents adds up to `p * d` edges; say so, and note that a transitive reduction is possible but rarely worth it.",
      "- With an AI tool in the loop, the value you add is the contract and the tests: a cycle attempt, a diamond, removal in the middle of a chain, and a skipped rule whose own check would have passed.",
    ].join("\n"),
    judge: {
      starterCode: `class OrderValidator {
  constructor() {
    // Your code here
  }

  /**
   * @param {string} name
   * @param {{type: "prohibited", items: string[]} | {type: "price", min: number, max: number}} rule
   * @returns {boolean}
   */
  addRule(name, rule) {
    return false;
  }

  /**
   * @param {string} prerequisite
   * @param {string} rule
   * @returns {boolean}
   */
  addDependency(prerequisite, rule) {
    return false;
  }

  /**
   * @param {string} name
   * @returns {boolean}
   */
  removeRule(name) {
    return false;
  }

  /**
   * @param {{items: {name: string, price: number}[]}} order
   * @returns {{valid: boolean, failed: string[], skipped: string[]}}
   */
  validate(order) {
    return { valid: true, failed: [], skipped: [] };
  }
}
`,
      solutionCode: `class OrderValidator {
  constructor() {
    this.rules = new Map(); // name -> { rule, prerequisites: Set, dependents: Set }
  }

  addRule(name, rule) {
    if (this.rules.has(name)) return false;
    this.rules.set(name, { rule, prerequisites: new Set(), dependents: new Set() });
    return true;
  }

  addDependency(prerequisite, rule) {
    const before = this.rules.get(prerequisite);
    const after = this.rules.get(rule);
    if (!before || !after || prerequisite === rule) return false;
    if (after.prerequisites.has(prerequisite)) return false;
    if (this.reaches(rule, prerequisite)) return false; // would close a cycle
    after.prerequisites.add(prerequisite);
    before.dependents.add(rule);
    return true;
  }

  /** Is \`target\` reachable from \`start\` by following dependents? */
  reaches(start, target) {
    const stack = [start];
    const seen = new Set(stack);
    while (stack.length > 0) {
      const name = stack.pop();
      if (name === target) return true;
      for (const next of this.rules.get(name).dependents) {
        if (!seen.has(next)) {
          seen.add(next);
          stack.push(next);
        }
      }
    }
    return false;
  }

  removeRule(name) {
    const record = this.rules.get(name);
    if (!record) return false;
    for (const before of record.prerequisites) this.rules.get(before).dependents.delete(name);
    for (const after of record.dependents) this.rules.get(after).prerequisites.delete(name);
    for (const before of record.prerequisites) {
      for (const after of record.dependents) {
        this.rules.get(before).dependents.add(after);
        this.rules.get(after).prerequisites.add(before);
      }
    }
    this.rules.delete(name);
    return true;
  }

  validate(order) {
    const status = new Map(); // name -> "passed" | "failed" | "skipped"
    const passes = (rule) =>
      rule.type === "prohibited"
        ? !order.items.some((item) => rule.items.includes(item.name))
        : order.items.every((item) => item.price >= rule.min && item.price <= rule.max);
    const resolve = (name) => {
      if (status.has(name)) return status.get(name);
      const record = this.rules.get(name);
      let result = "passed";
      for (const before of record.prerequisites) {
        if (resolve(before) !== "passed") result = "skipped";
      }
      if (result === "passed" && !passes(record.rule)) result = "failed";
      status.set(name, result);
      return result;
    };
    const failed = [];
    const skipped = [];
    for (const name of this.rules.keys()) {
      const result = resolve(name);
      if (result === "failed") failed.push(name);
      if (result === "skipped") skipped.push(name);
    }
    return { valid: failed.length === 0 && skipped.length === 0, failed, skipped };
  }
}
`,
      entry: "__runOrderValidator",
      driverCode: `function __runOrderValidator(operations) {
  const validator = new OrderValidator();
  return operations.map(([name, ...args]) => validator[name](...args));
}
`,
      tests: [
        {
          name: "Prompt example: a failed prerequisite skips its dependent",
          input: [
            [
              [
                "addRule",
                "no-weapons",
                { type: "prohibited", items: ["knife"] },
              ],
              ["addRule", "price-range", { type: "price", min: 1, max: 500 }],
              ["addDependency", "no-weapons", "price-range"],
              ["validate", { items: [{ name: "knife", price: 9000 }] }],
              ["validate", { items: [{ name: "spoon", price: 9000 }] }],
              ["validate", { items: [{ name: "spoon", price: 3 }] }],
            ],
          ],
          expected: [
            true,
            true,
            true,
            { valid: false, failed: ["no-weapons"], skipped: ["price-range"] },
            { valid: false, failed: ["price-range"], skipped: [] },
            { valid: true, failed: [], skipped: [] },
          ],
        },
        {
          name: "Independent rules all run; an empty order passes",
          input: [
            [
              ["addRule", "cheap", { type: "price", min: 0, max: 10 }],
              [
                "addRule",
                "no-glass",
                { type: "prohibited", items: ["vase", "mirror"] },
              ],
              ["addRule", "cheap", { type: "price", min: 0, max: 99 }],
              [
                "validate",
                {
                  items: [
                    { name: "mirror", price: 40 },
                    { name: "pen", price: 2 },
                  ],
                },
              ],
              ["validate", { items: [] }],
            ],
          ],
          expected: [
            true,
            true,
            false,
            { valid: false, failed: ["cheap", "no-glass"], skipped: [] },
            { valid: true, failed: [], skipped: [] },
          ],
        },
        {
          name: "Dependencies that are refused",
          input: [
            [
              ["addRule", "a", { type: "price", min: 0, max: 5 }],
              ["addRule", "b", { type: "price", min: 0, max: 5 }],
              ["addRule", "c", { type: "price", min: 0, max: 5 }],
              ["addDependency", "a", "b"],
              ["addDependency", "b", "c"],
              ["addDependency", "a", "b"],
              ["addDependency", "c", "a"],
              ["addDependency", "a", "a"],
              ["addDependency", "a", "missing"],
              ["addDependency", "a", "c"],
            ],
          ],
          expected: [
            true,
            true,
            true,
            true,
            true,
            false,
            false,
            false,
            false,
            true,
          ],
        },
        {
          name: "Skips propagate down a chain",
          input: [
            [
              ["addRule", "first", { type: "prohibited", items: ["x"] }],
              ["addRule", "second", { type: "price", min: 0, max: 100 }],
              ["addRule", "third", { type: "price", min: 0, max: 100 }],
              ["addRule", "aside", { type: "price", min: 50, max: 100 }],
              ["addDependency", "second", "third"],
              ["addDependency", "first", "second"],
              ["validate", { items: [{ name: "x", price: 10 }] }],
            ],
          ],
          expected: [
            true,
            true,
            true,
            true,
            true,
            true,
            {
              valid: false,
              failed: ["first", "aside"],
              skipped: ["second", "third"],
            },
          ],
        },
        {
          name: "Removing the middle of a chain keeps the ordering",
          input: [
            [
              ["addRule", "first", { type: "prohibited", items: ["x"] }],
              ["addRule", "middle", { type: "price", min: 0, max: 100 }],
              ["addRule", "last", { type: "price", min: 0, max: 100 }],
              ["addDependency", "first", "middle"],
              ["addDependency", "middle", "last"],
              ["removeRule", "middle"],
              ["removeRule", "middle"],
              ["validate", { items: [{ name: "x", price: 10 }] }],
              ["addDependency", "last", "first"],
            ],
          ],
          expected: [
            true,
            true,
            true,
            true,
            true,
            true,
            false,
            { valid: false, failed: ["first"], skipped: ["last"] },
            false,
          ],
        },
        {
          name: "Removal connects every prerequisite to every dependent",
          input: [
            [
              ["addRule", "p1", { type: "prohibited", items: ["x"] }],
              ["addRule", "p2", { type: "prohibited", items: ["y"] }],
              ["addRule", "hub", { type: "price", min: 0, max: 100 }],
              ["addRule", "d1", { type: "price", min: 0, max: 100 }],
              ["addRule", "d2", { type: "price", min: 0, max: 100 }],
              ["addDependency", "p1", "hub"],
              ["addDependency", "p2", "hub"],
              ["addDependency", "hub", "d1"],
              ["addDependency", "hub", "d2"],
              ["removeRule", "hub"],
              ["validate", { items: [{ name: "y", price: 10 }] }],
              ["addDependency", "p1", "d1"],
            ],
          ],
          expected: [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            { valid: false, failed: ["p2"], skipped: ["d1", "d2"] },
            false,
          ],
        },
      ],
    },
  },
];
