import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";

const HomePage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 opacity-40">
          <div className="absolute top-[10%] right-[10%] w-[400px] h-[400px] bg-indigo-300 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[20%] left-[5%] w-[350px] h-[350px] bg-violet-300 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-semibold mb-8">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-ping"></span>
            مستقبلك التعليمي يبدأ هنا مع الذكاء الاصطناعي
          </div>

          <h1 className="text-5xl lg:text-7xl font-black text-gray-900 leading-[1.1] mb-8 tracking-tight">
            تعليم أذكى، نتائج أسرع <br />
            مع <span className="text-gradient">مساعدك الشخصي</span>
          </h1>

          <p className="max-w-2xl mx-auto text-xl text-gray-600 mb-12 leading-relaxed">
            ارفع مستنداتك التعليمية ودع مساعدنا الذكي يساعدك في التلخيص، توليد
            الفلاش كاردز، وإجراء اختبارات تفاعلية لتعزيز مهاراتك بشكل أسرع.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link
              to="/register"
              className="w-full sm:w-auto px-12 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 hover:-translate-y-1 active:scale-95"
            >
              ابدأ الآن مجاناً
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-12 py-4 bg-white text-gray-700 border-2 border-gray-100 rounded-2xl font-bold text-lg hover:border-indigo-600 hover:text-indigo-600 transition-all hover:-translate-y-1 active:scale-95"
            >
              تسجيل الدخول
            </Link>
          </div>

          {/* Feature Grid */}
          <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass p-10 rounded-[2.5rem] hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 group">
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-indigo-100">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-right">
                محادثة ذكية
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed text-right">
                ناقش محتوى ملفاتك مع الذكاء الاصطناعي واحصل على إجابات فورية
                ودقيقة مبنية على مراجعك.
              </p>
            </div>

            <div className="glass p-10 rounded-[2.5rem] hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 group">
              <div className="w-16 h-16 bg-violet-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-violet-100">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-right">
                بطاقات ذكية
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed text-right">
                حول دروسك إلى بطاقات تعليمية (فلاش كاردز) تلقائية تساعدك على
                الحفظ بأسلوب التكرار المتباعد.
              </p>
            </div>

            <div className="glass p-10 rounded-[2.5rem] hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 group">
              <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-emerald-100">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-right">
                اختبارات ذكية
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed text-right">
                اختبر فهمك للمادة من خلال كويزات مخصصة يولدها النظام بناءً على
                النقاط الأساسية في ملفاتك.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Placeholder */}
      <footer className="py-12 border-t border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              A
            </div>
            <span className="font-bold text-gray-900">
              ذكي ليرن &copy; {new Date().getFullYear()}
            </span>
          </div>
          <div className="flex gap-8 text-gray-500 text-sm">
            <a href="#" className="hover:text-indigo-600 transition-colors">
              سياسة الخصوصية
            </a>
            <a href="#" className="hover:text-indigo-600 transition-colors">
              شروط الخدمة
            </a>
            <a href="#" className="hover:text-indigo-600 transition-colors">
              تواصل معنا
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
