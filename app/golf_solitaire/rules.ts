import { compareCards } from "./deck";
import type { Card, GameState } from "./solitaire.types";

export function canPlay(card: Card, topOfWaste: Card): boolean {
  return compareCards(card, topOfWaste) === 1;
}

// win = every column in the tableau is cleared
export function isWin(state: GameState): boolean {
  return state.tableau.every((column) => column.length === 0);
}
