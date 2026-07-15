import { Routes, Route, Navigate } from "react-router-dom";

// Student Pages
import StudentLogin from "./pages/student/auth/Login";
import StudentSignup from "./pages/student/auth/Signup";
import StudentForgotPassword from "./pages/student/auth/ForgotPassword";
import StudentOTPVerification from "./pages/student/auth/OTPVerification";
import StudentResetPassword from "./pages/student/auth/ResetPassword";

// Instructor Pages
import InstructorSignup from "./pages/instructor/auth/Signup";
import InstructorEmailVerification from "./pages/instructor/auth/EmailVerification";
import InstructorPendingApproval from "./pages/instructor/auth/PendingApproval";
import InstructorLogin from "./pages/instructor/auth/Login";
import InstructorForgotPassword from "./pages/instructor/auth/ForgotPassword";
import InstructorOTPVerification from "./pages/instructor/auth/OTPVerification";
import InstructorResetPassword from "./pages/instructor/auth/ResetPassword";

function App() {
  return (
    <Routes>

      {/* Default Route */}
      <Route path="/" element={<Navigate to="/student/login" />} />

      {/* Student Routes */}
      <Route path="/student/login" element={<StudentLogin />} />
      <Route path="/student/signup" element={<StudentSignup />} />
      <Route path="/student/forgot-password" element={<StudentForgotPassword />} />
      <Route path="/student/otp" element={<StudentOTPVerification />} />
      <Route path="/student/reset-password" element={<StudentResetPassword />} />

      {/* Instructor Routes */}
      <Route path="/instructor/register" element={<InstructorSignup />} />
      <Route path="/instructor/email-verification" element={<InstructorEmailVerification />} />
      <Route path="/instructor/pending-approval" element={<InstructorPendingApproval />} />
      <Route path="/instructor/login" element={<InstructorLogin />} />
      <Route path="/instructor/forgot-password" element={<InstructorForgotPassword />} />
      <Route path="/instructor/otp" element={<InstructorOTPVerification />} />
      <Route path="/instructor/reset-password" element={<InstructorResetPassword />} />

    </Routes>
  );
}

export default App;