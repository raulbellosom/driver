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
      {/* Simple toggle button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className="p-2 h-9 w-9"
        title={`Tema actual: ${
          themes.find((t) => t.value === theme)?.label || "Claro"
        }`}
      >
        <Icon className="h-4 w-4" />
      </Button>

      {/* TODO: Implementar dropdown para selección específica */}
      {/* Para ahora, solo el toggle simple que cicla entre los temas */}
    </div>
  );
};

export default ThemeSelector;
