import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const permissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );
    const req = context.switchToHttp().getRequest();
    if (!req.user) {
      return false;
    }
    const userPermissions = req.user.role.permissions.map((it) => it.identifier)
    // const userPermissions = req.user.role.flatMap((role) =>
    //   role.permissions.map((it) => it.identifier),
    // );
    for (const permission of permissions) {
      return userPermissions.includes(permission)
    }
    return false;
  }
}
