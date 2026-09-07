export const authConfig = () => ({
  jwtSecret: process.env.JWT_SECRET || 'crm-secret-key-super-secure-2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  saltRounds: 10,
});
