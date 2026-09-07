interface SolitaireMenuProps {
  newGame: () => void;
  undo: () => void;
}

export function SolitaireMenu({ newGame, undo }: SolitaireMenuProps) {
  return (
    <div className="solitaire-menu">
      <button className="solitaire-menu-button" onClick={newGame}>
        new game
      </button>
      <button className="solitaire-menu-button" onClick={undo}>
        undo
      </button>
    </div>
  );
}
