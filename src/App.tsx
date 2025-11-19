import { useState, useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { User } from "./types/user";
import CardList from "./components/CardList";
import RenderPane from "./components/RenderPane";
import SelectionBubble from "./components/SelectionBubble";
import SearchFilter, { FilterOptions } from "./components/SearchFilter";
import { fetchUsersWithParams } from "./utils/userService";

function App() {
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: "",
    searchType: "all",
    gender: "",
    ageRange: "",
  });

  // Infinite query for users
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
        limit: 30,
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
      return loadedCount < lastPage.total ? loadedCount : undefined;
    },
  });

  // Flatten all pages and apply client-side age filtering
  const users = useMemo(() => {
    const allUsers = data?.pages.flatMap((page) => page.users) ?? [];

    // Apply age range filter client-side
    if (!filters.ageRange) return allUsers;

    return allUsers.filter((user) => {
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
          return true;
      }
    });
  }, [data, filters.ageRange]);

  const totalCount = data?.pages[0]?.total ?? 0;

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
  };

  if (isLoading) {
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
        />

        {/* Card List */}
        <CardList
          users={users}
          selectedUsers={selectedUsers}
          onSelectUser={handleSelectUser}
          onUserClick={handleUserClick}
          onLoadMore={fetchNextPage}
          hasMore={hasNextPage}
          isLoadingMore={isFetchingNextPage}
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
