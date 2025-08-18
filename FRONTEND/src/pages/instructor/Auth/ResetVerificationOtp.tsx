import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { instructorVerifyResetOtp, instructorForgotResendOtp } from '../../../api/auth/InstructorAuthentication';

const ResetVerificationOTP = () => {
  const [otp, setOtp] = useState<string[]>(Array(4).fill(''));
  const [counter, setCounter] = useState<number>(60);
  const [resendActive, setResendActive] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (counter > 0) {
      const timer = setInterval(() => {
        setCounter(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setResendActive(true);
    }
  }, [counter]);

  const handleResend = async () => {
    setResendActive(false);
    setCounter(60);
    const email = localStorage.getItem("ForgotPassEmail") || "";
    const response = await instructorForgotResendOtp(email);
    if (response.success) {
      toast.success(response.message);
    } else {
      toast.error(response.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otpInput-${index - 1}`)?.focus();
    }
  };

  const handleSubmit = async () => {
    const OTP = otp.join('');
    if (OTP.length !== 4) {
      toast.error("Please enter the full OTP!");
      return;
    }

    const email = localStorage.getItem("ForgotPassEmail") || "";
    const response = await instructorVerifyResetOtp(email, OTP);
    if (response.success) {
      toast.success(response.message);
      navigate('/instructor/resetPassword');
    } else {
      toast.error(response.message);
    }
  };
return (
  <div
    className="min-h-screen flex items-center justify-center px-4"
    
  >
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 sm:p-10 border border-purple-300">
      {/* Logo */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-purple-900 tracking-tight">
          <span className="text-pink-500">Skill</span>zio
        </h1>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-purple-900">
          Verify Your Email
        </h2>
        <p className="text-sm text-purple-700 mt-2">
          Please enter the 4-digit OTP sent to your email address.
        </p>
      </div>

      {/* OTP Inputs */}
      <div className="flex justify-center gap-4 mb-8">
        {otp.map((value, index) => (
          <input
            key={index}
            id={`otpInput-${index}`}
            type="text"
            maxLength={1}
            value={value}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className="w-14 h-14 text-center text-2xl font-semibold text-purple-900 border border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-pink-300 bg-purple-50"
          />
        ))}
      </div>

      {/* Submit Button (hidden after timeout) */}
      {counter > 0 && (
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full py-3 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-700 text-white text-lg font-semibold rounded-xl shadow-lg hover:brightness-110 transition"
        >
          Continue
        </button>
      )}

      {/* Resend Link / Timer */}
      <div className="text-center mt-6 text-sm">
        {resendActive ? (
          <button
            onClick={handleResend}
            className="text-pink-500 font-semibold hover:underline"
          >
            Resend OTP
          </button>
        ) : (
          <span className="text-purple-700">Resend in {counter} seconds</span>
        )}
      </div>
    </div>
  </div>
);


};

export default ResetVerificationOTP;
