import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly prisma: PrismaService,
  ) {}

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type === 'Bearer') {
      return token;
    }
    // Coba ambil dari query params jika tidak ada di header (Untuk SSE EventSource)
    if (request.query.token && typeof request.query.token === 'string') {
      return request.query.token;
    }
    return undefined;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Missing or invalid authorization token');
    }

    const { data: { user }, error } = await this.supabaseService
      .getClient()
      .auth.getUser(token);

    if (error || !user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Attach user to request
    // We also fetch from DB to get the role and full profile
    const dbUser = await this.prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!dbUser) {
      throw new UnauthorizedException('User not found in database');
    }

    request.user = dbUser;
    
    return true;
  }
}
