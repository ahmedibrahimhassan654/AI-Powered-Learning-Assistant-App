import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  useGetDocumentsQuery,
  useDeleteDocumentMutation,
  useUploadDocumentMutation,
} from "../../redux/api/documentApiSlice";
import {
  FileText,
  Upload,
  Search,
  Trash2,
  Eye,
  PlusCircle,
  File,
  X,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

const DocumentListPage = () => {
  const { data: documentsData, isLoading } = useGetDocumentsQuery();
  const [deleteDocument, { isLoading: isDeleting }] =
    useDeleteDocumentMutation();
  const [uploadDocument, { isLoading: isUploading }] =
    useUploadDocumentMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentTitle, setDocumentTitle] = useState("");

  const fileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "هل أنت متأكد من أنك تريد حذف هذا المستند؟ لا يمكن التراجع عن هذا الإجراء.",
      )
    ) {
      try {
        await deleteDocument(id).unwrap();
        toast.success("تم حذف المستند بنجاح");
      } catch (err) {
        toast.error(err.data?.message || "فشل حذف المستند");
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("يرجى رفع ملف بصيغة PDF فقط");
        setSelectedFile(null);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("حجم الملف يجب أن لا يتجاوز 10 ميجابايت");
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      if (!documentTitle) {
        setDocumentTitle(file.name.replace(".pdf", ""));
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      return toast.error("يرجى اختيار ملف للرفع");
    }

    const formData = new FormData();
    formData.append("pdf", selectedFile);
    if (documentTitle) {
      formData.append("title", documentTitle);
    }

    try {
      await uploadDocument(formData).unwrap();
      toast.success("تم رفع المستند بنجاح وهو الآن قيد المعالجة");
      setShowUploadModal(false);
      setSelectedFile(null);
      setDocumentTitle("");
    } catch (err) {
      toast.error(err.data?.message || "فشل رفع المستند");
    }
  };

  const filteredDocuments =
    documentsData?.data?.filter((doc) =>
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 leading-none mb-2">
            مكتبة المستندات
          </h1>
          <p className="text-gray-500 font-medium">
            قم برفع مذكراتك وكتبك الدراسية لتحويلها إلى محتوى تفاعلي
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
        >
          <PlusCircle size={20} />
          رفع مستند جديد
        </button>
      </div>

      {/* Controls (Search & Filter) */}
      <div className="glass p-4 rounded-3xl border border-gray-100 flex items-center justify-between shadow-sm">
        <div className="relative w-full max-w-sm">
          <Search
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="ابحث في مستنداتك..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-12 pl-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-medium"
          />
        </div>
        <div className="hidden sm:flex items-center gap-2 text-sm font-bold text-gray-500 px-4">
          <FileText size={18} />
          <span>{filteredDocuments.length} مستند</span>
        </div>
      </div>

      {/* Documents List */}
      <div className="glass rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-50/50 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-indigo-600">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="font-bold">جاري تحميل المستندات...</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-300 mb-6">
              <File size={48} />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">
              لا توجد مستندات بعد!
            </h3>
            <p className="text-gray-500 max-w-md mx-auto mb-8 font-medium">
              لم تقم برفع أي ملفات حتى الآن، أو لا توجد نتائج مطابقة لبحثك. ابدأ
              برفع ملف PDF لتحويله إلى بطاقات واختبارات.
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-8 py-3 bg-indigo-50 text-indigo-600 rounded-2xl font-bold hover:bg-indigo-100 transition-colors"
            >
              <Upload size={20} />
              رفع ملف الآن
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-sm font-bold border-b border-gray-100">
                  <th className="p-5 tracking-wider">اسم المستند</th>
                  <th className="p-5 tracking-wider">تاريخ الرفع</th>
                  <th className="p-5 tracking-wider">الحجم</th>
                  <th className="p-5 tracking-wider">الحالة</th>
                  <th className="p-5 tracking-wider">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredDocuments.map((doc) => (
                  <tr
                    key={doc._id}
                    className="hover:bg-indigo-50/30 transition-colors group"
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1 max-w-[250px]">
                            {doc.title}
                          </p>
                          <p
                            className="text-xs text-gray-400 mt-1 font-medium"
                            dir="ltr"
                          >
                            {doc.filename}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 whitespace-nowrap">
                      <p className="text-sm font-bold text-gray-700">
                        {new Date(doc.createdAt).toLocaleDateString("ar-EG")}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(doc.createdAt).toLocaleTimeString("ar-EG", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </td>
                    <td className="p-5 whitespace-nowrap text-sm font-bold text-gray-600">
                      {formatFileSize(doc.filesize)}
                    </td>
                    <td className="p-5 whitespace-nowrap">
                      <span
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 w-fit ${
                          doc.status === "ready"
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : doc.status === "processing"
                              ? "bg-amber-50 text-amber-600 border border-amber-100 animate-pulse"
                              : "bg-red-50 text-red-600 border border-red-100"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            doc.status === "ready"
                              ? "bg-emerald-500"
                              : doc.status === "processing"
                                ? "bg-amber-500"
                                : "bg-red-500"
                          }`}
                        ></span>
                        {doc.status === "ready"
                          ? "جاهز"
                          : doc.status === "processing"
                            ? "جاري المعالجة"
                            : "فشل"}
                      </span>
                    </td>
                    <td className="p-5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/documents/${doc._id}`}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                            doc.status === "ready"
                              ? "bg-white border border-gray-100 text-indigo-600 hover:bg-indigo-600 hover:text-white shadow-sm"
                              : "bg-gray-50 text-gray-300 cursor-not-allowed"
                          }`}
                          onClick={(e) =>
                            doc.status !== "ready" && e.preventDefault()
                          }
                        >
                          <Eye size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(doc._id)}
                          disabled={isDeleting}
                          className="w-10 h-10 rounded-xl bg-white border border-gray-100 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm disabled:opacity-50"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900">
                رفع مستند جديد
              </h3>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                  setDocumentTitle("");
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-400 hover:text-gray-700 shadow-sm border border-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpload} className="p-6 space-y-6">
              {/* File Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-[2rem] p-8 text-center cursor-pointer transition-all ${
                  selectedFile
                    ? "border-emerald-400 bg-emerald-50/50"
                    : "border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/30"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  hidden
                  accept="application/pdf"
                  onChange={handleFileChange}
                />

                {selectedFile ? (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                      <FileText size={32} />
                    </div>
                    <p
                      className="font-bold text-gray-900 line-clamp-1 max-w-[200px]"
                      dir="ltr"
                    >
                      {selectedFile.name}
                    </p>
                    <p className="text-sm font-bold text-emerald-600 mt-2">
                      تم اختيار الملف ({formatFileSize(selectedFile.size)})
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center mb-4 child-transition">
                      <Upload size={32} />
                    </div>
                    <p className="font-bold text-gray-700 mb-1">
                      انقر لاختيار ملف PDF
                    </p>
                    <p className="text-xs text-gray-400 font-medium">
                      الحد الأقصى للحجم: 10 ميجابايت
                    </p>
                  </div>
                )}
              </div>

              {/* Document Title Input */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 px-1">
                  عنوان المستند (اختياري)
                </label>
                <input
                  type="text"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  placeholder="مثال: مذكرة الأحياء - الفصل الدراسي الأول"
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-medium"
                />
              </div>

              <div className="bg-blue-50/50 p-4 rounded-2xl flex gap-3 text-blue-600 border border-blue-50 text-sm">
                <AlertCircle className="shrink-0 mt-0.5" size={18} />
                <p className="leading-relaxed">
                  سيبدأ نظام "ذكي ليرن" في معالجة المستند واستخراج المحتوى منه
                  فور رفعه لتتمكن من إنشاء البطاقات والاختبارات لاحقاً.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isUploading || !selectedFile}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    جاري الرفع...
                  </>
                ) : (
                  <>
                    <Upload size={20} />
                    تأكيد الرفع
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentListPage;
