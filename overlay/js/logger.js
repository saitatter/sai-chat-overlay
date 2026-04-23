function asBooleanFlag(value) {
  if (typeof value !== "string") return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
}

export function readDebugFlagFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return asBooleanFlag(params.get("debug"));
}

export function createLogger(namespace, debugEnabled = false) {
  const prefix = `[${namespace}]`;
  return {
    debug: (...args) => {
      if (!debugEnabled) return;
      console.debug(prefix, ...args);
    },
    info: (...args) => console.info(prefix, ...args),
    warn: (...args) => console.warn(prefix, ...args),
    error: (...args) => console.error(prefix, ...args),
  };
}
