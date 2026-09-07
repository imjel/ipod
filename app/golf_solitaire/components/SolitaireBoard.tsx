import type { GameState } from "../solitaire.types";
import { CardColumn } from "./CardColumn";
import { Stock } from "./Stock";
import { Waste } from "./Waste";
import { SolitaireMenu } from "./SolitaireMenu";
import "../solitaire.css";

interface SolitaireBoardProps {
  game: GameState;
  draw: () => void;
  playCard: (index: number) => void;
  newGame: () => void;
  undo: () => void;
}

export function SolitaireBoard({
  game,
  draw,
  playCard,
  newGame,
  undo,
}: SolitaireBoardProps) {
  const tableau = game.tableau;
  const stock = game.stock;
  const waste = game.waste;

  return (
    <div className="solitaire-board">
      <section className="tableau">
        {tableau.map((column, i) => (
          <CardColumn key={i} cards={column} playCard={() => playCard(i)} />
        ))}
      </section>
      <section className="stock-waste-section">
        <Stock stock={stock} draw={draw} />
        <Waste waste={waste} />
      </section>
      <SolitaireMenu newGame={newGame} undo={undo} />
    </div>
  );
}
