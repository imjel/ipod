import type { Card } from "../solitaire.types";
import { PlayingCard } from "./PlayingCard";

interface WasteProps {
  waste: Card[];
}

export function Waste({ waste }: WasteProps) {
  const topCard = waste.at(-1) ?? undefined;

  return (
    <div>
      {topCard ? (
        <PlayingCard value={topCard.value} suit={topCard.suit} />
      ) : (
        <p>yippee</p>
      )}
    </div>
  );
}
