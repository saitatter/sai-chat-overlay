export function getDom() {
  return {
    chat: document.getElementById("chat"),
    settingsPanel: document.getElementById("settingsPanel"),
    settingsToggle: document.getElementById("settingsToggle"),
    twitchColorInput: document.getElementById("twitchColor"),
    youtubeColorInput: document.getElementById("youtubeColor"),
    fadeTimeInput: document.getElementById("fadeTime"),
    msgBgColorInput: document.getElementById("msgBgColor"),
    msgBgOpacityInput: document.getElementById("msgBgOpacity"),
    fontSelect: document.getElementById("fontFamilySelect"),
    copyUrlBtn: document.getElementById("copyUrlBtn"),
  };
}
