import { ProgressBar } from "./ProgressBar";
import type { UsePlaybackProgressReturn } from "~/hooks/usePlaybackProgress";

export function ProgressBarWithTimestamps({
  ref,
  timeElapsedRef,
  timeRemainingRef,
}: UsePlaybackProgressReturn) {
  return (
    <div className="flex flex-col gap-0.5">
      <ProgressBar ref={ref} />
      <section className="flex flex-row justify-between">
        <span ref={timeElapsedRef}></span>
        <span ref={timeRemainingRef}></span>
      </section>
    </div>
  );
}
