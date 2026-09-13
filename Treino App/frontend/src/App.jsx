import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./api/AuthContext";
import PublicLayout from "./components/PublicLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import InterestFormPage from "./pages/InterestFormPage";
import CheckoutPage from "./pages/CheckoutPage";
import Onboarding from "./pages/student/Onboarding";

import StudentLayout from "./pages/student/StudentLayout";
import Dashboard from "./pages/student/Dashboard";
import MyWorkout from "./pages/student/MyWorkout";
import Progress from "./pages/student/Progress";
import Goals from "./pages/student/Goals";
import Checkin from "./pages/student/Checkin";
import Nutrition from "./pages/student/Nutrition";
import Feedback from "./pages/student/Feedback";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import AdminFeedback from "./pages/admin/AdminFeedback";
import AdminFoodRequests from "./pages/admin/AdminFoodRequests";
import AdminStudentDetail from "./pages/admin/AdminStudentDetail";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Público */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/planos" element={<LandingPage />} />
          <Route path="/quero-saber-mais" element={<InterestFormPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
        </Route>

        {/* Área do aluno */}
        <Route
          path="/app"
          element={
            <ProtectedRoute role="STUDENT">
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="cadastro-inicial" element={<Onboarding />} />
          <Route path="treino" element={<MyWorkout />} />
          <Route path="evolucao" element={<Progress />} />
          <Route path="alimentacao" element={<Nutrition />} />
          <Route path="metas" element={<Goals />} />
          <Route path="checkin" element={<Checkin />} />
          <Route path="feedback" element={<Feedback />} />
        </Route>

        {/* Painel admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="alunos" element={<AdminStudents />} />
          <Route path="alunos/:id" element={<AdminStudentDetail />} />
          <Route path="assinaturas" element={<AdminSubscriptions />} />
          <Route path="pagamentos" element={<AdminPayments />} />
          <Route path="feedbacks" element={<AdminFeedback />} />
          <Route path="alimentos" element={<AdminFoodRequests />} />
          <Route path="cupons" element={<AdminCoupons />} />
        </Route>

        <Route path="*" element={<LandingPage />} />
      </Routes>
    </AuthProvider>
  );
}
