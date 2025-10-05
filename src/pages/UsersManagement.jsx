import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Filter,
  Users,
  UserPlus,
  Edit,
  Trash2,
  Key,
  Eye,
  MoreVertical,
  Shield,
  User,
  CheckCircle,
  X,
  ChevronDown,
} from "lucide-react";
import { motion } from "framer-motion";
import usersService from "../api/users";
import { useRole } from "../hooks/useRole";
import { useNotifications } from "../components/common/NotificationSystem";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Card from "../components/common/Card";
import StatusBadge from "../components/common/StatusBadge";
import CreateUserModal from "../components/CreateUserModal";
import EditUserModal from "../components/EditUserModal";
import AdminChangePasswordModal from "../components/common/AdminChangePasswordModal";
import Modal from "../components/common/Modal";

export default function UsersManagement() {
  const { role, can } = useRole();
  const { addNotification } = useNotifications();
  const queryClient = useQueryClient();

  // Estados para modales y filtros
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Query para obtener usuarios
  const {
    data: users = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["users"],
    queryFn: () => usersService.getUsers(),
    enabled: can.accessUsersManagement(),
  });

  // Mutation para cambiar estado de usuario
  const toggleStatusMutation = useMutation({
    mutationFn: ({ userId, enabled }) =>
      usersService.toggleUserStatus(userId, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      addNotification({
        type: "success",
        message: "Estado del usuario actualizado correctamente",
      });
    },
    onError: (error) => {
      addNotification({
        type: "error",
        message: error.message || "Error al cambiar estado del usuario",
      });
    },
  });

  // Filtrar usuarios según permisos y filtros
  const filteredUsers = useMemo(() => {
    if (!users) return [];

    let filtered = users;

    // Filtrar por permisos según el rol del usuario actual
    if (role === "ops") {
      // Ops solo pueden ver drivers
      filtered = filtered.filter((user) => user.role === "driver");
    } else if (role === "admin") {
      // Admin puede ver todos
      filtered = users;
    } else {
      // Otros roles no pueden gestionar usuarios
      return [];
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.displayName?.toLowerCase().includes(term) ||
          user.email?.toLowerCase().includes(term) ||
          user.phone?.includes(term)
      );
    }

    // Filtrar por rol
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Filtrar por estado
    if (statusFilter !== "all") {
      const isEnabled = statusFilter === "enabled";
      filtered = filtered.filter((user) => user.enabled === isEnabled);
    }

    return filtered;
  }, [users, searchTerm, roleFilter, statusFilter, role]);

  // Handlers
  const handleCreateUser = () => {
    setShowCreateModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleChangePassword = (user) => {
    setSelectedUser(user);
    setShowPasswordModal(true);
  };

  const handleToggleStatus = (user) => {
    toggleStatusMutation.mutate({
      userId: user.userId,
      enabled: !user.enabled,
    });
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (selectedUser) {
      toggleStatusMutation.mutate({
        userId: selectedUser.userId,
        enabled: false,
      });
    }
    setShowDeleteConfirm(false);
    setSelectedUser(null);
  };

  // Obtener estadísticas
  const stats = useMemo(() => {
    const totalUsers = filteredUsers.length;
    const activeUsers = filteredUsers.filter((u) => u.enabled).length;
    const adminUsers = filteredUsers.filter((u) => u.role === "admin").length;
    const opsUsers = filteredUsers.filter((u) => u.role === "ops").length;
    const driverUsers = filteredUsers.filter((u) => u.role === "driver").length;

    return {
      total: totalUsers,
      active: activeUsers,
      inactive: totalUsers - activeUsers,
      admins: adminUsers,
      ops: opsUsers,
      drivers: driverUsers,
    };
  }, [filteredUsers]);

  const getRoleBadgeColor = (userRole) => {
    switch (userRole) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "ops":
        return "bg-blue-100 text-blue-800";
      case "driver":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleLabel = (userRole) => {
    switch (userRole) {
      case "admin":
        return "Administrador";
      case "ops":
        return "Operaciones";
      case "driver":
        return "Conductor";
      default:
        return "Sin rol";
    }
  };

  if (!can.accessUsersManagement()) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Acceso no autorizado
          </h3>
          <p className="text-gray-500">
            No tienes permisos para acceder a la gestión de usuarios.
          </p>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Gestión de Usuarios
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra usuarios, roles y permisos del sistema
          </p>
        </div>

        {can.createUsers() && (
          <Button
            onClick={handleCreateUser}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
          >
            <UserPlus className="w-4 h-4" />
            Crear Usuario
          </Button>
        )}
      </motion.div>

      {/* Estadísticas */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Usuarios
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.total}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Usuarios Activos
                  </p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {stats.active}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Conductores
                  </p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {stats.drivers}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {role === "admin" && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Staff Total
                    </p>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {stats.admins + stats.ops}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </motion.div>

      {/* Filtros y búsqueda */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Búsqueda */}
              <div className="flex-1">
                <Input
                  leftIcon={<Search />}
                  type="text"
                  placeholder="Buscar por nombre, email o teléfono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Filtros */}
              <div className="flex flex-col sm:flex-row gap-3 lg:min-w-0 lg:flex-shrink-0">
                {/* Filtro de Rol */}
                <div className="relative min-w-[180px]">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none cursor-pointer"
                  >
                    <option value="all">Todos los roles</option>
                    {role === "admin" && (
                      <>
                        <option value="admin">👑 Administradores</option>
                        <option value="ops">⚙️ Operaciones</option>
                      </>
                    )}
                    <option value="driver">🚗 Conductores</option>
                  </select>
                </div>

                {/* Filtro de Estado */}
                <div className="relative min-w-[160px]">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none cursor-pointer"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="enabled">✅ Activos</option>
                    <option value="disabled">❌ Inactivos</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Indicadores de filtros activos */}
            {(searchTerm || roleFilter !== "all" || statusFilter !== "all") && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Filtros activos:
                  </span>

                  {searchTerm && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm"
                    >
                      <Search className="w-3 h-3 mr-1" />"{searchTerm}"
                      <button
                        onClick={() => setSearchTerm("")}
                        className="ml-2 hover:text-blue-600 dark:hover:text-blue-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  )}

                  {roleFilter !== "all" && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-sm"
                    >
                      <Shield className="w-3 h-3 mr-1" />
                      Rol:{" "}
                      {roleFilter === "admin"
                        ? "Administradores"
                        : roleFilter === "ops"
                        ? "Operaciones"
                        : "Conductores"}
                      <button
                        onClick={() => setRoleFilter("all")}
                        className="ml-2 hover:text-purple-600 dark:hover:text-purple-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  )}

                  {statusFilter !== "all" && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-sm"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Estado:{" "}
                      {statusFilter === "enabled" ? "Activos" : "Inactivos"}
                      <button
                        onClick={() => setStatusFilter("all")}
                        className="ml-2 hover:text-green-600 dark:hover:text-green-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  )}

                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setRoleFilter("all");
                      setStatusFilter("all");
                    }}
                    className="ml-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline"
                  >
                    Limpiar todos
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Lista de usuarios */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Teams
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Última actualización
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-500">
                        Cargando usuarios...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="text-red-500">
                      Error al cargar usuarios: {error.message}
                    </div>
                    <Button
                      onClick={() => refetch()}
                      variant="outline"
                      size="sm"
                      className="mt-2"
                    >
                      Reintentar
                    </Button>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <div className="text-gray-500">
                      {searchTerm ||
                      roleFilter !== "all" ||
                      statusFilter !== "all"
                        ? "No se encontraron usuarios con los filtros aplicados"
                        : "No hay usuarios registrados"}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.$id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {(user.displayName ||
                                user.name ||
                                "U")[0].toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.displayName || user.name || "Sin nombre"}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email || "Sin email"}
                          </div>
                          {user.phone && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(
                          user.role
                        )}`}
                      >
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {(user.teams || []).map((team) => (
                          <span
                            key={team.id}
                            className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full dark:bg-gray-700 dark:text-gray-200"
                          >
                            {team.name}
                          </span>
                        ))}
                        {(!user.teams || user.teams.length === 0) && (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Sin equipos asignados
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge
                        status={user.enabled ? "active" : "inactive"}
                        labels={{ active: "Activo", inactive: "Inactivo" }}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.updatedAt
                        ? new Date(user.updatedAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {can.editAnyUser() ||
                        (can.editOpsAndDrivers() &&
                          ["ops", "driver"].includes(user.role)) ||
                        (can.editOnlyDrivers() && user.role === "driver") ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        ) : null}

                        {can.editAnyUser() ||
                        (can.editOpsAndDrivers() &&
                          ["ops", "driver"].includes(user.role)) ||
                        (can.editOnlyDrivers() && user.role === "driver") ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleChangePassword(user)}
                            className="text-purple-600 hover:text-purple-700"
                          >
                            <Key className="w-4 h-4" />
                          </Button>
                        ) : null}

                        {can.editAnyUser() ||
                        (can.editOpsAndDrivers() &&
                          ["ops", "driver"].includes(user.role)) ||
                        (can.editOnlyDrivers() && user.role === "driver") ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(user)}
                            className={
                              user.enabled
                                ? "text-red-600 hover:text-red-700"
                                : "text-green-600 hover:text-green-700"
                            }
                          >
                            {user.enabled ? (
                              <Trash2 className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modales */}
      {showCreateModal && (
        <CreateUserModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            queryClient.invalidateQueries(["users"]);
          }}
        />
      )}

      {showEditModal && selectedUser && (
        <EditUserModal
          isOpen={showEditModal}
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedUser(null);
            queryClient.invalidateQueries(["users"]);
          }}
        />
      )}

      {showPasswordModal && selectedUser && (
        <AdminChangePasswordModal
          isOpen={showPasswordModal}
          userId={selectedUser.userId}
          userName={selectedUser.displayName || selectedUser.name}
          onClose={() => {
            setShowPasswordModal(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            setShowPasswordModal(false);
            setSelectedUser(null);
          }}
        />
      )}

      {showDeleteConfirm && selectedUser && (
        <Modal
          isOpen={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false);
            setSelectedUser(null);
          }}
          title="Confirmar deshabilitación"
        >
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              ¿Estás seguro de que deseas deshabilitar al usuario{" "}
              <strong>{selectedUser.displayName || selectedUser.name}</strong>?
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              El usuario no podrá acceder al sistema pero sus datos se
              mantendrán.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedUser(null);
                }}
              >
                Cancelar
              </Button>
              <Button variant="danger" onClick={confirmDelete}>
                Deshabilitar Usuario
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </motion.div>
  );
}
