import type { Problem } from "./types";

// TikTok and ByteDance bank, part J: the open-ended ByteDance screen that
// asks for a serialization format for a key-value store, judged by
// round-tripping, and the front-end screen's comment tree built from flat
// records. Judged in JavaScript.

export const tiktokProblemsJ: Problem[] = [
  {
    slug: "kv-store-serialization",
    title: "Serialize a Key-Value Store",
    category: "algorithms",
    difficulty: "medium",
    companies: ["bytedance"],
    summary:
      "Turn a map of arbitrary strings into one string and back. Any separator can appear in the data, so the format has to say where each field ends: length prefixes.",
    prompt: [
      "Implement serialization for an in-memory key-value store whose keys and values are strings.",
      "",
      "- `serialize(store)` takes a plain object and returns a single string that could be written to a file or sent over a network.",
      "- `deserialize(text)` takes that string and returns an object equal to the original.",
      "",
      "Keys and values may be empty and may contain **any character**: spaces, newlines, quotes, digits, and whatever separator you might pick. The format is yours to design, and designing it is the exercise, so do not hand the work to `JSON.stringify` or another built-in encoder.",
      "",
      "```",
      'store = { "user:1": "alice", "note": "a=b;c\\nd", "empty": "" }',
      "deserialize(serialize(store))   // deep-equals store",
      "```",
      "",
      "The tests round-trip a store through your two functions; the order of keys does not matter. Only the task itself was given in the interview, so be ready to justify the format and to say what you would ask about value types and size.",
    ].join("\n"),
    hints: [
      "A format like `key=value;key=value` breaks as soon as a key or value contains `=` or `;`. Escaping fixes that, but there is a simpler idea.",
      "Tell the reader how long the next field is before it starts: `<length>:<characters>`. The reader then takes exactly that many characters without looking at them.",
      "List the inputs most likely to break a round trip, such as empty strings, a value that looks like your own header (`3:abc`), and newlines, and check the format against each before coding.",
    ],
    solution: [
      "## Approach",
      "",
      "Write every field with a length prefix: the decimal length, a colon, then the raw characters. An entry is its key field followed by its value field, and the whole store is the entries concatenated. To read, parse digits up to the colon to get a length, slice exactly that many characters, and repeat; fields alternate between key and value until the text is exhausted.",
      "",
      "Because the reader never searches the data for a delimiter, nothing inside a key or value can confuse it: not a colon, not digits, not a string that looks like another header. Empty strings are the field `0:`. Both directions are linear in the size of the data.",
      "",
      "## Worth saying out loud",
      "",
      "- The alternative is a delimiter with escaping. It is human-readable but every reader and writer must agree on the escape rules, and it is the usual source of bugs.",
      "- Lengths here count UTF-16 code units, which is consistent within JavaScript. A format shared across languages should count bytes of a stated encoding, UTF-8, and say so.",
      "- Questions to ask: are values only strings, or typed (then add a type tag per field); how large is the store (then stream entries instead of building one string); and does the format need a version number and a checksum so a reader can reject corrupt or newer data?",
      "- `deserialize` should fail loudly on malformed input, a missing colon or a length that runs past the end, rather than return a partial store.",
    ].join("\n"),
    judge: {
      starterCode: `/**
 * @param {Record<string, string>} store
 * @returns {string}
 */
function serialize(store) {
  // Your code here
  return "";
}

/**
 * @param {string} text - the output of serialize
 * @returns {Record<string, string>}
 */
function deserialize(text) {
  // Your code here
  return {};
}
`,
      solutionCode: `// Every field is written as <length>:<characters>; an entry is a key field then a value field.
function serialize(store) {
  let out = "";
  for (const [key, value] of Object.entries(store)) {
    out += key.length + ":" + key + value.length + ":" + value;
  }
  return out;
}

function deserialize(text) {
  const store = {};
  let i = 0;
  const readField = () => {
    const colon = text.indexOf(":", i);
    if (colon === -1) throw new Error("malformed input: missing length");
    const length = Number(text.slice(i, colon));
    const start = colon + 1;
    if (!Number.isInteger(length) || start + length > text.length) {
      throw new Error("malformed input: bad length");
    }
    i = start + length;
    return text.slice(start, i);
  };
  while (i < text.length) {
    const key = readField();
    store[key] = readField();
  }
  return store;
}
`,
      entry: "__roundTrip",
      driverCode: `function __roundTrip(pairs) {
  const store = Object.fromEntries(pairs);
  const text = serialize(store);
  if (typeof text !== "string") return "serialize must return a string";
  const back = deserialize(text);
  if (back === null || typeof back !== "object") return "deserialize must return an object";
  const keys = Object.keys(store);
  if (Object.keys(back).length !== keys.length) {
    return "expected " + keys.length + " keys, got " + Object.keys(back).length;
  }
  for (const key of keys) {
    if (!Object.prototype.hasOwnProperty.call(back, key)) return "missing key " + JSON.stringify(key);
    if (back[key] !== store[key]) return "wrong value for key " + JSON.stringify(key);
  }
  return true;
}
`,
      tests: [
        {
          name: "Prompt example",
          input: [
            [
              ["user:1", "alice"],
              ["note", "a=b;c\nd"],
              ["empty", ""],
            ],
          ],
          expected: true,
        },
        {
          name: "Common separators inside keys and values",
          input: [
            [
              ["a,b", "c|d"],
              ["k=v", "x;y"],
              ["tab\tkey", "line1\nline2\r\n"],
            ],
          ],
          expected: true,
        },
        {
          name: "Values that look like a length header",
          input: [
            [
              ["3:abc", "5:hello"],
              ["12", "0:"],
              [":", "::"],
            ],
          ],
          expected: true,
        },
        {
          name: "Empty key and empty values",
          input: [
            [
              ["", "value of the empty key"],
              ["blank", ""],
            ],
          ],
          expected: true,
        },
        {
          name: "Quotes, backslashes and braces",
          input: [
            [
              ['say "hi"', "back\\slash"],
              ["{json}", '["not", "parsed"]'],
            ],
          ],
          expected: true,
        },
        {
          name: "Non-ASCII text",
          input: [
            [
              ["名前", "田中"],
              ["emoji", "🙂 ok"],
              ["café", "naïve"],
            ],
          ],
          expected: true,
        },
        { name: "A single pair", input: [[["k", "v"]]], expected: true },
        {
          name: "Many small entries",
          input: [
            [
              ["a", "1"],
              ["b", "22"],
              ["c", "333"],
              ["d", "4444"],
              ["e", "55555"],
              ["f", "666666"],
              ["g", "7777777"],
              ["h", "88888888"],
              ["i", "999999999"],
              ["j", "0000000000"],
            ],
          ],
          expected: true,
        },
      ],
    },
  },
  {
    slug: "nested-comment-tree",
    title: "Build a Comment Tree From Flat Records",
    category: "frontend",
    difficulty: "easy",
    companies: ["bytedance", "tiktok"],
    summary:
      "Turn a flat list of comments with parent ids into nested roots with children, in two passes with a map, without depending on input order or mutating the input.",
    prompt: [
      "An API returns comments as a flat list. Each comment is `{ id, parent_id, text }`, and a `parent_id` of `null` marks a top-level comment. Implement `buildCommentTree(comments)`, which returns the top-level comments as an array, each with its replies nested inside it to any depth.",
      "",
      "- Every comment in the output keeps its `id`, `parent_id` and `text` and gains a `children` array, empty when it has no replies.",
      "- Top-level comments, and the replies inside each `children` array, appear in the order they have in the input.",
      "- A reply may appear in the input **before** the comment it answers.",
      "- A comment whose `parent_id` matches no comment is treated as top-level.",
      "- Do not mutate the input objects.",
      "",
      "```js",
      "buildCommentTree([",
      '  { id: 1, parent_id: null, text: "First root" },',
      '  { id: 2, parent_id: null, text: "Second root" },',
      '  { id: 3, parent_id: 1, text: "Reply to the first root" },',
      '  { id: 4, parent_id: 2, text: "Reply to the second root" },',
      '  { id: 5, parent_id: 3, text: "Reply to the reply" },',
      "]);",
      "// root 1 contains 3, which contains 5; root 2 contains 4",
      "```",
      "",
      "Ids are unique. The interviewer's own example had a typo in one `parent_id`; ask about anything in sample data that does not add up.",
    ].join("\n"),
    hints: [
      "Finding a comment's parent by scanning the list makes the whole thing quadratic. Index the comments by id first.",
      "Two passes: create a copy of every comment with an empty `children` array and store it in a map; then attach each copy to its parent's `children`, or to the roots.",
      "Because every node exists before any attaching happens, the order of the input does not matter.",
    ],
    solution: [
      "## Approach",
      "",
      "First pass: for every comment, create a shallow copy with `children: []` and store it in a `Map` keyed by id. Second pass, in input order: look up the parent of each comment; if it exists, push the copy onto the parent's `children`, otherwise push it onto the list of roots. Every node is created before anything is attached, so a reply that precedes its parent is handled, and iterating in input order preserves sibling order. O(n) time and space, no recursion.",
      "",
      "## Worth saying out loud",
      "",
      "- Copying the records keeps the caller's data untouched, which matters when the flat list is also React state.",
      "- Policies to settle for untrusted data: a missing parent (here it becomes a root), duplicate ids, a comment that is its own parent, and cycles, which would otherwise make part of the tree unreachable from any root.",
      "- In a component, keep the list flat in state and derive the tree with `useMemo`; adding a reply is then an append, not a deep update.",
    ].join("\n"),
    judge: {
      starterCode: `/**
 * @param {{id: number, parent_id: number | null, text: string}[]} comments
 * @returns {object[]} top-level comments, each with a nested children array
 */
function buildCommentTree(comments) {
  // Your code here
  return [];
}
`,
      solutionCode: `function buildCommentTree(comments) {
  // Pass 1: a copy of every comment, with room for its replies.
  const byId = new Map();
  for (const comment of comments) byId.set(comment.id, { ...comment, children: [] });

  // Pass 2: attach each copy to its parent, or to the roots.
  const roots = [];
  for (const comment of comments) {
    const node = byId.get(comment.id);
    const parent = comment.parent_id === null ? undefined : byId.get(comment.parent_id);
    if (parent) parent.children.push(node);
    else roots.push(node);
  }
  return roots;
}
`,
      entry: "__runCommentTree",
      driverCode: `function __runCommentTree(comments) {
  const before = JSON.stringify(comments);
  const tree = buildCommentTree(comments);
  if (JSON.stringify(comments) !== before) return "the input was mutated";
  return tree;
}
`,
      tests: [
        {
          name: "Prompt example",
          input: [
            [
              { id: 1, parent_id: null, text: "First root" },
              { id: 2, parent_id: null, text: "Second root" },
              { id: 3, parent_id: 1, text: "Reply to the first root" },
              { id: 4, parent_id: 2, text: "Reply to the second root" },
              { id: 5, parent_id: 3, text: "Reply to the reply" },
            ],
          ],
          expected: [
            {
              id: 1,
              parent_id: null,
              text: "First root",
              children: [
                {
                  id: 3,
                  parent_id: 1,
                  text: "Reply to the first root",
                  children: [
                    {
                      id: 5,
                      parent_id: 3,
                      text: "Reply to the reply",
                      children: [],
                    },
                  ],
                },
              ],
            },
            {
              id: 2,
              parent_id: null,
              text: "Second root",
              children: [
                {
                  id: 4,
                  parent_id: 2,
                  text: "Reply to the second root",
                  children: [],
                },
              ],
            },
          ],
        },
        { name: "No comments", input: [[]], expected: [] },
        {
          name: "Only roots",
          input: [
            [
              { id: 7, parent_id: null, text: "a" },
              { id: 3, parent_id: null, text: "b" },
            ],
          ],
          expected: [
            { id: 7, parent_id: null, text: "a", children: [] },
            { id: 3, parent_id: null, text: "b", children: [] },
          ],
        },
        {
          name: "Replies listed before their parents",
          input: [
            [
              { id: 3, parent_id: 2, text: "grandchild" },
              { id: 2, parent_id: 1, text: "child" },
              { id: 1, parent_id: null, text: "root" },
            ],
          ],
          expected: [
            {
              id: 1,
              parent_id: null,
              text: "root",
              children: [
                {
                  id: 2,
                  parent_id: 1,
                  text: "child",
                  children: [
                    { id: 3, parent_id: 2, text: "grandchild", children: [] },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: "Siblings keep input order",
          input: [
            [
              { id: 1, parent_id: null, text: "root" },
              { id: 9, parent_id: 1, text: "first reply" },
              { id: 4, parent_id: 1, text: "second reply" },
              { id: 6, parent_id: 1, text: "third reply" },
            ],
          ],
          expected: [
            {
              id: 1,
              parent_id: null,
              text: "root",
              children: [
                { id: 9, parent_id: 1, text: "first reply", children: [] },
                { id: 4, parent_id: 1, text: "second reply", children: [] },
                { id: 6, parent_id: 1, text: "third reply", children: [] },
              ],
            },
          ],
        },
        {
          name: "A missing parent makes the comment a root",
          input: [
            [
              { id: 1, parent_id: 99, text: "orphan" },
              { id: 2, parent_id: 1, text: "reply to the orphan" },
            ],
          ],
          expected: [
            {
              id: 1,
              parent_id: 99,
              text: "orphan",
              children: [
                {
                  id: 2,
                  parent_id: 1,
                  text: "reply to the orphan",
                  children: [],
                },
              ],
            },
          ],
        },
      ],
    },
  },
];
