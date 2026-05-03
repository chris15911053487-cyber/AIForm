import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { FormService } from './form.service';
import { FormDefinition } from './entities/form-definition.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('forms')
export class FormController {
  constructor(private readonly formService: FormService) {}

  @Get()
  findAll(@CurrentUser('tenantId') tenantId: string, @Query() pagination: PaginationDto) {
    return this.formService.findAll(tenantId, pagination);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.formService.findOne(id);
  }

  @Post()
  create(@CurrentUser('tenantId') tenantId: string, @Body() dto: Partial<FormDefinition>) {
    dto.tenantId = tenantId;
    return this.formService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: Partial<FormDefinition>) {
    return this.formService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.formService.delete(id);
  }
}
