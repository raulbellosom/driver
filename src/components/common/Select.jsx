import React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../utils";

const Select = React.forwardRef(
  (
    {
      className,
      label,
      error,
      hint,
      leftIcon,
      disabled = false,
      required = false,
      size = "default",
      children,
      ...props
    },
    ref
  ) => {
    const inputId = props.id || props.name;

    // Base styles
    const baseStyles = cn(
      "flex w-full rounded-lg border transition-all duration-200 ease-in-out",
      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
      "bg-white dark:bg-gray-700 text-gray-900 dark:text-white",
      "border-gray-300 dark:border-gray-600",
      "hover:border-gray-400 dark:hover:border-gray-500",
      disabled && "opacity-50 cursor-not-allowed"
    );

    // Size variants
    const sizeStyles = {
      sm: "h-8 px-2.5 py-1 text-xs",
      default: "h-10 px-3 py-2 text-sm", // Consistente con Input
      lg: "h-12 px-4 py-3 text-base",
    };

    // Error styles
    const errorStyles = cn(
      "border-red-500 focus:border-red-500 focus:ring-red-500/20",
      "dark:border-red-400 dark:focus:border-red-400 dark:focus:ring-red-400/20"
    );

    // Icon positioning based on size
    const iconPositioning = {
      sm: { left: "left-2", padding: "pl-7" },
      default: { left: "left-3", padding: "pl-10" },
      lg: { left: "left-4", padding: "pl-12" },
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
              {React.cloneElement(leftIcon, {
                size: size === "sm" ? 14 : size === "lg" ? 20 : 16,
              })}
            </div>
          )}

          <select
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={cn(
              baseStyles,
              sizeStyles[size],
              leftIcon && iconPos.padding,
              "pr-10", // Space for chevron
              error && errorStyles,
              "appearance-none cursor-pointer",
              className
            )}
            {...props}
          >
            {children}
          </select>

          {/* Custom chevron */}
          <div
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none",
              "text-gray-500 dark:text-gray-400"
            )}
          >
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {(error || hint) && (
          <p
            className={cn(
              "text-xs",
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

Select.displayName = "Select";

export default Select;
