import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { MenuService } from './menu.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Controller('menus')
@UseGuards(JwtAuthGuard)
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get('tree')
  getTree(@CurrentUser() user: any) {
    return this.menuService.getTreeForUser(user.tenantId, user.userId, user.roles);
  }

  @Get('routes')
  getRoutes(@CurrentUser('tenantId') tenantId: string) {
    return this.menuService.getRoutes(tenantId);
  }

  @Get()
  findAll(@CurrentUser('tenantId') tenantId: string) {
    return this.menuService.findAll(tenantId);
  }

  @Post()
  create(@CurrentUser('tenantId') tenantId: string, @Body() dto: CreateMenuDto) {
    return this.menuService.create({ ...dto, tenantId } as CreateMenuDto & { tenantId: string });
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMenuDto) {
    return this.menuService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.menuService.delete(id);
  }

  @Get(':id/data')
  getMenuData(@Param('id') id: string, @Query() query: Record<string, string>) {
    return this.menuService.executeQuery(id, query);
  }
}
