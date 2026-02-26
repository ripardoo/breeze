export function debounce<A extends unknown[], R>(
  fn: (...args: A) => R,
  ms: number,
): (...args: A) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: A) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), ms);
  };
}
