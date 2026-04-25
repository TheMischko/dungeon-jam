/**
 * Least Recently Used (LRU) Cache
 *
 * Cache with a maximum capacity, which replaces the least recently used object
 * with the new data.
 */
export class LRUCache<K, V> {
  private cache: Map<K, V>;
  constructor(private capacity: number) {
    if (capacity <= 0) {
      throw Error('Capacity of LRU Cache has to be greater than 0!');
    }
    this.cache = new Map<K, V>();
  }

  public put(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size === this.capacity) {
      this.cache.delete(this.first!);
    }
    this.cache.set(key, value);
  }

  public get(key: K): V | undefined {
    const item = this.cache.get(key);
    if (item !== undefined) {
      this.cache.delete(key);
      this.cache.set(key, item);
    }
    return item;
  }

  private get first(): K | undefined {
    return this.cache.keys().next().value;
  }
}
