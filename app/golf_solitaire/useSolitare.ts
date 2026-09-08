import { useReducer } from "react";
import type { GameState, Action } from "./solitaire.types";
import { isWin, canPlay, isStuck } from "./rules";
import { initGameState } from "./game";
import { shuffleDeck, createNewDeck } from "./deck";

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "playCard": {
      // If the player chooses a valid column and their waste pile has a card,
      const column = state.tableau[action.column];
      const card = column.at(-1);
      const top = state.waste.at(-1);
      if (!top) return state;

      // checks if the absolute value of that card and the card at their chosen column and row 0 = 1
      if (!card || !canPlay(card, top)) return state;

      // if so, that becomes their waste card
      // and the card is removed from its column
      return {
        ...state,
        tableau: state.tableau.map((column, i) =>
          i === action.column ? column.slice(0, -1) : column,
        ),
        waste: [...state.waste, card],
        history: [...state.history, state],
      };
    }

    // move top card from stock to waste pile
    case "draw": {
      const drawnCard = state.stock.at(-1);
      if (!drawnCard) return state;
      return {
        ...state,
        stock: state.stock.slice(0, -1),
        waste: [...state.waste, drawnCard],
        history: [...state.history, state],
      };
    }

    case "undo": {
      return state.history.at(-1) ?? state;
    }
    case "newGame": {
      return initGameState(action.deck);
    }
  }
}

export function useSolitaire() {
  const [state, dispatch] = useReducer(reducer, undefined, () =>
    initGameState(shuffleDeck(createNewDeck())),
  );
  return {
    state,
    playCard: (i: number) => dispatch({ type: "playCard", column: i }),
    draw: () => dispatch({ type: "draw" }),
    undo: () => dispatch({ type: "undo" }),
    isWin: isWin(state),
    isStuck: isStuck(state),
    newGame: () =>
      dispatch({ type: "newGame", deck: shuffleDeck(createNewDeck()) }),
  };
}
