import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../common/Sidebar";
import UserMenu from "../common/UserMenu";

const AppLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50 font-display transition-all duration-500">
      {/* Sidebar - Always visible as part of the protected layout */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 shrink-0 py-4">
          <div className="flex flex-col">
            <h2 className="text-xl font-black text-gray-900 leading-none mb-1">
              مرحباً بك! 👋
            </h2>
            <p className="text-xs text-gray-400 font-medium">
              {new Date().toLocaleDateString("ar-EG", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
          </div>

          <div className="flex items-center gap-6">
            {/* Search Bar Placeholder */}
            <div className="hidden md:flex items-center gap-2 bg-gray-50 px-4 py-2.5 rounded-2xl border border-gray-100 w-64 focus-within:bg-white focus-within:border-indigo-200 transition-all">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="ابحث هنا..."
                className="bg-transparent border-none outline-none text-sm w-full font-medium"
              />
            </div>

            <div className="h-8 w-[1px] bg-gray-100 mx-2"></div>

            {/* Profile Dropdown */}
            <UserMenu />
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-auto p-4 lg:p-10">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-700">
            {children || <Outlet />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
