export function randomInt(from: number, to: number): number {
  return Math.floor(Math.random() * (to - from) + from);
}

export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
