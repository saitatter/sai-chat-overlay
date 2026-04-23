import { DEFAULTS, WEBSOCKET_DEFAULTS } from "./constants.js";

function isValidWebSocketUrl(value) {
  if (typeof value !== "string" || value.trim() === "") return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "ws:" || parsed.protocol === "wss:";
  } catch {
    return false;
  }
}

function pickWsUrlCandidate(candidates) {
  for (const candidate of candidates) {
    if (isValidWebSocketUrl(candidate)) return candidate;
  }
  return DEFAULTS.wsUrl;
}

export function getRuntimeConfig() {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get("wsUrl") || params.get("streamerbotWsUrl");
  const fromWindow =
    window.__SAI_CHAT_OVERLAY_CONFIG__?.wsUrl || window.__SAI_OVERLAY_CONFIG__?.wsUrl;

  const wsUrl = pickWsUrlCandidate([fromQuery, fromWindow, DEFAULTS.wsUrl]);

  return {
    wsUrl,
    websocket: {
      wsUrl,
      reconnectInitialDelayMs: WEBSOCKET_DEFAULTS.reconnectInitialDelayMs,
      reconnectMaxDelayMs: WEBSOCKET_DEFAULTS.reconnectMaxDelayMs,
      reconnectBackoff: WEBSOCKET_DEFAULTS.reconnectBackoff,
    },
  };
}
