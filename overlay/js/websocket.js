import { DEFAULTS, WEBSOCKET_DEFAULTS } from "./constants.js";

function getBadges(packet) {
  if (!Array.isArray(packet?.data?.user?.badges)) return [];
  return packet.data.user.badges.map((badge) => badge.imageUrl).filter(Boolean);
}

function subscribeToChatEvents(ws) {
  ws.send(
    JSON.stringify({
      request: "Subscribe",
      id: "twitch-youtube-chat-subscribe",
      events: {
        YouTube: ["Message"],
        Twitch: ["ChatMessage"],
      },
    }),
  );
}

function parseAndDispatchMessage(packet, onChatMessage) {
  const source = packet?.event?.source;
  const userName = packet?.data?.user?.name;
  if (!source || typeof userName !== "string" || userName.length === 0) return;

  const badges = getBadges(packet);
  if (source === "Twitch") {
    const text = packet?.data?.message?.message;
    if (typeof text === "string" && text.length > 0) {
      onChatMessage(userName, text, "twitch", badges);
    }
    return;
  }

  if (source === "YouTube") {
    const text = packet?.data?.message;
    if (typeof text === "string" && text.length > 0) {
      onChatMessage(userName, text, "youtube", badges);
    }
  }
}

export function connectChatSocket(onChatMessage, options = {}) {
  const wsUrl = options.wsUrl || DEFAULTS.wsUrl;
  const reconnectInitialDelayMs =
    options.reconnectInitialDelayMs || WEBSOCKET_DEFAULTS.reconnectInitialDelayMs;
  const reconnectMaxDelayMs =
    options.reconnectMaxDelayMs || WEBSOCKET_DEFAULTS.reconnectMaxDelayMs;
  const reconnectBackoff = options.reconnectBackoff || WEBSOCKET_DEFAULTS.reconnectBackoff;

  let ws = null;
  let reconnectTimer = null;
  let reconnectAttempt = 0;
  let intentionallyClosed = false;

  function clearReconnectTimer() {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  }

  function scheduleReconnect() {
    if (intentionallyClosed) return;
    clearReconnectTimer();

    reconnectAttempt += 1;
    const delay = Math.min(
      reconnectMaxDelayMs,
      Math.round(reconnectInitialDelayMs * reconnectBackoff ** (reconnectAttempt - 1)),
    );

    console.warn(
      `Streamer.bot disconnected. Reconnecting in ${delay}ms (attempt ${reconnectAttempt})...`,
    );
    reconnectTimer = setTimeout(connect, delay);
  }

  function connect() {
    clearReconnectTimer();
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      reconnectAttempt = 0;
      console.log(`Connected to Streamer.bot WebSocket at ${wsUrl}`);
      subscribeToChatEvents(ws);
    };

    ws.onerror = (error) => {
      console.error("Streamer.bot WebSocket error:", error);
    };

    ws.onmessage = (event) => {
      let packet;
      try {
        packet = JSON.parse(event.data);
      } catch (error) {
        console.error("Invalid WebSocket payload:", error);
        return;
      }

      parseAndDispatchMessage(packet, onChatMessage);
    };

    ws.onclose = () => {
      if (intentionallyClosed) return;
      scheduleReconnect();
    };
  }

  function close() {
    intentionallyClosed = true;
    clearReconnectTimer();
    if (ws && ws.readyState === WebSocket.OPEN) ws.close(1000, "Client closed");
    if (ws && ws.readyState === WebSocket.CONNECTING) ws.close();
  }

  connect();

  return {
    close,
    getUrl: () => wsUrl,
  };
}
