import React from "react";
import classNames from "classnames";

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
  header?: React.ReactNode;
  withShadow?: boolean;
  padded?: boolean;
}

const Card: React.FC<CardProps> = ({
  title,
  children,
  className = "",
  footer,
  header,
  withShadow = true,
  padded = true,
}) => {
  return (
    <div
      className={classNames(
        // Updated colors & style
        "bg-gradient-to-br from-white via-slate-50 to-slate-100 rounded-2xl border border-slate-200",
        withShadow &&
          "shadow-lg hover:shadow-xl transition-shadow duration-300",
        "overflow-hidden",
        className
      )}
    >
      {/* Optional Header Section */}
      {header && (
        <div className="bg-slate-100/60 px-5 py-3 border-b border-slate-200">
          {header}
        </div>
      )}

      {/* Optional Title */}
      {title && (
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 tracking-tight">
            {title}
          </h2>
        </div>
      )}

      {/* Main Content */}
      <div className={classNames(padded ? "p-5" : "p-0")}>{children}</div>

      {/* Optional Footer */}
      {footer && (
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 text-sm text-slate-600">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
