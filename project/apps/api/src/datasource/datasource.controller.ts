import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { DatasourceService } from './datasource.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('datasources')
@UseGuards(JwtAuthGuard)
export class DatasourceController {
  constructor(private readonly datasourceService: DatasourceService) {}

  @Get()
  findAll(@CurrentUser('tid') tenantId: string) {
    return this.datasourceService.findAll(tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.datasourceService.findOne(id);
  }

  @Post()
  create(@Body() dto: any, @CurrentUser('tid') tenantId: string) {
    return this.datasourceService.create({ ...dto, tenantId });
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.datasourceService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.datasourceService.delete(id);
  }

  @Post(':id/test-connection')
  testConnection(@Param('id') id: string) {
    return this.datasourceService.testConnection(id);
  }

  @Get(':id/tables')
  getTables(@Param('id') id: string) {
    return this.datasourceService.getTables(id);
  }

  @Get(':id/preview')
  previewData(
    @Param('id') id: string,
    @Query('table') tableName: string,
    @Query('limit') limit?: number,
  ) {
    return this.datasourceService.previewData(id, tableName, limit);
  }
}
