"use client";

import React, { useRef, useEffect, useState } from "react";

/**
 * TabBar component with keyboard navigation support
 * @param {Object} props
 * @param {Array} props.tabs - Array of tab objects with {id, label, icon (React component)}
 * @param {string} props.activeTab - Currently active tab id
 * @param {Function} props.onTabChange - Callback when tab changes
 */
const TabBar = ({ tabs, activeTab, onTabChange }) => {
  const tabRefs = useRef({});
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const containerRef = useRef(null);

  useEffect(() => {
    // Focus the active tab when it changes
    if (tabRefs.current[activeTab]) {
      tabRefs.current[activeTab].focus();
    }
  }, [activeTab]);

  useEffect(() => {
    // Update sliding indicator position
    const activeTabElement = tabRefs.current[activeTab];
    if (activeTabElement && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const tabRect = activeTabElement.getBoundingClientRect();

      setIndicatorStyle({
        width: tabRect.width,
        transform: `translateX(${tabRect.left - containerRect.left}px)`,
      });
    }
  }, [activeTab, tabs]);

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
      className="bg-white dark:bg-zinc-900 sticky top-0 z-10"
      role="tablist"
      aria-label="Employee information tabs"
    >
      <div className="max-w-6xl mx-auto px-4 pt-3">
        <div className="relative" ref={containerRef}>
          <div className="flex gap-2">
            {tabs.map((tab, index) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;

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
                    relative flex-1 px-8 py-3.5 text-sm font-medium transition-all duration-300 ease-out
                    whitespace-nowrap flex items-center justify-center gap-3
                    focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-0
                    rounded-xl group overflow-hidden
                    ${
                      isActive
                        ? "text-white dark:text-white bg-linear-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 shadow-lg shadow-blue-500/30 dark:shadow-blue-500/20 scale-105"
                        : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 hover:bg-white/80 dark:hover:bg-zinc-800/80 hover:shadow-md"
                    }
                  `}
                >
                  {/* Background glow effect for active tab */}
                  {isActive && (
                    <div className="absolute inset-0 bg-linear-to-br from-blue-400/20 to-transparent animate-pulse" />
                  )}

                  {Icon && (
                    <Icon
                      className={`w-5 h-5 transition-all duration-300 relative z-10 ${
                        isActive
                          ? "scale-110 drop-shadow-sm"
                          : "group-hover:scale-110 group-hover:rotate-3"
                      }`}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                  )}
                  <span
                    className={`font-semibold transition-all duration-300 relative z-10 ${
                      isActive
                        ? "translate-y-0 drop-shadow-sm"
                        : "group-hover:-translate-y-0.5"
                    }`}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bottom spacing */}
          <div className="h-4"></div>
        </div>
      </div>
    </div>
  );
};

export default TabBar;
