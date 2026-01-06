// Re-export all auth modules for convenient imports

export { type Permission, type PermissionMeta, PERMISSION_METADATA, getPermissionMeta, getPermissionsByCategory, CATEGORY_LABELS } from './permissions';
export { type RoleType, type RoleDefinition, ROLES, getRole, getAllRoles, roleHasPermission, getRolePermissions } from './roles';
export { type User, MOCK_USERS, findUserByEmail, findUserById, getUsersByRole, validateCredentials } from './users';
export { AuthProvider, useAuth, usePermission, useAnyPermission, useRole } from './context';
