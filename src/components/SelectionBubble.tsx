import React from "react";

interface SelectionBubbleProps {
  count: number;
}

const SelectionBubble: React.FC<SelectionBubbleProps> = ({ count }) => {
  if (count === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-blue-600 text-white rounded-full shadow-lg flex items-center gap-2 px-5 py-3 animate-bounce-subtle">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>

        <span className="text-base font-semibold whitespace-nowrap">
          {count} selected
        </span>
      </div>
    </div>
  );
};

export default SelectionBubble;
