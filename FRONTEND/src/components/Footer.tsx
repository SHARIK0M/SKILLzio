import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-10">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Branding */}
        <div>
          <h2 className="text-2xl font-bold text-[#49BBBD]">SKILLzio</h2>
          <p className="text-sm text-gray-400 mt-2">
            Learn. Grow. Excel. Expert-led courses for your career success.
          </p>
          <div className="flex space-x-3 mt-4">
            {[FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram].map(
              (Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="hover:text-[#49BBBD] transition-colors"
                >
                  <Icon />
                </a>
              )
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold mb-3">Links</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>
              <a href="/" className="hover:text-[#49BBBD]">
                Home
              </a>
            </li>
            <li>
              <a href="/courses" className="hover:text-[#49BBBD]">
                Courses
              </a>
            </li>
            <li>
              <a href="/instructors" className="hover:text-[#49BBBD]">
                Instructors
              </a>
            </li>
            <li>
              <a href="/about" className="hover:text-[#49BBBD]">
                About
              </a>
            </li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h3 className="font-semibold mb-3">Resources</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>
              <a href="/faq" className="hover:text-[#49BBBD]">
                FAQ
              </a>
            </li>
            <li>
              <a href="/blog" className="hover:text-[#49BBBD]">
                Blog
              </a>
            </li>
            <li>
              <a href="/support" className="hover:text-[#49BBBD]">
                Support
              </a>
            </li>
            <li>
              <a href="/contact" className="hover:text-[#49BBBD]">
                Contact
              </a>
            </li>
          </ul>
        </div>

        {/* Email Box */}
        <div>
          <h3 className="font-semibold mb-3">Stay in Touch</h3>
          <form className="flex gap-2">
            <input
              type="email"
              placeholder="Email"
              className="px-3 py-2 rounded-lg w-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#49BBBD]"
            />
            <button
              type="submit"
              className="bg-[#49BBBD] hover:bg-teal-500 text-white px-4 rounded-lg font-semibold"
            >
              ➤
            </button>
          </form>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-gray-800 mt-8 pt-4 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} SKILLzio. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
