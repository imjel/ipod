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

export type FaceCard = "Jack" | "Queen" | "King";
export type CardValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
export const CARD_VALUES = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
] satisfies CardValue[];
export type Card = {
  suit: Suit;
  value: CardValue;
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
