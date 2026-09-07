export const databaseConfig = () => ({
  url: process.env.DATABASE_URL || 'postgresql://postgres:123456@localhost:5432/crm?schema=public',
});
