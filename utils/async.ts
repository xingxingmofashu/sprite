/**
 * Run async tasks with a concurrency limit.
 * Resolves in insertion order, same length as input.
 */
export async function throttledMap<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  limit: number,
): Promise<R[]> {
  const results: R[] = [];
  const queue = [...items.entries()];

  const worker = async () => {
    while (queue.length > 0) {
      const [index, item] = queue.shift()!;
      try {
        results[index] = await fn(item);
      } catch {
        results[index] = null as unknown as R;
      }
    }
  };

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return results;
}
