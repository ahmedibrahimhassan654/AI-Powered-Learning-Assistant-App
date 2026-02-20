import React from "react";
import Sidebar from "../common/Sidebar";

const AppLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50 font-display">
      {/* Sidebar - Always visible as part of the protected layout */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header Placeholder */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-700">
              مرحباً بك! 👋
            </h2>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>
              تاريخ اليوم:{" "}
              {new Date().toLocaleDateString("ar-EG", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
