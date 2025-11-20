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

let globalIdCounter = 0;

/**
 * Assign random status to users for demo purposes and generate unique IDs
 */
const assignStatusToUsers = (users: User[]): User[] => {
  const statuses: Array<"active" | "inactive" | "pending"> = [
    "active",
    "inactive",
    "pending",
  ];
  return users.map((user) => {
    // Generate truly unique ID using global counter
    globalIdCounter++;
    const originalId = user.id;
    return {
      ...user,
      id: globalIdCounter, // Globally unique ID that never repeats
      status: statuses[originalId % 3] as "active" | "inactive" | "pending",
    };
  });
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
  if (search && search.trim()) {
    if (searchType === "firstName") {
      return filterUsers("firstName", search, limit, skip);
    } else if (searchType === "lastName") {
      return filterUsers("lastName", search, limit, skip);
    }
    return searchUsers(search, limit, skip);
  }

  if (filterKey && filterValue) {
    return filterUsers(filterKey, filterValue, limit, skip);
  }

  return fetchUsers(limit, skip);
};
