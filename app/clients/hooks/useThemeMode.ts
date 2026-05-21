import { useCallback, useEffect, useState } from "react";

export type ThemeMode = "light" | "dark";

export const THEME_STORAGE_KEY = "ilt-theme-mode";
const THEME_CHANGE_EVENT = "ilt-theme-mode-change";

export function normalizeThemeMode(value: unknown): ThemeMode {
  return value === "dark" ? "dark" : "light";
}

export function applyThemeMode(mode: ThemeMode): ThemeMode {
  if (typeof document !== "undefined") {
    document.documentElement.dataset.theme = mode;
    document.documentElement.dataset.themeMode = mode;
    document.documentElement.style.colorScheme = mode;
  }

  return mode;
}

function readStoredThemeMode(): ThemeMode {
  if (typeof window === "undefined") return "light";

  try {
    return normalizeThemeMode(window.localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return "light";
  }
}

function writeStoredThemeMode(mode: ThemeMode) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // Theme persistence should not block the UI if storage is unavailable.
  }
}

export function useThemeMode() {
  const [mode, setModeState] = useState<ThemeMode>("light");

  useEffect(() => {
    const storedMode = readStoredThemeMode();
    setModeState(storedMode);
    applyThemeMode(storedMode);
  }, []);

  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key !== THEME_STORAGE_KEY) return;

      const nextMode = normalizeThemeMode(event.newValue);
      setModeState(nextMode);
      applyThemeMode(nextMode);
    }

    function onThemeChange(event: Event) {
      const nextMode = normalizeThemeMode(
        event instanceof CustomEvent ? event.detail : null,
      );
      setModeState(nextMode);
      applyThemeMode(nextMode);
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener(THEME_CHANGE_EVENT, onThemeChange);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(THEME_CHANGE_EVENT, onThemeChange);
    };
  }, []);

  const setTheme = useCallback((nextMode: ThemeMode) => {
    const normalizedMode = normalizeThemeMode(nextMode);
    writeStoredThemeMode(normalizedMode);
    setModeState(normalizedMode);
    applyThemeMode(normalizedMode);
    window.dispatchEvent(
      new CustomEvent(THEME_CHANGE_EVENT, { detail: normalizedMode }),
    );
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(mode === "dark" ? "light" : "dark");
  }, [mode, setTheme]);

  return { mode, setTheme, toggleTheme };
}
