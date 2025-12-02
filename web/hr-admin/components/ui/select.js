import React, { useState } from "react";

export function Select({ children, defaultValue, value, onChange, disabled, ...props }) {
  const [internalValue, setInternalValue] = useState(defaultValue || "");
  
  // Use controlled value if provided, otherwise use internal state
  const currentValue = value !== undefined ? value : internalValue;

  const handleChange = (e) => {
    if (disabled) return;
    
    const newValue = e.target.value;
    
    if (value === undefined) {
      setInternalValue(newValue);
    }
    
    if (onChange) onChange(newValue);
  };

  return (
    <select
      value={currentValue}
      onChange={handleChange}
      disabled={disabled}
      className={`border rounded-md px-3 py-2 w-full bg-white focus:outline-none focus:ring focus:ring-blue-300 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function SelectItem({ value, children }) {
  return <option value={value}>{children}</option>;
}
