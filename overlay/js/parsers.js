import { MESSAGE_LIMITS } from "./constants.js";

/**
 * @typedef {Object} ParsedChatEvent
 * @property {string} user
 * @property {string} message
 * @property {"twitch"|"youtube"} platform
 * @property {string[]} badges
 */

function clampText(value, maxChars) {
  if (typeof value !== "string") return "";
  const normalized = value.replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  if (normalized.length <= maxChars) return normalized;
  return `${normalized.slice(0, maxChars - 1)}…`;
}

function safeBadgeUrl(value) {
  if (typeof value !== "string" || value.length === 0) return "";
  try {
    const parsed = new URL(value);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") return value;
  } catch {
    return "";
  }
  return "";
}

function getBadges(packet) {
  if (!Array.isArray(packet?.data?.user?.badges)) return [];
  return packet.data.user.badges
    .map((badge) => safeBadgeUrl(badge?.imageUrl))
    .filter(Boolean)
    .slice(0, MESSAGE_LIMITS.maxBadges);
}

/**
 * @param {any} packet
 * @returns {ParsedChatEvent|null}
 */
function parseTwitchEvent(packet) {
  const user = clampText(packet?.data?.user?.name, MESSAGE_LIMITS.maxUserNameChars);
  const message = clampText(packet?.data?.message?.message, MESSAGE_LIMITS.maxMessageChars);
  if (!user || !message) return null;

  return {
    user,
    message,
    platform: "twitch",
    badges: getBadges(packet),
  };
}

/**
 * @param {any} packet
 * @returns {ParsedChatEvent|null}
 */
function parseYouTubeEvent(packet) {
  const user = clampText(packet?.data?.user?.name, MESSAGE_LIMITS.maxUserNameChars);
  const message = clampText(packet?.data?.message, MESSAGE_LIMITS.maxMessageChars);
  if (!user || !message) return null;

  return {
    user,
    message,
    platform: "youtube",
    badges: getBadges(packet),
  };
}

/**
 * @param {any} packet
 * @returns {ParsedChatEvent|null}
 */
export function parseChatEvent(packet) {
  const source = packet?.event?.source;
  if (source === "Twitch") return parseTwitchEvent(packet);
  if (source === "YouTube") return parseYouTubeEvent(packet);
  return null;
}
