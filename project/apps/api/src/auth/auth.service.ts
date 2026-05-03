import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { RolePermission } from './entities/role-permission.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    @InjectRepository(RolePermission) private permRepo: Repository<RolePermission>,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { username: dto.username } });
    if (!user) throw new UnauthorizedException('用户名或密码错误');
    if (user.status !== 'active') throw new UnauthorizedException('账号已被禁用');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('用户名或密码错误');

    user.lastLoginAt = new Date();
    await this.userRepo.save(user);

    return this.generateToken(user);
  }

  async register(dto: RegisterDto) {
    const exists = await this.userRepo.findOne({ where: { username: dto.username } });
    if (exists) throw new ConflictException('用户名已存在');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      tenantId: '00000000-0000-0000-0000-000000000001',
      username: dto.username,
      email: dto.email,
      phone: dto.phone,
      passwordHash,
    });
    await this.userRepo.save(user);

    return this.generateToken(user);
  }

  async getCurrentUser(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('用户不存在');
    const { passwordHash, ...result } = user;
    return result;
  }

  private async generateToken(user: User) {
    const roles = await this.roleRepo
      .createQueryBuilder('r')
      .innerJoin('sys_user_roles', 'ur', 'ur.role_id = r.id')
      .where('ur.user_id = :userId', { userId: user.id })
      .getMany();

    const roleIds = roles.map(r => r.id);
    const permissions = roleIds.length > 0
      ? await this.permRepo
          .createQueryBuilder('rp')
          .innerJoin('sys_resources', 'r', 'r.id = rp.resource_id')
          .where('rp.role_id IN (:...roleIds)', { roleIds })
          .select(['r.code', 'rp.actions'])
          .getRawMany()
      : [];

    const payload = {
      sub: user.id,
      tid: user.tenantId,
      roles: roles.map(r => r.code),
      perms: permissions.map((p: any) => `${p.r_code}:${p.rp_actions.join(',')}`),
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: roles.map(r => ({ code: r.code, name: r.name })),
      },
    };
  }
}
