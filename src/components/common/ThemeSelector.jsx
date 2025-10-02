import React from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import Button from "./Button";

const ThemeSelector = ({ className = "" }) => {
  const { theme, toggleTheme, setTheme } = useTheme();

  const themes = [
    { value: "light", icon: Sun, label: "Claro" },
    { value: "dark", icon: Moon, label: "Oscuro" },
    { value: "system", icon: Monitor, label: "Sistema" },
  ];

  const getCurrentIcon = () => {
    const currentTheme = themes.find((t) => t.value === theme);
    return currentTheme ? currentTheme.icon : Sun;
  };

  const Icon = getCurrentIcon();

  return (
    <div className={`relative ${className}`}>
      {/* Enhanced theme toggle button with color */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className={`
          p-2 h-9 w-9 transition-all duration-200 hover:scale-105
          ${
            theme === "light"
              ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20"
              : theme === "dark"
              ? "text-blue-400 hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              : "text-purple-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
          }
        `}
        title={`Tema actual: ${
          themes.find((t) => t.value === theme)?.label || "Claro"
        }. Clic para cambiar`}
      >
        <Icon
          className={`
          h-4 w-4 transition-transform duration-200
          ${
            theme === "light"
              ? "rotate-0"
              : theme === "dark"
              ? "rotate-180"
              : "rotate-90"
          }
        `}
        />
      </Button>
    </div>
  );
};

export default ThemeSelector;
