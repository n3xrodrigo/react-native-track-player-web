// Event Emitter
// adapted from https://github.com/ai/nanoevents

interface EventsMap {
  [event: string]: any;
}

interface DefaultEvents extends EventsMap {
  [event: string]: (...args: any) => void;
}

export interface Unsubscribe {
  remove(): void;
}

export declare class Emitter<Events extends EventsMap = DefaultEvents> {
  /**
   * Event names in keys and arrays with listeners in values.
   *
   * ```js
   * emitter1.events = emitter2.events
   * emitter2.events = { }
   * ```
   */
  events: Partial<{ [E in keyof Events]: Events[E][] }>;
  addEventListener<K extends keyof Events>(this: this, event: K, cb: Events[K]): Unsubscribe;
  emit<K extends keyof Events>(this: this, event: K, ...args: Parameters<Events[K]>): void;
}

export const createNanoEvents = <Events extends EventsMap = DefaultEvents>(): Emitter<Events> => ({
  events: {},
  emit(event, ...args) {
    for (let i of this.events[event] || []) {
      i(...args);
    }
  },
  addEventListener(event, cb) {
    (this.events[event] = this.events[event] || []).push(cb);

    return {
      remove: () => (this.events[event] = this.events[event].filter((i) => i !== cb)),
    };
  },
});
