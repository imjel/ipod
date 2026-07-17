export function formatTime(s: number): string {
  const seconds = s % 60;
  const minutes = Math.floor(s / 60);
  return String(minutes) + ":" + String(seconds).padStart(2, "0");
}

export function formatTimeFromMs(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60);
  return String(minutes) + ":" + String(seconds).padStart(2, "0");
}
