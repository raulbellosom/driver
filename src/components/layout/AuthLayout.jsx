import React from "react";
import { Outlet } from "react-router-dom";
import ThemeSelector from "../common/ThemeSelector";

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header with theme selector */}
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center space-x-2">
          <img
            src="/logo.png"
            alt="DriverPro"
            className="h-8 w-8"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            DriverPro
          </span>
        </div>

        <ThemeSelector />
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Outlet />
        </div>
      </div>

      {/* Footer */}
      <div className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>
          &copy; 2025 DriverPro by Racoon Devs. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
