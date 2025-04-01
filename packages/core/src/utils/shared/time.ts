export function secondsToMs(seconds: number): number {
  return seconds * 1000;
}

export function minutesToMs(minutes: number): number {
  return secondsToMs(minutes * 60);
}

export function hoursToMs(hours: number): number {
  return minutesToMs(hours * 60);
}

export function daysToMs(days: number): number {
  return hoursToMs(days * 24);
}
