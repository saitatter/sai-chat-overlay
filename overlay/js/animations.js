import { ANIM_MS } from "./constants.js";

export function shiftFollowingSiblingsLeft(chat, target, distance) {
  const all = Array.from(chat.children);
  const index = all.indexOf(target);
  if (index === -1) return () => {};

  const toMove = all.slice(index + 1);
  toMove.forEach((msg) => {
    msg.classList.add("shifting");
    msg.style.transition = "none";
    const currentTransform = getComputedStyle(msg).transform;
    msg.style.transform = currentTransform === "none" ? "translate3d(0,0,0)" : currentTransform;
    msg.style.opacity = "1";
  });

  void chat.offsetWidth;

  requestAnimationFrame(() => {
    toMove.forEach((msg) => {
      msg.style.transition = `transform ${ANIM_MS}ms ease`;
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
  if (msgElement.dataset.removing === "1") return;
  msgElement.dataset.removing = "1";

  const width = msgElement.offsetWidth + extraOffset;
  const cleanupSiblings = shiftFollowingSiblingsLeft(chat, msgElement, width);

  msgElement.style.transition = `transform ${ANIM_MS}ms ease, opacity ${ANIM_MS}ms ease`;
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
  }, ANIM_MS + 50);
}
