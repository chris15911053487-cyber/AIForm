import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  async findAll(tenantId: string, pagination: PaginationDto): Promise<PaginatedResult<User>> {
    const [items, total] = await this.userRepo.findAndCount({
      where: { tenantId },
      skip: ((pagination.page || 1) - 1) * (pagination.pageSize || 20),
      take: pagination.pageSize || 20,
      order: { createdAt: 'DESC' },
    });
    const safeItems = items.map(({ passwordHash, ...rest }) => rest as User);
    return {
      items: safeItems,
      total,
      page: pagination.page || 1,
      pageSize: pagination.pageSize || 20,
      totalPages: Math.ceil(total / (pagination.pageSize || 20)),
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('用户不存在');
    const { passwordHash, ...result } = user;
    return result as User;
  }

  async create(dto: { username: string; password: string; email?: string; tenantId: string }) {
    const exists = await this.userRepo.findOne({ where: { username: dto.username } });
    if (exists) throw new BadRequestException('用户名已存在');
    const passwordHash = await bcrypt.hash(dto.password, 10);
    return this.userRepo.save(this.userRepo.create({ ...dto, passwordHash }));
  }

  async update(id: string, dto: Partial<User>) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('用户不存在');
    Object.assign(user, dto);
    return this.userRepo.save(user);
  }

  async changePassword(id: string, oldPassword: string, newPassword: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('用户不存在');
    const valid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!valid) throw new BadRequestException('原密码错误');
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    return this.userRepo.save(user);
  }
}
