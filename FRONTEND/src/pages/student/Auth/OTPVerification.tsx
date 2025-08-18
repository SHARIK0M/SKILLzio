import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { resendOtp, verifyOtp } from "../../../api/auth/UserAuthentication";
import otpImage from "../../../assets/otp.jpg";

const OTPVerification = () => {
  const [otp, setOtp] = useState<string[]>(Array(4).fill(""));
  const [counter, setCounter] = useState<number>(60);
  const [resendActive, setResendActive] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (counter > 0) {
      timer = setInterval(() => {
        setCounter((prev) => prev - 1);
      }, 1000);
    } else {
      setResendActive(true);
    }

    return () => clearInterval(timer);
  }, [counter]);

  const handleResend = async () => {
    setResendActive(false);
    setCounter(60); // Reset timer

    const email = localStorage.getItem("email");
    if (email) {
      const response = await resendOtp(email);
      if (response.success) {
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    } else {
      toast.error("Validation token expired! Redirecting...");
      navigate("/user/verifyOtp");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value;
    const newOTP = [...otp];
    newOTP[index] = value;
    setOtp(newOTP);

    if (value && index < otp.length - 1) {
      document.getElementById(`otpInput-${index + 1}`)?.focus();
    } else if (!value && index > 0) {
      document.getElementById(`otpInput-${index - 1}`)?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otpInput-${index - 1}`)?.focus();
    }
  };

  const handleSubmit = async () => {
    const OTP = otp.join("");
    if (OTP.length === 4) {
      const response = await verifyOtp(OTP);
      if (response.success) {
        toast.success(response.message);
        localStorage.removeItem("verificationToken");
        localStorage.removeItem("email");
        setTimeout(() => {
          navigate("/user/login");
        }, 1000);
      } else {
        toast.error(response.message);
      }
    } else {
      toast.error("Please enter the complete OTP");
    }
  };

return (
  <div className="min-h-screen bg-[#e6f8f8] flex items-center justify-center px-6 py-10 sm:p-6">
    <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl overflow-hidden border border-[#49BBBD]/30 flex flex-col md:flex-row">
      {/* Left side - Form */}
      <div className="w-full md:w-1/2 p-8 sm:p-12">
        {/* Brand */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-[#49BBBD] tracking-wide">
            SKILLzio
          </h1>
        </div>

        {/* Heading */}
        <h2 className="text-3xl font-semibold text-gray-900">
          Verify Your Email Address
        </h2>
        <p className="text-gray-700 mt-3 text-base leading-relaxed">
          We’ve sent a verification OTP to your email. Enter the code below to
          continue.
        </p>

        {/* OTP Inputs */}
        <div className="flex space-x-4 mt-8 justify-center">
          {otp.map((value, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              value={value}
              id={`otpInput-${index}`}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onChange={(e) => handleChange(e, index)}
              className="bg-[#dff7f7] rounded-lg w-14 h-14 border border-[#49BBBD]/50 focus:border-[#49BBBD] focus:ring-2 focus:ring-[#49BBBD]/70 text-center text-xl font-semibold text-[#49BBBD] shadow-sm transition"
            />
          ))}
        </div>

        {/* Submit Button - Hide after 60s */}
        {!resendActive && (
          <div className="mt-8">
            <button
              onClick={handleSubmit}
              className="w-full py-3 bg-[#49BBBD] text-white rounded-xl font-semibold hover:bg-[#3aa5a7] transition-colors shadow-md"
            >
              Continue
            </button>
          </div>
        )}

        {/* Resend Link */}
        <div className="text-center mt-5 text-sm text-gray-600">
          {resendActive ? (
            <button
              onClick={handleResend}
              className="text-[#49BBBD] font-semibold hover:text-[#3aa5a7] hover:underline transition-colors"
            >
              Resend OTP
            </button>
          ) : (
            <span>
              Resend OTP in{" "}
              <span className="text-[#49BBBD] font-semibold">{counter}s</span>
            </span>
          )}
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden md:flex w-1/2 bg-[#f0fbfb] items-center justify-center p-8">
        <img
          src={otpImage}
          alt="Illustration"
          className="max-w-xs rounded-2xl shadow-lg"
        />
      </div>
    </div>
  </div>
);


};

export default OTPVerification;
