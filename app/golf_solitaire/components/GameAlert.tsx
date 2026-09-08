interface GameAlertProps {
  message: string;
  onUndo?: () => void;
  onRestart?: () => void;
}

export function GameAlert({ message, onUndo, onRestart }: GameAlertProps) {
  return (
    <div className="game-alert">
      <p>{message}</p>
      <section className="flex flex-col justify-between">
        {onUndo && (
          <button className="game-alert-action" onClick={onUndo}>
            undo
          </button>
        )}
        {onRestart && (
          <button className="game-alert-action" onClick={onRestart}>
            restart
          </button>
        )}
      </section>
    </div>
  );
}
