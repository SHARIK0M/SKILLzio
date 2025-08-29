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
        // Dark instructor theme
        "bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl border border-gray-700/30 rounded-3xl text-white",
        withShadow &&
          "shadow-2xl hover:shadow-3xl transition-shadow duration-300",
        "overflow-hidden",
        className
      )}
    >
      {/* Optional Header Section */}
      {header && (
        <div className="bg-gray-800/60 px-6 py-4 border-b border-gray-700/30">
          {header}
        </div>
      )}

      {/* Optional Title */}
      {title && (
        <div className="px-6 py-4 border-b border-gray-700/30">
          <h2 className="text-2xl font-bold text-gray-400 tracking-tight">
            {title}
          </h2>
        </div>
      )}

      {/* Main Content */}
      <div className={classNames(padded ? "p-6" : "p-0")}>{children}</div>

      {/* Optional Footer */}
      {footer && (
        <div className="bg-gray-800/60 px-6 py-4 border-t border-gray-700/30 text-sm text-gray-300">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
