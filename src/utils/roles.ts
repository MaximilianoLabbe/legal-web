const ADMIN_ROLE_NAMES = new Set(['admin', 'administrator', 'administrador']);

export const isAdminRole = (role: unknown): boolean =>
  typeof role === 'string' && ADMIN_ROLE_NAMES.has(role.trim().toLocaleLowerCase());
