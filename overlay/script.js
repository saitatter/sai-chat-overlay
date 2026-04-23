import { createChatController } from "./js/chat.js";
import { getRuntimeConfig } from "./js/config.js";
import { getDom } from "./js/dom.js";
import { setupSettings } from "./js/settings.js";
import { connectChatSocket } from "./js/websocket.js";

const dom = getDom();
const runtimeConfig = getRuntimeConfig();
const settings = setupSettings(dom, { wsUrl: runtimeConfig.wsUrl });
const chatController = createChatController(dom.chat, settings.getFadeTimeMs);

connectChatSocket(chatController.addMessage, runtimeConfig.websocket);
