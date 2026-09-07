import type { Card } from "../solitaire.types";
import { PlayingCard } from "./PlayingCard";

interface CardColumnProps {
  cards: Card[];
  playCard: () => void;
}

export function CardColumn({ cards, playCard }: CardColumnProps) {
  return (
    <button className="column" onClick={playCard}>
      {cards.map((card) => (
        <PlayingCard
          key={`${card.suit.name}-${card.value}`}
          value={card.value}
          suit={card.suit}
        />
      ))}
    </button>
  );
}
