import { useAuth } from '../context/AuthContext';

export const usePermissions = () => {
  const { user } = useAuth();
  return {
    canDelete: user ? (user.role === 'Admin' || user.role === 'Manager') : false,
    canEdit: !!user,
    isAdmin: user ? user.role === 'Admin' : false,
  };
};
