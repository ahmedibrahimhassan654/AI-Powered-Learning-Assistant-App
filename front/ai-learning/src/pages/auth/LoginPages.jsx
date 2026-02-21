import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useDispatch } from "react-redux";
import { useLoginMutation } from "../../redux/api/authApiSlice";
import { setCredentials } from "../../redux/slices/authSlice";
import toast from "react-hot-toast";

const LoginPages = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await login(formData).unwrap();

      if (res.success) {
        dispatch(setCredentials({ user: res.data, token: res.data.token }));
        toast.success("تم تسجيل الدخول بنجاح! مرحباً بك.");
        navigate("/dashboard");
      }
    } catch (err) {
      const message = err.data?.message || "فشلت عملية تسجيل الدخول";
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden px-6 py-12">
      {/* Background Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-100 rounded-full blur-[100px] -z-10 opacity-60"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-100 rounded-full blur-[100px] -z-10 opacity-60"></div>

      <div className="w-full max-w-md">
        <div className="glass p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-100 animate-in fade-in zoom-in duration-500">
          {/* Header */}
          <div className="text-center mb-10">
            <Link
              to="/"
              className="inline-flex items-center gap-2 mb-6 group transition-transform hover:scale-105"
            >
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                <span className="text-white font-bold text-2xl">A</span>
              </div>
              <span className="text-2xl font-black text-gradient">
                ذكي ليرن
              </span>
            </Link>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              تسجيل الدخول
            </h2>
            <p className="text-gray-500">استكمل رحلتك التعليمية معنا</p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 mr-1">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={onChange}
                required
                placeholder="example@mail.com"
                className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 bg-gray-50/50 focus:border-indigo-600 focus:bg-white transition-all outline-none text-right"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 mr-1">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={onChange}
                  required
                  placeholder="••••••••"
                  className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 bg-gray-50/50 focus:border-indigo-600 focus:bg-white transition-all outline-none text-right pl-14"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors p-2"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end p-1">
              <a
                href="#"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                نسيت كلمة المرور؟
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5 active:scale-95"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  جاري التحميل...
                </>
              ) : (
                "تسجيل الدخول"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-10 text-center">
            <p className="text-gray-600">
              ليس لديك حساب؟{" "}
              <Link
                to="/register"
                className="text-indigo-600 font-bold hover:text-indigo-800 transition-colors"
              >
                إنشاء حساب جديد
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPages;
