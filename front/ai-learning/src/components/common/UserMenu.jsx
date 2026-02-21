import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout, selectCurrentUser } from "../../redux/slices/authSlice";
import {
  User,
  LogOut,
  LayoutDashboard,
  Files,
  Languages,
  BrainCircuit,
  ChevronDown,
  Bell,
} from "lucide-react";
import { getImageUrl } from "../../utils/getImageUrl";

const UserMenu = () => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setShowMenu(false);
    navigate("/login");
  };

  const appMenus = [
    { name: "لوحة التحكم", path: "/dashboard", icon: LayoutDashboard },
    { name: "المستندات", path: "/documents", icon: Files },
    { name: "البطاقات التعليمية", path: "/flashcards", icon: Languages },
    { name: "الاختبارات", path: "/quizzes", icon: BrainCircuit },
    { name: "الملف الشخصي", path: "/profile", icon: User },
  ];

  if (!currentUser) return null;

  return (
    <div className="flex items-center gap-3">
      {/* Notifications - Optional Add-on */}
      <button className="hidden sm:flex w-10 h-10 items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all relative">
        <Bell size={20} />
        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
      </button>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-3 p-1 rounded-full hover:bg-gray-100 transition-all group"
          id="user-menu-button"
        >
          <div className="text-right hidden lg:block mr-2">
            <p className="text-sm font-bold text-gray-900 leading-tight truncate max-w-[120px]">
              {currentUser.name}
            </p>
            <p className="text-[11px] text-gray-500 leading-tight truncate max-w-[120px]">
              {currentUser.email}
            </p>
          </div>

          <div className="relative">
            {currentUser.profileImage ? (
              <img
                src={getImageUrl(currentUser.profileImage)}
                alt={currentUser.name}
                className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-sm"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                }}
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <User size={20} />
              </div>
            )}
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
          </div>

          <ChevronDown
            size={16}
            className={`text-gray-400 mr-1 transition-transform duration-300 ${showMenu ? "rotate-180" : ""}`}
          />
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <div className="absolute left-0 mt-3 w-64 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 z-[100]">
            <div className="p-5 bg-gradient-to-br from-indigo-50/50 to-violet-50/50 border-b border-gray-100 block lg:hidden">
              <p className="font-bold text-gray-900 leading-none mb-1">
                {currentUser.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {currentUser.email}
              </p>
            </div>

            <div className="p-2">
              <p className="px-4 py-2 text-[10px] uppercase tracking-widest text-gray-400 font-black">
                القائمة البرمجية
              </p>
              {appMenus.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setShowMenu(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                    <item.icon size={18} />
                  </div>
                  <span className="font-bold text-sm">{item.name}</span>
                </Link>
              ))}
            </div>

            <div className="p-2 bg-gray-50 border-t border-gray-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-bold group"
              >
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm">
                  <LogOut size={18} />
                </div>
                <span className="text-sm">تسجيل الخروج</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserMenu;
