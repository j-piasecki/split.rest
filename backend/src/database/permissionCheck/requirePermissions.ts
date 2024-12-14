import { ForbiddenException } from '../../errors/ForbiddenException'
import { checkPermissions } from './checkPermissions'
import { PermissionArguments, PermissionToFieldMap } from './permissions'
import { Pool } from 'pg'

interface HasDatabasePool {
  pool: Pool
}

function validateArguments<TPermissions extends (keyof PermissionToFieldMap)[]>(
  permissions: TPermissions,
  args: PermissionArguments<TPermissions>
) {
  for (const permission of permissions) {
    const fields = PermissionToFieldMap[permission]

    for (const field of fields) {
      if (!args[field]) {
        throw new Error(`Missing required field: ${field}`)
      }
    }
  }
}

export function RequirePermissions<
  TTarget extends HasDatabasePool,
  TPermissions extends (keyof PermissionToFieldMap)[],
>(permissions: TPermissions) {
  return function <TArgs extends PermissionArguments<TPermissions>>(
    target: TTarget,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<(callerId: string, args: TArgs, ...rest: any[]) => any>
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (
      this: TTarget,
      callerId: string,
      args: TArgs,
      ...rest: any[]
    ) {
      validateArguments(permissions, args)
      if (!this.pool) {
        throw new Error('Database pool is not initialized')
      }

      const error = await checkPermissions(this.pool, callerId, permissions, args)

      if (error !== null) {
        throw new ForbiddenException(error)
      }

      return originalMethod.apply(this, [callerId, args, ...rest])
    }

    return descriptor
  }
}
