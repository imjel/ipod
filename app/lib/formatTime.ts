export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60);
  return String(minutes) + ":" + String(seconds).padStart(2, "0");
}
