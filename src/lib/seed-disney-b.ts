import type { Problem } from "./types";

// Disney software-engineer bank, part B: the session store with sliding
// expiry, class-based with an operations driver. Judged in JavaScript.

export const disneyProblemsB: Problem[] = [
  {
    slug: "session-manager-sliding-expiry",
    title: "Session Manager With Sliding Expiry",
    category: "algorithms",
    difficulty: "medium",
    companies: ["disney"],
    summary:
      "Unique tokens, validation that pushes the expiry forward, explicit revocation and an O(n) cleanup; an LRU cache with time as the key.",
    prompt: [
      "Implement the session store behind a login system. Time is passed in explicitly as whole seconds, so the behaviour is deterministic.",
      "",
      "- `new SessionManager(ttl)`: sessions live `ttl` seconds after their last use.",
      "- `createSession(userId, now)`: returns a new token, unique among every token ever issued. A user may hold several sessions at once.",
      "- `validate(token, now)`: returns the session's `userId` when the token exists and has not expired, otherwise `null`. A successful validation resets the expiry to `now + ttl`.",
      "- `invalidate(token)`: revokes the token; returns whether it existed.",
      "- `cleanup(now)`: removes every expired session from storage and returns how many it removed. It must run in O(n) for n stored sessions.",
      "",
      "A session created or last validated at time `t` is valid while `now < t + ttl`.",
      "",
      "```",
      "sm = new SessionManager(300)",
      'tok = sm.createSession("user_7", 0)',
      'sm.validate(tok, 200)   ->  "user_7"   // and the expiry moves to 500',
      'sm.validate(tok, 499)   ->  "user_7"   // expiry moves to 799',
      "sm.validate(tok, 799)   ->  null       // expired",
      "sm.cleanup(800)         ->  1",
      "```",
    ].join("\n"),
    hints: [
      "A map from token to `{ userId, expiresAt }` covers everything except an efficient cleanup; a counter or a random id with a uniqueness check gives the tokens.",
      "Expire lazily too: a `validate` that finds an expired token can delete it on the spot instead of leaving it for `cleanup`.",
      "This is an LRU cache keyed by time. Keep the sessions in a list ordered by expiry (a validation moves its session to the tail), and `cleanup` walks from the head and stops at the first live one.",
    ],
    solution: [
      "## Approach",
      "",
      "A map from token to session record holds `userId` and `expiresAt`. `createSession` mints a token from a counter (unique by construction; a random id would need a collision check) and stores `now + ttl`. `validate` looks the token up, deletes and returns `null` if `now` has reached the expiry, otherwise pushes the expiry to `now + ttl` and returns the user. `invalidate` is a delete. `cleanup` is one pass over the map removing expired records, which is O(n) as required.",
      "",
      "To make cleanup cheaper than a full scan, keep the records in a doubly linked list ordered by expiry, exactly like an LRU cache: a validation unlinks its record and appends it to the tail, so the head is always the oldest. `cleanup` pops from the head until it meets a live record and stops, so it costs only as much as it removes.",
      "",
      "## Worth saying out loud",
      "",
      "- Sliding expiry means a stolen token lives as long as the thief keeps using it. An absolute maximum lifetime on top of the sliding one bounds the exposure; say which the product wants.",
      "- Several API servers: the map becomes a shared store, for instance a Redis hash per token plus a sorted set keyed by expiry, which is the linked list again, at the price of a network hop per validation.",
      '- A per-user index makes "log out everywhere" and "at most k sessions per user" cheap.',
      "- Surviving a restart means persisting the records, or accepting that every session dies with the process.",
    ].join("\n"),
    judge: {
      starterCode: `class SessionManager {
  /** @param {number} ttl - seconds a session lives after its last use */
  constructor(ttl) {
    // Your code here
  }

  /** @returns {string} a token unique among every token ever issued */
  createSession(userId, now) {
    // Your code here
    return "";
  }

  /** @returns {string | null} the userId, or null when missing or expired; resets the expiry */
  validate(token, now) {
    // Your code here
    return null;
  }

  /** @returns {boolean} whether the token existed */
  invalidate(token) {
    // Your code here
    return false;
  }

  /** @returns {number} how many expired sessions were removed */
  cleanup(now) {
    // Your code here
    return 0;
  }
}
`,
      solutionCode: `class SessionManager {
  constructor(ttl) {
    this.ttl = ttl;
    this.sessions = new Map(); // token -> { userId, expiresAt }
    this.nextId = 1;
  }

  createSession(userId, now) {
    const token = "s" + this.nextId++; // unique by construction
    this.sessions.set(token, { userId, expiresAt: now + this.ttl });
    return token;
  }

  validate(token, now) {
    const session = this.sessions.get(token);
    if (!session) return null;
    if (now >= session.expiresAt) {
      this.sessions.delete(token); // expire lazily
      return null;
    }
    session.expiresAt = now + this.ttl; // sliding window
    return session.userId;
  }

  invalidate(token) {
    return this.sessions.delete(token);
  }

  cleanup(now) {
    let removed = 0;
    for (const [token, session] of this.sessions) {
      if (now >= session.expiresAt) {
        this.sessions.delete(token);
        removed++;
      }
    }
    return removed;
  }
}
`,
      entry: "__runSessions",
      // Tokens are whatever the candidate's code returns, so scripts refer
      // to them by the order they were created: "$0" is the first token. A
      // createSession step reports "token" (or the bad value), and the run
      // ends with whether every token issued was distinct.
      driverCode: `function __runSessions(ttl, steps) {
  const manager = new SessionManager(ttl);
  const tokens = [];
  const out = [];
  for (const [method, ...rawArgs] of steps) {
    const args = rawArgs.map((a) =>
      typeof a === "string" && a[0] === "$" ? tokens[Number(a.slice(1))] : a
    );
    if (method === "createSession") {
      const token = manager.createSession(...args);
      tokens.push(token);
      out.push(typeof token === "string" && token.length > 0 ? "token" : token);
    } else {
      out.push(manager[method](...args));
    }
  }
  out.push(new Set(tokens).size === tokens.length ? "all tokens distinct" : "duplicate token");
  return out;
}
`,
      tests: [
        {
          name: "Prompt example: the window slides, then runs out",
          input: [
            300,
            [
              ["createSession", "user_7", 0],
              ["validate", "$0", 200],
              ["validate", "$0", 499],
              ["validate", "$0", 799],
              ["cleanup", 800],
            ],
          ],
          expected: [
            "token",
            "user_7",
            "user_7",
            null,
            0,
            "all tokens distinct",
          ],
        },
        {
          name: "Unknown and revoked tokens",
          input: [
            60,
            [
              ["createSession", "ana", 10],
              ["validate", "nope", 11],
              ["invalidate", "$0"],
              ["validate", "$0", 12],
              ["invalidate", "$0"],
            ],
          ],
          expected: ["token", null, true, null, false, "all tokens distinct"],
        },
        {
          name: "One user, several sessions; cleanup counts only expired ones",
          input: [
            100,
            [
              ["createSession", "bo", 0],
              ["createSession", "bo", 50],
              ["createSession", "cy", 80],
              ["validate", "$0", 99],
              ["cleanup", 150],
              ["validate", "$0", 150],
              ["validate", "$1", 150],
              ["validate", "$2", 150],
              ["cleanup", 1000],
            ],
          ],
          expected: [
            "token",
            "token",
            "token",
            "bo",
            1,
            "bo",
            null,
            "cy",
            2,
            "all tokens distinct",
          ],
        },
        {
          name: "Expiry is exclusive at exactly ttl seconds",
          input: [
            5,
            [
              ["createSession", "d", 0],
              ["validate", "$0", 4],
              ["validate", "$0", 9],
              ["createSession", "d", 9],
              ["validate", "$1", 13],
              ["validate", "$1", 17],
              ["validate", "$1", 22],
            ],
          ],
          expected: [
            "token",
            "d",
            null,
            "token",
            "d",
            "d",
            null,
            "all tokens distinct",
          ],
        },
        {
          name: "Many sessions stay distinct",
          input: [
            10,
            [
              ["createSession", "u", 0],
              ["createSession", "u", 0],
              ["createSession", "u", 0],
              ["createSession", "v", 0],
              ["validate", "$3", 1],
              ["cleanup", 5],
              ["cleanup", 10],
            ],
          ],
          expected: [
            "token",
            "token",
            "token",
            "token",
            "v",
            0,
            3,
            "all tokens distinct",
          ],
        },
      ],
    },
  },
];
