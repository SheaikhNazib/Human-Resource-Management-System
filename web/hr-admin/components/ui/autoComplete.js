"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, X, Search } from "lucide-react";

const AutoComplete = (props = {}) => {
  const {
    options = [],
    value = "",
    onChange = () => {},
    placeholder = "Search...",
    label = "",
    displayKey = "",
    error = "",
    disabled = false,
    className = "",
  } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Auto-detect keys for objects
  const getKeys = () => {
    if (!options.length) return { display: "label", value: "value" };

    const firstOption = options[0];
    if (typeof firstOption !== "object") return { display: null, value: null };

    const keys = Object.keys(firstOption);

    // Detect a good display key (name-like string)
    const detectedDisplayKey =
      displayKey && keys.includes(displayKey)
        ? displayKey
        : keys.find((k) =>
            ["name", "label", "title"].includes(k.toLowerCase())
          ) ||
          keys.find((k) => typeof firstOption[k] === "string") ||
          keys[0];

    // Detect a sensible value key (id/number-like) distinct from display
    const detectedValueKey =
      keys.find((k) => ["id", "value", "code"].includes(k.toLowerCase())) ||
      keys.find((k) => typeof firstOption[k] === "number") ||
      // fallback to a different key than display if possible
      keys.find((k) => k !== detectedDisplayKey) ||
      detectedDisplayKey;

    return { display: detectedDisplayKey, value: detectedValueKey };
  };

  const { display: displayKeyAuto, value: valueKeyAuto } = getKeys();

  // Normalize options
  const normalizedOptions = options.map((option) => {
    if (typeof option === "string" || typeof option === "number") {
      return { _display: option, _value: option, _original: option };
    }
    return {
      _display: option[displayKeyAuto],
      _value: option[valueKeyAuto],
      _original: option,
    };
  });

  // Filter options
  const filteredOptions = searchTerm
    ? normalizedOptions.filter((option) =>
        option._display
          ?.toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    : normalizedOptions;

  // Get display text
  const getDisplayText = () => {
    if (!value && value !== 0) return "";
    const selected = normalizedOptions.find((opt) => opt._value === value);
    return selected ? selected._display : value;
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const highlightedElement = dropdownRef.current.children[highlightedIndex];
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [highlightedIndex]);

  const handleKeyDown = (e) => {
    if (disabled) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setIsOpen(true);
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (isOpen && highlightedIndex >= 0) {
          handleSelect(filteredOptions[highlightedIndex]);
        } else {
          setIsOpen(!isOpen);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSearchTerm("");
        break;
      case "Tab":
        setIsOpen(false);
        setSearchTerm("");
        break;
    }
  };

  const handleSelect = (option) => {
    onChange(option._value);
    setIsOpen(false);
    setSearchTerm("");
    setHighlightedIndex(-1);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
    setSearchTerm("");
    inputRef.current?.focus();
  };

  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      inputRef.current?.focus();
    }
  };

  return (
    <div className={`w-full ${className}`} ref={wrapperRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      <div className="relative">
        <div
          className={`
            relative flex items-center w-full border rounded-lg bg-white
            transition-all duration-200
            ${
              disabled
                ? "bg-gray-100 cursor-not-allowed opacity-60"
                : "cursor-pointer"
            }
            ${error ? "border-red-500" : "border-gray-300"}
            ${isOpen && !error ? "ring-2 ring-blue-500 border-blue-500" : ""}
            ${!disabled && !error ? "hover:border-gray-400" : ""}
          `}
          onClick={handleInputClick}
        >
          <Search className="absolute left-3 w-4 h-4 text-gray-400" />

          <input
            ref={inputRef}
            type="text"
            value={isOpen ? searchTerm : getDisplayText()}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
              setHighlightedIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1 pl-10 pr-3 py-2 outline-none bg-transparent text-sm"
          />

          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 rounded-full mr-1"
              tabIndex={-1}
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}

          <ChevronDown
            className={`w-4 h-4 text-gray-400 mx-2 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>

        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            <div ref={dropdownRef}>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => (
                  <div
                    key={`${option._value}-${index}`}
                    onClick={() => handleSelect(option)}
                    className={`
                      px-4 py-2 cursor-pointer text-sm
                      ${
                        option._value === value
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-700"
                      }
                      ${
                        highlightedIndex === index
                          ? "bg-gray-100"
                          : "hover:bg-gray-50"
                      }
                    `}
                  >
                    {option._display}
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  No options found
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default AutoComplete;
