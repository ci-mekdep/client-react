import { RoleCode } from 'src/entities/app/Enums'

const getHomeRoute = (role: RoleCode | string) => {
  if (role) return '/dashboard'
}

export default getHomeRoute
