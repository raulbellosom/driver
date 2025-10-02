import React from "react";
import { Link } from "react-router-dom";
import { Home, AlertCircle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import Button from "../../components/common/Button";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center px-4">
      <motion.div
        className="text-center max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Error Icon */}
        <motion.div
          className="mx-auto w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
        </motion.div>

        {/* 404 Text */}
        <motion.h1
          className="text-6xl font-bold text-gray-900 dark:text-white mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          404
        </motion.h1>

        <motion.h2
          className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          Página no encontrada
        </motion.h2>

        <motion.p
          className="text-gray-600 dark:text-gray-400 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          className="space-y-3 sm:space-y-0 sm:space-x-3 sm:flex sm:justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Button as={Link} to="/" className="w-full sm:w-auto">
            <Home className="h-4 w-4 mr-2" />
            Ir al Inicio
          </Button>

          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Regresar
          </Button>
        </motion.div>

        {/* Help Links */}
        <motion.div
          className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            ¿Necesitas ayuda? Prueba estos enlaces:
          </p>

          <div className="space-y-1">
            <Link
              to="/admin"
              className="block text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
            >
              Panel Administrativo
            </Link>
            <Link
              to="/driver"
              className="block text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
            >
              Panel de Conductor
            </Link>
            <Link
              to="/profile"
              className="block text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
            >
              Mi Perfil
            </Link>
          </div>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.div
        className="mt-12 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.7 }}
      >
        <p className="text-xs text-gray-400 dark:text-gray-600">
          &copy; 2025 DriverPro by Racoon Devs. Todos los derechos reservados.
        </p>
      </motion.div>
    </div>
  );
};

export default NotFound;
