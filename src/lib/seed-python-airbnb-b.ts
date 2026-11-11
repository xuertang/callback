import type { JudgeLanguage } from "./types";

// Python judges for the Airbnb bank, part two: the retry wrapper, the FIFO
// stock allocator and the poker hand classifier. Keyed by slug and merged
// into judge.python by the seed script like seed-python.ts.

export const airbnbPythonJudgesB: Record<string, JudgeLanguage> = {
  "retry-wrapper": {
    entry: "__run_retry_scenario",
    starterCode: `import random
import time


# Backoff strategies: each returns a function (attempt) -> delay in ms, attempt starting at 0.
def fixed(ms):
    return lambda attempt: ms


def linear(ms):
    return lambda attempt: 0


def exponential(base, cap=30_000):
    return lambda attempt: 0


def exponential_jitter(base, cap=30_000, rand=random.random):
    """Jitter spreads synchronized retries: delay * [0.5, 1.5)."""
    return lambda attempt: 0


class Retryer:
    def __init__(self, max_attempts=3, backoff=None, is_retryable=None,
                 on_attempt=None, on_failure=None, sleep=None):
        # Your state here. Defaults: exponential_jitter(200), every error is
        # retryable, hooks do nothing, and sleep waits ms milliseconds.
        pass

    def run(self, fn, signal=None):
        """Call fn(attempt) until it returns; re-raise the last (or a non-retryable)
        error. With a signal, call signal.throw_if_aborted() before each attempt."""
        return fn(0)

    def wrap(self, fn):
        """Decorator form: retryer.wrap(fetch_json) returns a retrying version."""
        return lambda *args, **kwargs: self.run(lambda attempt: fn(*args, **kwargs))
`,
    solutionCode: `import random
import time


# Backoff strategies: each returns a function (attempt) -> delay in ms.
def fixed(ms):
    return lambda attempt: ms


def linear(ms):
    return lambda attempt: ms * (attempt + 1)


def exponential(base, cap=30_000):
    return lambda attempt: min(cap, base * 2**attempt)


def exponential_jitter(base, cap=30_000, rand=random.random):
    # Jitter prevents synchronized retry storms: delay * [0.5, 1.5).
    return lambda attempt: min(cap, base * 2**attempt) * (0.5 + rand())


class Retryer:
    # Three pluggable pieces: a backoff strategy, a retryable-error filter, hooks.
    def __init__(self, max_attempts=3, backoff=None, is_retryable=None,
                 on_attempt=None, on_failure=None, sleep=None):
        self.max_attempts = max_attempts
        self.delay_for = backoff or exponential_jitter(200)
        self.is_retryable = is_retryable or (lambda err: True)
        self.on_attempt = on_attempt or (lambda attempt: None)
        self.on_failure = on_failure or (lambda err, attempt: None)
        self.sleep = sleep or (lambda ms: time.sleep(ms / 1000))

    def run(self, fn, signal=None):
        attempt = 0
        while True:
            if signal is not None:
                signal.throw_if_aborted()
            self.on_attempt(attempt)
            try:
                return fn(attempt)
            except Exception as err:
                last = attempt == self.max_attempts - 1
                self.on_failure(err, attempt)
                if last or not self.is_retryable(err):
                    raise  # the last, or a non-retryable, error goes to the caller
                self.sleep(self.delay_for(attempt))
            attempt += 1

    def wrap(self, fn):
        return lambda *args, **kwargs: self.run(lambda attempt: fn(*args, **kwargs))
`,
    driverCode: `class _ScenarioError(Exception):
    name = "Error"

    def __init__(self, message, retryable=True):
        super().__init__(message)
        self.retryable = retryable


class _AbortError(Exception):
    name = "AbortError"


class _AbortedSignal:
    aborted = True

    def throw_if_aborted(self):
        raise _AbortError("Aborted")


def __run_retry_scenario(kind):
    log = []
    sleeps = []
    state = {"calls": 0}

    def sleep(ms):
        sleeps.append(ms)

    def failing_until(n, result="ok"):
        def fn(attempt):
            state["calls"] += 1
            if state["calls"] <= n:
                raise _ScenarioError("fail " + str(state["calls"]))
            return result

        return fn

    def summarize(action):
        try:
            result = action()
            return {"result": result, "calls": state["calls"], "sleeps": sleeps, "log": log}
        except Exception as err:
            return {
                "error": str(err),
                "name": getattr(err, "name", "Error"),
                "calls": state["calls"],
                "sleeps": sleeps,
                "log": log,
            }

    if kind == "first-try":
        return summarize(lambda: Retryer(sleep=sleep).run(failing_until(0)))
    if kind == "retries-then-succeeds":
        return summarize(lambda: Retryer(max_attempts=3, backoff=fixed(100), sleep=sleep).run(failing_until(2)))
    if kind == "exhausted":
        return summarize(lambda: Retryer(max_attempts=3, backoff=fixed(50), sleep=sleep).run(failing_until(99)))
    if kind == "non-retryable":
        def bad_request(attempt):
            state["calls"] += 1
            raise _ScenarioError("bad request", retryable=False)

        retryer = Retryer(
            max_attempts=5,
            backoff=fixed(50),
            sleep=sleep,
            is_retryable=lambda err: getattr(err, "retryable", False) is True,
        )
        return summarize(lambda: retryer.run(bad_request))
    if kind == "exponential":
        return summarize(lambda: Retryer(max_attempts=4, backoff=exponential(100, 350), sleep=sleep).run(failing_until(99)))
    if kind == "linear":
        return summarize(lambda: Retryer(max_attempts=4, backoff=linear(100), sleep=sleep).run(failing_until(99)))
    if kind == "jitter":
        jittered = exponential_jitter(100, 30000, lambda: 0.25)
        return summarize(lambda: Retryer(max_attempts=3, backoff=jittered, sleep=sleep).run(failing_until(99)))
    if kind == "hooks":
        retryer = Retryer(
            max_attempts=3,
            backoff=fixed(10),
            sleep=sleep,
            on_attempt=lambda attempt: log.append("attempt " + str(attempt)),
            on_failure=lambda err, attempt: log.append("failure " + str(attempt) + ": " + str(err)),
        )
        return summarize(lambda: retryer.run(failing_until(1)))
    if kind == "aborted":
        return summarize(lambda: Retryer(sleep=sleep).run(failing_until(0), signal=_AbortedSignal()))

    retryer = Retryer(max_attempts=2, backoff=fixed(5), sleep=sleep)

    def add_numbers(a, b):
        state["calls"] += 1
        return a + b

    add = retryer.wrap(add_numbers)
    return summarize(lambda: add(2, 3))
`,
  },
  "fifo-order-allocator": {
    entry: "__run_operations",
    starterCode: `class StockAllocator:
    def __init__(self):
        # Your state here
        pass

    def receive(self, lot_id, quantity, received_at):
        """Add a lot of stock. Lots are consumed oldest received_at first; ties in the order received."""
        # Your code here
        pass

    def allocate(self, order_id, quantity):
        """Fill an order from the oldest stock. All-or-nothing: None (and no change) when
        stock is short. Returns [{"lotId": ..., "quantity": ...}, ...]."""
        return None

    def available(self):
        """Total units still in stock."""
        return 0

    def lots(self):
        """Remaining lots in consumption order:
        [{"lotId": ..., "quantity": ..., "receivedAt": ...}, ...]"""
        return []
`,
    solutionCode: `class StockAllocator:
    # Consume the oldest lot first, partially if needed, and report which lots
    # an order drew from. All-or-nothing on a shortage.
    def __init__(self):
        self._lots = []  # dicts kept sorted: receivedAt ascending, then arrival order
        self._seq = 0

    def receive(self, lot_id, quantity, received_at):
        if quantity <= 0:
            return
        self._lots.append(
            {"lotId": lot_id, "quantity": quantity, "receivedAt": received_at, "seq": self._seq}
        )
        self._seq += 1
        self._lots.sort(key=lambda lot: (lot["receivedAt"], lot["seq"]))

    def available(self):
        return sum(lot["quantity"] for lot in self._lots)

    def lots(self):
        return [
            {"lotId": lot["lotId"], "quantity": lot["quantity"], "receivedAt": lot["receivedAt"]}
            for lot in self._lots
        ]

    def allocate(self, order_id, quantity):
        if quantity <= 0:
            return []
        if self.available() < quantity:
            return None  # all-or-nothing: leave the stock untouched
        allocations = []
        remaining = quantity
        while remaining > 0:
            lot = self._lots[0]  # the oldest lot is always at the front
            take = min(lot["quantity"], remaining)
            allocations.append({"lotId": lot["lotId"], "quantity": take})
            lot["quantity"] -= take
            remaining -= take
            if lot["quantity"] == 0:
                self._lots.pop(0)
        return allocations
`,
    driverCode: `def __run_operations(operations, args):
    allocator = None
    out = []
    for op, a in zip(operations, args):
        if op == "StockAllocator":
            allocator = StockAllocator()
            out.append(None)
        else:
            out.append(getattr(allocator, op)(*a))
    return out
`,
  },
  "poker-hand-category": {
    entry: "hand_category",
    starterCode: `def hand_category(hand):
    """hand: five distinct cards like "10H", "AS", "QD".
    Return the best category, e.g. "Full house"."""
    # Your code here
    return "High card"
`,
    solutionCode: `FACE_VALUES = {"A": 1, "J": 11, "Q": 12, "K": 13}


def hand_category(hand):
    # A rank histogram plus "flush" and "straight".
    values = sorted(
        FACE_VALUES.get(card[:-1]) or int(card[:-1])  # "10H" is the one three-character card
        for card in hand
    )
    suits = {card[-1] for card in hand}
    by_rank = {}
    for value in values:
        by_rank[value] = by_rank.get(value, 0) + 1
    counts = sorted(by_rank.values(), reverse=True)

    flush = len(suits) == 1
    straight = len(counts) == 5 and (
        values[4] - values[0] == 4 or values == [1, 10, 11, 12, 13]  # ace high
    )

    if straight and flush:
        return "Straight flush"
    if counts[0] == 4:
        return "Four of a kind"
    if counts[0] == 3 and counts[1] == 2:
        return "Full house"
    if flush:
        return "Flush"
    if straight:
        return "Straight"
    if counts[0] == 3:
        return "Three of a kind"
    if counts[0] == 2 and counts[1] == 2:
        return "Two pair"
    if counts[0] == 2:
        return "One pair"
    return "High card"
`,
  },
};
