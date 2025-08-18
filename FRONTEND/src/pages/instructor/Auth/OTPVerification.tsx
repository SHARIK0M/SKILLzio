import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { resendOtp, verifyOtp } from "../../../api/auth/InstructorAuthentication";
import otpImage from '../../../assets/otp.jpg';

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
    setCounter(60);

    const email = localStorage.getItem("email");
    if (email) {
      const response = await resendOtp(email);
      if (response.success) {
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    } else {
      toast.error("Validation Token expired! Redirecting...");
      navigate("/instructor/verifyOtp");
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
          navigate("/instructor/login");
        }, 1000);
      } else {
        toast.error(response.message);
      }
    } else {
      toast.error("Please enter the complete OTP");
    }
  };

return (
  <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:p-4 bg-gray-100">
    <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden border flex flex-col md:flex-row">
      {/* Left side - Form */}
      <div className="w-full md:w-1/2 p-8">
        {/* Brand */}
        <h1 className="text-3xl font-bold text-purple-900 tracking-wide select-none mb-8">
          SKILLzio
        </h1>

        {/* Heading */}
        <h2 className="text-2xl font-semibold text-gray-900">
          Verify Your Email Address
        </h2>
        <p className="text-gray-600 mt-2 text-sm">
          We’ve sent a verification code to your email. Please enter it below.
        </p>

        {/* OTP Inputs */}
        <div className="flex space-x-3 mt-6 justify-center">
          {otp.map((value, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              value={value}
              id={`otpInput-${index}`}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onChange={(e) => handleChange(e, index)}
              className="bg-gray-100 rounded-md w-12 h-12 border border-gray-300 
                         focus:border-purple-600 focus:ring-2 focus:ring-purple-400 
                         text-center text-lg font-medium transition-colors"
              autoComplete="one-time-code"
              inputMode="numeric"
            />
          ))}
        </div>

        {/* Submit Button */}
        {counter > 0 && (
          <button
            onClick={handleSubmit}
            className="w-full mt-6 py-3 bg-purple-700 text-white rounded-lg font-semibold 
                       hover:bg-purple-800 transition-colors"
            type="button"
          >
            Continue
          </button>
        )}

        {/* Resend Link */}
        <div className="text-center mt-4 text-sm text-gray-700">
          {resendActive ? (
            <button
              onClick={handleResend}
              className="text-purple-700 font-semibold hover:underline focus:outline-none"
              type="button"
            >
              Resend OTP
            </button>
          ) : (
            <span>
              Resend OTP in <span className="text-purple-700">{counter}s</span>
            </span>
          )}
        </div>
      </div>

      {/* Right side - Image */}
      <div
        className="hidden md:flex w-1/2 bg-gradient-to-br from-purple-100 to-purple-200 
                      items-center justify-center p-6"
      >
        <img
          src={otpImage}
          alt="OTP Illustration"
          className="max-w-xs rounded-xl shadow-md"
          draggable={false}
        />
      </div>
    </div>
  </div>
);


};

export default OTPVerification;
