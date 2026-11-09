// The source strings of the Animal Chess engine problem (seed-duolingo-chess.ts):
// the shared constants, the starter and the reference, all JavaScript shown
// in the editor.

export const chessShared = `const RANK = { Elephant: 8, Lion: 7, Tiger: 6, Leopard: 5, Wolf: 4, Dog: 3, Cat: 2, Rat: 1 };
const LETTER = { Elephant: "E", Lion: "L", Tiger: "T", Leopard: "P", Wolf: "W", Dog: "D", Cat: "C", Rat: "R" };
const DENS = { A: [0, 3], B: [8, 3] };
const TRAPS = { A: [[0, 2], [0, 4], [1, 3]], B: [[8, 2], [8, 4], [7, 3]] };
const SETUP = {
  A: [["Lion", 0, 0], ["Tiger", 0, 6], ["Dog", 1, 1], ["Cat", 1, 5], ["Rat", 2, 0], ["Leopard", 2, 2], ["Wolf", 2, 4], ["Elephant", 2, 6]],
  B: [["Elephant", 6, 0], ["Wolf", 6, 2], ["Leopard", 6, 4], ["Rat", 6, 6], ["Cat", 7, 1], ["Dog", 7, 5], ["Tiger", 8, 0], ["Lion", 8, 6]],
};
const isRiver = (r, c) => r >= 3 && r <= 5 && (c === 1 || c === 2 || c === 4 || c === 5);
const inBounds = (r, c) => r >= 0 && r < 9 && c >= 0 && c < 7;
const other = (owner) => (owner === "A" ? "B" : "A");
`;

export const chessStarter = `${chessShared}
class AnimalChess {
  constructor() {
    this.clear();
  }

  /** Empty board, player A to move, no winner. Returns true. */
  clear() {
    // Your code here
    return true;
  }

  /** The standard setup from SETUP. Returns true. */
  init() {
    // Your code here
    return true;
  }

  /** @returns {boolean} false when out of bounds, occupied, the owner's own den, or a non-Rat on a river cell */
  place(owner, pieceName, r, c) {
    // Your code here
    return false;
  }

  /** @returns {boolean} whether the move was legal and applied */
  move(owner, r1, c1, r2, c2) {
    // Your code here
    return false;
  }

  /** @returns {string | null} the piece code at (r, c), e.g. "AL", or null */
  piece(r, c) {
    // Your code here
    return null;
  }

  /** @returns {Array<[number, number, string]>} every piece as [row, col, code], row-major */
  snapshot() {
    // Your code here
    return [];
  }

  /** @returns {string[][]} 9 rows of 7 codes or "__" */
  display() {
    // Your code here
    return [];
  }

  /** @returns {"A" | "B"} */
  turn() {
    // Your code here
    return "A";
  }

  /** @returns {"A" | "B" | null} */
  winner() {
    // Your code here
    return null;
  }
}
`;

export const chessSolution = `${chessShared}
class AnimalChess {
  constructor() {
    this.clear();
  }

  clear() {
    this.board = Array.from({ length: 9 }, () => Array(7).fill(null));
    this.current = "A";
    this.won = null;
    return true;
  }

  init() {
    this.clear();
    for (const owner of ["A", "B"]) {
      for (const [name, r, c] of SETUP[owner]) this.board[r][c] = { owner, name };
    }
    return true;
  }

  isDenOf(owner, r, c) {
    return DENS[owner][0] === r && DENS[owner][1] === c;
  }

  isTrapOf(owner, r, c) {
    return TRAPS[owner].some(([tr, tc]) => tr === r && tc === c);
  }

  place(owner, pieceName, r, c) {
    if (!inBounds(r, c) || !(pieceName in RANK) || this.board[r][c]) return false;
    if (this.isDenOf(owner, r, c)) return false;
    if (isRiver(r, c) && pieceName !== "Rat") return false;
    this.board[r][c] = { owner, name: pieceName };
    return true;
  }

  /** A piece standing in the enemy's trap has rank 0. */
  effectiveRank(piece, r, c) {
    return this.isTrapOf(other(piece.owner), r, c) ? 0 : RANK[piece.name];
  }

  canCapture(attacker, r1, c1, defender, r2, c2) {
    if (defender.owner === attacker.owner) return false;
    if (this.isTrapOf(attacker.owner, r2, c2)) return true; // defender sits in the attacker's trap
    if (attacker.name === "Rat" && defender.name === "Elephant") return true;
    if (attacker.name === "Elephant" && defender.name === "Rat") return false;
    return this.effectiveRank(attacker, r1, c1) >= this.effectiveRank(defender, r2, c2);
  }

  /** One orthogonal step, or a Lion/Tiger jump straight across one river section. */
  canReach(piece, r1, c1, r2, c2) {
    const dr = r2 - r1;
    const dc = c2 - c1;
    if (Math.abs(dr) + Math.abs(dc) === 1) return !(isRiver(r2, c2) && piece.name !== "Rat");
    if (piece.name !== "Lion" && piece.name !== "Tiger") return false;
    if ((dr !== 0 && dc !== 0) || isRiver(r1, c1) || isRiver(r2, c2)) return false;
    const stepR = Math.sign(dr);
    const stepC = Math.sign(dc);
    let r = r1 + stepR;
    let c = c1 + stepC;
    let crossed = 0;
    while (r !== r2 || c !== c2) {
      if (!isRiver(r, c)) return false; // a jump covers river cells only
      const occupant = this.board[r][c];
      if (occupant && occupant.name === "Rat") return false; // a Rat blocks the jump
      crossed++;
      r += stepR;
      c += stepC;
    }
    return crossed > 0;
  }

  hasPieces(owner) {
    return this.board.some((row) => row.some((p) => p && p.owner === owner));
  }

  move(owner, r1, c1, r2, c2) {
    if (this.won || owner !== this.current) return false;
    if (!inBounds(r1, c1) || !inBounds(r2, c2)) return false;
    const piece = this.board[r1][c1];
    if (!piece || piece.owner !== owner) return false;
    if (this.isDenOf(owner, r2, c2)) return false;
    if (!this.canReach(piece, r1, c1, r2, c2)) return false;
    const target = this.board[r2][c2];
    if (target && !this.canCapture(piece, r1, c1, target, r2, c2)) return false;
    this.board[r2][c2] = piece;
    this.board[r1][c1] = null;
    const enemy = other(owner);
    if (this.isDenOf(enemy, r2, c2) || !this.hasPieces(enemy)) this.won = owner;
    this.current = enemy;
    return true;
  }

  code(piece) {
    return piece.owner + LETTER[piece.name];
  }

  piece(r, c) {
    const p = inBounds(r, c) ? this.board[r][c] : null;
    return p ? this.code(p) : null;
  }

  snapshot() {
    const out = [];
    this.board.forEach((row, r) => row.forEach((p, c) => p && out.push([r, c, this.code(p)])));
    return out;
  }

  display() {
    return this.board.map((row) => row.map((p) => (p ? this.code(p) : "__")));
  }

  turn() {
    return this.current;
  }

  winner() {
    return this.won;
  }
}
`;
