import bannerImg from "../assets/banner.jpg";

const Banner = () => {
return (
  <section className="relative w-full aspect-[15/7] overflow-hidden shadow-2xl select-none">
    {/* Background image with soft zoom */}
    <img
      src={bannerImg}
      alt="SKILLzio Banner"
      className="w-full h-full object-cover brightness-75 transition-transform duration-[1400ms] ease-in-out hover:scale-105"
    />

    {/* Center content (no overlay now) */}
    <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-8 max-w-4xl mx-auto">
      <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight drop-shadow-xl">
        Learn, Grow &{" "}
        <span className="bg-gradient-to-r from-[#49BBBD] via-[#6fd4d5] to-[#9becec] bg-clip-text text-transparent">
          Succeed
        </span>{" "}
        <br />
        Anytime, Anywhere
      </h1>

      <p className="mt-5 max-w-lg text-[#dff8f8] text-lg md:text-xl tracking-wide drop-shadow-md">
        Unlock your career potential with hands-on courses, real-world projects,
        and expert mentorship.
      </p>

      {/* CTA Buttons */}
      <div className="mt-10 flex flex-col sm:flex-row gap-5">
        <button
          onClick={() => (window.location.href = "/courses")}
          className="px-10 py-3 rounded-full bg-[#49BBBD] text-white font-semibold shadow-lg hover:shadow-xl hover:bg-[#3aa7aa] transition duration-300"
        >
          Explore Courses
        </button>

        <button
          onClick={() => (window.location.href = "/instructor/signUp")}
          className="px-10 py-3 rounded-full border-2 border-[#49BBBD] text-[#49BBBD] font-semibold hover:bg-[#49BBBD] hover:text-white transition duration-300"
        >
          Become an Instructor
        </button>
      </div>
    </div>

    {/* Wavy bottom divider */}
    <svg
      className="absolute bottom-0 left-0 w-full"
      viewBox="0 0 1440 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <path
        d="M0 100C360 130 720 40 1080 100C1260 130 1440 70 1440 70V140H0V100Z"
        fill="url(#brandWave)"
        className="animate-wavePulse"
      />
      <defs>
        <linearGradient
          id="brandWave"
          x1="0"
          y1="0"
          x2="1440"
          y2="140"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#49BBBD" />
          <stop offset="1" stopColor="#3aa7aa" />
        </linearGradient>
      </defs>
    </svg>

    {/* Wave Animation */}
    <style>
      {`
        @keyframes wavePulse {
          0%, 100% { opacity: 0.75; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-4px); }
        }
        .animate-wavePulse {
          animation: wavePulse 6s ease-in-out infinite;
        }
      `}
    </style>
  </section>
);


};

export default Banner;
