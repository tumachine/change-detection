export function randomInt(from: number, to: number): number {
  return Math.floor(Math.random() * (to - from) + from);
}

export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export class IntervalUtils {
  intervalId: number | null = null;

  // overArray<T>(arr: T[], operation: (item: T) => void, intervalMs: number): void {
  //   let counter = 0;
  //   this.intervalId = setInterval(() => {
  //     if (counter < arr.length) {
  //       operation(arr[counter]);
  //       counter++;
  //     } else {
  //       this.stop();
  //       return;
  //     }
  //   }, intervalMs);
  // }

  overArray<T>(arr: T[], operation: (item: T) => void, intervalMs: number): void {
    let counter = 0;
    this.intervalId = setInterval(() => {
      if (counter < arr.length) {
        operation(arr[counter]);
        counter++;
      } else {
        this.stop();
        return;
      }
    }, intervalMs);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
