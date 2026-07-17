import { ProgressBar } from "./ProgressBar";
import type { UsePlaybackProgressReturn } from "~/hooks/usePlaybackProgress";

export function ProgressBarWithTimestamps({
  ref,
  timeElapsedRef,
  timeRemainingRef,
}: UsePlaybackProgressReturn) {
  return (
    <div className="flex flex-col gap-0.5 w-full">
      <ProgressBar ref={ref} />
      <section className="flex flex-row justify-between">
        <span ref={timeElapsedRef}>0:00</span>
        <span ref={timeRemainingRef}>0:00</span>
      </section>
    </div>
  );
}
