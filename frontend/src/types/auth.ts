export interface AuthUser {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'SalesExecutive';
  avatarUrl?: string;
}
