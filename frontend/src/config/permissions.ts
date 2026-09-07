export const rolePermissions = {
  Admin: ['*'],
  Manager: ['read:*', 'write:*', 'delete:leads', 'delete:deals'],
  SalesExecutive: ['read:leads', 'write:leads', 'read:deals', 'write:deals', 'read:contacts'],
};
