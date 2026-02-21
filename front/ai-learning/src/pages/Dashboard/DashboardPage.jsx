import React from "react";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../redux/slices/authSlice";
import { useGetDashboardStatsQuery } from "../../redux/api/dashboardApiSlice";
import {
  Files,
  Languages,
  BrainCircuit,
  Clock,
  ChevronLeft,
  ArrowUpRight,
  PlusCircle,
  FileText,
} from "lucide-react";
import { Link } from "react-router-dom";

const DashboardPage = () => {
  const currentUser = useSelector(selectCurrentUser);
  const { data: dashboardData, isLoading } = useGetDashboardStatsQuery();

  const stats = [
    {
      title: "إجمالي المستندات",
      value: dashboardData?.data?.stats?.totalDocuments || 0,
      icon: Files,
      color: "from-blue-500 to-indigo-600",
      shadow: "shadow-blue-100",
    },
    {
      title: "البطاقات التعليمية",
      value: dashboardData?.data?.stats?.totalFlashcards || 0,
      icon: Languages,
      color: "from-violet-500 to-purple-600",
      shadow: "shadow-violet-100",
    },
    {
      title: "الاختبارات الذكية",
      value: dashboardData?.data?.stats?.totalQuizzes || 0,
      icon: BrainCircuit,
      color: "from-emerald-500 to-teal-600",
      shadow: "shadow-emerald-100",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Welcome Header */}
      <div className="relative overflow-hidden p-10 rounded-[3rem] bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-2xl shadow-indigo-200">
        <div className="relative z-10">
          <h1 className="text-4xl font-black mb-4">
            أهلاً بك مجدداً، {currentUser?.name}! 👋
          </h1>
          <p className="text-indigo-100 text-lg font-medium max-w-2xl leading-relaxed">
            جاهز لتعلم شيء جديد اليوم؟ ملفاتك التعليمية بانتظارك، ويمكنك البدء
            برفع مستند جديد أو مراجعة ما قمت به مؤخراً.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/documents"
              className="px-8 py-3.5 bg-white text-indigo-600 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-50 transition-all shadow-lg active:scale-95"
            >
              <PlusCircle size={20} />
              رفع مستند جديد
            </Link>
            <Link
              to="/quizzes"
              className="px-8 py-3.5 bg-indigo-500/30 backdrop-blur-md text-white border border-indigo-400/30 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-500/50 transition-all active:scale-95"
            >
              <BrainCircuit size={20} />
              بدء اختبار
            </Link>
          </div>
        </div>

        {/* Decorative backdrop elements */}
        <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[300px] h-[300px] bg-indigo-400/20 rounded-full blur-3xl"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="glass p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-50 flex items-center gap-6 group hover:-translate-y-2 transition-all duration-300"
          >
            <div
              className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.color} ${stat.shadow} flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3`}
            >
              <stat.icon size={30} />
            </div>
            <div>
              <p className="text-gray-500 font-bold mb-1">{stat.title}</p>
              <h3 className="text-3xl font-black text-gray-900">
                {stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Table */}
        <div className="lg:col-span-2 glass p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-50">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold">
                <Clock size={20} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                آخر المستندات المرفوعة
              </h3>
            </div>
            <Link
              to="/documents"
              className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group"
            >
              عرض الكل
              <ChevronLeft
                size={16}
                className="group-hover:-translate-x-1 transition-transform"
              />
            </Link>
          </div>

          <div className="space-y-4">
            {!dashboardData?.data?.recentDocuments?.length && (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <FileText size={48} className="mb-3 opacity-20" />
                <p className="font-medium">
                  لا توجد مستندات بعد. ابدأ برفع أول ملف لك!
                </p>
              </div>
            )}

            {dashboardData?.data?.recentDocuments?.map((doc) => (
              <div
                key={doc._id}
                className="flex items-center justify-between p-5 rounded-3xl border border-gray-50 bg-gray-50/30 hover:bg-white hover:border-indigo-100 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-indigo-600">
                    <FileText size={22} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors uppercase truncate max-w-[200px]">
                      {doc.title}
                    </h4>
                    <p className="text-xs text-gray-400 font-medium flex items-center gap-2">
                      <span>
                        {new Date(doc.createdAt).toLocaleDateString("ar-EG")}
                      </span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span>
                        {new Date(doc.createdAt).toLocaleTimeString("ar-EG", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                      doc.status === "ready"
                        ? "bg-emerald-50 text-emerald-600"
                        : doc.status === "processing"
                          ? "bg-amber-50 text-amber-600 animate-pulse"
                          : "bg-red-50 text-red-600"
                    }`}
                  >
                    {doc.status === "ready"
                      ? "جاهز"
                      : doc.status === "processing"
                        ? "جاري المعالجة"
                        : "فشل"}
                  </span>

                  <Link
                    to={`/documents/${doc._id}`}
                    className="w-10 h-10 rounded-xl bg-white border border-gray-100 text-gray-400 flex items-center justify-center hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm group/btn"
                  >
                    <ArrowUpRight
                      size={18}
                      className="group-hover/btn:scale-110 transition-transform"
                    />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Tips / Suggestions */}
        <div className="lg:col-span-1 glass p-8 rounded-[3rem] bg-indigo-900 text-white shadow-2xl shadow-indigo-50 border border-indigo-800 overflow-hidden relative">
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white mb-6">
                <BrainCircuit size={24} />
              </div>
              <h3 className="text-2xl font-black mb-4 leading-tight">
                كيف تحقق أقصى استفادة؟
              </h3>
              <p className="text-indigo-200 text-sm leading-relaxed mb-6 font-medium">
                ارفع كتبك الدراسية أو ملخصاتك، وسيقوم "ذكي ليرن" بتحويلها إلى
                بطاقات تفاعلية واختبارات قياس ذكية لضمان فهمك العميق.
              </p>

              <ul className="space-y-4">
                {[
                  "ارفع ملفات PDF بوضوح جيد",
                  "راجع البطاقات التعليمية يومياً",
                  "اختبر نفسك لتقوية ذاكرتك",
                ].map((tip, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-sm font-bold"
                  >
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <PlusCircle size={12} />
                    </div>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-10 p-5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <p className="text-xs text-indigo-300 font-bold mb-1 uppercase tracking-widest">
                تلميحة اليوم
              </p>
              <p className="text-sm font-medium">
                المراجعة المتباعدة هي أسرع وسيلة للحفظ طويل الأمد!
              </p>
            </div>
          </div>

          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-indigo-500/20 rounded-full blur-[80px]"></div>
          <div className="absolute bottom-0 left-0 w-[150px] h-[150px] bg-violet-600/20 rounded-full blur-[60px]"></div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
