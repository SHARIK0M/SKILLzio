import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { verifyEmail, verifyResetOtp } from '../../../api/auth/UserAuthentication';

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
    setOtp(Array(4).fill("")); // reset OTP input

    const email = localStorage.getItem("ForgotPassEmail") || "";
    const response = await verifyEmail(email);
    if (response.success) {
      toast.success(response.message);
    } else {
      toast.error(response.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (!/^\d?$/.test(value)) return; // only digits

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
    if (OTP.length !== 4 || otp.some((digit) => digit === '')) {
      toast.error("Please enter the full OTP!");
      return;
    }

    const email = localStorage.getItem("ForgotPassEmail") || "";
    const response = await verifyResetOtp(email, OTP);
    if (response.success) {
      toast.success(response.message);
      navigate('/user/resetPassword');
    } else {
      toast.error(response.message);
    }
  };
return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-cyan-50 px-6 py-10">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-10 border border-teal-100">
      {/* Logo */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-[#49BBBD] tracking-wide">
          <span className="text-gray-800">Skill</span>zio
        </h1>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-1">
          Verify Your Email
        </h2>
        <p className="text-sm text-gray-500">
          Please enter the 4-digit OTP sent to your email address.
        </p>
      </div>

      {/* OTP Input */}
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
            className="w-14 h-14 sm:w-16 sm:h-16 text-center text-2xl font-semibold text-gray-800 border border-[#49BBBD] rounded-lg focus:outline-none focus:ring-4 focus:ring-[#49BBBD]/40 bg-teal-50 shadow-sm"
          />
        ))}
      </div>

      {/* Conditional Button */}
      {!resendActive ? (
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full py-3 bg-[#49BBBD] text-white text-lg font-semibold rounded-xl shadow-lg hover:bg-[#3aa4a7] transition duration-300"
        >
          Continue
        </button>
      ) : (
        <button
          onClick={handleResend}
          className="w-full py-3 border-2 border-[#49BBBD] text-[#49BBBD] font-semibold rounded-xl hover:bg-teal-50 transition duration-300"
        >
          Resend OTP
        </button>
      )}

      {/* Timer / Info */}
      <div className="text-center mt-5 text-sm text-gray-500">
        {resendActive ? (
          <p>Didn't receive the code? Click above to resend.</p>
        ) : (
          <span>
            Resend in <strong>{counter}</strong> seconds
          </span>
        )}
      </div>
    </div>
  </div>
);


};

export default ResetVerificationOTP;
