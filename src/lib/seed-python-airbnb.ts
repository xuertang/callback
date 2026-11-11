import type { JudgeLanguage } from "./types";

// Python judges for the Airbnb bank, part one: the file system, the two
// pour-water problems, the boxed sentences, the query-string parser and
// review tagging. Keyed by slug and merged into judge.python by the seed
// script like seed-python.ts.

const WRAP_WORDS_STARTER = `def wrap_words(sentence, width):
    """Greedy word wrap: never split a word; a line never starts with punctuation."""
    # Your code here
    return [sentence]
`;

const WRAP_WORDS_SOLUTION = `LEADING_PUNCT = ".,;:!?"


def wrap_words(sentence, width):
    # Greedy: append words while they fit; a word that starts with punctuation
    # always joins the current line.
    lines = []
    line = ""
    for word in sentence.split():
        if line == "":
            line = word
        elif len(line) + 1 + len(word) <= width or word[0] in LEADING_PUNCT:
            line += " " + word
        else:
            lines.append(line)
            line = word
    if line:
        lines.append(line)
    return lines
`;

export const airbnbPythonJudges: Record<string, JudgeLanguage> = {
  "in-memory-file-system": {
    entry: "__run_operations",
    starterCode: `class FileSystem:
    def __init__(self):
        # Your state here: a tree of nodes keyed by path segment
        pass

    def create(self, path, value=None):
        """True if created; False if the path already exists; raise when the parent is missing."""
        return False

    def get(self, path):
        """The node's value, or None when the path doesn't exist."""
        return None

    def set(self, path, value):
        """Overwrite the node's value; raise when the path doesn't exist."""
        pass

    def list(self, path=""):
        """Child names, sorted; [] for a missing path."""
        return []
`,
    solutionCode: `class FileSystem:
    # Paths look like "a/b/c". A tree of nodes; each node may hold a value and children.
    def __init__(self):
        self.root = {"children": {}, "value": None}

    def _walk(self, parts):
        node = self.root
        for part in parts:
            node = node["children"].get(part)
            if node is None:
                return None
        return node

    @staticmethod
    def _parts(path):
        return [part for part in path.split("/") if part]

    def create(self, path, value=None):
        # The parent must exist, like mkdir without -p.
        parts = self._parts(path)
        if not parts:
            raise ValueError("empty path")
        parent = self._walk(parts[:-1])
        if parent is None:
            raise KeyError('Parent of "' + path + '" does not exist')
        name = parts[-1]
        if name in parent["children"]:
            return False
        parent["children"][name] = {"children": {}, "value": value}
        return True

    def get(self, path):
        node = self._walk(self._parts(path))
        return node["value"] if node else None

    def set(self, path, value):
        node = self._walk(self._parts(path))
        if node is None:
            raise KeyError('"' + path + '" does not exist')
        node["value"] = value

    def list(self, path=""):
        node = self._walk(self._parts(path))
        return sorted(node["children"]) if node else []
`,
    driverCode: `def __run_operations(operations, args):
    fs = None
    out = []
    for op, a in zip(operations, args):
        if op == "FileSystem":
            fs = FileSystem()
            out.append(None)
            continue
        try:
            out.append(getattr(fs, op)(*a))
        except Exception:
            out.append("error")
    return out
`,
  },
  "pour-water": {
    entry: "pour_water",
    starterCode: `def pour_water(heights, volume, k):
    """Final heights after dropping volume units at index k, one unit at a time."""
    return heights
`,
    solutionCode: `def pour_water(heights, volume, k):
    # Each unit tries to move left to a strictly lower resting spot, then right, else stays.
    h = list(heights)
    for _ in range(volume):
        landed = False
        for step in (-1, 1):  # left first, then right
            best = i = k
            while 0 <= i + step < len(h) and h[i + step] <= h[i]:
                i += step
                if h[i] < h[best]:
                    best = i  # lowest point reachable without climbing
            if best != k:
                h[best] += 1
                landed = True
                break
        if not landed:
            h[k] += 1
    return h
`,
  },
  "print-terrain": {
    entry: "print_terrain",
    starterCode: `def print_terrain(heights, water):
    """Rows from the top down (height max(water)), joined by newlines:
    "#" ground, "~" water, " " air."""
    return ""
`,
    solutionCode: `def print_terrain(heights, water):
    # Draw terrain and water as rows of characters, top level first.
    rows = []
    for level in range(max(water, default=0), 0, -1):
        rows.append(
            "".join(
                "#" if level <= ground else "~" if level <= water[i] else " "
                for i, ground in enumerate(heights)
            )
        )
    return "\\n".join(rows)
`,
  },
  "boxed-sentence": {
    entry: "__judge_box",
    starterCode: `${WRAP_WORDS_STARTER}

def render_box(sentence, width):
    """One sentence in a box, wrapped at width. Lines joined by newlines."""
    return ""
`,
    solutionCode: `${WRAP_WORDS_SOLUTION}

def render_box(sentence, width):
    rule = "+" + "-" * (width + 2) + "+"
    body = ["| " + line.ljust(width) + " |" for line in wrap_words(sentence, width)]
    return "\\n".join([rule, *body, rule])
`,
    driverCode: `def __judge_box(kind, sentence, width):
    return wrap_words(sentence, width) if kind == "wrap" else render_box(sentence, width)
`,
  },
  "boxed-sentences-mixed-widths": {
    entry: "render_multi_box",
    starterCode: `${WRAP_WORDS_STARTER}

def render_multi_box(blocks):
    """Several sentences, each wrapped at its own width, in one aligned box.
    blocks: [{"text": ..., "width": ...}]"""
    return ""
`,
    solutionCode: `${WRAP_WORDS_SOLUTION}

def render_multi_box(blocks):
    inner = max(block["width"] for block in blocks)
    rule = "+" + "-" * (inner + 2) + "+"
    out = [rule]
    for i, block in enumerate(blocks):
        if i > 0:
            out.append("| " + "-" * inner + " |")  # separator between sentences
        for line in wrap_words(block["text"], block["width"]):
            out.append("| " + line.ljust(inner) + " |")
    out.append(rule)
    return "\\n".join(out)
`,
  },
  "parse-query-string": {
    entry: "parse_query",
    starterCode: `def parse_query(url):
    """"?a=b&c=d" -> {"a": "b", "c": "d"}. A bare key is True; a repeated key becomes
    a list; percent-decode after splitting; drop the #fragment; no "?" -> {}."""
    # Your code here
    return {}
`,
    solutionCode: `import re
from urllib.parse import unquote

MALFORMED_ESCAPE = re.compile(r"%(?![0-9A-Fa-f]{2})")


def decode(text):
    # "+" is a space; a malformed escape or invalid UTF-8 leaves the text as it was.
    if MALFORMED_ESCAPE.search(text):
        return text
    try:
        return unquote(text.replace("+", " "), errors="strict")
    except UnicodeDecodeError:
        return text


def parse_query(url):
    q = url.find("?")
    if q == -1:
        return {}
    query = url[q + 1 :].split("#")[0]  # drop the fragment
    out = {}
    for part in query.split("&"):
        if not part:
            continue  # a trailing "&" or "&&" is a no-op
        key, eq, raw = part.partition("=")
        key = decode(key)  # decode after splitting on & and =
        value = decode(raw) if eq else True
        if key not in out:
            out[key] = value
        elif isinstance(out[key], list):
            out[key].append(value)
        else:
            out[key] = [out[key], value]
    return out
`,
  },
  "review-token-tagging": {
    entry: "tag_tokens",
    starterCode: `def tag_tokens(review, tokens):
    """Wrap each case-insensitive occurrence of a token as [label]{original text}.
    Multi-word tokens match across a space; the longest match wins at an offset.
    tokens: dict of token -> label."""
    # Your code here
    return review
`,
    solutionCode: `def tag_tokens(review, tokens):
    # A trie over the lowercased tokens; the label is stored under the key None.
    root = {}
    for token, label in tokens.items():
        node = root
        for ch in token.lower():
            node = node.setdefault(ch, {})
        node[None] = label

    lower = review.lower()
    out = []
    i = 0
    while i < len(lower):
        node = root
        best = None  # (end, label) of the longest match starting at i
        j = i
        while j < len(lower) and lower[j] in node:
            node = node[lower[j]]
            j += 1
            if None in node:
                best = (j, node[None])  # keep going: a longer match may follow
        if best:
            end, label = best
            out.append("[" + label + "]{" + review[i:end] + "}")
            i = end
        else:
            out.append(review[i])
            i += 1
    return "".join(out)
`,
  },
};
