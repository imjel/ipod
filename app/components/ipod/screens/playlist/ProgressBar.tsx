export function ProgressBar({ ref }: { ref: React.RefObject<HTMLDivElement | null> }) {
  return (
    <section className="w-full rounded-xs progress-bar-border progress-bar-outer-gradient">
      <div
        ref={ref}
        className="h-3 progress-bar-inner-gradient rounded-xs"
      />
    </section>
  );
}
