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
}

const CardList: React.FC<CardListProps> = ({
  users,
  selectedUsers,
  onSelectUser,
  onUserClick,
  onLoadMore,
  hasMore,
  isLoadingMore,
}) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: users.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // Height of each card
    overscan: 5, // Render 5 extra items above/below for smoother scrolling
  });

  // Infinite scroll detection
  useEffect(() => {
    const scrollElement = parentRef.current;
    if (!scrollElement || !onLoadMore || !hasMore || isLoadingMore) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      // Load more when within 200px of bottom
      if (scrollTop + clientHeight >= scrollHeight - 200) {
        onLoadMore();
      }
    };

    scrollElement.addEventListener("scroll", handleScroll);
    return () => scrollElement.removeEventListener("scroll", handleScroll);
  }, [onLoadMore, hasMore, isLoadingMore]);

  return (
    <div className="flex-1 bg-white border-r border-gray-200 overflow-hidden flex flex-col">
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

          {/* Loading More Indicator */}
          {isLoadingMore && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600">Loading more...</span>
              </div>
            </div>
          )}

          {/* No More Items */}
          {!hasMore && users.length > 0 && (
            <div className="absolute bottom-0 left-0 right-0 p-3 text-center text-xs text-gray-500">
              All users loaded
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardList;
