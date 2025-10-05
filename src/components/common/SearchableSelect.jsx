import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Check, ChevronDown } from "lucide-react";

const SearchableSelect = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Buscar o crear...",
  leftIcon,
  onCreateNew,
  createLabel = "Crear",
  useModal = false,
  required = false,
  error,
  disabled = false,
  loading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [displayValue, setDisplayValue] = useState("");
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Actualizar display value cuando cambie el value seleccionado
  useEffect(() => {
    if (value) {
      const selectedOption = options.find((option) => option.value === value);
      if (selectedOption) {
        setDisplayValue(selectedOption.label);
        setSearchTerm(selectedOption.label);
      } else {
        // Si no encuentra la opción, mostrar el value como fallback
        setDisplayValue(value);
        setSearchTerm(value);
      }
    } else {
      setDisplayValue("");
      setSearchTerm("");
    }
  }, [value, options]);

  // Filtrar opciones basado en búsqueda
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Verificar si el término de búsqueda coincide exactamente con alguna opción
  const exactMatch = options.find(
    (option) => option.label.toLowerCase() === searchTerm.toLowerCase()
  );

  // Mostrar opción "Crear nuevo" si hay texto y no hay coincidencia exacta
  const showCreateOption = searchTerm.trim() && !exactMatch && onCreateNew;

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        // Restaurar valor si no se seleccionó nada
        if (!value) {
          setSearchTerm("");
          setDisplayValue("");
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setDisplayValue(newValue);
    setIsOpen(true);

    // Si se borra el input, limpiar selección
    if (!newValue) {
      onChange("");
    }
  };

  const handleOptionSelect = (option) => {
    setSearchTerm(option.label);
    setDisplayValue(option.label);
    onChange(option.value);
    setIsOpen(false);
  };

  const handleCreateNew = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (onCreateNew && searchTerm.trim()) {
      onCreateNew(searchTerm.trim());
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && showCreateOption && filteredOptions.length === 0) {
      e.preventDefault();
      handleCreateNew();
    } else if (e.key === "Enter" && filteredOptions.length === 1) {
      e.preventDefault();
      handleOptionSelect(filteredOptions[0]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="space-y-1" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={inputRef}
            type="text"
            value={displayValue}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || loading}
            className={`w-full ${
              leftIcon ? "pl-10" : "pl-4"
            } pr-10 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              error
                ? "border-red-300 dark:border-red-600"
                : "border-gray-300 dark:border-gray-600"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          />

          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {loading ? (
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            ) : (
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            )}
          </div>
        </div>

        {/* Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            >
              {/* Opciones filtradas */}
              {filteredOptions.length > 0 && (
                <div className="py-1">
                  {filteredOptions.map((option, index) => (
                    <button
                      key={option.value}
                      onClick={() => handleOptionSelect(option)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between group transition-colors"
                    >
                      <span className="text-gray-900 dark:text-white">
                        {option.label}
                      </span>
                      {value === option.value && (
                        <Check className="w-4 h-4 text-blue-500" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Opción "Crear nuevo" */}
              {showCreateOption && (
                <>
                  {filteredOptions.length > 0 && (
                    <div className="border-t border-gray-200 dark:border-gray-600" />
                  )}
                  <div className="py-1">
                    <button
                      onClick={handleCreateNew}
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-3 text-blue-600 dark:text-blue-400 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>
                        {createLabel} "<strong>{searchTerm}</strong>"
                      </span>
                    </button>
                  </div>
                </>
              )}

              {/* Sin resultados */}
              {filteredOptions.length === 0 &&
                !showCreateOption &&
                searchTerm && (
                  <div className="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm">
                    No se encontraron resultados para "{searchTerm}"
                  </div>
                )}

              {/* Estado vacío */}
              {filteredOptions.length === 0 && !searchTerm && (
                <div className="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm">
                  {options.length === 0
                    ? "No hay opciones disponibles"
                    : "Escribe para buscar..."}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default SearchableSelect;
