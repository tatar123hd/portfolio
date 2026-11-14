// localStorage wrappers that never throw: blocked or corrupt storage falls back.
const defaultStorage = () => {
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
};

export function loadState(key, fallback, storage = defaultStorage()) {
  try {
    const raw = storage ? storage.getItem(key) : null;
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function saveState(key, value, storage = defaultStorage()) {
  try {
    if (!storage) return false;
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
