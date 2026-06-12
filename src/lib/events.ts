type Listener = (data: string) => void;

class EventBus {
  private listeners = new Map<string, Set<Listener>>();

  subscribe(channel: string, listener: Listener) {
    if (!this.listeners.has(channel)) this.listeners.set(channel, new Set());
    this.listeners.get(channel)!.add(listener);
    return () => { this.listeners.get(channel)?.delete(listener); };
  }

  publish(channel: string, data: any) {
    const payload = JSON.stringify(data);
    this.listeners.get(channel)?.forEach(fn => fn(payload));
  }
}

export const eventBus = (globalThis as any).__eventBus || ((globalThis as any).__eventBus = new EventBus());
