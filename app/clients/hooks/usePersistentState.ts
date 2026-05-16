import { useEffect, useState } from "react";

type PersistentStateOptions<T> = {
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
};

export function usePersistentState<T>(
  key: string,
  initialValue: T | (() => T),
  options: PersistentStateOptions<T> = {},
) {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
  } = options;

  const [value, setValue] = useState<T>(() => {
    const fallback =
      typeof initialValue === "function"
        ? (initialValue as () => T)()
        : initialValue;

    if (typeof window === "undefined") return fallback;

    try {
      const stored = window.localStorage.getItem(key);
      return stored == null ? fallback : deserialize(stored);
    } catch {
      return fallback;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, serialize(value));
    } catch {
      // localStorage can fail in private browsing or restricted contexts.
    }
  }, [key, serialize, value]);

  return [value, setValue] as const;
}
