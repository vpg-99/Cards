import React from "react";
import { User } from "../types/user";

interface UserCardProps {
  user: User;
  isSelected: boolean;
  onSelect: (userId: number) => void;
  onClick: (userId: number) => void;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  isSelected,
  onSelect,
  onClick,
}) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "inactive":
        return "bg-gray-100 text-gray-600";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-green-100 text-green-700";
    }
  };

  const status = user.status || "active";

  return (
    <div
      className={`flex items-start p-4 bg-white border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors relative ${
        isSelected ? "border-l-4 border-l-blue-500 bg-blue-50" : ""
      }`}
      onClick={() => onClick(user.id)}
    >
      {/* Checkbox */}
      <div className="mr-3 mt-1" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(user.id)}
          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
        />
      </div>

      {/* User Avatar */}
      <div className="mr-3 shrink-0">
        <img
          src={user.image}
          alt={`${user.firstName} ${user.lastName}`}
          className="w-12 h-12 rounded-full object-cover"
        />
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-gray-900 truncate mb-1">
          {user.firstName} {user.lastName}
        </h3>
        <p className="text-xs text-gray-500 truncate mb-1">{user.email}</p>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-gray-600 font-medium">
            {user.company.title}
          </p>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${getStatusColor(
              status
            )}`}
          >
            {status}
          </span>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
