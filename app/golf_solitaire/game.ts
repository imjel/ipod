import type { Card, GameState } from "./solitaire.types";

// 7 columns with 5 cards each for total of 35 cards in tableau
function initTableau(deck: Card[]): Card[][] {
  let tableau = [];
  for (let i = 0; i < 7; i++) {
    // e.g., if row = 0, then we slice the first 5 cards from the deck:
    const col = deck.slice(i * 5, i * 5 + 5);
    tableau.push(col);
  }
  return tableau;
}

export function initGameState(deck: Card[]): GameState {
  const tableau = initTableau(deck);

  return {
    tableau,
    stock: deck.slice(36), // stock pile is remaining 16 cards
    waste: [deck[35]],
    history: [],
  };
}
