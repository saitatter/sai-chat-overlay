import { ANIM_MS } from "./constants.js";
import { getCssNumberVar } from "./utils.js";

function getShiftDurationMs() {
  return getCssNumberVar("--msg-shift-ms", ANIM_MS);
}

export function shiftFollowingSiblingsLeft(chat, target, distance) {
  const animMs = getShiftDurationMs();
  const all = Array.from(chat.children);
  const index = all.indexOf(target);
  if (index === -1) return () => {};

  const toMove = all.slice(index + 1);
  const transforms = toMove.map((msg) => ({
    msg,
    transform: getComputedStyle(msg).transform,
  }));

  transforms.forEach(({ msg, transform }) => {
    msg.classList.add("shifting");
    msg.style.transition = "none";
    msg.style.transform = transform === "none" ? "translate3d(0,0,0)" : transform;
    msg.style.opacity = "1";
  });

  void chat.offsetWidth;

  requestAnimationFrame(() => {
    toMove.forEach((msg) => {
      msg.style.transition = `transform ${animMs}ms ease`;
    });
    requestAnimationFrame(() => {
      toMove.forEach((msg) => {
        msg.style.transform = `translate3d(-${distance}px, 0, 0)`;
      });
    });
  });

  return () => {
    const shiftingNow = Array.from(chat.querySelectorAll(".shifting"));
    shiftingNow.forEach((msg) => {
      msg.style.transition = "none";
      msg.style.transform = "translate3d(0,0,0)";
      msg.style.opacity = "1";
      msg.classList.remove("shifting");
    });

    void chat.offsetWidth;
    shiftingNow.forEach((msg) => {
      msg.style.transition = "";
    });
  };
}

export function animateRemoveMessage(chat, msgElement, extraOffset, callback) {
  const animMs = getShiftDurationMs();
  if (msgElement.dataset.removing === "1") return;
  msgElement.dataset.removing = "1";

  const width = msgElement.offsetWidth + extraOffset;
  const cleanupSiblings = shiftFollowingSiblingsLeft(chat, msgElement, width);

  msgElement.style.transition = `transform ${animMs}ms ease, opacity ${animMs}ms ease`;
  void msgElement.offsetWidth;
  msgElement.style.transform = `translate3d(-${width}px, 0, 0)`;
  msgElement.style.opacity = "0";

  const done = () => {
    if (msgElement.parentNode) msgElement.parentNode.removeChild(msgElement);
    msgElement.dataset.removing = "";
    cleanupSiblings();
    if (typeof callback === "function") callback();
  };

  let finished = false;
  const onEnd = (e) => {
    if (finished) return;
    if (e.target !== msgElement || e.propertyName !== "transform") return;
    finished = true;
    msgElement.removeEventListener("transitionend", onEnd);
    done();
  };

  msgElement.addEventListener("transitionend", onEnd);
  setTimeout(() => {
    if (finished) return;
    msgElement.removeEventListener("transitionend", onEnd);
    done();
  }, animMs + 50);
}
