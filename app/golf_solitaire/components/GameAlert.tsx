interface GameAlertProps {
  message: string;
  onUndo?: () => void;
  onRestart?: () => void;
}

export function GameAlert({ message, onUndo, onRestart }: GameAlertProps) {
  return (
    <div className="game-alert">
      <p className="game-alert-message">{message}</p>
      <section className="flex flex-col justify-between">
        {onUndo && (
          <button className="game-alert-action" onClick={onUndo}>
            Undo
          </button>
        )}
        {onRestart && (
          <button className="game-alert-action" onClick={onRestart}>
            Restart
          </button>
        )}
      </section>
    </div>
  );
}
