import { useSolitaire } from "../useSolitare";
import { SolitaireBoard } from "./SolitaireBoard";

export function SolitaireView() {
  const { state, playCard, draw, undo, isWin, isStuck, newGame } =
    useSolitaire();

  return (
    <SolitaireBoard
      game={state}
      draw={draw}
      playCard={playCard}
      newGame={newGame}
      undo={undo}
    />
  );
}
