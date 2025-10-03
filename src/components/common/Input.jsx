import React from "react";
import { cn } from "../../utils";

const Input = React.forwardRef(
  (
    {
      className,
      type = "text",
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      disabled = false,
      required = false,
      size = "default",
      variant = "default",
      ...props
    },
    ref
  ) => {
    const inputId = props.id || props.name;

    // Base styles with improved dark mode support
    const baseStyles = cn(
      // Layout and spacing
      "flex w-full rounded-lg border transition-all duration-200 ease-in-out",
      "file:border-0 file:bg-transparent file:text-sm file:font-medium",
      "placeholder:transition-colors placeholder:duration-200",
      "focus:outline-none focus:ring-2 focus:ring-offset-1",
      "disabled:cursor-not-allowed disabled:opacity-50",

      // Light mode styles
      "border-gray-300 bg-white text-gray-900",
      "placeholder:text-gray-500",
      "focus:border-primary-500 focus:ring-primary-500/20",
      "hover:border-gray-400",

      // Dark mode styles - improved text visibility
      "dark:border-gray-600 dark:bg-gray-800 dark:text-white",
      "dark:placeholder:text-gray-400",
      "dark:focus:border-primary-400 dark:focus:ring-primary-400/20",
      "dark:hover:border-gray-500",

      // Disabled styles
      "disabled:bg-gray-50 disabled:text-gray-500",
      "dark:disabled:bg-gray-800 dark:disabled:text-gray-400"
    );

    // Size variants
    const sizeStyles = {
      sm: "h-8 px-2.5 py-1 text-xs",
      default: "h-10 px-3 py-2 text-sm",
      lg: "h-12 px-4 py-3 text-base",
    };

    // Variant styles
    const variantStyles = {
      default: "",
      ghost:
        "border-transparent bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800",
      filled:
        "bg-gray-50 border-gray-200 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600",
    };

    // Error styles
    const errorStyles = cn(
      "border-red-500 focus:border-red-500 focus:ring-red-500/20",
      "dark:border-red-400 dark:focus:border-red-400 dark:focus:ring-red-400/20"
    );

    // Icon positioning based on size
    const iconPositioning = {
      sm: {
        left: "left-2",
        right: "right-2",
        padding: { left: "pl-7", right: "pr-7" },
      },
      default: {
        left: "left-3",
        right: "right-3",
        padding: { left: "pl-10", right: "pr-10" },
      },
      lg: {
        left: "left-4",
        right: "right-4",
        padding: { left: "pl-12", right: "pr-12" },
      },
    };

    const iconPos = iconPositioning[size];

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "block text-sm font-medium leading-none",
              "text-gray-900 dark:text-gray-100",
              disabled && "opacity-50"
            )}
          >
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div
              className={cn(
                "absolute top-1/2 -translate-y-1/2 pointer-events-none",
                iconPos.left,
                "text-gray-500 dark:text-gray-400",
                size === "sm"
                  ? "h-3 w-3"
                  : size === "lg"
                  ? "h-5 w-5"
                  : "h-4 w-4"
              )}
            >
              {leftIcon &&
                React.cloneElement(leftIcon, {
                  size: size === "sm" ? 14 : size === "lg" ? 20 : 16,
                })}
            </div>
          )}

          <input
            type={type}
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={cn(
              baseStyles,
              sizeStyles[size],
              variantStyles[variant],
              leftIcon && iconPos.padding.left,
              rightIcon && iconPos.padding.right,
              error && errorStyles,
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div
              className={cn(
                "absolute top-1/2 -translate-y-1/2 pointer-events-none",
                iconPos.right,
                "text-gray-500 dark:text-gray-400",
                size === "sm"
                  ? "h-3 w-3"
                  : size === "lg"
                  ? "h-5 w-5"
                  : "h-4 w-4"
              )}
            >
              {rightIcon &&
                React.cloneElement(rightIcon, {
                  size: size === "sm" ? 14 : size === "lg" ? 20 : 16,
                })}
            </div>
          )}
        </div>

        {(error || hint) && (
          <p
            className={cn(
              "text-sm leading-relaxed",
              error
                ? "text-red-600 dark:text-red-400"
                : "text-gray-600 dark:text-gray-400"
            )}
          >
            {error || hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
