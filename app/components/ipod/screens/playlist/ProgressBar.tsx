export function ProgressBar({ progress }: { progress: number }) {
  return (
    <section className="w-full rounded-xs progress-bar-border progress-bar-outer-gradient">
      <div
        className="h-3 progress-bar-inner-gradient rounded-xs"
        style={{ width: `${progress}%` }}
      />
    </section>
  );
}
