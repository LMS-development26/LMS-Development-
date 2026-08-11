import { Link } from 'react-router-dom';
import { GraduationCap, User, Users, Shield } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-white flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <GraduationCap className="h-16 w-16 text-purple-600" />
          </div>
          <h1 className="text-5xl font-bold text-purple-900 mb-4">Learning Management System</h1>
          <p className="text-xl text-purple-700">Choose your role to continue</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Student Card */}
          <Link
            to="/student/login"
            className="group bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-purple-200"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-purple-200 transition-colors">
                <User className="h-10 w-10 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Student</h2>
              <p className="text-gray-600 mb-6">Access courses, assignments, and track your learning progress</p>
              <div className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold group-hover:bg-purple-700 transition-colors">
                Login as Student
              </div>
            </div>
          </Link>

          {/* Instructor Card */}
          <Link
            to="/instructor/login"
            className="group bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-purple-200"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-purple-200 transition-colors">
                <Users className="h-10 w-10 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Instructor</h2>
              <p className="text-gray-600 mb-6">Create courses, manage students, and track performance</p>
              <div className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold group-hover:bg-purple-700 transition-colors">
                Login as Instructor
              </div>
            </div>
          </Link>

          {/* Admin Card */}
          <Link
            to="/admin/login"
            className="group bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-purple-200"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-purple-200 transition-colors">
                <Shield className="h-10 w-10 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Admin</h2>
              <p className="text-gray-600 mb-6">Manage users, categories, and platform settings</p>
              <div className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold group-hover:bg-purple-700 transition-colors">
                Login as Admin
              </div>
            </div>
          </Link>
        </div>

        <div className="text-center mt-12 text-purple-700">
          <p className="text-sm">© 2024 Learning Management System. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
