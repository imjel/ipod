import type { Card, GameState } from "../solitaire.types";

interface StockProps {
  stock: Card[];
  draw: () => void;
}

export function Stock({ stock, draw }: StockProps) {
  return (
    <button onClick={draw} className="ipod-card-back">
      <span>{stock.length}</span>
    </button>
  );
}
