import React from "react";
import classNames from "classnames";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  className,
  ...props
}) => {
  const baseClass =
    "px-5 py-2.5 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variantClass =
    variant === "primary"
      ? "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500"
      : "bg-slate-100 text-slate-800 hover:bg-slate-200 focus:ring-slate-400";

  return (
    <button
      className={classNames(baseClass, variantClass, className)}
      {...props}
    >
      {children}
    </button>
  );
};
