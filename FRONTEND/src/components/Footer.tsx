import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Branding & Description */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-[#49BBBD] tracking-wide">
            SKILLzio
          </h2>
          <p className="text-sm text-gray-300 leading-relaxed">
            Explore our wide range of tech courses guided by expert instructors.
            Whether you're a beginner or looking to upskill, SKILLzio has you
            covered.
          </p>
          <div className="flex space-x-4 mt-4">
            <a href="#" className="hover:text-[#49BBBD] transition-colors">
              <FaFacebookF />
            </a>
            <a href="#" className="hover:text-[#49BBBD] transition-colors">
              <FaTwitter />
            </a>
            <a href="#" className="hover:text-[#49BBBD] transition-colors">
              <FaLinkedinIn />
            </a>
            <a href="#" className="hover:text-[#49BBBD] transition-colors">
              <FaInstagram />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-200">
            Quick Links
          </h3>
          <ul className="space-y-2 text-gray-400">
            <li>
              <a href="/" className="hover:text-[#49BBBD] transition-colors">
                Home
              </a>
            </li>
            <li>
              <a
                href="/courses"
                className="hover:text-[#49BBBD] transition-colors"
              >
                Courses
              </a>
            </li>
            <li>
              <a
                href="/instructors"
                className="hover:text-[#49BBBD] transition-colors"
              >
                Instructors
              </a>
            </li>
            <li>
              <a
                href="/about"
                className="hover:text-[#49BBBD] transition-colors"
              >
                About Us
              </a>
            </li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-200">
            Resources
          </h3>
          <ul className="space-y-2 text-gray-400">
            <li>
              <a href="/faq" className="hover:text-[#49BBBD] transition-colors">
                FAQ
              </a>
            </li>
            <li>
              <a
                href="/blog"
                className="hover:text-[#49BBBD] transition-colors"
              >
                Blog
              </a>
            </li>
            <li>
              <a
                href="/support"
                className="hover:text-[#49BBBD] transition-colors"
              >
                Support
              </a>
            </li>
            <li>
              <a
                href="/contact"
                className="hover:text-[#49BBBD] transition-colors"
              >
                Contact
              </a>
            </li>
          </ul>
        </div>

        {/* Email Box */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-200">
            Contact Us
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Enter your email and we’ll get back to you shortly.
          </p>
          <form className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="Your email"
              className="px-4 py-2 rounded-xl w-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#49BBBD]"
            />
            <button
              type="submit"
              className="bg-[#49BBBD] hover:bg-teal-500 text-white px-5 py-2 rounded-xl font-semibold transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-800 mt-12 pt-6 text-center text-gray-400 text-sm">
        © {new Date().getFullYear()} SKILLzio. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
