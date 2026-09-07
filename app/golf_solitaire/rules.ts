import { compareCards } from "./deck";
import type { Card, GameState } from "./solitaire.types";

export function canPlay(card: Card, topOfWaste: Card): boolean {
  return compareCards(card, topOfWaste) === 1;
}

// win = every column in the tableau is cleared
export function isWin(state: GameState): boolean {
  return state.tableau.every((column) => column.length === 0);
}

/**
 * you are stuck when:
 * - you can't draw from the stock anymore
 * - && the top of every column in the tableau is unplayable with the drawn card
 */
export function isStuck(state: GameState): boolean {
  if (state.stock.length > 0) return false;
  const top = state.waste.at(-1);
  if (!top) return false;

  return !state.tableau.some((col) => {
    const card = col.at(-1);
    return card !== undefined && canPlay(card, top);
  });
}
