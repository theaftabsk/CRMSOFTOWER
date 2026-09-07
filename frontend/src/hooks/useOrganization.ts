import { useAuth } from '../context/AuthContext';
export const useOrganization = () => {
  const { organization } = useAuth();
  return organization;
};
