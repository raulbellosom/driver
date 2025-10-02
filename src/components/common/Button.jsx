import React from "react";
import { cn } from "../../utils";

const Button = React.forwardRef(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled = false,
      children,
      as: Component = "button",
      asChild, // Capturar y filtrar asChild
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
      primary:
        "bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500 shadow-sm dark:bg-green-600 dark:hover:bg-green-700",
      secondary:
        "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 focus-visible:ring-green-500 shadow-sm dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-700",
      outline:
        "border border-green-600 text-green-600 hover:bg-green-50 focus-visible:ring-green-500 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-950/20",
      ghost:
        "text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-500 dark:text-gray-300 dark:hover:bg-gray-800",
      success:
        "bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500 shadow-sm",
      warning:
        "bg-yellow-600 text-white hover:bg-yellow-700 focus-visible:ring-yellow-500 shadow-sm",
      danger:
        "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 shadow-sm",
    };

    const sizes = {
      xs: "h-7 px-2 text-xs",
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base",
      xl: "h-14 px-8 text-lg",
    };

    const isDisabled = disabled || loading;

    return (
      <Component
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </Component>
    );
  }
);

Button.displayName = "Button";

export default Button;
