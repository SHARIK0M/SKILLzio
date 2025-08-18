import Banner from "../components/Banner";
import First from '../assets/course-1.png'
 
const LandingPage = () => {
  return (
    <div className="font-sans bg-gradient-to-b from-white via-slate-50 to-slate-100 min-h-screen">
      {/* Hero Banner */}
      <Banner />

      {/* Intro Section */}
      <main className="mt-20 px-6 max-w-6xl mx-auto text-center relative pb-[60px]">
        {/* Background Glow */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-radial from-[#49BBBD]/20 to-transparent opacity-30 -z-10" />

        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-slate-900 leading-snug">
          Learn Smarter with <span className="text-[#49BBBD]">SKILLzio</span>
        </h1>

        <p className="text-xl md:text-2xl text-slate-700 max-w-3xl mx-auto mb-10 leading-relaxed">
          Interactive courses, expert mentorship, and real-world projects — all
          designed to help you unlock your true potential in tech.
        </p>

        <div className="flex justify-center gap-5 flex-wrap">
          <button
            onClick={() => (window.location.href = "/courses")}
            className="bg-[#49BBBD] hover:bg-[#3aa7aa] text-white font-semibold py-3 px-8 rounded-xl shadow-lg transition duration-300"
          >
            Explore Courses
          </button>
          <button
            onClick={() => (window.location.href = "/user/login")}
            className="border-2 border-[#49BBBD] text-[#49BBBD] hover:bg-[#49BBBD] hover:text-white font-semibold py-3 px-8 rounded-xl shadow-lg transition duration-300"
          >
            Join as Student
          </button>
        </div>

        {/* Highlights Section */}
        <section className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {[
            {
              title: "Live Interactive Workshops",
              desc: "Hands-on coding in real-time with expert mentors guiding you step by step.",
            },
            {
              title: "Personalized Mentorship",
              desc: "One-on-one guidance to overcome roadblocks and accelerate your learning.",
            },
            {
              title: "Real-World Projects",
              desc: "Build portfolio-ready projects to showcase your skills to future employers.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-6 bg-white rounded-xl shadow-md border border-slate-200 hover:shadow-xl transition"
            >
              <h3 className="text-xl font-semibold mb-2 text-slate-900">
                {item.title}
              </h3>
              <p className="text-slate-600">{item.desc}</p>
            </div>
          ))}
        </section>
      </main>

      {/* Popular Courses */}
      <section className="mt-28 px-6 max-w-6xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-6 text-slate-900">
          Popular <span className="text-[#49BBBD]">Courses</span>
        </h2>
        <p className="text-lg text-slate-600 mb-12 max-w-3xl mx-auto">
          Explore top-rated courses designed by industry experts to keep you
          ahead.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((course) => (
            <div
              key={course}
              className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden hover:shadow-xl transition"
            >
              <img
                src={First}
                alt="Course Thumbnail"
                className="w-full h-48 object-cover"
              />
              <div className="p-6 text-left">
                <h3 className="text-xl font-semibold text-slate-900">
                  Course Title {course}
                </h3>
                <p className="text-slate-600 text-sm mt-2 mb-4">
                  Short course description goes here. Learn skills that matter.
                </p>
                <button className="bg-[#49BBBD] text-white px-5 py-2 rounded-lg hover:bg-[#3aa7aa] transition">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Instructor Call-to-Action */}
      <section className="mt-28 px-6 max-w-6xl mx-auto text-center py-16 bg-gradient-to-r from-[#49BBBD]/10 via-white to-[#49BBBD]/10 rounded-3xl shadow-inner mb-5">
        <h2 className="text-4xl font-bold mb-4 text-slate-900">
          Share Your Knowledge, Inspire Students
        </h2>
        <p className="text-lg text-slate-700 max-w-2xl mx-auto mb-8">
          Become an instructor at SKILLzio and help learners around the world
          achieve their goals.
        </p>
        <button
          onClick={() => (window.location.href = "/instructor/signUp")}
          className="bg-[#49BBBD] hover:bg-[#3aa7aa] text-white font-semibold py-3 px-10 rounded-xl shadow-lg transition"
        >
          Become an Instructor
        </button>
      </section>
    </div>
  );
};

export default LandingPage;
  