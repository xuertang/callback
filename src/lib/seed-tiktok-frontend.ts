import type { Problem, UiFile } from "./types";

// TikTok front-end bank: the reusable comment thread, as a React workspace
// with tests. The function that builds the tree from flat records is judged
// separately (seed-tiktok-j.ts).

const threadCss: UiFile = {
  name: "styles.css",
  contents: `body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #18181b;
  background: #f4f4f5;
}

.comments {
  padding: 16px;
  max-width: 560px;
}

.comments__new,
.comment__form {
  display: flex;
  gap: 8px;
  margin: 8px 0;
}

input {
  flex: 1;
  padding: 6px 8px;
  border: 1px solid #d4d4d8;
  border-radius: 6px;
  background: white;
  color: inherit;
  font: inherit;
}

button {
  padding: 4px 10px;
  border: 1px solid #d4d4d8;
  border-radius: 6px;
  background: white;
  color: inherit;
  font: inherit;
  cursor: pointer;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.thread {
  list-style: none;
  margin: 0;
  padding: 0;
}

.thread .thread {
  margin-left: 16px;
  padding-left: 12px;
  border-left: 2px solid #d4d4d8;
}

.comment {
  margin-top: 12px;
}

.comment__author {
  margin: 0;
  font-weight: 600;
}

.comment__text {
  margin: 2px 0 6px;
}

.comment__actions {
  display: flex;
  gap: 8px;
}
`,
};

const threadData: UiFile = {
  name: "data.js",
  contents: `// The comments as the API returns them: a flat list, replies pointing at
// their parent. A parentId of null marks a top-level comment.
export const initialComments = [
  { id: 1, parentId: null, author: "Mina", text: "Loved the ending." },
  { id: 2, parentId: 1, author: "Ravi", text: "Same, watched it twice." },
  { id: 3, parentId: 2, author: "Mina", text: "Better the second time." },
  { id: 4, parentId: null, author: "Jo", text: "What song is this?" },
  { id: 5, parentId: 1, author: "Lee", text: "Agreed!" },
];
`,
};

const threadStarter = `import { useState } from "react";
import { initialComments } from "./data.js";

export default function App() {
  const [comments, setComments] = useState(initialComments);
  // Your code here: nest each reply inside the comment it answers, add the
  // reply form and the hide/show toggle, and wire up the form below.
  // The markup is the contract; see the description.
  return (
    <main className="comments">
      <form
        className="comments__new"
        onSubmit={(event) => event.preventDefault()}
      >
        <input aria-label="Add a comment" placeholder="Add a comment" />
        <button type="submit">Comment</button>
      </form>
      <ul className="thread" aria-label="Comments">
        {comments.map((comment) => (
          <li key={comment.id} className="comment">
            <p className="comment__author">{comment.author}</p>
            <p className="comment__text">{comment.text}</p>
            <div className="comment__actions">
              <button type="button">Reply</button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
`;

const threadSolution = `import { useMemo, useState } from "react";
import { initialComments } from "./data.js";

function Comment({ comment, repliesByParent, onReply }) {
  const [replying, setReplying] = useState(false);
  const [draft, setDraft] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const replies = repliesByParent.get(comment.id) || [];

  const submit = (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onReply(comment.id, text);
    setDraft("");
    setReplying(false);
    setCollapsed(false); // make sure the new reply is visible
  };

  return (
    <li className="comment">
      <p className="comment__author">{comment.author}</p>
      <p className="comment__text">{comment.text}</p>
      <div className="comment__actions">
        <button type="button" onClick={() => setReplying(true)}>
          Reply
        </button>
        {replies.length > 0 && (
          <button
            type="button"
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((value) => !value)}
          >
            {collapsed ? "Show" : "Hide"} replies ({replies.length})
          </button>
        )}
      </div>
      {replying && (
        <form className="comment__form" onSubmit={submit}>
          <input
            aria-label={"Reply to " + comment.author}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <button type="submit" disabled={draft.trim() === ""}>
            Post
          </button>
          <button
            type="button"
            onClick={() => {
              setReplying(false);
              setDraft("");
            }}
          >
            Cancel
          </button>
        </form>
      )}
      {replies.length > 0 && !collapsed && (
        <ul className="thread">
          {replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              repliesByParent={repliesByParent}
              onReply={onReply}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function App() {
  const [comments, setComments] = useState(initialComments);
  const [draft, setDraft] = useState("");

  // The list stays flat in state; the tree is derived by grouping on parentId.
  const repliesByParent = useMemo(() => {
    const groups = new Map();
    for (const comment of comments) {
      if (!groups.has(comment.parentId)) groups.set(comment.parentId, []);
      groups.get(comment.parentId).push(comment);
    }
    return groups;
  }, [comments]);

  const addComment = (parentId, text) =>
    setComments((current) => [
      ...current,
      {
        id: Math.max(0, ...current.map((comment) => comment.id)) + 1,
        parentId,
        author: "You",
        text,
      },
    ]);

  const submit = (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    addComment(null, text);
    setDraft("");
  };

  return (
    <main className="comments">
      <form className="comments__new" onSubmit={submit}>
        <input
          aria-label="Add a comment"
          placeholder="Add a comment"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <button type="submit" disabled={draft.trim() === ""}>
          Comment
        </button>
      </form>
      <ul className="thread" aria-label="Comments">
        {(repliesByParent.get(null) || []).map((comment) => (
          <Comment
            key={comment.id}
            comment={comment}
            repliesByParent={repliesByParent}
            onReply={addComment}
          />
        ))}
      </ul>
    </main>
  );
}
`;

export const tiktokFrontendProblems: Problem[] = [
  {
    slug: "comment-thread",
    title: "Nested Comment Thread",
    category: "frontend",
    difficulty: "medium",
    companies: ["tiktok"],
    summary:
      "A reusable comment component: replies nested to any depth, an inline reply form, a hide/show toggle with a count, and a flat list in state with the tree derived from it.",
    prompt: [
      "Build a comment thread like the one under a video. `data.js` exports `initialComments`, a flat list of `{ id, parentId, author, text }` in which a `parentId` of `null` marks a top-level comment.",
      "",
      "## Requirements",
      "",
      "- **Nesting.** Render the top-level comments in the list labelled `Comments`. Each comment is an `<li>` showing its author and text, and its replies are rendered in a nested list **inside that `<li>`**, to any depth, in the order they appear in the data.",
      "- **Reply.** Every comment has a `Reply` button. Clicking it shows a text box labelled `Reply to <author>` with `Post` and `Cancel` buttons. `Post` is disabled while the box is empty or only spaces. Posting adds a reply by `You` under that comment and closes the form; `Cancel` closes it without adding anything.",
      "- **Hide and show.** A comment with replies has a button reading `Hide replies (n)`, where `n` is the number of direct replies. Clicking it removes the replies from the page and the button becomes `Show replies (n)`.",
      "- **New comment.** The form at the top, with the box labelled `Add a comment` and the `Comment` button, adds a top-level comment by `You` at the end and clears the box.",
      "",
      "Keep the starter's class names and labels. Be ready to discuss how the component's API would look if another team reused it, and what changes with ten thousand comments.",
    ].join("\n"),
    hints: [
      "Keep the comments flat in state, as they arrive. Group them by `parentId` once per change and let a recursive `Comment` component look up its own replies.",
      "The open reply form, its draft text and the collapsed flag are local to one comment; they belong in that `Comment`'s own state, not in the list.",
      "Adding a reply is an append to the flat list with the right `parentId`. No deep update of a nested structure is needed.",
    ],
    solution: [
      "## Approach",
      "",
      '`App` holds the flat list and the draft for the top form. A `useMemo` groups the comments into a `Map` from `parentId` to its replies, which is the whole tree: the top level is the group for `null`. `Comment` renders one `<li>`, looks up its replies in the map and renders a nested `<ul>` of `Comment`s for them. Whether the reply form is open, what has been typed into it and whether the replies are hidden are local state of that `Comment`. Posting calls `onReply(comment.id, text)`, which appends `{ id, parentId, author: "You", text }` to the flat list; the map is rebuilt and the new reply appears in place.',
      "",
      "## Worth saying out loud",
      "",
      "- Storing the nested tree in state makes every reply a deep immutable update along a path. Flat state plus a derived index keeps writes trivial.",
      "- As a reusable component: accept `comments`, `onReply` and a `renderComment` slot as props, keep the fetching outside, and make hide/show controllable for callers that need to persist it.",
      "- At scale: load top-level comments in pages and replies on demand (`Show replies` becomes a fetch), window the list, memoise `Comment` so one new reply does not re-render the thread, and cap the visual indentation.",
      "- Posting for real is optimistic: show the reply at once with a pending state, reconcile with the server's id, and roll back with a retry on failure.",
      "- Accessibility: the toggle carries `aria-expanded`, the reply box is labelled with the author it answers, and focus should move into the form when it opens and back to `Reply` when it closes.",
    ].join("\n"),
    ui: {
      framework: "react",
      files: [
        { name: "App.jsx", contents: threadStarter },
        threadData,
        threadCss,
      ],
      solution: [
        { name: "App.jsx", contents: threadSolution },
        threadData,
        threadCss,
      ],
    },
  },
];
