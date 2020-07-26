// Event Emitter
// adapted from https://github.com/ai/nanoevents

export const createNanoEvents = () => ({
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
