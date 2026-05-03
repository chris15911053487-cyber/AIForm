import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { RolePermission } from './entities/role-permission.entity';

const mockQueryBuilder = () => ({
  innerJoin: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  getMany: jest.fn().mockResolvedValue([]),
  getRawMany: jest.fn().mockResolvedValue([]),
});

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: jest.Mocked<Repository<User>>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: { findOne: jest.fn(), create: jest.fn(), save: jest.fn() } },
        { provide: getRepositoryToken(Role), useValue: { createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder()) } },
        { provide: getRepositoryToken(RolePermission), useValue: { createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder()) } },
        { provide: JwtService, useValue: { sign: jest.fn().mockReturnValue('mock-token') } },
      ],
    }).compile();

    service = module.get(AuthService);
    userRepo = module.get(getRepositoryToken(User));
    jwtService = module.get(JwtService);
  });

  describe('login', () => {
    it('should throw if user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);
      await expect(service.login({ username: 'test', password: 'x' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should throw if password is wrong', async () => {
      const hash = await bcrypt.hash('correct', 10);
      userRepo.findOne.mockResolvedValue({ id: '1', username: 'test', passwordHash: hash, status: 'active' } as unknown as User);
      await expect(service.login({ username: 'test', password: 'wrong' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should return token on success', async () => {
      const hash = await bcrypt.hash('correct', 10);
      const mockUser = { id: '1', tenantId: 't1', username: 'test', passwordHash: hash, status: 'active', lastLoginAt: null } as unknown as User;
      userRepo.findOne.mockResolvedValue(mockUser);
      userRepo.save.mockResolvedValue(mockUser);

      const result = await service.login({ username: 'test', password: 'correct' });
      expect(result.accessToken).toBe('mock-token');
    });
  });

  describe('register', () => {
    it('should throw if username exists', async () => {
      userRepo.findOne.mockResolvedValue({ id: '1' } as unknown as User);
      await expect(service.register({ username: 'test', password: '123456' }))
        .rejects.toThrow(ConflictException);
    });

    it('should return token on success', async () => {
      userRepo.findOne.mockResolvedValue(null);
      const mockUser = { id: '2', tenantId: 't1', username: 'newuser', email: 'a@b.com' } as unknown as User;
      userRepo.create.mockReturnValue(mockUser);
      userRepo.save.mockResolvedValue(mockUser);

      const result = await service.register({ username: 'newuser', password: '123456', email: 'a@b.com' });
      expect(result.accessToken).toBe('mock-token');
    });
  });
});
