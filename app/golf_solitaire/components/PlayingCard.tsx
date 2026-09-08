import { cardValueToStr, getSuitColor } from "../cardDisplay";
import type { CardValue, Suit } from "../solitaire.types";

interface PlayingCardProps {
  value: CardValue;
  suit: Suit;
}

export function PlayingCard({ value, suit }: PlayingCardProps) {
  const color = getSuitColor(suit);

  return (
    <div className={`solitaire-card ${color}`}>
      <span>
        {cardValueToStr(value)}
        {suit.symbol}
      </span>
    </div>
  );
}
