import { describe, expect, it } from "vitest";
import { parseChatEvent } from "../overlay/js/parsers.js";

describe("parseChatEvent", () => {
  it("parses a twitch message", () => {
    const packet = {
      event: { source: "Twitch" },
      data: {
        user: { name: "Alice", badges: [{ imageUrl: "https://example.com/badge.png" }] },
        message: { message: "Hello chat" },
      },
    };

    expect(parseChatEvent(packet)).toEqual({
      user: "Alice",
      message: "Hello chat",
      platform: "twitch",
      badges: ["https://example.com/badge.png"],
    });
  });

  it("drops invalid payloads safely", () => {
    const packet = {
      event: { source: "YouTube" },
      data: { user: { name: "" }, message: null },
    };
    expect(parseChatEvent(packet)).toBeNull();
  });
});
