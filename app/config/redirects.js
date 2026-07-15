/** @type {Readonly<Record<string, string>>} */
export const PERMANENT_REDIRECTS = Object.freeze({
  "/military-time-calculator": "/military-time-converter",
  "/army-time-converter": "/military-time-converter",
  "/military-time-translator": "/military-time-converter",
  "/ms-to-seconds": "/milliseconds-converter",
  "/milliseconds-to-seconds": "/milliseconds-converter",
  "/utc-time-now": "/utc-clock",
  "/current-unix-timestamp": "/epoch-unix-time-clock",
});

/**
 * @param {string} pathname
 */
export function getPermanentRedirect(pathname) {
  return PERMANENT_REDIRECTS[pathname];
}
