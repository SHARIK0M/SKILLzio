import React, { useState } from "react";
import { Field, ErrorMessage } from "formik";
import { Eye, EyeOff } from "lucide-react";

interface InputFieldProps {
  type?: string;
  placeholder?: string;
  name: string;
  label: string;
  disabled?: boolean;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  useFormik?: boolean; // default true
}

const InputField: React.FC<InputFieldProps> = ({
  type = "text",
  placeholder = "",
  name,
  label,
  disabled = false,
  value,
  onChange,
  useFormik = true,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  const inputBaseStyles =
    "w-full px-3 sm:px-5 py-2 sm:py-3 rounded-lg font-medium text-slate-800 text-xs sm:text-sm border border-slate-300 bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed";

  return (
    <div className="w-full">
      <label
        htmlFor={name}
        className="block text-slate-700 text-xs sm:text-sm font-semibold mb-1"
      >
        {label.toUpperCase()}
      </label>

      <div className="relative flex flex-col">
        {useFormik ? (
          <Field
            className={`${inputBaseStyles} ${
              type === "number" ? "no-arrows" : ""
            }`}
            type={isPassword ? (showPassword ? "text" : "password") : type}
            placeholder={placeholder}
            id={name}
            name={name}
            disabled={disabled}
          />
        ) : (
          <input
            className={`${inputBaseStyles} ${
              type === "number" ? "no-arrows" : ""
            }`}
            type={type}
            placeholder={placeholder}
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        )}

        {isPassword && (
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-2/4 right-3 transform -translate-y-1/2 cursor-pointer text-slate-500 hover:text-slate-700 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </span>
        )}
      </div>

      {useFormik && (
        <ErrorMessage
          className="text-xs sm:text-sm font-semibold text-red-500 mt-1 ml-2 sm:ml-3"
          name={name}
          component="span"
        />
      )}
    </div>
  );
};

export default InputField;
