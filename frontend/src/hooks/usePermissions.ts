import { useAuth } from '../context/AuthContext';
export const usePermissions = () => {
  const { user } = useAuth();
  return {
    canDelete: user.role === 'Admin' || user.role === 'Manager',
    canEdit: true,
    isAdmin: user.role === 'Admin',
  };
};
