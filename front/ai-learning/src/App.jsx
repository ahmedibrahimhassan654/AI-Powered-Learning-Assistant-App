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
import { Toaster } from "react-hot-toast";

// Import missing pages
import FlashCardsList from "./pages/FlashCards/FlashCardsList";
import FlashCardPage from "./pages/FlashCards/FlashCardPage";
import QuizzesList from "./pages/Quizzes/QuizzesList";
import QuizPage from "./pages/Quizzes/QuizPage";
import DocumentsList from "./pages/Documents/DocumentListPage";
import DocumentPage from "./pages/Documents/DocumentDetailPage";
import ProfilePage from "./pages/Profile/ProfilePage";
import HomePage from "./pages/Home/HomePage";

const App = () => {
  return (
    <div dir="rtl" className="min-h-screen font-display">
      <Toaster position="top-center" reverseOrder={false} />
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
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
