import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolePermission } from './entities/role-permission.entity';
import { Role } from './entities/role.entity';
import { Resource } from './entities/resource.entity';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(RolePermission) private permissionRepo: Repository<RolePermission>,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    @InjectRepository(Resource) private resourceRepo: Repository<Resource>,
  ) {}

  async getPermissions(
    roleId: string,
    resourceId?: string,
  ): Promise<RolePermission[]> {
    const where: any = { roleId };
    if (resourceId) where.resourceId = resourceId;
    return this.permissionRepo.find({ where, order: { createdAt: 'ASC' } });
  }

  async setPermissions(
    roleId: string,
    permissions: { resourceId: string; actions: string[]; conditions?: object; fieldPermissions?: object }[],
  ): Promise<RolePermission[]> {
    // 验证角色存在
    const role = await this.roleRepo.findOne({ where: { id: roleId } });
    if (!role) throw new NotFoundException('角色不存在');

    // 验证所有资源存在
    for (const p of permissions) {
      const resource = await this.resourceRepo.findOne({ where: { id: p.resourceId } });
      if (!resource) throw new NotFoundException(`资源 ${p.resourceId} 不存在`);
    }

    // 原子操作：先删除后新增
    await this.permissionRepo.delete({ roleId });
    const entities = permissions.map((p) =>
      this.permissionRepo.create({ roleId, ...p }),
    );
    return this.permissionRepo.save(entities);
  }
}
