import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Files,
  Languages,
  BrainCircuit,
  UserCircle,
  LogOut,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: "لوحة التحكم", icon: LayoutDashboard, path: "/dashboard" },
    { name: "المستندات", icon: Files, path: "/documents" },
    { name: "البطاقات التعليمية", icon: Languages, path: "/flashcards" },
    { name: "الاختبارات", icon: BrainCircuit, path: "/quizzes" },
    { name: "الملف الشخصي", icon: UserCircle, path: "/profile" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div
      className={`bg-white border-l border-gray-100 flex flex-col transition-all duration-300 relative ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -left-3 top-10 bg-white border border-gray-100 rounded-full p-1 text-gray-400 hover:text-primary transition-colors shadow-sm z-10"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Logo Area */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary/20">
          <BrainCircuit size={24} />
        </div>
        {!isCollapsed && (
          <span className="font-display font-bold text-xl text-gray-800 truncate">
            المساعد الذكي
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all group relative ${
                isActive
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-gray-500 hover:bg-gray-50 hover:text-primary"
              }`}
            >
              <item.icon
                size={22}
                className={
                  isActive ? "text-primary" : "group-hover:text-primary"
                }
              />
              {!isCollapsed && <span>{item.name}</span>}

              {isCollapsed && (
                <div className="absolute right-full mr-4 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors group relative"
        >
          <LogOut size={22} />
          {!isCollapsed && <span>تسجيل الخروج</span>}
          {isCollapsed && (
            <div className="absolute right-full mr-4 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
              تسجيل الخروج
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
