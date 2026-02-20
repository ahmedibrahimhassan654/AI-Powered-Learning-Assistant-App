import { Navigate, Outlet } from "react-router-dom";
import Loading from "../common/Loading";
import AppLayout from "../layout/AppLayout";

const ProtectedRoute = () => {
  // In a real app, you would check for a token in localStorage or a global state
  const isAuth = localStorage.getItem("token") || true; // Using true for now as per user's App.jsx state
  const loading = false;

  if (loading) {
    return <Loading />;
  }

  return isAuth ? (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ) : (
    <Navigate to="/login" replace />
  );
};

export default ProtectedRoute;
