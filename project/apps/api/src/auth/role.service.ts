import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { RolePermission } from './entities/role-permission.entity';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    @InjectRepository(RolePermission) private permissionRepo: Repository<RolePermission>,
  ) {}

  async findAll(tenantId: string, pagination: PaginationDto): Promise<PaginatedResult<Role>> {
    const [items, total] = await this.roleRepo.findAndCount({
      where: { tenantId },
      skip: ((pagination.page || 1) - 1) * (pagination.pageSize || 20),
      take: pagination.pageSize || 20,
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
    return {
      items,
      total,
      page: pagination.page || 1,
      pageSize: pagination.pageSize || 20,
      totalPages: Math.ceil(total / (pagination.pageSize || 20)),
    };
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) throw new NotFoundException('角色不存在');
    return role;
  }

  async create(dto: Partial<Role>): Promise<Role> {
    const exists = await this.roleRepo.findOne({ where: { code: dto.code } });
    if (exists) throw new BadRequestException('角色编码已存在');
    return this.roleRepo.save(this.roleRepo.create(dto));
  }

  async update(id: string, dto: Partial<Role>): Promise<Role> {
    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) throw new NotFoundException('角色不存在');
    Object.assign(role, dto);
    return this.roleRepo.save(role);
  }

  async delete(id: string): Promise<void> {
    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) throw new NotFoundException('角色不存在');
    // 删除角色时同时删除关联的权限
    await this.permissionRepo.delete({ roleId: id });
    await this.roleRepo.remove(role);
  }

  async getPermissions(roleId: string): Promise<RolePermission[]> {
    const role = await this.roleRepo.findOne({ where: { id: roleId } });
    if (!role) throw new NotFoundException('角色不存在');
    return this.permissionRepo.find({ where: { roleId }, order: { createdAt: 'ASC' } });
  }

  async setPermissions(
    roleId: string,
    permissions: { resourceId: string; actions: string[]; conditions?: object; fieldPermissions?: object }[],
  ): Promise<RolePermission[]> {
    const role = await this.roleRepo.findOne({ where: { id: roleId } });
    if (!role) throw new NotFoundException('角色不存在');
    // 原子操作：先删除后新增
    await this.permissionRepo.delete({ roleId });
    const entities = permissions.map((p) =>
      this.permissionRepo.create({ roleId, ...p }),
    );
    return this.permissionRepo.save(entities);
  }
}
