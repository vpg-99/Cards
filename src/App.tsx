import { useState, useMemo, useRef, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { User } from "./types/user";
import CardList from "./components/CardList";
import RenderPane from "./components/RenderPane";
import SelectionBubble from "./components/SelectionBubble";
import SearchFilter, { FilterOptions } from "./components/SearchFilter";
import { fetchUsersWithParams } from "./utils/userService";

// Configuration for large dataset loading
const BATCH_SIZE = 100; // Fetch 100 users per request
const MAX_USERS = 150000; // Maximum users to load (5000 batches × 30 or 1500 batches × 100)
const AUTO_FETCH_ENABLED = true; // Enable aggressive auto-fetching

function App() {
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: "",
    searchType: "all",
    gender: "",
    ageRange: "",
  });

  // Track if this is the very first load
  const hasLoadedOnce = useRef(false);
  const autoFetchTimer = useRef<NodeJS.Timeout | null>(null);

  // Infinite query for users with aggressive fetching
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: [
      "users",
      filters.searchQuery,
      filters.searchType,
      filters.gender,
    ],
    queryFn: ({ pageParam = 0 }) =>
      fetchUsersWithParams({
        limit: BATCH_SIZE,
        skip: pageParam,
        search: filters.searchQuery,
        searchType: filters.searchType,
        filterKey: filters.gender ? "gender" : undefined,
        filterValue: filters.gender,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.reduce(
        (sum, page) => sum + page.users.length,
        0
      );

      // Continue fetching if:
      // 1. We haven't reached the maximum user limit
      // 2. The API has more data (loadedCount < lastPage.total)
      // 3. The last page had users (lastPage.users.length > 0)
      if (loadedCount >= MAX_USERS) {
        return undefined; // Stop at max limit
      }

      if (lastPage.users.length === 0) {
        return undefined; // No more data from API
      }

      // For large datasets, cycle through the data by using modulo
      // This allows us to fetch more than the API's actual total
      if (loadedCount < lastPage.total) {
        return loadedCount;
      }

      // If API has limited data, cycle through it to reach our target
      return loadedCount < MAX_USERS ? loadedCount % lastPage.total : undefined;
    },
    placeholderData: (previousData) => previousData, // Keep previous data while loading new data
    maxPages: Math.ceil(MAX_USERS / BATCH_SIZE), // Limit total pages
  });

  // Mark that we've loaded data at least once
  if (data && !hasLoadedOnce.current) {
    hasLoadedOnce.current = true;
  }

  // Aggressive auto-fetching to load large dataset in background
  useEffect(() => {
    if (!AUTO_FETCH_ENABLED) return;

    // Clear any existing timer
    if (autoFetchTimer.current) {
      clearTimeout(autoFetchTimer.current);
    }

    // Auto-fetch more data if available and not currently fetching
    if (hasNextPage && !isFetchingNextPage && hasLoadedOnce.current) {
      autoFetchTimer.current = setTimeout(() => {
        fetchNextPage();
      }, 100); // Fetch every 100ms when not actively fetching
    }

    return () => {
      if (autoFetchTimer.current) {
        clearTimeout(autoFetchTimer.current);
      }
    };
  }, [hasNextPage, isFetchingNextPage, hasLoadedOnce.current, fetchNextPage]);

  // Flatten all pages and apply ALL client-side filters
  const users = useMemo(() => {
    const allUsers = data?.pages.flatMap((page) => page.users) ?? [];

    return allUsers.filter((user) => {
      // Apply gender filter client-side (when search is active, gender wasn't applied server-side)
      if (filters.gender && filters.searchQuery) {
        if (user.gender.toLowerCase() !== filters.gender.toLowerCase()) {
          return false;
        }
      }

      // Apply age range filter client-side
      if (filters.ageRange) {
        const age = user.age;
        switch (filters.ageRange) {
          case "18-25":
            return age >= 18 && age <= 25;
          case "26-35":
            return age >= 26 && age <= 35;
          case "36-45":
            return age >= 36 && age <= 45;
          case "46-60":
            return age >= 46 && age <= 60;
          case "60+":
            return age >= 60;
          default:
            break;
        }
      }

      return true;
    });
  }, [data, filters.ageRange, filters.gender, filters.searchQuery]);

  const totalCount = data?.pages[0]?.total ?? 0;
  const serverLoadedCount =
    data?.pages.flatMap((page) => page.users).length ?? 0;

  // Check if we have client-side filters active
  const hasClientSideFilters = Boolean(
    (filters.gender && filters.searchQuery) || // Gender when search is active
      filters.ageRange // Age range is always client-side
  );

  const handleSelectUser = (userId: number) => {
    setSelectedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleUserClick = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setSelectedUsers(new Set()); // Clear selections on filter change
    // Note: We don't clear currentUser to keep RenderPane showing the same user
  };

  // Only show full-page loading on the very first load (before any data has been fetched)
  const isInitialLoading = isLoading && !hasLoadedOnce.current;

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          <p className="mt-4 text-lg text-gray-700">Loading users...</p>
          <p className="text-sm text-gray-500">Fetching user data...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600">
            {error instanceof Error ? error.message : "Failed to load users"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Panel - 20% width */}
      <div className="w-1/5 min-w-[300px] flex flex-col">
        {/* Search and Filter */}
        <SearchFilter
          filters={filters}
          onFiltersChange={handleFiltersChange}
          totalCount={totalCount}
          loadedCount={users.length}
          serverLoadedCount={serverLoadedCount}
          isLoadingMore={isFetchingNextPage}
          maxUsers={MAX_USERS}
        />

        {/* Card List */}
        <CardList
          users={users}
          selectedUsers={selectedUsers}
          onSelectUser={handleSelectUser}
          onUserClick={handleUserClick}
          onLoadMore={fetchNextPage}
          hasMore={hasNextPage}
          isLoadingMore={
            isFetchingNextPage || (isLoading && hasLoadedOnce.current)
          }
          hasClientSideFilters={hasClientSideFilters}
          serverLoadedCount={serverLoadedCount}
        />
      </div>

      {/* Right Panel - 80% width */}
      <div className="w-4/5 flex-1">
        <RenderPane selectedUser={currentUser} />
      </div>

      {/* Selection Bubble */}
      <SelectionBubble count={selectedUsers.size} />
    </div>
  );
}

export default App;
