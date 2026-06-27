import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let supabase: SupabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
        {
          provide: SupabaseService,
          useValue: {
            getClient: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    supabase = module.get<SupabaseService>(SupabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should throw UnauthorizedException if credentials are invalid', async () => {
      (supabase.getClient as jest.Mock).mockReturnValue({
        auth: {
          signInWithPassword: jest.fn().mockResolvedValue({ data: { session: null }, error: new Error('Invalid email or password') }),
        },
      });

      await expect(service.login({ email: 'test@test.com', password: 'wrong' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return user and session if credentials are valid', async () => {
      const mockSession = { access_token: 'valid-token' };
      const mockDbUser = { id: 'uuid-1', email: 'test@test.com', role: 'USER' };

      (supabase.getClient as jest.Mock).mockReturnValue({
        auth: {
          signInWithPassword: jest.fn().mockResolvedValue({ data: { session: mockSession }, error: null }),
        },
      });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockDbUser);

      const result = await service.login({ email: 'test@test.com', password: 'password' });
      expect(result).toEqual({ user: mockDbUser, session: mockSession });
    });
  });
});
