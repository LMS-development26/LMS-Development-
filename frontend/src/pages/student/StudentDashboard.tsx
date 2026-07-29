import {
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  PlayCircle,
  Calendar,
} from "lucide-react";

export function StudentDashboard() {
  return (
    <div className="space-y-8">

      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, Student! 👋
        </h1>

        <p className="mt-2 text-gray-500">
          Continue your learning journey and achieve your goals.
        </p>
      </div>


      {/* Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

        {/* My Courses */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                My Courses
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                4
              </h2>
            </div>

            <div className="rounded-lg bg-purple-100 p-3">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>

          </div>
        </div>


        {/* Hours Learned */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Hours Learned
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                25
              </h2>
            </div>

            <div className="rounded-lg bg-purple-100 p-3">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>

          </div>
        </div>


        {/* Certificates */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Certificates
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                2
              </h2>
            </div>

            <div className="rounded-lg bg-purple-100 p-3">
              <Award className="h-6 w-6 text-purple-600" />
            </div>

          </div>
        </div>


        {/* Overall Progress */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Overall Progress
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                68%
              </h2>
            </div>

            <div className="rounded-lg bg-purple-100 p-3">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>

          </div>
        </div>

      </div>


      {/* Continue Learning */}
      <div>

        <div className="mb-4 flex items-center justify-between">

          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Continue Learning
            </h2>

            <p className="text-sm text-gray-500">
              Pick up where you left off
            </p>
          </div>

        </div>


        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-5 md:flex-row md:items-center">

            {/* Course Icon */}
            <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-purple-100">
              <PlayCircle className="h-10 w-10 text-purple-600" />
            </div>


            {/* Course Information */}
            <div className="flex-1">

              <p className="text-sm font-medium text-purple-600">
                Web Development
              </p>

              <h3 className="mt-1 text-lg font-bold text-gray-900">
                Complete React Developer Course
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Continue learning React and build modern applications.
              </p>


              {/* Progress */}
              <div className="mt-4">

                <div className="mb-1 flex justify-between text-xs">

                  <span className="text-gray-500">
                    Course Progress
                  </span>

                  <span className="font-medium text-purple-600">
                    65%
                  </span>

                </div>

                <div className="h-2 overflow-hidden rounded-full bg-gray-200">

                  <div
                    className="h-full rounded-full bg-purple-600"
                    style={{ width: "65%" }}
                  />

                </div>

              </div>

            </div>


            {/* Continue Button */}
            <button
              className="rounded-lg bg-purple-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-700"
            >
              Continue
            </button>

          </div>

        </div>

      </div>


      {/* Bottom Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">


        {/* Upcoming Classes */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="rounded-lg bg-purple-100 p-3">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>

            <div>
              <h2 className="font-bold text-gray-900">
                Upcoming Classes
              </h2>

              <p className="text-sm text-gray-500">
                Your scheduled learning sessions
              </p>
            </div>

          </div>


          <div className="mt-5 rounded-lg bg-gray-50 p-4">

            <p className="font-semibold text-gray-900">
              React Live Class
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Tomorrow • 10:00 AM
            </p>

          </div>

        </div>


        {/* Recent Achievement */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="rounded-lg bg-purple-100 p-3">
              <Award className="h-5 w-5 text-purple-600" />
            </div>

            <div>
              <h2 className="font-bold text-gray-900">
                Recent Achievement
              </h2>

              <p className="text-sm text-gray-500">
                Your latest learning achievement
              </p>
            </div>

          </div>


          <div className="mt-5 rounded-lg bg-gray-50 p-4">

            <p className="font-semibold text-gray-900">
              JavaScript Fundamentals
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Course completed successfully 🎉
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}