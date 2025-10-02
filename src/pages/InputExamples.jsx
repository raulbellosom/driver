import React from "react";
import { Mail, Lock, Eye, EyeOff, Search, User } from "lucide-react";
import Input from "../components/common/Input";

const InputExamples = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
    search: "",
    name: "",
  });

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-4 dark:text-white">
          Ejemplos del Componente Input Mejorado
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Todos los inputs ahora tienen mejor soporte para tema oscuro y son
          completamente responsivos.
        </p>
      </div>

      {/* Tamaños */}
      <section>
        <h2 className="text-lg font-semibold mb-4 dark:text-white">Tamaños</h2>
        <div className="space-y-4">
          <Input
            size="sm"
            label="Pequeño"
            placeholder="Input pequeño"
            leftIcon={<User />}
          />
          <Input
            size="default"
            label="Por defecto"
            placeholder="Input por defecto"
            leftIcon={<User />}
          />
          <Input
            size="lg"
            label="Grande"
            placeholder="Input grande"
            leftIcon={<User />}
          />
        </div>
      </section>

      {/* Variantes */}
      <section>
        <h2 className="text-lg font-semibold mb-4 dark:text-white">
          Variantes
        </h2>
        <div className="space-y-4">
          <Input
            variant="default"
            label="Por defecto"
            placeholder="Variante por defecto"
          />
          <Input variant="ghost" label="Ghost" placeholder="Variante ghost" />
          <Input
            variant="filled"
            label="Filled"
            placeholder="Variante filled"
          />
        </div>
      </section>

      {/* Con iconos */}
      <section>
        <h2 className="text-lg font-semibold mb-4 dark:text-white">
          Con Iconos
        </h2>
        <div className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="tu@email.com"
            leftIcon={<Mail />}
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
          />

          <Input
            label="Contraseña"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            leftIcon={<Lock />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="hover:text-gray-700 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            }
            value={formData.password}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, password: e.target.value }))
            }
          />

          <Input
            label="Buscar"
            placeholder="Buscar algo..."
            leftIcon={<Search />}
            value={formData.search}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, search: e.target.value }))
            }
          />
        </div>
      </section>

      {/* Estados */}
      <section>
        <h2 className="text-lg font-semibold mb-4 dark:text-white">Estados</h2>
        <div className="space-y-4">
          <Input
            label="Campo requerido"
            placeholder="Este campo es obligatorio"
            required
          />

          <Input
            label="Con error"
            placeholder="Campo con error"
            error="Este campo es obligatorio"
          />

          <Input
            label="Con ayuda"
            placeholder="Campo con texto de ayuda"
            hint="Este es un texto de ayuda para el usuario"
          />

          <Input
            label="Deshabilitado"
            placeholder="Campo deshabilitado"
            disabled
            value="No se puede editar"
          />
        </div>
      </section>

      {/* Ejemplo de formulario */}
      <section>
        <h2 className="text-lg font-semibold mb-4 dark:text-white">
          Formulario de Ejemplo
        </h2>
        <form className="space-y-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Input
            label="Nombre completo"
            placeholder="Ingresa tu nombre"
            leftIcon={<User />}
            required
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
          />

          <Input
            label="Correo electrónico"
            type="email"
            placeholder="tu@empresa.com"
            leftIcon={<Mail />}
            required
            hint="Usaremos este email para contactarte"
          />

          <Input
            label="Contraseña"
            type="password"
            placeholder="Mínimo 8 caracteres"
            leftIcon={<Lock />}
            required
            hint="Debe contener al menos 8 caracteres"
          />

          <button
            type="submit"
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Registrarse
          </button>
        </form>
      </section>
    </div>
  );
};

export default InputExamples;
