import type { CardValue, FaceCard, Suit } from "./solitaire.types";

export function cardValueToStr(val: CardValue): FaceCard | string {
  switch (val) {
    case 1:
      return "Ace";
    case 11:
      return "Jack";
    case 12:
      return "Queen";
    case 13:
      return "King";
    default:
      return val.toString();
  }
}

export function getSuitColor(suit: Suit) {
  return suit.name === "Diamonds" || suit.name === "Hearts" ? "red" : "black";
}
