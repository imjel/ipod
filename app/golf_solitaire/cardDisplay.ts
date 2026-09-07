import type { CardValue, FaceCard, Suit } from "./solitaire.types";

export function cardValueToStr(val: CardValue): FaceCard | string {
  switch (val) {
    case 1:
      return "A";
    case 11:
      return "J";
    case 12:
      return "Q";
    case 13:
      return "K";
    default:
      return val.toString();
  }
}

export function getSuitColor(suit: Suit) {
  return suit.name === "Diamonds" || suit.name === "Hearts"
    ? "red-suits"
    : "black-suits";
}
