import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { RoleService } from './role.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  findAll(@CurrentUser('tenantId') tenantId: string, @Query() pagination: PaginationDto) {
    return this.roleService.findAll(tenantId, pagination);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(id);
  }

  @Post()
  create(@CurrentUser('tenantId') tenantId: string, @Body() dto: any) {
    return this.roleService.create({ ...dto, tenantId });
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.roleService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.roleService.delete(id);
  }

  @Get(':id/permissions')
  getPermissions(@Param('id') id: string) {
    return this.roleService.getPermissions(id);
  }

  @Put(':id/permissions')
  setPermissions(@Param('id') id: string, @Body() permissions: any[]) {
    return this.roleService.setPermissions(id, permissions);
  }
}
