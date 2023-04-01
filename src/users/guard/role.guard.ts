import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import { RequestWithUser } from '../../auth/type/request-with-user.interface';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { Role } from '../role.enum';

export const RoleGuard = (role: Role): Type<CanActivate> => {
  class RoleGuardMixin extends JwtAuthGuard {
    async canActivate(context: ExecutionContext) {
      await super.canActivate(context);

      const request = context.switchToHttp().getRequest<RequestWithUser>();
      return request?.user['type'].split(',').includes(role);
    }
  }

  return mixin(RoleGuardMixin);
};