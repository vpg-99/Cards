import React, { useRef, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { User } from "../types/user";
import UserCard from "./UserCard";

interface CardListProps {
  users: User[];
  selectedUsers: Set<number>;
  onSelectUser: (userId: number) => void;
  onUserClick: (userId: number) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  hasClientSideFilters?: boolean;
  serverLoadedCount?: number;
}

const CardList: React.FC<CardListProps> = ({
  users,
  selectedUsers,
  onSelectUser,
  onUserClick,
  onLoadMore,
  hasMore,
  isLoadingMore,
  hasClientSideFilters: _hasClientSideFilters = false,
  serverLoadedCount: _serverLoadedCount = 0,
}) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: users.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 10,
  });

  useEffect(() => {
    const scrollElement = parentRef.current;
    if (!scrollElement || !onLoadMore || !hasMore || isLoadingMore) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      // Load more when within 800px of bottom (more aggressive for large datasets)
      if (scrollTop + clientHeight >= scrollHeight - 800) {
        onLoadMore();
      }
    };

    scrollElement.addEventListener("scroll", handleScroll);

    handleScroll();

    return () => scrollElement.removeEventListener("scroll", handleScroll);
  }, [onLoadMore, hasMore, isLoadingMore]);

  return (
    <div className="flex-1 bg-white border-r border-gray-200 overflow-hidden flex flex-col relative">
      {isLoadingMore && users.length === 0 && (
        <div className="flex-1 flex items-center justify-center bg-blue-50">
          <div className="text-center px-4 py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <span className="text-lg font-medium text-blue-700">
              Loading users...
            </span>
            <p className="text-sm text-gray-500 mt-2">
              Searching for matches...
            </p>
          </div>
        </div>
      )}

      {/* No Results Message - Only When NOT Loading */}
      {!isLoadingMore && users.length === 0 && (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center px-4 py-8">
            <svg
              className="mx-auto h-16 w-16 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No users found
            </h3>
            <p className="text-sm text-gray-500">
              Try adjusting your filters or search query
            </p>
          </div>
        </div>
      )}

      {/* Virtualized List */}
      <div ref={parentRef} className="flex-1 overflow-auto">
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const user = users[virtualItem.index];
            return (
              <div
                key={user.id}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <UserCard
                  user={user}
                  isSelected={selectedUsers.has(user.id)}
                  onSelect={onSelectUser}
                  onClick={onUserClick}
                />
              </div>
            );
          })}

          {/* Loading More Indicator (for infinite scroll) */}
          {isLoadingMore && users.length > 0 && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600">Loading more...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardList;
