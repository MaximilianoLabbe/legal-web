import React, { useEffect, useState } from 'react';
import { Header } from '../components/layout';
import { Card, Button } from '../components/ui';
import { EditUserModal } from '../components/common';
import { useUserStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';
import type { User } from '../types';

export const AdminUsersPage: React.FC = () => {
  const navigate = useNavigate();
  const { users, fetchUsers, isLoading } = useUserStore();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    // Refresh users list after successful update
    fetchUsers();
  };

  return (
    <div>
      <Header
        title="Gestión de Usuarios"
        subtitle="Administra usuarios del sistema"
        action={
          <Button
            variant="primary"
            onClick={() => navigate('/admin/users/create')}
            className="flex items-center gap-2"
          >
            <FiPlus size={20} />
            Nuevo Usuario
          </Button>
        }
      />

      <div className="p-6">
        {isLoading ? (
          <Card className="text-center py-12">
            <p className="text-gray-500">Cargando usuarios...</p>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Email
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Rol
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {user.role === 'admin' ? 'Administrador' : 'Abogado'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditClick(user)}
                        >
                          Editar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Edit User Modal */}
      {selectedUser && (
        <EditUserModal
          user={selectedUser}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedUser(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
};

AdminUsersPage.displayName = 'AdminUsersPage';
