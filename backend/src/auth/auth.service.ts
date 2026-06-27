import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly prisma: PrismaService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, fullName } = registerDto;

    // Check if user exists in DB
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Register in Supabase
    const { data, error } = await this.supabaseService.getClient().auth.signUp({
      email,
      password,
    });

    if (error) {
      throw new ConflictException(error.message);
    }

    // Create user in Prisma DB
    const user = await this.prisma.user.create({
      data: {
        email,
        fullName,
      },
    });

    return {
      user,
      session: data.session,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const { data, error } = await this.supabaseService.getClient().auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return {
      user,
      session: data.session,
    };
  }

  async logout(token: string) {
    const { error } = await this.supabaseService.getClient().auth.signOut();
    
    if (error) {
      throw new UnauthorizedException(error.message);
    }
    
    return true;
  }
}
