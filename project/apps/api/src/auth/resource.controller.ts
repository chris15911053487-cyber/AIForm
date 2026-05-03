import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ResourceService } from './resource.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('resources')
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  @Get()
  findAll(@CurrentUser('tenantId') tenantId: string, @Query() pagination: PaginationDto) {
    return this.resourceService.findAll(tenantId, pagination);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.resourceService.findOne(id);
  }

  @Post()
  create(@CurrentUser('tenantId') tenantId: string, @Body() dto: any) {
    return this.resourceService.create({ ...dto, tenantId });
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.resourceService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.resourceService.delete(id);
  }
}
