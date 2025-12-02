import React from "react";

export function Input({ className, disabled, ...props }) {
  return (
    <input
      className={`border rounded-md px-3 py-2 w-full focus:outline-none focus:ring focus:ring-blue-300 ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''} ${className || ''}`}
      disabled={disabled}
      {...props}
    />
  );
}
