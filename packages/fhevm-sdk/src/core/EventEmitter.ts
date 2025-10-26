/**
 * Lightweight EventEmitter implementation
 * Compatible with both browser and Node.js environments
 */

type EventListener = (...args: any[]) => void;

export class EventEmitter<Events extends Record<string, EventListener> = Record<string, EventListener>> implements Record<string, any> {
  [key: string]: any;
  private listeners: Map<keyof Events, Set<EventListener>> = new Map();

  /**
   * Register an event listener
   */
  on<K extends keyof Events>(event: K, listener: Events[K]): this {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener as EventListener);
    return this;
  }

  /**
   * Register a one-time event listener
   */
  once<K extends keyof Events>(event: K, listener: Events[K]): this {
    const onceWrapper = ((...args: any[]) => {
      this.off(event, onceWrapper as Events[K]);
      listener(...args);
    }) as Events[K];
    return this.on(event, onceWrapper);
  }

  /**
   * Remove an event listener
   */
  off<K extends keyof Events>(event: K, listener: Events[K]): this {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listener as EventListener);
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    }
    return this;
  }

  /**
   * Emit an event
   */
  emit<K extends keyof Events>(event: K, ...args: Parameters<Events[K]>): boolean {
    const eventListeners = this.listeners.get(event);
    if (!eventListeners || eventListeners.size === 0) {
      return false;
    }

    eventListeners.forEach(listener => {
      try {
        listener(...args);
      } catch (error) {
        // Prevent listener errors from breaking other listeners
        console.error(`Error in event listener for "${String(event)}":`, error);
      }
    });

    return true;
  }

  /**
   * Remove all listeners for an event, or all listeners if no event specified
   */
  removeAllListeners<K extends keyof Events>(event?: K): this {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
    return this;
  }

  /**
   * Get the number of listeners for an event
   */
  listenerCount<K extends keyof Events>(event: K): number {
    return this.listeners.get(event)?.size ?? 0;
  }
}
