import React from "react";

export function Switch({ checked, onChange, disabled, ...props }) {
  return (
    <label className={`inline-flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <input
        type="checkbox"
        className="hidden"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        {...props}
      />
      <span
        className={`w-10 h-5 flex items-center rounded-full p-1 duration-300 ${
          checked ? "bg-blue-600" : "bg-gray-400"
        } ${disabled ? 'cursor-not-allowed' : ''}`}
      >
        <span
          className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${
            checked ? "translate-x-5" : ""
          }`}
        ></span>
      </span>
    </label>
  );
}
