import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../redux/slices/authSlice";
import UserMenu from "../common/UserMenu";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const currentUser = useSelector(selectCurrentUser);
  const isAuth = !!currentUser;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "الرئيسية", path: "/" },
    { name: "المميزات", path: "/features" },
    { name: "عن التطبيق", path: "/about" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-lg shadow-sm py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 transition-transform group-hover:scale-110">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          <span className="text-xl font-black text-gradient">ذكي ليرن</span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="text-gray-600 hover:text-indigo-600 font-bold transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {isAuth ? (
            <UserMenu />
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-600 hover:text-indigo-600 font-bold transition-colors px-4"
              >
                تسجيل الدخول
              </Link>
              <Link
                to="/register"
                className="px-8 py-3 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 hover:-translate-y-0.5 active:scale-95"
              >
                ابدأ الآن
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
