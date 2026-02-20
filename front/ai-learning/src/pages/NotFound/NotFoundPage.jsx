import React from "react";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-800 p-6">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary opacity-20">404</h1>
        <h2 className="text-4xl font-bold mt-[-40px] mb-4">
          عذراً، الصفحة غير موجودة
        </h2>
        <p className="text-gray-500 mb-8 text-lg">
          يبدو أنك سلكت طريقاً خاطئاً. الصفحة التي تبحث عنها قد تم نقلها أو أنها
          لم تكن موجودة أبداً.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-opacity-90 transition-all shadow-lg shadow-primary/20"
        >
          <Home size={20} />
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
