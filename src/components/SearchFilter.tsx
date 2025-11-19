import React, { useState, useEffect, useRef } from "react";

export interface FilterOptions {
  searchQuery: string;
  searchType: "all" | "firstName" | "lastName";
  gender: string;
  ageRange: string;
}

interface SearchFilterProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  totalCount: number;
  loadedCount: number;
  serverLoadedCount?: number;
  isLoadingMore?: boolean;
  maxUsers?: number;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  filters,
  onFiltersChange,
  totalCount,
  loadedCount,
  serverLoadedCount = 0,
  isLoadingMore = false,
  maxUsers = 0,
}) => {
  const [localSearch, setLocalSearch] = useState(filters.searchQuery);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Debounced search effect
  useEffect(() => {
    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // If there's a difference, mark as debouncing
    if (localSearch !== filters.searchQuery) {
      setIsDebouncing(true);
    }

    // Set new timer - trigger search after 500ms of no typing
    debounceTimer.current = setTimeout(() => {
      if (localSearch !== filters.searchQuery) {
        onFiltersChange({ ...filters, searchQuery: localSearch });
      }
      setIsDebouncing(false);
    }, 500);

    // Cleanup on unmount or when localSearch changes
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [localSearch]); // Only re-run when localSearch changes

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Clear debounce timer and search immediately on Enter
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    setIsDebouncing(false);
    onFiltersChange({ ...filters, searchQuery: localSearch });
  };

  const handleClearSearch = () => {
    setLocalSearch("");
    // Clear debounce timer to trigger immediate update
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    setIsDebouncing(false);
    onFiltersChange({ ...filters, searchQuery: "" });
  };

  const handleClearAll = () => {
    setLocalSearch("");
    // Clear debounce timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    setIsDebouncing(false);
    onFiltersChange({
      searchQuery: "",
      searchType: "all",
      gender: "",
      ageRange: "",
    });
  };

  const activeFiltersCount = [
    filters.searchQuery,
    filters.gender,
    filters.ageRange !== "",
  ].filter(Boolean).length;

  return (
    <div className="bg-white p-4 shadow-sm border-b border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900">Users</h2>
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-500">
              Showing {loadedCount.toLocaleString()} users
            </p>
            {/* {isLoadingMore && serverLoadedCount < maxUsers && (
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                <span>
                  Loading... ({serverLoadedCount.toLocaleString()}/
                  {maxUsers.toLocaleString()})
                </span>
              </div>
            )} */}
          </div>
          {serverLoadedCount > 0 && (
            <div className="mt-1">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      (serverLoadedCount / maxUsers) * 100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {serverLoadedCount.toLocaleString()} loaded from server
              </p>
            </div>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <button
            onClick={handleClearAll}
            className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded transition-colors font-medium"
          >
            Clear All ({activeFiltersCount})
          </button>
        )}
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="mb-3">
        <div className="relative">
          {isDebouncing ? (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          )}
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {localSearch && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </form>

      {/* Filters Section - Collapsible */}
      {(filters.gender || filters.ageRange || totalCount > 0) && (
        <div className="space-y-3">
          {/* Gender Filter Pills */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">
              Gender
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => onFiltersChange({ ...filters, gender: "" })}
                className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filters.gender === ""
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => onFiltersChange({ ...filters, gender: "male" })}
                className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filters.gender === "male"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Male
              </button>
              <button
                onClick={() =>
                  onFiltersChange({ ...filters, gender: "female" })
                }
                className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filters.gender === "female"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Female
              </button>
            </div>
          </div>

          {/* Age Range Filter */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">
              Age Range
            </label>
            <select
              value={filters.ageRange}
              onChange={(e) =>
                onFiltersChange({ ...filters, ageRange: e.target.value })
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Ages</option>
              <option value="18-25">18-25 years</option>
              <option value="26-35">26-35 years</option>
              <option value="36-45">36-45 years</option>
              <option value="46-60">46-60 years</option>
              <option value="60+">60+ years</option>
            </select>
          </div>

          {/* Search Type */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">
              Search Type
            </label>
            <select
              value={filters.searchType}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  searchType: e.target.value as FilterOptions["searchType"],
                })
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Fields</option>
              <option value="firstName">First Name</option>
              <option value="lastName">Last Name</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
