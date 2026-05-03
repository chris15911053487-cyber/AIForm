import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll(@CurrentUser('tenantId') tenantId: string, @Query() pagination: PaginationDto) {
    return this.userService.findAll(tenantId, pagination);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Post()
  create(@CurrentUser('tenantId') tenantId: string, @Body() dto: any) {
    return this.userService.create({ ...dto, tenantId });
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.userService.update(id, dto);
  }

  @Put(':id/password')
  changePassword(@Param('id') id: string, @Body('oldPassword') old: string, @Body('newPassword') n: string) {
    return this.userService.changePassword(id, old, n);
  }
}
