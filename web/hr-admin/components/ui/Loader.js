import React from "react";

/**
 * Centered Loader
 * - Centers itself within the available space using flexbox
 * - Accepts `size` (px) and `className` for small adjustments
 */
export default function Loader({
  size = 48,
  className = "",
  label = "Loading...",
}) {
  const style = { width: size, height: size };

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      role="status"
      aria-live="polite"
    >
      <div
        style={style}
        className="rounded-full border-4 border-t-blue-600 border-gray-200 animate-spin dark:border-zinc-700 dark:border-t-blue-400"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
