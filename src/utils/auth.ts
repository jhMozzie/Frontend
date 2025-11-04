/**
 * Utilidades para manejo de autenticación y roles
 */

export const ROLES = {
  ADMIN: 'Administrador',
  TRAINER: 'Entrenador',
} as const

export type UserRole = typeof ROLES[keyof typeof ROLES]

/**
 * Obtiene el rol del usuario actual desde localStorage
 */
export const getCurrentUserRole = (): string | null => {
  return localStorage.getItem('userRole')
}

/**
 * Verifica si el usuario actual tiene uno de los roles especificados
 */
export const hasRole = (allowedRoles: string[]): boolean => {
  const userRole = getCurrentUserRole()
  if (!userRole) return false
  
  return allowedRoles.includes(userRole)
}

/**
 * Verifica si el usuario actual es administrador
 */
export const isAdmin = (): boolean => {
  return getCurrentUserRole() === ROLES.ADMIN
}

/**
 * Verifica si el usuario actual es entrenador
 */
export const isTrainer = (): boolean => {
  return getCurrentUserRole() === ROLES.TRAINER
}

/**
 * Obtiene la información del usuario actual
 */
export const getCurrentUser = () => {
  return {
    email: localStorage.getItem('userEmail'),
    role: localStorage.getItem('userRole'),
    roleId: localStorage.getItem('userRoleId'),
  }
}
