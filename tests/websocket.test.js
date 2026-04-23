import { describe, expect, it } from "vitest";
import { computeBackoffDelay } from "../overlay/js/websocket.js";

describe("computeBackoffDelay", () => {
  it("computes exponential delay with jitter", () => {
    const delay = computeBackoffDelay({
      reconnectInitialDelayMs: 1000,
      reconnectBackoff: 2,
      reconnectMaxDelayMs: 20000,
      reconnectJitterRatio: 0.2,
      reconnectAttempt: 3,
      randomFn: () => 0.5,
    });

    expect(delay).toBe(4400);
  });

  it("caps delay at max", () => {
    const delay = computeBackoffDelay({
      reconnectInitialDelayMs: 5000,
      reconnectBackoff: 3,
      reconnectMaxDelayMs: 12000,
      reconnectJitterRatio: 0.2,
      reconnectAttempt: 4,
      randomFn: () => 1,
    });

    expect(delay).toBe(12000);
  });
});
