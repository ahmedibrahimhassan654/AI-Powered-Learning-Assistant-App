import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  useUpdateMeMutation,
  useChangePasswordMutation,
  useGetMeQuery,
} from "../../redux/api/authApiSlice";
import { setCredentials } from "../../redux/slices/authSlice";
import {
  User,
  Mail,
  Lock,
  ShieldCheck,
  Camera,
  Save,
  Key,
  Eye,
  EyeOff,
} from "lucide-react";
import toast from "react-hot-toast";
import { getImageUrl } from "../../utils/getImageUrl";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  // Get fresh data from server
  const { data: userData, isLoading: isUserLoading } = useGetMeQuery();

  const [updateMe, { isLoading: isUpdating }] = useUpdateMeMutation();
  const [changePassword, { isLoading: isChangingPassword }] =
    useChangePasswordMutation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (userData?.data) {
      // eslint-disable-next-line
      setFormData({
        name: userData.data.name || "",
        email: userData.data.email || "",
      });
      setImagePreview(userData.data.profileImage || null);
    }
  }, [userData]);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const onProfileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onPasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      if (image) {
        data.append("profileImage", image);
      }

      const res = await updateMe(data).unwrap();
      if (res.success) {
        dispatch(
          setCredentials({
            user: res.data,
            token: res.data.token,
          }),
        );
        toast.success("تم تحديث الملف الشخصي بنجاح");
        setImage(null); // Reset file selection after success
      }
    } catch (err) {
      toast.error(err.data?.message || "فشل تحديث الملف الشخصي");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      return toast.error("كلمات المرور الجديدة غير متطابقة");
    }

    try {
      const res = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      }).unwrap();

      if (res.success) {
        toast.success("تم تغيير كلمة المرور بنجاح");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        });
      }
    } catch (err) {
      toast.error(err.data?.message || "فشل تغيير كلمة المرور");
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 leading-none mb-2">
            الملف الشخصي
          </h1>
          <p className="text-gray-500 font-medium">
            إدارة معلوماتك الشخصية وإعدادات الأمان
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="glass p-8 rounded-[2.5rem] shadow-xl shadow-indigo-50 border border-gray-100 flex flex-col items-center text-center sticky top-24">
            <div className="relative group mb-6">
              <div className="w-32 h-32 rounded-3xl bg-indigo-600 flex items-center justify-center text-white text-4xl font-bold shadow-2xl shadow-indigo-200 overflow-hidden border-4 border-white">
                {imagePreview ? (
                  <img
                    src={getImageUrl(imagePreview)}
                    alt={formData.name || "User"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                    }}
                  />
                ) : (
                  <span>{formData.name?.charAt(0) || "U"}</span>
                )}
              </div>
              <input
                type="file"
                id="profileImage"
                hidden
                accept="image/*"
                onChange={handleImageChange}
              />
              <button
                type="button"
                onClick={() => document.getElementById("profileImage").click()}
                className="absolute -bottom-2 -right-2 w-10 h-10 bg-white shadow-lg rounded-xl flex items-center justify-center text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all"
              >
                <Camera size={18} />
              </button>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {userData?.data?.name}
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              {userData?.data?.email}
            </p>

            <div className="w-full pt-6 border-t border-gray-50 space-y-3">
              <div className="flex items-center justify-between text-sm px-2">
                <span className="text-gray-400 font-bold">الحالة:</span>
                <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  نشط
                </span>
              </div>
              <div className="flex items-center justify-between text-sm px-2">
                <span className="text-gray-400 font-bold">الدور:</span>
                <span className="text-indigo-600 font-bold">طالب</span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Sections */}
        <div className="lg:col-span-2 space-y-8">
          {/* Update Info */}
          <div className="glass p-8 rounded-[2.5rem] shadow-xl shadow-gray-100 border border-gray-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                <User size={20} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                المعلومات الأساسية
              </h3>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 mr-1">
                    الاسم الكامل
                  </label>
                  <div className="relative">
                    <User
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={onProfileChange}
                      required
                      className="w-full pr-12 pl-4 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50/50 focus:border-indigo-600 focus:bg-white transition-all outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 mr-1">
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={onProfileChange}
                      required
                      className="w-full pr-12 pl-4 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50/50 focus:border-indigo-600 focus:bg-white transition-all outline-none"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex items-center gap-2 px-8 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                >
                  <Save size={18} />
                  {isUpdating ? "جاري الحفظ..." : "حفظ التغييرات"}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="glass p-8 rounded-[2.5rem] shadow-xl shadow-gray-100 border border-gray-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center text-violet-600">
                <ShieldCheck size={20} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">أمان الحساب</h3>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 mr-1">
                  كلمة المرور الحالية
                </label>
                <div className="relative">
                  <Lock
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={onPasswordChange}
                    required
                    placeholder="••••••••"
                    className="w-full pr-12 pl-12 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50/50 focus:border-violet-600 focus:bg-white transition-all outline-none"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-violet-600 transition-colors"
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 mr-1">
                    كلمة المرور الجديدة
                  </label>
                  <div className="relative">
                    <Key
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={onPasswordChange}
                      required
                      placeholder="••••••••"
                      className="w-full pr-12 pl-12 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50/50 focus:border-violet-600 focus:bg-white transition-all outline-none"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-violet-600 transition-colors"
                    >
                      {showNewPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 mr-1">
                    تأكيد كلمة المرور الجديدة
                  </label>
                  <div className="relative">
                    <Key
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type={showConfirmNewPassword ? "text" : "password"}
                      name="confirmNewPassword"
                      value={passwordData.confirmNewPassword}
                      onChange={onPasswordChange}
                      required
                      placeholder="••••••••"
                      className="w-full pr-12 pl-12 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50/50 focus:border-violet-600 focus:bg-white transition-all outline-none"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmNewPassword(!showConfirmNewPassword)
                      }
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-violet-600 transition-colors"
                    >
                      {showConfirmNewPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="flex items-center gap-2 px-8 py-3.5 bg-violet-600 text-white rounded-2xl font-bold hover:bg-violet-700 transition-all shadow-lg shadow-violet-100 disabled:opacity-50"
                >
                  <Lock size={18} />
                  {isChangingPassword ? "جاري التغيير..." : "تحديث كلمة المرور"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
