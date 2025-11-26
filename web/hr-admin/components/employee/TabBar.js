"use client";

import React, { useRef, useEffect } from "react";

/**
 * TabBar component with keyboard navigation support
 * @param {Object} props
 * @param {Array} props.tabs - Array of tab objects with {id, label, icon}
 * @param {string} props.activeTab - Currently active tab id
 * @param {Function} props.onTabChange - Callback when tab changes
 */
const TabBar = ({ tabs, activeTab, onTabChange }) => {
  const tabRefs = useRef({});

  useEffect(() => {
    // Focus the active tab when it changes
    if (tabRefs.current[activeTab]) {
      tabRefs.current[activeTab].focus();
    }
  }, [activeTab]);

  const handleKeyDown = (e, currentIndex) => {
    let newIndex = currentIndex;

    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        newIndex = (currentIndex + 1) % tabs.length;
        break;
      case "ArrowLeft":
        e.preventDefault();
        newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        break;
      case "Home":
        e.preventDefault();
        newIndex = 0;
        break;
      case "End":
        e.preventDefault();
        newIndex = tabs.length - 1;
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        onTabChange(tabs[currentIndex].id);
        return;
      default:
        return;
    }

    const newTab = tabs[newIndex];
    onTabChange(newTab.id);
  };

  return (
    <div
      className="bg-white border-b border-gray-200 shadow-sm"
      role="tablist"
      aria-label="Employee information tabs"
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex">
          {tabs.map((tab, index) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                ref={(el) => (tabRefs.current[tab.id] = el)}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                id={`tab-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => onTabChange(tab.id)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={`
                  relative flex-1 px-6 py-4 text-sm font-semibold transition-all duration-200
                  whitespace-nowrap flex items-center justify-center space-x-2
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset
                  ${
                    isActive
                      ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }
                `}
              >
                {tab.icon && <span className="text-lg">{tab.icon}</span>}
                <span>{tab.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 animate-scaleIn" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TabBar;
