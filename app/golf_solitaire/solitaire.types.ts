export const DECK_CARDS = 52;

type SuitName = "Hearts" | "Diamonds" | "Clubs" | "Spades";
type SuitSymbol = "♥" | "♦" | "♣" | "♠";
export type Suit = { name: SuitName; symbol: SuitSymbol };
export const Suits: Suit[] = [
  { name: "Hearts", symbol: "♥" },
  { name: "Diamonds", symbol: "♦" },
  { name: "Clubs", symbol: "♣" },
  { name: "Spades", symbol: "♠" },
];

export type FaceCard = "J" | "Q" | "K" | "A";
export type CardValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
export const CARD_VALUES = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
] satisfies CardValue[];
export type Card = {
  suit: Suit;
  value: CardValue;
};

export type PipValue = Exclude<CardValue, 11 | 12 | 13>;
export type PipCell = { col: number; row: number };

// card pip positions on a 3 col x 9 row grid
// col 1 = left flank, 2 = center, 3 = right
// row 1 = top, 9 = bottom
// pips at row > 5 are rendered upside down
export const PIP_LAYOUTS: Record<PipValue, PipCell[]> = {
  1: [{ col: 2, row: 5 }],
  2: [
    { col: 2, row: 1 },
    { col: 2, row: 9 },
  ],
  3: [
    { col: 2, row: 1 },
    { col: 2, row: 5 },
    { col: 2, row: 9 },
  ],
  4: [
    { col: 1, row: 1 },
    { col: 3, row: 1 },
    { col: 1, row: 9 },
    { col: 3, row: 9 },
  ],
  5: [
    { col: 1, row: 1 },
    { col: 3, row: 1 },
    { col: 2, row: 5 },
    { col: 1, row: 9 },
    { col: 3, row: 9 },
  ],
  6: [
    { col: 1, row: 1 },
    { col: 3, row: 1 },
    { col: 1, row: 5 },
    { col: 3, row: 5 },
    { col: 1, row: 9 },
    { col: 3, row: 9 },
  ],
  7: [
    { col: 1, row: 1 },
    { col: 3, row: 1 },
    { col: 2, row: 7 },
    { col: 1, row: 5 },
    { col: 3, row: 5 },
    { col: 1, row: 9 },
    { col: 3, row: 9 },
  ],
  8: [
    { col: 1, row: 1 },
    { col: 3, row: 1 },
    { col: 2, row: 3 },
    { col: 1, row: 5 },
    { col: 3, row: 5 },
    { col: 2, row: 7 },
    { col: 1, row: 9 },
    { col: 3, row: 9 },
  ],
  9: [
    { col: 1, row: 1 },
    { col: 3, row: 1 },
    { col: 1, row: 3 },
    { col: 3, row: 3 },
    { col: 2, row: 5 },
    { col: 1, row: 7 },
    { col: 3, row: 7 },
    { col: 1, row: 9 },
    { col: 3, row: 9 },
  ],
  10: [
    { col: 1, row: 1 },
    { col: 3, row: 1 },
    { col: 2, row: 2 },
    { col: 1, row: 3 },
    { col: 3, row: 3 },
    { col: 1, row: 7 },
    { col: 3, row: 7 },
    { col: 2, row: 8 },
    { col: 1, row: 9 },
    { col: 3, row: 9 },
  ],
};

export type FaceCardValue = 11 | 12 | 13;
export const FaceCardSymbol: Record<FaceCardValue, string> = {
  11: "♗",
  12: "♕",
  13: "♔",
};

export type GameState = {
  tableau: Card[][];
  stock: Card[];
  waste: Card[];
  history: GameState[];
};

export type Action =
  | { type: "newGame"; deck: Card[] }
  | { type: "playCard"; column: number }
  | { type: "draw" }
  | { type: "undo" };

export const STUCK_MESSAGE = "You can't make any more moves D:";
export const WIN_MESSAGE = "We have a winner!";
