/**
 * @typedef {"pending" | "filled" | "empty"} AdSensePageStatus
 */

/**
 * Resolve all known AdSense unit outcomes into one page-level fallback state.
 * Pending always wins over empty so a fallback cannot appear while another
 * unit might still receive a creative.
 *
 * @param {Array<string | null | undefined>} statuses
 * @returns {AdSensePageStatus}
 */
export function resolveAdSensePageStatus(statuses) {
  if (statuses.some((status) => status === "filled")) {
    return "filled";
  }

  if (
    statuses.length > 0 &&
    statuses.every(
      (status) => status === "unfilled" || status === "unfill-optimized",
    )
  ) {
    return "empty";
  }

  return "pending";
}
