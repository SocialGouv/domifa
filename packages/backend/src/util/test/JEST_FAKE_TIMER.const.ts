export const JEST_FAKE_TIMER: FakeTimersConfig = {
  doNotFake: [
    "nextTick",
    "setImmediate",
    "clearImmediate",
    "setInterval",
    "clearInterval",
    "setTimeout",
    "clearTimeout",
  ],
};
