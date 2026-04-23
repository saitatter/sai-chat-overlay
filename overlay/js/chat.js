import { GAP_PX, MAX_MESSAGES } from "./constants.js";
import { animateRemoveMessage } from "./animations.js";

function buildMessageNode(user, message, platform, badges) {
  const div = document.createElement("div");
  div.className = `msg ${platform.toLowerCase()}`;

  if (Array.isArray(badges)) {
    badges.forEach((url) => {
      const badge = document.createElement("img");
      badge.src = url;
      badge.alt = "badge";
      badge.className = "badge";
      div.appendChild(badge);
    });
  }

  const userSpan = document.createElement("span");
  userSpan.className = "user";
  userSpan.textContent = `${user}:`;
  div.appendChild(userSpan);
  div.appendChild(document.createTextNode(` ${message}`));
  return div;
}

export function createChatController(chat, getFadeTimeMs) {
  let isCompacting = false;

  function compactOverflow() {
    if (isCompacting) return;
    if (chat.children.length <= MAX_MESSAGES) return;

    isCompacting = true;
    const first = chat.firstElementChild;
    if (!first) {
      isCompacting = false;
      return;
    }

    animateRemoveMessage(chat, first, GAP_PX, () => {
      isCompacting = false;
      if (chat.children.length > MAX_MESSAGES) compactOverflow();
    });
  }

  function addMessage(user, message, platform, badges) {
    const div = buildMessageNode(user, message, platform, badges);
    div.style.transition = "transform 300ms ease";
    div.style.transform = "translate3d(100%, 0, 0)";
    div.style.opacity = "1";
    chat.appendChild(div);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        div.style.transform = "translate3d(0, 0, 0)";
      });
    });

    setTimeout(() => {
      if (div.parentNode) animateRemoveMessage(chat, div, GAP_PX);
    }, getFadeTimeMs());

    compactOverflow();
  }

  return {
    addMessage,
  };
}
