import React, { useState } from "react";
import { Field, ErrorMessage } from "formik";
import { Eye, EyeOff } from "lucide-react";

interface PasswordFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  hideError?: boolean;
}

const PasswordField: React.FC<PasswordFieldProps> = ({
  name,
  label = "Password",
  placeholder = "Enter your password",
  hideError = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => setShowPassword((prev) => !prev);

  return (
    <div className="mb-4">
      <label
        htmlFor={name}
        className="block text-sm font-semibold text-gray-700 mb-1"
      >
        {label}
      </label>

      <div className="relative">
        <Field
          id={name}
          name={name}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          className={`w-full px-4 py-2 pr-10 rounded-lg border 
            ${
              showPassword
                ? "border-green-400 bg-green-50"
                : "border-gray-300 bg-gray-100"
            } 
            focus:outline-none focus:ring-2 
            ${showPassword ? "focus:ring-green-500" : "focus:ring-blue-500"} 
            text-sm transition-colors`}
        />
        <button
          type="button"
          onClick={togglePassword}
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer 
            ${
              showPassword
                ? "text-green-600 hover:text-green-800"
                : "text-gray-600 hover:text-gray-800"
            } 
            transition-colors`}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {!hideError && (
        <ErrorMessage
          name={name}
          component="div"
          className="text-red-500 text-xs mt-1"
        />
      )}
    </div>
  );
};

export default PasswordField;
