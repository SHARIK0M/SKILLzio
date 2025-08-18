import { useNavigate } from "react-router-dom";
import { GraduationCap, Users } from "lucide-react";

const EnrollPage = () => {
  const navigate = useNavigate();

  // Enrollment roles config
  const roles = [
    {
      title: "Student",
      path: "/user/signUp",
      description:
        "Learn from expert mentors, gain in-demand skills, and grow your career with real-world projects.",
      icon: <GraduationCap className="w-10 h-10 text-teal-600" />,
      gradient: "from-teal-400 to-emerald-500",
      buttonColor:
        "bg-teal-600 hover:bg-teal-700 focus:ring-2 focus:ring-teal-300",
    },
    {
      title: "Instructor",
      path: "/instructor/signUp",
      description:
        "Share your expertise, create impactful courses, and inspire learners globally.",
      icon: <Users className="w-10 h-10 text-purple-600" />,
      gradient: "from-purple-400 to-fuchsia-500",
      buttonColor:
        "bg-purple-600 hover:bg-purple-700 focus:ring-2 focus:ring-purple-300",
    },
  ];

  return (
    <main className="bg-gradient-to-b from-slate-50 to-slate-100 min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="text-center py-14 px-6">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Choose Your <span className="text-teal-600">Learning Path</span>
        </h1>
        <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Whether you’re here to learn new skills or to share your knowledge,
          SKILLzio empowers you to take the next step in your journey.
        </p>
      </section>

      {/* Role Cards */}
      <section className="flex flex-col md:flex-row items-center justify-center gap-10 px-6 pb-16">
        {roles.map((role) => (
          <div
            key={role.title}
            className="relative group max-w-sm w-full rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 bg-white"
          >
            {/* Gradient Header */}
            <div
              className={`h-28 flex items-center justify-center bg-gradient-to-r ${role.gradient}`}
            >
              {role.icon}
            </div>

            {/* Content */}
            <div className="p-8 text-center space-y-4">
              <h2 className="text-2xl font-bold text-slate-800">
                Enroll as {role.title}
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                {role.description}
              </p>
              <button
                onClick={() => navigate(role.path)}
                className={`${role.buttonColor} text-white rounded-full px-6 py-3 font-semibold shadow-md transition-transform transform hover:scale-105`}
              >
                Get Started
              </button>
            </div>
          </div>
        ))}
      </section>

   
    </main>
  );
};

export default EnrollPage;
