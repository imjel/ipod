import { cardValueToStr, getSuitColor, isFaceCard } from "../cardDisplay";
import type { CardValue, Suit } from "../solitaire.types";
import { FaceCardSymbol, PIP_LAYOUTS } from "../solitaire.types";

interface PlayingCardProps {
  value: CardValue;
  suit: Suit;
}

export function PlayingCard({ value, suit }: PlayingCardProps) {
  const color = getSuitColor(suit);
  const pipCount = isFaceCard(value) ? 1 : PIP_LAYOUTS[value].length;

  return (
    <div className={`solitaire-card ${color}`}>
      <span className="card-label">
        {cardValueToStr(value)}
        {suit.symbol}
      </span>
      <div
        className="card-pips"
        style={{ "--pips": pipCount } as React.CSSProperties}
      >
        {isFaceCard(value) ? (
          <span className="face-card">{FaceCardSymbol[value]}</span>
        ) : (
          PIP_LAYOUTS[value].map(({ col, row }, i) => (
            <span
              key={i}
              style={{
                gridColumn: col,
                gridRow: row,
                transform: row > 5 ? "rotate(180deg)" : undefined,
              }}
            >
              {suit.symbol}
            </span>
          ))
        )}
      </div>
    </div>
  );
}
