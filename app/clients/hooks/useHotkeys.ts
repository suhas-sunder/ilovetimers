import { useEffect, useRef, type RefObject } from "react";

type HotkeyHandler = (event: KeyboardEvent) => void;
type HotkeyMap = Record<string, HotkeyHandler | undefined>;

function isTypingTarget(target: EventTarget | null) {
  const element = target as HTMLElement | null;
  if (!element) return false;

  return (
    element.tagName === "INPUT" ||
    element.tagName === "TEXTAREA" ||
    element.tagName === "SELECT" ||
    element.isContentEditable
  );
}

export function useHotkeys(
  hotkeys: HotkeyMap,
  options: {
    enabled?: boolean;
    ignoreTyping?: boolean;
    targetRef?: RefObject<HTMLElement | null>;
  } = {},
) {
  const hotkeysRef = useRef(hotkeys);
  hotkeysRef.current = hotkeys;

  const {
    enabled = true,
    ignoreTyping = true,
    targetRef,
  } = options;

  useEffect(() => {
    if (!enabled) return;

    const target = targetRef?.current ?? window;
    const onKeyDown = (event: Event) => {
      const keyboardEvent = event as KeyboardEvent;
      if (ignoreTyping && isTypingTarget(keyboardEvent.target)) return;

      const key = keyboardEvent.key.toLowerCase();
      const handler = hotkeysRef.current[key];
      if (!handler) return;

      handler(keyboardEvent);
    };

    target.addEventListener("keydown", onKeyDown);
    return () => target.removeEventListener("keydown", onKeyDown);
  }, [enabled, ignoreTyping, targetRef]);
}
