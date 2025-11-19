import { UsersResponse, User } from "../types/user";

const API_URL = "https://dummyjson.com/users";

export interface FetchUsersParams {
  limit?: number;
  skip?: number;
  search?: string;
  searchType?: "all" | "firstName" | "lastName";
  filterKey?: string;
  filterValue?: string;
}

/**
 * Assign random status to users for demo purposes
 */
const assignStatusToUsers = (users: User[]): User[] => {
  const statuses: Array<"active" | "inactive" | "pending"> = [
    "active",
    "inactive",
    "pending",
  ];
  return users.map((user) => ({
    ...user,
    status: statuses[user.id % 3] as "active" | "inactive" | "pending",
  }));
};

/**
 * Fetch users with pagination
 */
export const fetchUsers = async (
  limit: number = 30,
  skip: number = 0
): Promise<UsersResponse> => {
  try {
    const response = await fetch(`${API_URL}?limit=${limit}&skip=${skip}`);
    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }
    const data = await response.json();
    return {
      ...data,
      users: assignStatusToUsers(data.users),
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

/**
 * Search users by query
 */
export const searchUsers = async (
  query: string,
  limit: number = 30,
  skip: number = 0
): Promise<UsersResponse> => {
  try {
    const response = await fetch(
      `${API_URL}/search?q=${encodeURIComponent(
        query
      )}&limit=${limit}&skip=${skip}`
    );
    if (!response.ok) {
      throw new Error("Failed to search users");
    }
    const data = await response.json();
    return {
      ...data,
      users: assignStatusToUsers(data.users),
    };
  } catch (error) {
    console.error("Error searching users:", error);
    throw error;
  }
};

/**
 * Filter users by key-value pair
 */
export const filterUsers = async (
  key: string,
  value: string,
  limit: number = 30,
  skip: number = 0
): Promise<UsersResponse> => {
  try {
    const response = await fetch(
      `${API_URL}/filter?key=${encodeURIComponent(
        key
      )}&value=${encodeURIComponent(value)}&limit=${limit}&skip=${skip}`
    );
    if (!response.ok) {
      throw new Error("Failed to filter users");
    }
    const data = await response.json();
    return {
      ...data,
      users: assignStatusToUsers(data.users),
    };
  } catch (error) {
    console.error("Error filtering users:", error);
    throw error;
  }
};

/**
 * Unified function to fetch users with optional search/filter
 */
export const fetchUsersWithParams = async ({
  limit = 30,
  skip = 0,
  search,
  searchType = "all",
  filterKey,
  filterValue,
}: FetchUsersParams): Promise<UsersResponse> => {
  // Search takes priority
  if (search && search.trim()) {
    // For name-specific searches, use the filter endpoint
    if (searchType === "firstName") {
      return filterUsers("firstName", search, limit, skip);
    } else if (searchType === "lastName") {
      return filterUsers("lastName", search, limit, skip);
    }
    // Default: search all fields
    return searchUsers(search, limit, skip);
  }

  // Then filter by gender
  if (filterKey && filterValue) {
    return filterUsers(filterKey, filterValue, limit, skip);
  }

  // Default: fetch all
  return fetchUsers(limit, skip);
};
