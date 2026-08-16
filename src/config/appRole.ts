export type AppRole = 'student' | 'teacher'

export const appRole: AppRole = import.meta.env.VITE_APP_ROLE === 'teacher' ? 'teacher' : 'student'
export const requiresLogin = import.meta.env.VITE_REQUIRE_LOGIN === 'true'
