import {
  useCallback,
  useEffect,
  useState,
  type RefObject,
} from "react";

export function useFullscreen(targetRef: RefObject<HTMLElement | null>) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => {
      const target = targetRef.current;
      setIsFullscreen(!!target && document.fullscreenElement === target);
    };

    document.addEventListener("fullscreenchange", onChange);
    onChange();
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [targetRef]);

  const enter = useCallback(async () => {
    const target = targetRef.current;
    if (!target || document.fullscreenElement) return;
    if (typeof target.requestFullscreen !== "function") return;
    await target.requestFullscreen().catch(() => {});
  }, [targetRef]);

  const exit = useCallback(async () => {
    if (!document.fullscreenElement) return;
    if (typeof document.exitFullscreen !== "function") return;
    await document.exitFullscreen().catch(() => {});
  }, []);

  const toggle = useCallback(async () => {
    if (document.fullscreenElement) {
      if (typeof document.exitFullscreen !== "function") return;
      await document.exitFullscreen().catch(() => {});
      return;
    }

    const target = targetRef.current;
    if (target && typeof target.requestFullscreen === "function") {
      await target.requestFullscreen().catch(() => {});
    }
  }, [targetRef]);

  return { isFullscreen, enter, exit, toggle };
}
