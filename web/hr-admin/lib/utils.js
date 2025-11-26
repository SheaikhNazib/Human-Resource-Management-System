/**
 * Safely convert various error/result shapes into a readable string
 * Prevents "Objects are not valid as a React child" errors
 */
export function toMessage(v) {
  if (!v) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object") {
    if (v.message && typeof v.message === "string") return v.message;
    if (v.data && typeof v.data === "string") return v.data;
    if (v.error && typeof v.error === "string") return v.error;
    try {
      return JSON.stringify(v);
    } catch (e) {
      return String(v);
    }
  }
  return String(v);
}
