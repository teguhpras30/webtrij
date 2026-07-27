import React from "react";

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count: number;
}

export default function TabButton({ active, onClick, icon, label, count }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
        active
          ? "bg-red-600 text-white shadow-lg shadow-red-600/25"
          : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
      }`}
    >
      {icon}
      <span>{label}</span>
      <span className={`px-2 py-0.5 rounded-full text-[10px] ${active ? "bg-red-700 text-white" : "bg-slate-800 text-slate-400"}`}>
        {count}
      </span>
    </button>
  );
}
