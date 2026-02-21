import React, { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useGetDocumentQuery } from "../../redux/api/documentApiSlice";
import {
  useGetChatHistoryQuery,
  useAskQuestionMutation,
  useClearChatHistoryMutation,
} from "../../redux/api/aiApiSlice";
import {
  FileText,
  Send,
  Bot,
  User,
  Trash2,
  Clock,
  ArrowRight,
  Loader2,
  FileDigit,
  BrainCircuit,
  MessageSquare,
} from "lucide-react";
import toast from "react-hot-toast";

const DocumentDetailPage = () => {
  const { id } = useParams();
  const [message, setMessage] = useState("");

  // APIs
  const { data: documentData, isLoading: isDocLoading } =
    useGetDocumentQuery(id);
  const {
    data: chatData,
    isLoading: isChatLoading,
  } = useGetChatHistoryQuery(id);
  const [askQuestion, { isLoading: isAsking }] = useAskQuestionMutation();
  const [clearHistory, { isLoading: isClearing }] =
    useClearChatHistoryMutation();

  const messagesEndRef = useRef(null);

  const doc = documentData?.data;
  const chatHistory = chatData?.data || [];

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatData, isAsking]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const currentMessage = message;
    setMessage(""); // Optimistic clear

    try {
      await askQuestion({ docId: id, message: currentMessage }).unwrap();
      // Tag invalidation in RTK Query will auto-fetch the new history,
      // but just in case, it automatically updates.
    } catch (err) {
      toast.error(err.data?.message || "فشل إرسال السؤال");
      setMessage(currentMessage); // Restore message on fail
    }
  };

  const handleClearChat = async () => {
    if (window.confirm("هل تريد بالتأكيد مسح سجل المحادثة بالكامل؟")) {
      try {
        await clearHistory(id).unwrap();
        toast.success("تم مسح المحادثة");
      } catch {
        toast.error("فشل مسح المحادثة");
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (isDocLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <p className="font-bold text-gray-500">جاري تحميل مساحة العمل...</p>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          المستند غير موجود
        </h2>
        <Link
          to="/documents"
          className="text-indigo-600 font-bold hover:underline"
        >
          العودة للمكتبة
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Header / Breadcrumbs */}
      <div className="flex items-center gap-4 text-sm font-bold text-gray-400 mb-2">
        <Link
          to="/documents"
          className="hover:text-indigo-600 flex items-center gap-1 transition-colors"
        >
          <ArrowRight size={16} /> العودة للمكتبة
        </Link>
        <span>/</span>
        <span className="text-indigo-600 truncate max-w-[200px]">
          {doc.title}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)] min-h-[600px]">
        {/* Left Side: Document Info & Stats */}
        <div className="lg:col-span-4 h-full flex flex-col gap-6 overflow-y-auto hidden-scrollbar pb-6">
          {/* Main Card */}
          <div className="glass p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-50 flex-shrink-0">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
              <FileText size={32} />
            </div>

            <h1 className="text-2xl font-black text-gray-900 leading-tight mb-2">
              {doc.title}
            </h1>
            <p
              className="text-sm font-bold text-gray-400 mb-6 font-mono"
              dir="ltr"
            >
              {doc.filename}
            </p>

            <div className="space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 font-bold flex items-center gap-2">
                  <Clock size={16} /> تاريخ الرفع
                </span>
                <span className="text-gray-900 font-bold">
                  {new Date(doc.createdAt).toLocaleDateString("ar-EG")}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 font-bold flex items-center gap-2">
                  <FileDigit size={16} /> الحجم
                </span>
                <span className="text-gray-900 font-bold">
                  {formatFileSize(doc.filesize)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 font-bold flex items-center gap-2">
                  <FileText size={16} /> عدد الصفحات
                </span>
                <span className="text-gray-900 font-bold">
                  {doc.totalPages || "-"}
                </span>
              </div>
            </div>

            <div className="mt-8">
              <span
                className={`px-4 py-2 flex items-center justify-center gap-2 w-full rounded-xl text-sm font-black uppercase tracking-wider ${
                  doc.status === "ready"
                    ? "bg-emerald-50 text-emerald-600"
                    : doc.status === "processing"
                      ? "bg-amber-50 text-amber-600 animate-pulse"
                      : "bg-red-50 text-red-600"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${doc.status === "ready" ? "bg-emerald-500" : doc.status === "processing" ? "bg-amber-500" : "bg-red-500"}`}
                ></span>
                {doc.status === "ready"
                  ? "متاح للمحادثة"
                  : doc.status === "processing"
                    ? "جاري التحليل..."
                    : "خطأ في المعالجة"}
              </span>
            </div>
          </div>

          {/* Associated Items */}
          <div className="glass p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-50">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BrainCircuit size={18} className="text-indigo-600" /> ملحقات
              المستند
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl flex flex-col items-center">
                <span className="text-2xl font-black text-emerald-600">
                  {doc.quizzesCount || 0}
                </span>
                <span className="text-xs font-bold text-emerald-700/70 mt-1">
                  اختبارات
                </span>
              </div>
              <div className="bg-violet-50/50 border border-violet-100 p-4 rounded-2xl flex flex-col items-center">
                <span className="text-2xl font-black text-violet-600">
                  {doc.flashcardsCount || 0}
                </span>
                <span className="text-xs font-bold text-violet-700/70 mt-1">
                  بطاقات
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Chat Interface */}
        <div className="lg:col-span-8 h-full glass rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-50 flex flex-col overflow-hidden relative">
          {/* Chat Header */}
          <div className="p-6 border-b border-gray-100 bg-white/50 backdrop-blur-md flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <MessageSquare size={18} />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">المساعد الذكي</h2>
                <p className="text-xs text-indigo-600 font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>{" "}
                  متصل ويعرف المستند
                </p>
              </div>
            </div>
            {chatHistory.length > 0 && (
              <button
                onClick={handleClearChat}
                disabled={isClearing}
                className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm group disabled:opacity-50"
                title="مسح المحادثة"
              >
                <Trash2
                  size={18}
                  className="group-hover:scale-110 transition-transform"
                />
              </button>
            )}
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-gray-50/30">
            {isChatLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              </div>
            ) : chatHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 grayscale-[0.5] opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                <div className="w-24 h-24 mb-6 relative">
                  <div className="absolute inset-0 bg-indigo-200 rounded-full animate-ping opacity-20"></div>
                  <div className="w-full h-full bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center relative z-10 shadow-lg border-4 border-white">
                    <Bot size={40} />
                  </div>
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">
                  كيف يمكنني المساعدة؟
                </h3>
                <p className="text-sm font-medium text-gray-500 max-w-sm">
                  لقد قمت بقراءة المستند <b>"{doc.title}"</b>. يمكنك سؤالي عن أي
                  شيء يخصه، أو اطلب مني تلخيصه.
                </p>
              </div>
            ) : (
              chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex items-end gap-3 max-w-[85%] ${msg.role === "user" ? "mr-auto flex-row-reverse" : "ml-auto"}`}
                >
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-md border-2 border-white ${
                      msg.role === "user"
                        ? "bg-indigo-100 text-indigo-600"
                        : "bg-violet-600 text-white"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <User size={18} />
                    ) : (
                      <Bot size={18} />
                    )}
                  </div>
                  <div
                    className={`p-5 rounded-3xl text-sm leading-relaxed shadow-sm ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white rounded-br-none"
                        : "bg-white border border-gray-100 text-gray-800 rounded-bl-none prose prose-indigo max-w-none prose-sm"
                    }`}
                  >
                    <pre className="font-sans whitespace-pre-wrap">
                      {msg.content}
                    </pre>
                  </div>
                </div>
              ))
            )}

            {isAsking && (
              <div className="flex items-end gap-3 max-w-[85%] ml-auto animate-pulse">
                <div className="w-10 h-10 rounded-2xl bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-md border-2 border-white">
                  <Bot size={18} />
                </div>
                <div className="p-5 rounded-3xl rounded-bl-none bg-white border border-gray-100 flex gap-2 w-24">
                  <div className="w-2 h-2 rounded-full bg-indigo-300 animate-bounce"></div>
                  <div
                    className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form Input Area */}
          <div className="p-4 bg-white/80 backdrop-blur-xl border-t border-gray-100 z-10">
            <form
              onSubmit={handleSendMessage}
              className="relative flex items-center"
            >
              <input
                type="text"
                placeholder={
                  doc.status === "ready"
                    ? "اسألني سؤالاً عن هذا المستند..."
                    : "يرجى الانتظار حتى تنتهي المعالجة..."
                }
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isAsking || doc.status !== "ready"}
                className="w-full pl-16 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-[2rem] focus:bg-white focus:border-indigo-500 focus:shadow-lg focus:shadow-indigo-100/50 outline-none transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={isAsking || !message.trim() || doc.status !== "ready"}
                className="absolute left-2 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 transition-all shadow-md active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {!isAsking ? (
                  <Send
                    size={18}
                    className="translate-x-[-2px] group-hover:scale-110 transition-transform"
                  />
                ) : (
                  <Loader2 size={18} className="animate-spin" />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetailPage;
