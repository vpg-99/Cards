import React from "react";
import { User } from "../types/user";

interface RenderPaneProps {
  selectedUser: User | null;
}

const RenderPane: React.FC<RenderPaneProps> = ({ selectedUser }) => {
  if (!selectedUser) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <svg
            className="mx-auto h-24 w-24 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No user selected
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Select a user from the list to view their details
          </p>
        </div>
      </div>
    );
  }

  const status = selectedUser.status || "active";
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500 text-white";
      case "inactive":
        return "bg-gray-400 text-white";
      case "pending":
        return "bg-yellow-500 text-white";
      default:
        return "bg-green-500 text-white";
    }
  };

  const joinDate = new Date(selectedUser.birthDate).toLocaleDateString(
    "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-8">
      {/* User Card Container */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-8">
        {/* User Header */}
        <div className="flex items-start mb-8">
          <img
            src={selectedUser.image}
            alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
            className="w-32 h-32 rounded-full object-cover shadow-md"
          />
          <div className="ml-8 flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {selectedUser.firstName} {selectedUser.lastName}
            </h1>
            <p className="text-lg text-gray-600 mb-3">
              ID: #{selectedUser.id.toString().padStart(6, "0")}
            </p>
            <span
              className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold uppercase tracking-wide ${getStatusColor(
                status
              )}`}
            >
              {status}
            </span>
          </div>
        </div>

        {/* User Details with Icons */}
        <div className="space-y-6 mb-8">
          {/* Email */}
          <div className="flex items-start">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4 shrink-0">
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Email</p>
              <p className="text-lg font-semibold text-gray-900">
                {selectedUser.email}
              </p>
            </div>
          </div>

          {/* Role */}
          <div className="flex items-start">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4 shrink-0">
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Role</p>
              <p className="text-lg font-semibold text-gray-900">
                {selectedUser.company.title}
              </p>
            </div>
          </div>

          {/* Department */}
          <div className="flex items-start">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4 shrink-0">
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Department</p>
              <p className="text-lg font-semibold text-gray-900">
                {selectedUser.company.department}
              </p>
            </div>
          </div>

          {/* Join Date */}
          <div className="flex items-start">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4 shrink-0">
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Join Date</p>
              <p className="text-lg font-semibold text-gray-900">{joinDate}</p>
            </div>
          </div>

          {/* Age */}
          <div className="flex items-start">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4 shrink-0">
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Age</p>
              <p className="text-lg font-semibold text-gray-900">
                {selectedUser.age} years
              </p>
            </div>
          </div>

          {/* Gender */}
          <div className="flex items-start">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4 shrink-0">
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Gender</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">
                {selectedUser.gender}
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-8"></div>

        {/* Additional Information */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Additional Information
          </h2>
          <p className="text-gray-600 leading-relaxed">
            This user has been part of the {selectedUser.company.department}{" "}
            department since {new Date(selectedUser.birthDate).getFullYear()}.
            They currently hold the position of {selectedUser.company.title} and
            their account status is {status}.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RenderPane;
