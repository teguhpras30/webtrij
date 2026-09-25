import React from "react";

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count?: number;
  badge?: number;
}

export default function TabButton({
  active,
  onClick,
  icon,
  label,
  count,
  badge,
}: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer relative ${
        active
          ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
          : "bg-white text-gray-600 hover:text-gray-900 border border-gray-200 hover:bg-gray-50"
      }`}
    >
      {icon}
      <span>{label}</span>

      {/* Red Notification Badge for Chat or Alerts */}
      {badge !== undefined && badge > 0 && (
        <span
          className={`px-1.5 py-0.5 rounded-full text-[10px] font-black min-w-5 h-5 flex items-center justify-center shadow-xs animate-bounce ${
            active
              ? "bg-white text-red-600 border border-white"
              : "bg-red-500 text-white border border-white"
          }`}
        >
          {badge}
        </span>
      )}

      {/* Standard Counter */}
      {count !== undefined && (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
            active ? "bg-red-700 text-white" : "bg-gray-100 text-gray-600"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}
