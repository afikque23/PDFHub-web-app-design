import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user) {
      return false; // Should be handled by AuthGuard
    }

    // Verify user role from database
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id } // Assume AuthGuard injects the Supabase user ID here
    });

    if (!dbUser) {
      throw new ForbiddenException('User not found in database');
    }

    const hasRole = requiredRoles.includes(dbUser.role);
    if (!hasRole) {
      throw new ForbiddenException('You do not have the required role to access this resource');
    }
    return true;
  }
}
