import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPages from "./pages/auth/LoginPages";
import RegisterPage from "./pages/auth/RegisterPage";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import NotFoundPage from "./pages/NotFound/NotFoundPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Loading from "./components/common/Loading";

const App = () => {
  const isAuth = !!localStorage.getItem("token"); // Sync with actual auth state
  const loading = false;

  if (loading) {
    return <Loading />;
  }

  return (
    <div dir="rtl" className="min-h-screen font-display">
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              isAuth ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="/login" element={<LoginPages />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/flashcards" element={<FlashCardsList />} />
            <Route path="/flashcards/:id" element={<FlashCardPage />} />
            <Route path="/quizzes" element={<QuizzesList />} />
            <Route path="/quizzes/:id" element={<QuizPage />} />
            <Route path="/documents" element={<DocumentsList />} />
            <Route path="/documents/:id" element={<DocumentPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
